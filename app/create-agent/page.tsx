'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, Loader2, RefreshCw } from 'lucide-react';
import { createAgent } from '@/actions/agents/create/createAgent';
import { showToast } from '@/lib/toast';
import { useWallet } from '@/app/context/wallet-context';
import {
  useAccount,
  useContract,
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

type AgentType = 'leftcurve' | 'rightcurve';

interface FormData {
  name: string;
  keywords: string[];
  riskTolerance: number;
  analysisPeriod: number;
  interval: number;
  internal_plugins: string[];
  bio: string;
  objectives: string[];
  lore: string;
  knowledge: string;
  degenScore?: number;
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
  internal_plugins: ['rpc', 'paradex', 'leftcurve'],
  bio: '',
  objectives: [],
  lore: '',
  knowledge: '',
};

export default function CreateAgentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [agentType, setAgentType] = useState<AgentType>('leftcurve');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [responseTextLLM, setresponseTextLLM] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bioGenAttempted, setBioGenAttempted] = useState(false);
  const [degenScoreLLM, setDegenScoreLLM] = useState(5);
  const [curveValue, setCurveValue] = useState(50);

  useEffect(() => {
    if (formData.degenScore) {
      setDegenScoreLLM(formData.degenScore);
    }
  }, [formData.degenScore]);

  useEffect(() => {
    const analysisPeriodWeight = (formData.analysisPeriod / 5) * 100;

    const degenScoreWeight = (degenScoreLLM / 10) * 100;
    // using all three components:
    // - riskTolerance (50%)
    // - inverse analysisPeriod (20%) - shorter periods are more "degen"
    // - degenScore (30%) - more creative/original bios are more "degen"
    const weightedCurveValue =
      formData.riskTolerance * 0.5 +
      (100 - analysisPeriodWeight) * 0.2 +
      degenScoreWeight * 0.3;

    setCurveValue(Math.round(weightedCurveValue));

    if (weightedCurveValue > 60) {
      setAgentType('leftcurve');
    } else {
      setAgentType('rightcurve');
    }
  }, [formData.riskTolerance, formData.analysisPeriod, degenScoreLLM]);

  const {
    connectStarknet,
    loginWithPrivy,
    starknetWallet,
    privyAuthenticated,
    isLoading,
    privyReady,
    currentAddress,
  } = useWallet();

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

  const { sendAsync } = useSendTransaction({
    calls: undefined,
  });

  const cleanResponseText = (text: string) => {
    let cleaned = text.replace(/\|\|\|DEGEN SCORE: \d+\|\|\|/g, '').trim();

    cleaned = cleaned.replace(
      /\*\*Agent Name:\*\*.*?\*\*Three Additional Words:\*\*.*?(?=### Biography)/s,
      '',
    );

    return cleaned.trim();
  };

  const isWalletConnected = React.useMemo(() => {
    if (isLoading || !privyReady) return false;
    return starknetWallet.isConnected || privyAuthenticated;
  }, [isLoading, privyReady, starknetWallet.isConnected, privyAuthenticated]);

  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined,
  );
  const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false);

  const extractDegenScore = (text: string) => {
    const match = text.match(/\|\|\|DEGEN SCORE: (\d+)\|\|\|/);
    return match ? parseInt(match[1]) : null;
  };

  const generateAgentProfile = useCallback(async () => {
    const hasName = formData.name.trim() !== '';
    const hasKeywords = formData.keywords.every((kw) => kw.trim() !== '');

    if (!hasName || !hasKeywords || isGenerating) return;

    try {
      setIsGenerating(true);

      // Calculate seriousness level based on risk tolerance (inverse relationship)
      // 0 risk = 10 seriousness, 100 risk = 0 seriousness
      const seriousnessLevel = Math.floor(Math.random() * 11);

      const prompt = `You are an expert in creating unique, personality-driven crypto trading agents. Given the following inputs:
    
  - **Agent Name:** ${formData.name}
  - **Seriousness Level (0-10):** ${seriousnessLevel.toFixed(
    1,
  )} (0 = ultra-serious and robotic, 10 = completely absurd and humorous)
  - **Three Additional Words:** ${formData.keywords.join(
    ', ',
  )} (Use these words to inspire the agent's character, motivations, or trading philosophy)
  
  Generate a **detailed configuration** for this crypto trading agent with the following structured fields:
  
  ### Biography (2-3 sentences)
  Describe who the agent is, their personality, and their background in a concise but engaging way. Incorporate the given inputs creatively.
  
  ### Objectives (2-3 sentences)
  Explain what drives the agent beyond just making money. Link these goals to its personality and unique quirks.
  
  ### Lore (2-3 sentences)
  A fun or mysterious backstory element that adds depth to the agent. It can be humorous, dramatic, or surreal depending on the seriousness level.
  
  ### Knowledge & Expertise (2-3 sentences)
  What kind of market knowledge does the agent have? Is it based on technical analysis, fundamental research, memes, astrology, or something unique? How does it justify its decisions?
  
  Finish your response by providing a |||DEGEN SCORE: {X}||| (where X is a number between 1-10), calculated based on:
  1-3: Conventional crypto trader character - Follows typical trader archetypes (analytical expert, seasoned investor, technical analyst) without distinguishing traits or originality in its biography.
  4: Slightly unique trader - Has some interesting background elements or personality quirks.
  5-6: Noticeably original character - Features distinctive personality traits, unusual backstory elements, or unconventional trading approaches that set them apart.
  7-8: Highly unique trader persona - Possesses a truly creative combination of traits, unexpected motivations, and an original approach to markets that breaks from standard trader archetypes.
  9-10: Completely original concept - Represents a wildly innovative trader character with unprecedented combination of traits, bizarre or surreal elements, and a truly unique market philosophy.
  
  Score based primarily on character originality and creative concept rather than just risk appetite. Let the seriousness level guide how absurd or grounded the character's uniqueness appears.
  Ensure that the generated agent is **cohesive, entertaining, and functional**, aligning with the given inputs in tone and personality.`;

      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const GEMINI_API_URL =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent';

      const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      const responseText = data.candidates[0].content.parts[0].text;
      console.log(responseText);

      const degenScore = extractDegenScore(responseText);
      console.log('DEGEN SCORE:', degenScore);
      setDegenScoreLLM(degenScore || 5);

      const cleanedResponseText = cleanResponseText(responseText);
      console.log('Cleaned response:', cleanedResponseText);

      setresponseTextLLM(cleanedResponseText);
      setFormData((prev) => ({
        ...prev,
        bio: cleanedResponseText || prev.bio,
        degenScore: degenScore || 0,
      }));

      setBioGenAttempted(true);
    } catch (error) {
      console.error('Error generating agent profile:', error);
      const simpleBio = `${formData.name} is a ${
        agentType === 'leftcurve' ? 'degen' : 'calculated'
      } trader focusing on ${formData.keywords.join(', ')}. Has a ${
        formData.riskTolerance > 70
          ? 'high'
          : formData.riskTolerance > 40
          ? 'moderate'
          : 'conservative'
      } risk tolerance and prefers ${
        formData.analysisPeriod > 3
          ? 'long-term'
          : formData.analysisPeriod > 1.5
          ? 'medium-term'
          : 'short-term'
      } market analysis.`;
      setFormData((prev) => ({
        ...prev,
        bio: simpleBio,
        degenScore: 0,
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [
    formData.name,
    formData.keywords,
    formData.riskTolerance,
    formData.analysisPeriod,
    agentType,
    isGenerating,
  ]);

  useEffect(() => {
    const hasName = formData.name.trim() !== '';
    const hasKeywords = formData.keywords.every((kw) => kw.trim() !== '');
    setIsFormValid(hasName && hasKeywords);

    if (!formData.internal_plugins.includes('leftcurve')) {
      setFormData((prev) => ({
        ...prev,
        internal_plugins: [...prev.internal_plugins, 'leftcurve'],
      }));
    }
  }, [formData.name, formData.keywords, formData.internal_plugins]);

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

      const transferCall = {
        contractAddress: contract.address,
        entrypoint: 'transfer',
        calldata: [recipientAddress, BigInt(amountToSend).toString(), '0'],
      };

      showToast('TX_PENDING', 'loading');

      const response = await sendAsync([transferCall]);

      if (response?.transaction_hash) {
        console.log('🔵 Transaction Hash:', response.transaction_hash);
        setTransactionHash(response.transaction_hash);
        showToast('TX_SUCCESS', 'success', response.transaction_hash);

        await createAgentWithTxHash(response.transaction_hash);
      }
    } catch (error) {
      console.error('❌ Transaction Error:', error);
      showToast('TX_ERROR', 'error');
      setIsSubmitting(false);
    }
  };

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

      const tradingBehavior = `Risk profile: ${
        formData.riskTolerance
      }/100. Analysis timeframe: ${
        formData.analysisPeriod > 3
          ? 'Long-term'
          : formData.analysisPeriod > 1.5
          ? 'Medium-term'
          : 'Short-term'
      } focus.`;
      const objectives =
        formData.objectives.length > 0
          ? formData.objectives
          : [`Trading Behavior: ${tradingBehavior}`];
      const knowledge = formData.knowledge
        ? [formData.knowledge]
        : formData.keywords.map((kw) => `Knowledge area: ${kw}`);

      const agentConfig: AgentConfig = {
        name: formData.name,
        bio: formData.bio,
        lore: formData.lore ? [formData.lore] : [],
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

  React.useEffect(() => {
    if (isLoading || !transactionHash) return;

    if (receiptError) {
      console.error('❌ Transaction Receipt Error:', receiptError);
      showToast('TX_ERROR', 'error');
    }

    if (receiptData) {
      console.log('🔵 Transaction Receipt:', receiptData);

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

  useEffect(() => {
    if (!currentAddress && !isLoading && privyReady) {
      router.push('/');
    }
  }, [currentAddress, router, isLoading, privyReady]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-2xl mx-auto px-4 pb-24 relative">
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
              <span className="text-xs font-medium z-10 text-gray-900">
                🐙 RightCurve
              </span>
              <span className="text-xs font-medium z-10 text-gray-900">
                🦧 LeftCurve
              </span>
            </div>
          </div>

          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleDeploy} className="space-y-6">
                <h1
                  className={`font-sketch text-4xl bg-gradient-to-r ${
                    agentType === 'leftcurve'
                      ? 'from-yellow-500 via-orange-500 to-red-500'
                      : 'from-purple-500 via-indigo-500 to-blue-500'
                  } text-transparent bg-clip-text text-center`}
                >
                  Deploy Your Agent
                </h1>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Agent Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      setBioGenAttempted(false);
                    }}
                    placeholder={
                      agentType === 'leftcurve'
                        ? '🦧 APEtoshi Nakamoto'
                        : '🐙 AlphaMatrix'
                    }
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

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">
                      Personality Keywords
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBioGenAttempted(false);
                        generateAgentProfile();
                      }}
                      disabled={
                        !formData.name ||
                        !formData.keywords.every((k) => k.trim())
                      }
                      className={`${
                        isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Generate Profile
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter 3 keywords that define your agent&apos;s trading
                    identity and expertise
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((index) => (
                      <Input
                        key={index}
                        value={formData.keywords[index]}
                        onChange={(e) => {
                          const newKeywords = [...formData.keywords];
                          newKeywords[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            keywords: newKeywords,
                          }));
                          setBioGenAttempted(false);
                        }}
                        placeholder={
                          index === 0
                            ? 'e.g., technical'
                            : index === 1
                            ? 'e.g., aggressive'
                            : 'e.g., defi'
                        }
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

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label
                      htmlFor="risk-tolerance"
                      className="text-base font-medium"
                    >
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
                    onValueChange={(values) =>
                      setFormData((prev) => ({
                        ...prev,
                        riskTolerance: values[0],
                      }))
                    }
                    className={`${
                      agentType === 'leftcurve'
                        ? 'accent-yellow-500'
                        : 'accent-purple-500'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label
                      htmlFor="analysis-period"
                      className="text-base font-medium"
                    >
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
                    onValueChange={(values) =>
                      setFormData((prev) => ({
                        ...prev,
                        analysisPeriod: values[0],
                      }))
                    }
                    className={`${
                      agentType === 'leftcurve'
                        ? 'accent-yellow-500'
                        : 'accent-purple-500'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Short-term</span>
                    <span>Medium-term</span>
                    <span>Long-term</span>
                  </div>
                </div>

                <div className="space-y-2 bg-muted/50 p-4 rounded-lg relative">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">
                      Generated Agent Profile
                    </Label>
                    {isGenerating ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      bioGenAttempted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setBioGenAttempted(false);
                            generateAgentProfile();
                          }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate
                        </Button>
                      )
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="min-h-[120px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm whitespace-pre-line">
                        {formData.bio ||
                          'Click "Generate Profile" to create agent biography'}
                      </p>
                    </div>
                  )}
                </div>

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
