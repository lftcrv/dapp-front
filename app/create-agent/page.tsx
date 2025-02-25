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
      }
    } catch (error) {
      console.error('❌ Transaction Error:', error);
      showToast('TX_ERROR', 'error');
      setIsSubmitting(false);
    }
  };

  const { data: receiptData, error: receiptError } = useTransactionReceipt({
    hash: transactionHash,
    watch: true,
  });

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
          showToast('TX_SUCCESS', 'success', transactionHash);
          setIsTransactionConfirmed(true);

          // Set up redirection after 5 seconds
          setTimeout(() => {
            console.log('🔄 Redirecting to home after 5s delay...');
            showToast('AGENT_CREATING', 'loading');
            router.push('/');
          }, 5000);
        }
      }
    }
  }, [receiptData, receiptError, isLoading, transactionHash, router]);

  React.useEffect(() => {
    if (!isTransactionConfirmed || !transactionHash || !currentAddress) return;

    const createAgentAfterTx = async () => {
      try {
        console.log('🔵 Creating Agent:', {
          transactionHash,
          userAddress: currentAddress,
          agentType,
        });

        // Préparer l'objet pour l'API selon le nouveau format AgentConfig
        const agentConfig: AgentConfig = {
          name: formData.name,
          bio: formData.bio,
          lore: formData.lore.filter(Boolean),
          objectives: formData.objectives.filter(Boolean),
          knowledge: formData.knowledge.filter(Boolean),
          interval: formData.interval,
          chat_id: formData.chat_id,
          external_plugins: formData.external_plugins.filter(Boolean),
          internal_plugins: formData.internal_plugins,
        };

        // Ajouter le comportement de trading dans les objectives s'il existe
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
          transactionHash,
          profilePicture || undefined,
        );

        if (result.success) {
          console.log('🔵 Agent Created Successfully:', result);
          showToast('AGENT_SUCCESS', 'success');
        } else {
          console.error('❌ Agent Creation Failed:', result.error);
          showToast('AGENT_ERROR', 'error');
        }
      } catch (error) {
        console.error('❌ Agent Creation Error:', error);
        showToast('AGENT_ERROR', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    createAgentAfterTx();
  }, [
    isTransactionConfirmed,
    transactionHash,
    currentAddress,
    agentType,
    formData,
    profilePicture,
  ]);

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
;
