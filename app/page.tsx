'use client';

import { Suspense, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAgents } from '@/hooks/use-agents';
import { useCreators } from '@/hooks/use-creators';
import Background from '@/components/ui/background';
// Import home components without Background
import {
  HeroSection,
  StatsSection,
  TopAgentsSection,
  CycleKingsSection,
  AgentTableSection,
  TopCreatorsSection,
} from '@/components/home';

export default function HomePage() {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const { 
    data: creators, 
    isLoading: isLoadingCreators, 
    error: creatorsError, 
    refetch: refetchCreators 
  } = useCreators(6); // Fetch 6 creators to display
  
  const [isRefetching, setIsRefetching] = useState(false);
  const [isRefetchingCreators, setIsRefetchingCreators] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRetry = useCallback(async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  }, [refetch]);

  const handleRetryCreators = useCallback(async () => {
    setIsRefetchingCreators(true);
    await refetchCreators();
    setIsRefetchingCreators(false);
  }, [refetchCreators]);

  const [tickerItems] = useState<{ id: string; content: React.ReactNode }[]>([
    {
      id: '1',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <span className="text-orange-500 mr-2">🦧</span>
          cute avocado sold 105 $STRK |{' '}
          <span className="text-green-500 font-bold">12% PnL</span>
        </div>
      ),
    },
    {
      id: '2',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <span className="text-purple-500 mr-2">🐙</span>
          0x7946...CV12 duplicated sigma4life
        </div>
      ),
    },
    {
      id: '3',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <span className="text-blue-500 mr-2">🦊</span>
          foxtrader earned 215 $STRK |{' '}
          <span className="text-green-500 font-bold">18% PnL</span>
        </div>
      ),
    },
    {
      id: '4',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <span className="text-red-500 mr-2">🐂</span>
          bull_market launched new agent
        </div>
      ),
    },
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F6ECE7]">
      {/* Background elements */}
      <Background />

      {/* Hero section - full screen height */}
      <HeroSection scrollToContent={scrollToContent} />

      {/* Main content */}
      <div
        ref={contentRef}
        className="container max-w-7xl mx-auto px-4 py-20 relative z-10"
      >
        {/* Stats section */}
        <StatsSection />

        {/* Top Agents section */}
        <TopAgentsSection
          agents={agents}
          isLoading={isLoading}
          error={error}
          isRefetching={isRefetching}
          handleRetry={handleRetry}
        />

        {/* Top Creators section */}
        <TopCreatorsSection
          creators={creators}
          isLoading={isLoadingCreators}
          error={creatorsError}
          isRefetching={isRefetchingCreators}
          handleRetry={handleRetryCreators}
        />

        {/* Cycle kings section */}
        {/* <CycleKingsSection /> */}

        {/* Agent table section */}
        <AgentTableSection
          agents={agents}
          isLoading={isLoading}
          error={error}
          isRefetching={isRefetching}
          handleRetry={handleRetry}
        />
      </div>
    </main>
  );
}
