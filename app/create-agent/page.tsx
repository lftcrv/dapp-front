'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { useAccount, useContract, useNetwork, useSendTransaction, useTransactionReceipt } from '@starknet-react/core';
import { type Abi } from 'starknet';

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
  } = useWallet();

  // Move hooks to component level
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contract } = useContract({
    abi: [
      {
        type: "function",
        name: "transfer",
        state_mutability: "external",
        inputs: [
          { name: "recipient", type: "core::starknet::contract_address::ContractAddress" },
          { name: "amount", type: "core::integer::u256" },
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

  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);
  const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false);

  // Debug logging
  React.useEffect(() => {
  }, [
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
      showToast('CONNECTION_ERROR', 'error');
      return;
    }
  
    if (!formData.name.trim()) {
      showToast('AGENT_ERROR', 'error');
      setCurrentTab('basic');
      return;
    }
  
    if (!formData.bio.some((b) => b.trim())) {
      showToast('AGENT_ERROR', 'error');
      setCurrentTab('personality');
      return;
    }
  
    if (!formData.messageExamples[0][0].content.text.trim() ||
        !formData.messageExamples[0][1].content.text.trim()) {
      showToast('AGENT_ERROR', 'error');
      setCurrentTab('examples');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const curveSide = agentType === 'leftcurve' ? 'LEFT' : 'RIGHT';
      const recipientAddress = process.env.NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT;
      const amountToSend = process.env.NEXT_PUBLIC_DEPLOYMENT_FEES;

      if (!recipientAddress || !amountToSend) {
        throw new Error("Deployment fees not configured");
      }

      console.log('🔵 Payment Debug:', {
        recipientAddress,
        amountToSend,
        curveSide,
      });

      console.log('🔵 Contract Debug:', {
        userAddress: address,
        chainId: chain?.id,
        contractAddress: contract?.address,
      });
  
      if (!contract || !address) {
        throw new Error("Contract or address not available");
      }

      // Call transfer directly
      const transferCall = {
        contractAddress: contract.address,
        entrypoint: "transfer",
        calldata: [
          recipientAddress,
          BigInt(amountToSend).toString(),
          "0" // For uint256, we need low and high parts
        ]
      };
      
      console.log('🔵 Transaction Debug:', {
        method: 'transfer',
        params: [recipientAddress, BigInt(amountToSend).toString()],
        calldata: [recipientAddress, BigInt(amountToSend).toString(), "0"]
      });
  
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
      console.error("❌ Transaction Receipt Error:", receiptError);
      showToast('TX_ERROR', 'error');
    }
  
    if (receiptData && receiptData.isSuccess()) {
      console.log('🔵 Transaction Receipt:', {
        status: 'success',
        receipt: receiptData,
      });
      showToast('TX_SUCCESS', 'success', transactionHash);
      setIsTransactionConfirmed(true);
    }
  }, [receiptData, receiptError, isLoading, transactionHash]);

  React.useEffect(() => {
    if (!isTransactionConfirmed || !transactionHash || !currentAddress) return;
  
    const createAgentAfterTx = async () => {
      try {
        console.log('🔵 Creating Agent:', {
          transactionHash,
          userAddress: currentAddress,
          agentType,
        });

        // Show the creating toast when we start the agent creation
        showToast('AGENT_CREATING', 'loading');

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
            messageExamples: formData.messageExamples.filter(msg => msg[0].content.text && msg[1].content.text),
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
          transactionHash
        );
  
        if (result.success) {
          console.log('🔵 Agent Created Successfully:', result);
          // This will automatically dismiss the AGENT_CREATING toast
          showToast('AGENT_SUCCESS', 'success');
          router.push('/');
        } else {
          console.error('❌ Agent Creation Failed:', result.error);
          // This will automatically dismiss the AGENT_CREATING toast
          showToast('AGENT_ERROR', 'error');
        }
      } catch (error) {
        console.error('❌ Agent Creation Error:', error);
        // This will automatically dismiss the AGENT_CREATING toast
        showToast('AGENT_ERROR', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    createAgentAfterTx();
  }, [isTransactionConfirmed, transactionHash]);
  

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
                  width: `${((TABS.indexOf(currentTab) + 1) / TABS.length) * 100}%`,
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
                      disabled={isSubmitting}
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
