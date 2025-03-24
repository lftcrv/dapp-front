'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, Loader2 } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { WalletConnectionOverlay } from '@/components/create-agent/WalletConnectionOverlay';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Type definitions for the new form structure
type AgentType = 'leftcurve' | 'rightcurve';

interface FormData {
  name: string;
  keywords: string[];
  riskTolerance: number;
  analysisPeriod: number;
  interval: number;
  internal_plugins: string[];
  bio: string; // Will be generated based on keywords
}

const generateRandomChatId = () => {
  return Math.random().toString(36).substring(2, 14);
};

const initialFormData: FormData = {
  name: '',
  keywords: ['', '', ''],
  riskTolerance: 50,
  analysisPeriod: 2.5,
  interval: 30,
  internal_plugins: ['rpc', 'paradex'],
  bio: '',
};

export default function CreateAgentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [agentType, setAgentType] = useState<AgentType>('leftcurve');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate agent type based on risk tolerance
  useEffect(() => {
    if (formData.riskTolerance > 60) {
      setAgentType('leftcurve');
    } else {
      setAgentType('rightcurve');
    }
  }, [formData.riskTolerance]);

  // Dynamic curve value for the indicator (0-100)
  const curveValue = formData.riskTolerance;

  const {
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

  // Form validation
  useEffect(() => {
    const hasName = formData.name.trim() !== '';
    const hasKeywords = formData.keywords.every(kw => kw.trim() !== '');
    setIsFormValid(hasName && hasKeywords);
    
    // Generate bio based on keywords (placeholder for actual generation)
    if (hasKeywords && hasName) {
      const generatedBio = `${formData.name} is a ${agentType === 'leftcurve' ? 'degen' : 'calculated'} trader focusing on ${formData.keywords.join(', ')}. Has a ${formData.riskTolerance > 70 ? 'high' : formData.riskTolerance > 40 ? 'moderate' : 'conservative'} risk tolerance and prefers ${formData.analysisPeriod > 3 ? 'long-term' : formData.analysisPeriod > 1.5 ? 'medium-term' : 'short-term'} market analysis.`;
      setFormData(prev => ({...prev, bio: generatedBio}));
    }
  }, [formData.name, formData.keywords, formData.riskTolerance, formData.analysisPeriod, agentType]);

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData(prev => ({...prev, keywords: newKeywords}));
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAddress) {
      showToast('CONNECTION_ERROR');
      return;
    }

    if (!isFormValid) {
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

      // Convert keywords to knowledge and objectives
      const knowledge = formData.keywords.map(kw => `Knowledge area: ${kw}`);
      const tradingBehavior = `Risk profile: ${formData.riskTolerance}/100. Analysis timeframe: ${formData.analysisPeriod > 3 ? 'Long-term' : formData.analysisPeriod > 1.5 ? 'Medium-term' : 'Short-term'} focus.`;
      const objectives = [`Trading Behavior: ${tradingBehavior}`];

      const agentConfig: AgentConfig = {
        name: formData.name,
        bio: formData.bio,
        lore: [], // Simplified - no separate lore
        objectives: objectives,
        knowledge: knowledge,
        interval: formData.interval,
        chat_id: generateRandomChatId(),
        external_plugins: [],
        internal_plugins: formData.internal_plugins,
      };

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

  // Monitor transaction status
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

          {/* Curve Indicator */}
          <div className="w-full bg-gray-100 h-12 rounded-lg relative overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                agentType === 'leftcurve' 
                  ? 'bg-gradient-to-r from-yellow-500 to-red-500' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${curveValue}%` }}
            />
            <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-4">
              <span className="text-xs font-medium z-10 text-gray-900">🐙 RightCurve</span>
              <span className="text-xs font-medium z-10 text-gray-900">🦧 LeftCurve</span>
            </div>
          </div>

          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleDeploy} className="space-y-6">
                <h1 className={`font-sketch text-4xl bg-gradient-to-r ${
                  agentType === 'leftcurve'
                    ? 'from-yellow-500 via-orange-500 to-red-500'
                    : 'from-purple-500 via-indigo-500 to-blue-500'
                } text-transparent bg-clip-text text-center`}>
                  Deploy Your Agent
                </h1>

                {/* Agent Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Agent Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder={agentType === 'leftcurve' ? '🦧 APEtoshi Nakamoto' : '🐙 AlphaMatrix'}
                    required
                    className={`border-2 transition-all duration-200 ${
                      agentType === 'leftcurve'
                        ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                        : 'focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                  />
                </div>

                {/* Profile Picture */}
                <ProfilePictureUpload
                  onFileSelect={setProfilePicture}
                  agentType={agentType}
                />

                {/* Keywords */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Personality Keywords
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enter 3 keywords that define your agent's trading identity and expertise
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((index) => (
                      <Input
                        key={index}
                        value={formData.keywords[index]}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder={index === 0 ? "e.g., technical" : index === 1 ? "e.g., aggressive" : "e.g., defi"}
                        required
                        className={`border-2 transition-all duration-200 ${
                          agentType === 'leftcurve'
                            ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                            : 'focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Risk Tolerance Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="risk-tolerance" className="text-base font-medium">
                      Risk Tolerance
                    </Label>
                    <span className="text-sm font-medium">
                      {formData.riskTolerance}/100
                    </span>
                  </div>
                  <Slider
                    id="risk-tolerance"
                    min={1}
                    max={100}
                    step={1}
                    value={[formData.riskTolerance]}
                    onValueChange={(values) => setFormData(prev => ({...prev, riskTolerance: values[0]}))}
                    className={`${
                      agentType === 'leftcurve' ? 'accent-yellow-500' : 'accent-purple-500'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                {/* Analysis Period Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="analysis-period" className="text-base font-medium">
                      Analysis Period Preference
                    </Label>
                    <span className="text-sm font-medium">
                      {formData.analysisPeriod.toFixed(1)}/5
                    </span>
                  </div>
                  <Slider
                    id="analysis-period"
                    min={0}
                    max={5}
                    step={0.1}
                    value={[formData.analysisPeriod]}
                    onValueChange={(values) => setFormData(prev => ({...prev, analysisPeriod: values[0]}))}
                    className={`${
                      agentType === 'leftcurve' ? 'accent-yellow-500' : 'accent-purple-500'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Short-term</span>
                    <span>Medium-term</span>
                    <span>Long-term</span>
                  </div>
                </div>

                {/* Technical Configuration Section */}
                <div className="space-y-4 border-t pt-6">
                  <Label className="text-lg font-medium">Technical Settings</Label>
                  
                  {/* Check Interval */}
                  <div className="p-4 border rounded-lg space-y-2">
                    <Label htmlFor="interval" className="text-base font-medium">
                      Check Interval
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      How often should your agent check for trading opportunities?
                    </p>
                    <Select
                      value={formData.interval.toString()}
                      onValueChange={(value) => setFormData(prev => ({...prev, interval: parseInt(value)}))}
                    >
                      <SelectTrigger className="w-full" id="interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: 5, label: '5 minutes' },
                          { value: 10, label: '10 minutes' },
                          { value: 15, label: '15 minutes' },
                          { value: 30, label: '30 minutes' },
                          { value: 60, label: '1 hour' },
                          { value: 180, label: '3 hours' },
                          { value: 360, label: '6 hours' },
                          { value: 720, label: '12 hours' },
                          { value: 1440, label: '24 hours' },
                        ].map((interval) => (
                          <SelectItem key={interval.value} value={interval.value.toString()}>
                            {interval.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Plugins */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-base font-medium">Internal Plugins</Label>
                    <p className="text-sm text-muted-foreground">
                      Select the plugins your agent will use for trading and on-chain interactions.
                    </p>
                    <div className="grid gap-4 pt-2">
                      {['rpc', 'leftcurve', 'paradex'].map((plugin) => {
                        const isSelected = formData.internal_plugins.includes(plugin);
                        const pluginLabels = {
                          'rpc': 'RPC (Blockchain Data Access)',
                          'leftcurve': 'Avnu (DEX Integration)',
                          'paradex': 'Paradex (Perpetual Trading)'
                        };
                        const pluginDescriptions = {
                          'rpc': 'Allows the agent to query on-chain data and blockchain state',
                          'leftcurve': 'Enables trading on Avnu DEX for onchain swap',
                          'paradex': 'Provides perpetual futures trading capabilities'
                        };
                        
                        const handlePluginToggle = () => {
                          if (plugin === 'avnu') return; // Don't allow toggling "avnu"
                          
                          setFormData(prev => {
                            if (isSelected) {
                              return {
                                ...prev, 
                                internal_plugins: prev.internal_plugins.filter(p => p !== plugin)
                              };
                            } else {
                              return {
                                ...prev,
                                internal_plugins: [...prev.internal_plugins, plugin]
                              };
                            }
                          });
                        };
                        
                        return (
                          <div
                            key={plugin}
                            className="flex items-start space-x-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`plugin-${plugin}`}
                              checked={isSelected}
                              onCheckedChange={handlePluginToggle}
                              className="mt-1"
                            />
                            <div className="space-y-1">
                              <Label
                                htmlFor={`plugin-${plugin}`}
                                className="font-medium cursor-pointer"
                              >
                                {pluginLabels[plugin as keyof typeof pluginLabels]}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {pluginDescriptions[plugin as keyof typeof pluginDescriptions]}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Generated Bio Preview */}
                <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                  <Label className="text-base font-medium">Generated Agent Bio</Label>
                  <p className="text-sm">{formData.bio || "Complete all fields to generate a bio"}</p>
                </div>

                {/* Deploy Button */}
                <Button
                  type="submit"
                  size="lg"
                  className={`w-full font-bold ${
                    agentType === 'leftcurve'
                      ? 'bg-gradient-to-r from-yellow-500 to-red-500 hover:opacity-90'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90'
                  }`}
                  disabled={isSubmitting || !isFormValid}
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
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}