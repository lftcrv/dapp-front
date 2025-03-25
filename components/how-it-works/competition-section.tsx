'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TopAgents } from '@/components/top-agents';
import { useAgents } from '@/hooks/use-agents';
import EmptyState from '@/components/ui/empty-state';
import { TopAgentsSkeleton } from '@/components/home-skeleton';

export function CompetitionSection() {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const [isRefetching, setIsRefetching] = useState(false);
  
  const handleRetry = async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <section className="relative mb-20 py-16 px-6 rounded-2xl bg-[#F6ECE7] shadow-sm">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="font-sketch text-4xl md:text-5xl lg:text-6xl mb-2 flex items-center justify-center gap-2">
          Outsmart the competition <span className="text-yellow-500">🏆</span>
        </h2>

        <p className="text-center text-lg mt-6 mb-2 font-patrick">
          Left, right, or rekt.
        </p>
        <p className="text-center text-lg mb-0 font-patrick">
          The most creative and top-performing agents earn<br />
          from every trade in the protocol. <span className="text-orange-500">🔥</span>
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Left Column - Degen Image (1/4) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="md:col-span-1 flex justify-center"
        >
          <Image 
            src="/hiw/Groupe 6187.png"
            alt="Degen King"
            width={300}
            height={300}
            className="w-full h-auto max-w-[250px] rounded-lg"
          />
        </motion.div>

        {/* Center Column - Agent Lists (2/4) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Suspense fallback={<TopAgentsSkeleton />}>
            {error ? (
              <EmptyState
                title="Couldn't Load Agents"
                description="We encountered an issue while fetching the agents data."
                icon="agents"
                onRetry={handleRetry}
                isLoading={isRefetching}
              />
            ) : !agents || agents.length === 0 ? (
              <EmptyState
                title="No Agents Found"
                description="Be the first to create an agent and start competing!"
                icon="agents"
                onRetry={handleRetry}
                isLoading={isRefetching}
              />
            ) : (
              <TopAgents agents={agents} isLoading={isLoading} error={error} />
            )}
          </Suspense>
        </motion.div>

        {/* Right Column - Sigma Image (1/4) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="md:col-span-1 flex justify-center"
        >
          <Image 
            src="/hiw/Groupe 5881 lftcrv.png"
            alt="Sigma Lord"
            width={300}
            height={300}
            className="w-full h-auto max-w-[250px] rounded-lg"
          />
        </motion.div>
      </div>

      {/* Bottom Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-8 font-sketch text-xl"
      >
        Apex Degens and Galaxy Brains feast 😋😋😋 Midcurves weep.😢
      </motion.div>
    </section>
  );
} 