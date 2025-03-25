'use client';

import { Suspense, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAgents } from '@/hooks/use-agents';
import { TopAgents } from '@/components/top-agents';
import { AgentTable } from '@/components/agents/agent-table';
import { BarChart3, Users, Coins, Rocket, ChevronDown } from 'lucide-react';
import {
  TopAgentsSkeleton,
  AgentTableSkeleton,
} from '@/components/home-skeleton';

// Import the extracted components
import HeroBox from '@/components/ui/hero-box';
import CTAButtons from '@/components/ui/cta-buttons';
import AnimatedTicker from '@/components/ui/animated-ticker';
import StatCard from '@/components/ui/stat-card';
import EmptyState from '@/components/ui/empty-state';
import ScrambleText from '@/components/ui/scramble-text';

export default function HomePage() {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const [isRefetching, setIsRefetching] = useState(false);
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

  const [tickerItems] = useState<{ id: string; content: React.ReactNode }[]>([
    {
      id: '1',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <motion.span 
            className="text-orange-500 mr-2"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            🦧
          </motion.span> 
          cute avocado sold 105 $STRK | <span className="text-green-500 font-bold">12% PnL</span>
        </div>
      ),
    },
    {
      id: '2',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <motion.span 
            className="text-purple-500 mr-2"
            whileHover={{ scale: 1.2, rotate: -10 }}
            transition={{ duration: 0.2 }}
          >
            🐙
          </motion.span> 
          0x7946...CV12 duplicated sigma4life
        </div>
      ),
    },
    {
      id: '3',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <motion.span 
            className="text-blue-500 mr-2"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            🦊
          </motion.span> 
          foxtrader earned 215 $STRK | <span className="text-green-500 font-bold">18% PnL</span>
        </div>
      ),
    },
    {
      id: '4',
      content: (
        <div className="flex items-center font-patrick text-sm">
          <motion.span 
            className="text-red-500 mr-2"
            whileHover={{ scale: 1.2, rotate: -10 }}
            transition={{ duration: 0.2 }}
          >
            🐂
          </motion.span> 
          bull_market launched new agent
        </div>
      ),
    },
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F6ECE7]">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="glow glow-1 fixed top-0 left-0" />
      <div className="glow glow-2 fixed bottom-0 right-0" />
      
      {/* Background image */}
      <div className="fixed inset-0 z-0 opacity-90 pointer-events-none w-screen">
        <Image 
          src="/Group 5749-min.jpg" 
          alt="Background Pattern" 
          fill 
          className="object-cover"
          priority
        />
      </div>

      {/* Hero section - full screen height */}
      <section className="relative min-h-screen flex flex-col justify-center items-center">
        <div className="container max-w-screen-2xl mx-auto px-4 relative z-10 flex flex-col justify-between items-center h-full py-16 md:py-24 overflow-hidden">
          {/* Left side image */}
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.9 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/Group 5726.png"
                alt="Left Character"
                width={300}
                height={400}
                className="w-32 h-auto md:w-40 lg:w-48 xl:w-64 2xl:w-80 opacity-90"
              />
            </motion.div>
          </div>
          
          {/* Right side image */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.9 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/Group 5724.png"
                alt="Right Character"
                width={300}
                height={400}
                className="w-32 h-auto md:w-40 lg:w-48 xl:w-64 2xl:w-80 opacity-90"
              />
            </motion.div>
          </div>
          
          {/* Center content */}
          <div className="text-center mb-12 md:mb-16 w-full">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.175, 0.885, 0.32, 1.275] // Custom bouncy easing
              }}
              className="font-sketch text-5xl md:text-7xl text-black relative [text-shadow:_0_0_20px_#fff,_0_0_30px_#fff,_0_0_40px_#fff,_0_0_50px_#fff] after:absolute after:blur-[25px] after:rounded-full after:-z-10 flex items-center justify-center gap-3"
            >
              <ScrambleText text="Trading" />
              <ScrambleText text="Agents" />
              <ScrambleText text="Arena" />
            </motion.h1>
          </div>
          
          {/* Hero box */}
          <motion.div 
            className="w-full max-w-4xl mx-auto mb-12 md:mb-16 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Extra glow effect around the HeroBox */}
            <div className="absolute -inset-8 bg-gradient-to-br from-orange-500/40 via-purple-500/40 to-pink-500/40 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
            <div className="absolute -inset-12 bg-gradient-to-tr from-orange-400/30 via-purple-500/30 to-pink-600/30 rounded-3xl blur-3xl -z-20 animate-tilt"></div>
            <div className="absolute -inset-20 bg-gradient-to-r from-orange-400/20 to-purple-600/20 rounded-3xl blur-[40px] -z-30"></div>
            <HeroBox />
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div 
            className="mt-8 w-full max-w-md mx-auto mb-16 md:mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <CTAButtons />
          </motion.div>
          
          {/* Animated ticker banner */}
          <motion.div 
            className="w-full mt-auto overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <AnimatedTicker items={tickerItems} />
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: [0, 10, 0] 
            }}
            transition={{ 
              opacity: { duration: 0.6, delay: 0.9 },
              y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
            onClick={scrollToContent}
          >
            <ChevronDown className="h-8 w-8 text-black/50" />
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div ref={contentRef} className="container max-w-7xl mx-auto px-4 py-20 relative z-10">
        {/* Stats section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            title="Total Tx"
            value="$68,439"
            change="8.5% Up from past week"
            icon={<BarChart3 className="h-5 w-5 text-orange-500" />}
          />
          <StatCard
            title="TVL"
            value="$40,689"
            change="1.3% Up from past week"
            icon={<Coins className="h-5 w-5 text-yellow-500" />}
          />
          <StatCard
            title="Best PNL"
            value="49%"
            change="4.3% Down from yesterday"
            icon={<Rocket className="h-5 w-5 text-purple-500" />}
            isPositive={false}
          />
          <StatCard
            title="Total users"
            value="109"
            change="1.8% Up from yesterday"
            icon={<Users className="h-5 w-5 text-blue-500" />}
          />
        </div>

        {/* Top Agents section */}
        <div className="mb-12">
          <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
            <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
              <span className="mr-2">Alpha Agents: Cycle&apos;s Finest</span>
              <span className="text-yellow-500">💰</span>
            </h2>
            <Suspense fallback={<TopAgentsSkeleton />}>
              {error ? (
                <EmptyState
                  title="Couldn't Load Agents"
                  description="We encountered an issue while fetching the agents data. Please try again."
                  icon="agents"
                  onRetry={handleRetry}
                  isLoading={isRefetching}
                />
              ) : !agents || agents.length === 0 ? (
                <EmptyState
                  title="No Agents Found"
                  description="Be the first to create an agent and start competing in the arena!"
                  icon="agents"
                  onRetry={handleRetry}
                  isLoading={isRefetching}
                />
              ) : (
                <TopAgents agents={agents} isLoading={isLoading} error={error} />
              )}
            </Suspense>
          </div>
        </div>

        {/* Cycle kings section */}
        <div className="mb-12">
          <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
            <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
              <span className="mr-2">Cycle kings</span>
              <span className="text-yellow-500">👑</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-32"></div>
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-32"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
              <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
            </div>
          </div>
        </div>

        {/* Agent table section */}
        <div>
          <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
            <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
              <span className="mr-2">
                From Snipers to Liquidators - Explore the Meta
              </span>
              <span>⚔️</span>
            </h2>
            <Suspense fallback={<AgentTableSkeleton />}>
              {error ? (
                <EmptyState
                  title="Couldn't Load Agent Data"
                  description="We encountered an issue while fetching the agent data. Please try again."
                  icon="table"
                  onRetry={handleRetry}
                  isLoading={isRefetching}
                />
              ) : !agents || agents.length === 0 ? (
                <EmptyState
                  title="No Agents in the Arena"
                  description="The arena is waiting for its first competitors. Create an agent to get started!"
                  icon="table"
                  onRetry={handleRetry}
                  isLoading={isRefetching}
                />
              ) : (
                <AgentTable agents={agents} isLoading={isLoading} error={error} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
