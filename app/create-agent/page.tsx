'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Flame,
  MessageSquare,
  Pencil,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Wallet,
} from 'lucide-react';
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
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { signatureStorage } from '@/actions/shared/derive-starknet-account';

type TabType = 'basic' | 'personality' | 'examples';
const TABS: TabType[] = ['basic', 'personality', 'examples'];

type ArrayFormField =
  | 'bio'
  | 'lore'
  | 'knowledge'
  | 'topics'
  | 'adjectives'
  | 'postExamples';
type FormField = ArrayFormField | 'name';

type FormDataType = {
  name: string;
  bio: string[];
  lore: string[];
  knowledge: string[];
  topics: string[];
  adjectives: string[];
  messageExamples: Array<
    [
      { user: string; content: { text: string } },
      { user: string; content: { text: string } },
    ]
  >;
  postExamples: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
};

const initialFormData: FormDataType = {
  name: '',
  bio: [''],
  lore: [''],
  knowledge: [''],
  topics: [''],
  adjectives: [''],
  messageExamples: [
    [
      { user: 'user1', content: { text: '' } },
      { user: '', content: { text: '' } },
    ],
  ],
  postExamples: [''],
  style: {
    all: [''],
    chat: [''],
    post: [''],
  },
};

export default function CreateAgentPage() {
  const router = useRouter();
  const {
    activeWalletType,
    connectStarknet,
    loginWithPrivy,
    starknetWallet,
    privyAuthenticated,
    isLoading,
    privyReady,
    currentAddress,
    derivedStarknetAddress,
    triggerStarknetDerivation,
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

  // Debug logging
  React.useEffect(() => {}, [
    activeWalletType,
    starknetWallet.isConnected,
    privyAuthenticated,
    isLoading,
    privyReady,
    isWalletConnected,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentType, setAgentType] = useState<'leftcurve' | 'rightcurve'>(
    'leftcurve',
  );
  const [currentTab, setCurrentTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState(initialFormData);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleArrayInput = (
    field: ArrayFormField,
    index: number,
    value: string,
  ) => {
    setFormData((prev: FormDataType) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === index ? value : item,
      ),
    }));
  };

  const handleRemoveField = (field: ArrayFormField, index: number) => {
    setFormData((prev: FormDataType) => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index),
    }));
  };

  const handleAddField = (field: ArrayFormField) => {
    setFormData((prev: FormDataType) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const renderArrayField = (
    field: ArrayFormField,
    label: string,
    placeholder: string,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddField(field)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add {label}
        </Button>
      </div>
      <div className="space-y-3">
        {formData[field].map((value: string, index: number) => (
          <div key={index} className="flex gap-2 group">
            <Input
              value={value}
              onChange={(e) => handleArrayInput(field, index, e.target.value)}
              placeholder={placeholder}
              className={`border-2 transition-all duration-200 ${
                agentType === 'leftcurve'
                  ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                  : 'focus:border-purple-500 focus:ring-purple-500/20'
              }`}
            />
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveField(field, index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleNext = () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex < TABS.length - 1) {
      setCurrentTab(TABS[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(TABS[currentIndex - 1]);
    }
  };

  const handleStyleInput = (
    type: keyof typeof formData.style,
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [type]: prev.style[type].map((item, i) => (i === index ? value : item)),
      },
    }));
  };

  const handleMessageExample = (
    index: number,
    type: 'user' | 'agent',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      messageExamples: prev.messageExamples.map((example, i) => {
        if (i !== index) return example;
        const [user, agent] = example;
        if (type === 'user') {
          return [{ ...user, content: { text: value } }, agent];
        } else {
          return [user, { ...agent, content: { text: value } }];
        }
      }),
    }));
  };

  const handleAddMessageExample = () => {
    setFormData((prev) => ({
      ...prev,
      messageExamples: [
        ...prev.messageExamples,
        [
          { user: 'user1', content: { text: '' } },
          { user: formData.name, content: { text: '' } },
        ],
      ],
    }));
  };

  const handleRemoveMessageExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      messageExamples: prev.messageExamples.filter((_, i) => i !== index),
    }));
  };

  const handleAddStyleField = (type: keyof typeof formData.style) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [type]: [...prev.style[type], ''],
      },
    }));
  };

  const handleRemoveStyleField = (
    type: keyof typeof formData.style,
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [type]: prev.style[type].filter((_, i) => i !== index),
      },
    }));
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAddress) {
      showToast('CONNECTION_ERROR');
      return;
    }

    if (!formData.name.trim()) {
      showToast('AGENT_ERROR');
      setCurrentTab('basic');
      return;
    }

    if (!formData.bio.some((b) => b.trim())) {
      showToast('AGENT_ERROR');
      setCurrentTab('personality');
      return;
    }

    if (
      !formData.messageExamples[0][0].content.text.trim() ||
      !formData.messageExamples[0][1].content.text.trim()
    ) {
      showToast('AGENT_ERROR');
      setCurrentTab('examples');
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

      // Enhanced logging for wallet type
      console.log('🔵 Wallet Debug:', {
        walletType: activeWalletType,
        address: currentAddress,
        isEvm: activeWalletType === 'privy',
        isStarknet: activeWalletType === 'starknet',
        derivedAddress: derivedStarknetAddress
      });

      console.log('🔵 Payment Debug:', {
        recipientAddress,
        amountToSend,
        curveSide,
        walletType: activeWalletType,
      });

      // For EVM wallets, we need to use the derived Starknet address
      const effectiveAddress = activeWalletType === 'privy' ? derivedStarknetAddress : address;
      
      // Additional check for derived address
      if (activeWalletType === 'privy' && !derivedStarknetAddress) {
        console.error('❌ No derived Starknet address available for EVM wallet');
        showToast('TX_ERROR', 'error', 'No Starknet address derived for your EVM wallet. Please try reconnecting your wallet.');
        setIsSubmitting(false);
        return;
      }

      console.log('🔵 Contract Debug:', {
        userAddress: effectiveAddress,
        chainId: chain?.id,
        contractAddress: contract?.address,
      });

      if (!contract?.address || !effectiveAddress) {
        throw new Error('Contract or address not available');
      }

      showToast('TX_PENDING', 'loading', 'Sending payment for agent creation...');

      let txHash;

      // Handle transaction differently based on wallet type
      const walletType = activeWalletType as 'privy' | 'starknet' | null;
      
      if (walletType === 'privy') {
        // For EVM wallets, we need to use a different approach
        // We'll use the signature from localStorage to derive the private key
        console.log('🔵 Using EVM-derived wallet for transaction');
        
        // Get the signature from localStorage
        const signature = await signatureStorage.getSignature(currentAddress || '');
        if (!signature) {
          throw new Error('No signature found for EVM wallet. Please reconnect your wallet.');
        }
        
        // Import necessary functions from starknet.js
        const { RpcProvider, Account, uint256 } = await import('starknet');
        
        // Import the function to derive the private key from signature
        const { deriveStarkKeyFromSignature } = await import('@/actions/shared/derive-starknet-account');
        
        // Derive the private key from the signature
        const privateKey = deriveStarkKeyFromSignature(signature);
        
        // Initialize provider
        const provider = new RpcProvider({ 
          nodeUrl: process.env.NEXT_PUBLIC_NODE_URL || 'https://starknet-sepolia.public.blastapi.io'
        });
        
        // Initialize account with the derived private key
        const account = new Account(provider, effectiveAddress as string, privateKey);
        
        // Convert amount to uint256
        const amountBigInt = BigInt(amountToSend);
        const amountUint256 = uint256.bnToUint256(amountBigInt);
        
        console.log('🔵 EVM Transaction Debug:', {
          method: 'transfer',
          contractAddress: contract.address,
          recipient: recipientAddress,
          amount: amountToSend,
          amountLow: amountUint256.low.toString(),
          amountHigh: amountUint256.high.toString(),
        });
        
        // Execute the transaction
        const response = await account.execute({
          contractAddress: contract.address,
          entrypoint: 'transfer',
          calldata: [
            recipientAddress,
            amountUint256.low.toString(),
            amountUint256.high.toString()
          ]
        });
        
        txHash = response.transaction_hash;
        
        // For EVM-derived wallets, we need to manually wait for the transaction
        // instead of using the useTransactionReceipt hook
        console.log('🔵 Manually waiting for transaction confirmation...');
        showToast('TX_PENDING', 'loading', 'Waiting for transaction confirmation...');
        
        try {
          // Wait for transaction to be confirmed
          await provider.waitForTransaction(txHash);
          console.log('✅ Transaction confirmed on L2');
          showToast('TX_SUCCESS', 'success', 'Payment confirmed! Creating your agent...');
          setIsTransactionConfirmed(true);
          
          // Create agent immediately after transaction confirmation
          createAgentAfterTx(txHash);
          
          // Return early since we've handled the transaction confirmation manually
          return;
        } catch (waitError) {
          console.error('❌ Error waiting for transaction:', waitError);
          showToast('TX_ERROR', 'error', 'Error confirming transaction. Please check your wallet.');
          setIsSubmitting(false);
          return;
        }
      } else if (walletType === 'starknet') {
        // For native Starknet wallets, use the starknet-react hooks
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

        console.log('🔵 Transaction Debug:', {
          method: 'transfer',
          params: [recipientAddress, BigInt(amountToSend).toString()],
          calldata: [recipientAddress, BigInt(amountToSend).toString(), '0'],
          evmDerived: activeWalletType === 'privy',
          effectiveAddress,
        });

        const response = await sendAsync([transferCall]);
        txHash = response?.transaction_hash;
      } else {
        throw new Error('Unsupported wallet type');
      }

      if (txHash) {
        console.log('🔵 Transaction Hash:', txHash);
        console.log('🔵 Transaction Submitted:', {
          hash: txHash,
          walletType: activeWalletType,
          effectiveAddress,
          timestamp: new Date().toISOString(),
        });
        setTransactionHash(txHash);
        showToast('TX_SUCCESS', 'success', `Payment sent with hash: ${txHash.slice(0, 10)}...`);
      } else {
        throw new Error('No transaction hash returned');
      }
    } catch (error) {
      console.error('❌ Transaction Error:', error);
      console.error('❌ Transaction Error Details:', {
        walletType: activeWalletType,
        address: currentAddress,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      showToast('TX_ERROR', 'error', 'Failed to send payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const { data: receiptData, error: receiptError } = useTransactionReceipt({
    hash: transactionHash,
    watch: true,
  });

  React.useEffect(() => {
    // Skip this effect for EVM-derived wallets as we handle them manually
    if (isLoading || !transactionHash || activeWalletType === 'privy') return;

    if (receiptError) {
      console.error('❌ Transaction Receipt Error:', receiptError);
      console.error('❌ Receipt Error Details:', {
        hash: transactionHash,
        walletType: activeWalletType,
        error: receiptError instanceof Error ? receiptError.message : String(receiptError),
        timestamp: new Date().toISOString(),
      });
      showToast('TX_ERROR', 'error', 'Transaction failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    if (receiptData) {
      console.log('🔵 Transaction Receipt:', receiptData);
      console.log('🔵 Receipt Details:', {
        hash: transactionHash,
        walletType: activeWalletType,
        finality: 'finality_status' in receiptData ? receiptData.finality_status : 'unknown',
        execution: 'execution_status' in receiptData ? receiptData.execution_status : 'unknown',
        timestamp: new Date().toISOString(),
      });

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
          console.log('✅ Transaction Success Details:', {
            hash: transactionHash,
            walletType: activeWalletType,
            timestamp: new Date().toISOString(),
          });
          showToast('TX_SUCCESS', 'success', 'Payment confirmed! Creating your agent...');
          setIsTransactionConfirmed(true);
          
          // Create agent immediately after transaction confirmation
          createAgentAfterTx(transactionHash);
        } else if (execution_status === 'REVERTED') {
          console.error('❌ Transaction reverted:', receiptData);
          console.error('❌ Revert Details:', {
            hash: transactionHash,
            walletType: activeWalletType,
            finality: finality_status,
            timestamp: new Date().toISOString(),
          });
          showToast('TX_ERROR', 'error', 'Transaction reverted. Please try again.');
          setIsSubmitting(false);
        }
      }
    }
  }, [receiptData, receiptError, isLoading, transactionHash, activeWalletType]);

  // Separate function to create agent after transaction confirmation
  const createAgentAfterTx = async (txHash: string) => {
    if (!txHash || !currentAddress) {
      setIsSubmitting(false);
      return;
    }

    try {
      // For EVM wallets, we need to use the derived Starknet address
      const walletType = activeWalletType as 'privy' | 'starknet' | null;
      const effectiveAddress = walletType === 'privy' ? derivedStarknetAddress : address;
      
      // Additional check for derived address
      if (walletType === 'privy' && !derivedStarknetAddress) {
        console.error('❌ No derived Starknet address available for EVM wallet');
        showToast('AGENT_ERROR', 'error', 'No Starknet address derived for your EVM wallet. Please try reconnecting your wallet.');
        setIsSubmitting(false);
        return;
      }

      console.log('🔵 Creating Agent:', {
        transactionHash: txHash,
        userAddress: currentAddress,
        agentType: agentType,
        walletType: activeWalletType,
        effectiveAddress,
        timestamp: new Date().toISOString(),
      });

      showToast('AGENT_CREATING', 'loading', 'Creating your agent...');

      const result = await createAgent(
        formData.name,
        {
          name: formData.name,
          clients: [],
          modelProvider: 'anthropic',
          settings: { secrets: {}, voice: { model: 'en_US-male-medium' } },
          plugins: [],
          bio: formData.bio.filter(Boolean),
          lore: formData.lore.filter(Boolean),
          knowledge: formData.knowledge.filter(Boolean),
          messageExamples: formData.messageExamples.filter(
            (msg) => msg[0].content.text && msg[1].content.text,
          ),
          postExamples: formData.postExamples.filter(Boolean),
          topics: formData.topics.filter(Boolean),
          style: {
            all: formData.style.all.filter(Boolean),
            chat: formData.style.chat.filter(Boolean),
            post: formData.style.post.filter(Boolean),
          },
          adjectives: formData.adjectives.filter(Boolean),
        },
        agentType === 'leftcurve' ? 'LEFT' : 'RIGHT',
        currentAddress,
        txHash,
        profilePicture || undefined,
      );

      if (result.success) {
        console.log('🔵 Agent Created Successfully:', result);
        showToast('AGENT_SUCCESS', 'success', 'Your agent has been created successfully!');
        
        // Set up redirection after 3 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to home after 3s delay...');
          router.push('/');
        }, 3000);
      } else {
        console.error('❌ Agent Creation Failed:', result.error);
        showToast('AGENT_ERROR', 'error', result.error || 'Failed to create agent');
      }
    } catch (error) {
      console.error('❌ Agent Creation Error:', error);
      showToast('AGENT_ERROR', 'error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = (field: FormField | 'style') => {
    const isLeft = agentType === 'leftcurve';
    const placeholders = {
      name: isLeft ? '🦧 APEtoshi Nakamoto' : '🐙 AlphaMatrix',
      bio: isLeft
        ? 'Born in the depths of /biz/, forged in the fires of degen trades...'
        : 'A sophisticated AI trained on decades of market data and technical analysis...',
      lore: isLeft
        ? "Legend says they once 100x'd their portfolio by following a dream about bananas..."
        : 'Mastered the art of price action through quantum computing simulations...',
      knowledge: isLeft
        ? 'Meme trends, Twitter sentiment, Discord alpha signals...'
        : 'Order flow analysis, market microstructure, institutional trading patterns...',
      topics: isLeft
        ? 'memes, defi, nfts, degen plays'
        : 'derivatives, volatility, market making, arbitrage',
      adjectives: isLeft
        ? 'chaotic, based, memetic, galaxy-brain'
        : 'precise, analytical, strategic, sophisticated',
    };
    return placeholders[field as keyof typeof placeholders] || '';
  };

  const tabs = [
    { id: 'basic', icon: Brain, label: 'Basic' },
    { id: 'personality', icon: MessageSquare, label: 'Personality' },
    { id: 'examples', icon: Pencil, label: 'Examples' },
  ];

  const renderStyleField = (
    type: keyof typeof formData.style,
    label: string,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddStyleField(type)}
          className={`${
            agentType === 'leftcurve'
              ? 'hover:bg-yellow-500/20'
              : 'hover:bg-purple-500/20'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add {label}
        </Button>
      </div>
      {formData.style[type].map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => handleStyleInput(type, index, e.target.value)}
            placeholder={placeholder}
            className="border-2 focus:ring-2 ring-offset-2"
          />
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveStyleField(type, index)}
              className="hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  // Effect to redirect if no address
  useEffect(() => {
    if (!currentAddress) {
      router.push('/');
    }
  }, [currentAddress, router]);

  // Effect to check for derived address for EVM wallets
  useEffect(() => {
    if (activeWalletType === 'privy' && !derivedStarknetAddress) {
      console.log('⚠️ EVM wallet connected but no derived Starknet address found');
      showToast('DEFAULT_ERROR', 'error', 'Waiting for Starknet address derivation. This may take a moment...');
    } else if (activeWalletType === 'privy' && derivedStarknetAddress) {
      console.log('✅ EVM wallet with derived Starknet address:', derivedStarknetAddress);
    }
  }, [activeWalletType, derivedStarknetAddress]);

  // Function to manually trigger Starknet derivation
  const handleManualDerivation = async () => {
    if (activeWalletType !== 'privy') return;
    
    console.log('🔄 Manually triggering Starknet derivation...');
    showToast('DEFAULT_ERROR', 'error', 'Deriving Starknet address. Please sign the message in your wallet...');
    
    try {
      const success = await triggerStarknetDerivation();
      if (success) {
        showToast('TX_SUCCESS', 'success', 'Successfully derived Starknet address!');
      } else {
        showToast('TX_ERROR', 'error', 'Failed to derive Starknet address. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error during manual derivation:', error);
      showToast('TX_ERROR', 'error', 'Error deriving Starknet address. Please try again.');
    }
  };

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const hasRequiredFields = Boolean(
      formData.name &&
      formData.bio.some(b => b.trim()) &&
      formData.messageExamples.some(m => 
        m[0].content.text.trim() && // User message
        m[1].content.text.trim()    // Agent response
      )
    );

    setIsFormValid(hasRequiredFields);
  }, [
    formData.name,
    formData.bio,
    formData.messageExamples
  ]);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-start pt-24">
        <div className="container max-w-2xl mx-auto px-4 pb-24 relative">
          {/* Blur overlay when wallet is not connected */}
          {!isWalletConnected && (
            <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-50 flex flex-col items-center justify-center gap-6 rounded-lg">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">
                  Connect Wallet to Create Agent
                </h3>
                <p className="text-muted-foreground">
                  You need to connect a wallet to deploy your agent
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={connectStarknet}
                  className="bg-gradient-to-r from-yellow-500 to-red-500 hover:opacity-90"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Starknet
                </Button>
                <Button
                  onClick={loginWithPrivy}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect EVM
                </Button>
              </div>
              {activeWalletType === 'privy' && !derivedStarknetAddress && (
                <div className="mt-4">
                  <Button
                    onClick={handleManualDerivation}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Derive Starknet Address
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your Starknet address is being derived. If it takes too long, click the button above.
                  </p>
                </div>
              )}
            </div>
          )}

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

            {/* Header */}
            <div className="text-center space-y-4">
              <h1
                className={`font-sketch text-4xl bg-gradient-to-r ${
                  agentType === 'leftcurve'
                    ? 'from-yellow-500 via-orange-500 to-red-500'
                    : 'from-purple-500 via-indigo-500 to-blue-500'
                } text-transparent bg-clip-text`}
              >
                Deploy Your Agent
              </h1>
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  choose your side anon, there&apos;s no going back 🔥
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    variant={agentType === 'leftcurve' ? 'default' : 'outline'}
                    onClick={() => setAgentType('leftcurve')}
                    className={
                      agentType === 'leftcurve'
                        ? 'bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105 transition-all'
                        : ''
                    }
                  >
                    <span className="mr-2">🦧</span> LeftCurve
                  </Button>
                  <Button
                    variant={agentType === 'rightcurve' ? 'default' : 'outline'}
                    onClick={() => setAgentType('rightcurve')}
                    className={
                      agentType === 'rightcurve'
                        ? 'bg-purple-500 hover:bg-purple-600 transform hover:scale-105 transition-all'
                        : ''
                    }
                  >
                    <span className="mr-2">🐙</span> RightCurve
                  </Button>
                </div>
                <motion.div
                  className="space-y-1"
                  initial={false}
                  animate={{ x: agentType === 'leftcurve' ? 0 : 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <p className="text-muted-foreground text-sm">
                    {agentType === 'leftcurve'
                      ? 'Creative chaos, meme magic, and pure degen energy'
                      : 'Technical mastery, market wisdom, and calculated alpha'}
                  </p>
                  <p className="text-[13px] text-muted-foreground italic">
                    {agentType === 'leftcurve'
                      ? 'For those who believe fundamentals are just vibes'
                      : 'For those who see patterns in the matrix'}
                  </p>
                </motion.div>
                <p className="text-[12px] text-yellow-500/70 animate-pulse">
                  Midcurvers ngmi 😭
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-muted rounded-full h-2 mb-6">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  agentType === 'leftcurve' ? 'bg-yellow-500' : 'bg-purple-500'
                }`}
                style={{
                  width: `${
                    ((TABS.indexOf(currentTab) + 1) / TABS.length) * 100
                  }%`,
                }}
              />
            </div>

            {/* Form */}
            <Card className="border-2 shadow-lg">
              <CardContent className="pt-6">
                <div>
                  <Tabs
                    value={currentTab}
                    onValueChange={(value) => setCurrentTab(value as TabType)}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 mb-4">
                      {tabs.map(({ id, icon: Icon, label }) => (
                        <TabsTrigger
                          key={id}
                          value={id}
                          className={`transition-all duration-200 ${
                            currentTab === id
                              ? `${
                                  agentType === 'leftcurve'
                                    ? 'data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-700'
                                    : 'data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700'
                                }`
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-medium">
                          Agent Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder={getPlaceholder('name')}
                          required
                          className={`border-2 transition-all duration-200 ${
                            agentType === 'leftcurve'
                              ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                              : 'focus:border-purple-500 focus:ring-purple-500/20'
                          }`}
                        />
                      </div>

                      <ProfilePictureUpload
                        onFileSelect={setProfilePicture}
                        agentType={agentType}
                      />

                      {renderArrayField(
                        'topics',
                        'Topics',
                        getPlaceholder('topics'),
                      )}
                      {renderArrayField(
                        'adjectives',
                        'Adjectives',
                        getPlaceholder('adjectives'),
                      )}
                    </TabsContent>

                    <TabsContent value="personality" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Bio</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddField('bio')}
                            className={`${
                              agentType === 'leftcurve'
                                ? 'hover:bg-yellow-500/20'
                                : 'hover:bg-purple-500/20'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                            Add Bio Entry
                          </Button>
                        </div>
                        {formData.bio.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <textarea
                              className="min-h-[80px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:ring-2 ring-offset-2"
                              value={item}
                              onChange={(e) =>
                                handleArrayInput('bio', index, e.target.value)
                              }
                              placeholder={getPlaceholder('bio')}
                            />
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveField('bio', index)}
                                className="hover:bg-red-500/20 self-start"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {renderArrayField('lore', 'Lore', getPlaceholder('lore'))}
                      {renderArrayField(
                        'knowledge',
                        'Knowledge',
                        getPlaceholder('knowledge'),
                      )}
                    </TabsContent>

                    <TabsContent value="examples" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Message Examples</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddMessageExample}
                            className={`${
                              agentType === 'leftcurve'
                                ? 'hover:bg-yellow-500/20'
                                : 'hover:bg-purple-500/20'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                            Add Example
                          </Button>
                        </div>
                        {formData.messageExamples.map((example, index) => (
                          <Card
                            key={index}
                            className={`p-4 relative border-2 transition-all duration-200 group ${
                              agentType === 'leftcurve'
                                ? 'hover:border-yellow-500/50'
                                : 'hover:border-purple-500/50'
                            }`}
                          >
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveMessageExample(index)
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-700 absolute top-2 right-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <div className="space-y-3">
                              <textarea
                                className={`min-h-[60px] w-full rounded-md border-2 bg-background px-3 py-2 text-sm transition-all duration-200 ${
                                  agentType === 'leftcurve'
                                    ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                                    : 'focus:border-purple-500 focus:ring-purple-500/20'
                                }`}
                                value={example[0].content.text}
                                onChange={(e) =>
                                  handleMessageExample(
                                    index,
                                    'user',
                                    e.target.value,
                                  )
                                }
                                placeholder={
                                  agentType === 'leftcurve'
                                    ? 'wen moon ser?'
                                    : "What's your analysis of current market conditions?"
                                }
                              />
                              <textarea
                                className={`min-h-[60px] w-full rounded-md border-2 bg-background px-3 py-2 text-sm transition-all duration-200 ${
                                  agentType === 'leftcurve'
                                    ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                                    : 'focus:border-purple-500 focus:ring-purple-500/20'
                                }`}
                                value={example[1].content.text}
                                onChange={(e) =>
                                  handleMessageExample(
                                    index,
                                    'agent',
                                    e.target.value,
                                  )
                                }
                                placeholder={
                                  agentType === 'leftcurve'
                                    ? 'ngmi if you have to ask anon 🚀'
                                    : 'Based on order flow analysis and market structure...'
                                }
                              />
                            </div>
                          </Card>
                        ))}
                      </div>

                      {renderStyleField(
                        'all',
                        'General Style',
                        agentType === 'leftcurve'
                          ? 'Uses excessive emojis and meme slang'
                          : 'Maintains professional and analytical tone',
                      )}
                      {renderStyleField(
                        'chat',
                        'Chat Style',
                        agentType === 'leftcurve'
                          ? 'Responds with degen enthusiasm'
                          : 'Provides detailed market analysis',
                      )}
                      {renderStyleField(
                        'post',
                        'Post Style',
                        agentType === 'leftcurve'
                          ? 'Creates viral meme content'
                          : 'Writes educational threads',
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex gap-4 pt-6">
                  {currentTab !== 'basic' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {currentTab !== 'examples' ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className={`flex-1 ${
                        agentType === 'leftcurve'
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      Next
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      className={`w-full font-bold ${
                        agentType === 'leftcurve'
                          ? 'bg-gradient-to-r from-yellow-500 to-red-500 hover:opacity-90'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90'
                      }`}
                      disabled={isSubmitting || !isFormValid}
                      onClick={handleDeploy}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          DEPLOYING...
                        </>
                      ) : (
                        <>
                          <Flame className="mr-2 h-5 w-5" />
                          DEPLOY {agentType === 'leftcurve' ? '🦧' : '🐙'} AGENT
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
