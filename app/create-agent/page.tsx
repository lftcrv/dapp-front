'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createAgent } from '@/actions/agents/create/createAgent';
import { showToast } from '@/lib/toast';
import { useWallet } from '@/app/context/wallet-context';
import {
  useAccount,
  useContract,
  useNetwork,
  useSendTransaction,
  useTransactionReceipt,
} from '@starknet-react/core';
import { type Abi } from 'starknet';
import { AgentConfig } from '@/lib/types';
import {
  FormProvider,
  useFormContext,
} from '@/components/create-agent/FormContext';
import { WalletConnectionOverlay } from '@/components/create-agent/WalletConnectionOverlay';
import { AgentForm } from '@/components/create-agent/AgentForm';
import { AgentTypeSelector } from '@/components/create-agent/AgentTypeSelector';

const generateRandomChatId = () => {
  return Math.random().toString(36).substring(2, 14);
};

const CreateAgentPageContent: React.FC = () => {
  const router = useRouter();
  const { formData, agentType, profilePicture } = useFormContext();

  const {
    activeWalletType,
    connectStarknet,
    loginWithPrivy,
    starknetWallet,
    privyAuthenticated,
    isLoading,
    privyReady,
    currentAddress,
  } = useWallet();

  // Move hooks to component level
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contract } = useContract({
    abi: [
      {
        type: 'function',
        name: 'transfer',
        state_mutability: 'external',
        inputs: [
          {
            name: 'recipient',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [],
      },
    ] as Abi,
    address: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS as `0x${string}`,
  });

  // Transaction hooks
  const { sendAsync } = useSendTransaction({
    calls: undefined,
  });

  // Compute wallet connection state
  const isWalletConnected = React.useMemo(() => {
    if (isLoading || !privyReady) return false;
    return starknetWallet.isConnected || privyAuthenticated;
  }, [isLoading, privyReady, starknetWallet.isConnected, privyAuthenticated]);

  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined,
  );
  const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAddress) {
      showToast('CONNECTION_ERROR');
      return;
    }

    if (!formData.name.trim() || !formData.bio.trim()) {
      showToast('AGENT_ERROR');
      return;
    }

    setIsSubmitting(true);

    try {
      const curveSide = agentType === 'leftcurve' ? 'LEFT' : 'RIGHT';
      const recipientAddress =
        process.env.NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT;
      const amountToSend = process.env.NEXT_PUBLIC_DEPLOYMENT_FEES;

      if (!recipientAddress || !amountToSend) {
        throw new Error('Deployment fees not configured');
      }

      if (!contract || !address) {
        throw new Error('Contract or address not available');
      }

      // Call transfer directly
      const transferCall = {
        contractAddress: contract.address,
        entrypoint: 'transfer',
        calldata: [
          recipientAddress,
          BigInt(amountToSend).toString(),
          '0', // For uint256, we need low and high parts
        ],
      };

      showToast('TX_PENDING', 'loading');

      const response = await sendAsync([transferCall]);

      if (response?.transaction_hash) {
        console.log('🔵 Transaction Hash:', response.transaction_hash);
        setTransactionHash(response.transaction_hash);
        showToast('TX_SUCCESS', 'success', response.transaction_hash);

        // Create agent immediately after getting transaction hash
        await createAgentWithTxHash(response.transaction_hash);
      }
    } catch (error) {
      console.error('❌ Transaction Error:', error);
      showToast('TX_ERROR', 'error');
      setIsSubmitting(false);
    }
  };

  // Function to create agent with transaction hash
  const createAgentWithTxHash = async (txHash: string) => {
    if (!txHash || !currentAddress) {
      console.error('❌ Missing transaction hash or address');
      showToast('AGENT_ERROR', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔵 Creating Agent:', {
        transactionHash: txHash,
        userAddress: currentAddress,
        agentType,
      });

      showToast('AGENT_CREATING', 'loading');

      const agentConfig: AgentConfig = {
        name: formData.name,
        bio: formData.bio,
        lore: formData.lore.filter(Boolean),
        objectives: formData.objectives.filter(Boolean),
        knowledge: formData.knowledge.filter(Boolean),
        interval: formData.interval,
        chat_id: generateRandomChatId(),
        external_plugins: formData.external_plugins.filter(Boolean),
        internal_plugins: formData.internal_plugins,
      };

      if (
        formData.bioParagraphs.length > 0 &&
        formData.bioParagraphs.some((p) => p.trim())
      ) {
        const combinedBio = formData.bioParagraphs.filter(Boolean).join('\n\n');
        if (combinedBio) {
          agentConfig.bio = combinedBio;
        }
      }

      if (formData.tradingBehavior.trim()) {
        agentConfig.objectives.push(
          `Trading Behavior: ${formData.tradingBehavior}`,
        );
      }

      const result = await createAgent(
        formData.name,
        agentConfig,
        agentType === 'leftcurve' ? 'LEFT' : 'RIGHT',
        currentAddress,
        txHash,
        profilePicture || undefined,
      );

      if (result.success && result.orchestrationId) {
        console.log('🔵 Agent Creation Initiated:', result);
        showToast('AGENT_CREATING', 'success');

        // Redirect to deploying state page with orchestration ID
        setTimeout(() => {
          console.log('🔄 Redirecting to deployment status page...');
          router.push(
            `/agent/deploying/${
              result.orchestrationId
            }?tx=${txHash}&wallet=${encodeURIComponent(currentAddress)}`,
          );
        }, 1500);
      } else {
        console.error('❌ Agent Creation Failed:', result.error);
        showToast('AGENT_ERROR', 'error');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('❌ Detailed Agent Creation Error:', {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name,
      });
      showToast('AGENT_ERROR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: receiptData, error: receiptError } = useTransactionReceipt({
    hash: transactionHash,
    watch: true,
  });

  // Keep this effect for monitoring transaction status, but remove the agent creation part
  React.useEffect(() => {
    if (isLoading || !transactionHash) return;

    if (receiptError) {
      console.error('❌ Transaction Receipt Error:', receiptError);
      showToast('TX_ERROR', 'error');
    }

    if (receiptData) {
      console.log('🔵 Transaction Receipt:', receiptData);

      // Check if it's an invoke transaction
      if (
        'finality_status' in receiptData &&
        'execution_status' in receiptData
      ) {
        const { finality_status, execution_status } = receiptData;

        if (
          finality_status === 'ACCEPTED_ON_L2' &&
          execution_status === 'SUCCEEDED'
        ) {
          console.log('✅ Transaction confirmed on L2');
          setIsTransactionConfirmed(true);
        }
      }
    }
  }, [receiptData, receiptError, isLoading, transactionHash]);

  // Effect to redirect if no address
  useEffect(() => {
    if (!currentAddress && !isLoading && privyReady) {
      router.push('/');
    }
  }, [currentAddress, router, isLoading, privyReady]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-2xl mx-auto px-4 pb-24 relative">
        {/* Wallet Connection Overlay */}
        <WalletConnectionOverlay
          isVisible={!isWalletConnected}
          connectStarknet={connectStarknet}
          loginWithPrivy={loginWithPrivy}
        />

        <motion.div
          className="space-y-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          {/* Header with Agent Type Selection */}
          <AgentTypeSelector />

          {/* Form Card with Tabs */}
          <AgentForm isSubmitting={isSubmitting} onDeploy={handleDeploy} />
        </motion.div>
      </div>
    </div>
  );
};

export default function CreateAgentPage() {
  return (
    <FormProvider>
      <CreateAgentPageContent />
    </FormProvider>
  );
}
