'use client';

import { Suspense, memo } from 'react';
import Image from 'next/image';
import { HeroSection } from '@/components/how-it-works/hero-section';
import { BuildAgentsSection } from '@/components/how-it-works/build-agents-section';
import { CompetitionSection } from '@/components/how-it-works/competition-section';
import { UnderHoodSection } from '@/components/how-it-works/under-hood-section';
import { useAgents } from '@/hooks/use-agents';
import { useState, useCallback } from 'react';

// Memoize imported components to prevent unnecessary re-renders
const MemoizedHeroSection = memo(HeroSection);
const MemoizedBuildAgentsSection = memo(BuildAgentsSection);
const MemoizedCompetitionSection = memo(CompetitionSection);
const MemoizedUnderHoodSection = memo(UnderHoodSection);

// Loading fallback component
const SectionFallback = () => (
  <div className="w-full h-[300px] bg-gray-100/20 animate-pulse rounded-2xl"></div>
);

export default function HowItWorksPage() {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } finally {
      setIsRefetching(false);
    }
  }, [refetch]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F6ECE7]">
      {/* Background elements - with will-change optimization */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="glow glow-1 fixed top-0 left-0" />
      <div className="glow glow-2 fixed bottom-0 right-0" />

      {/* Background image with optimized loading */}
      <div className="fixed inset-0 z-0 opacity-90 pointer-events-none w-screen">
        <Image
          src="/Group 5749-min.jpg"
          alt="Background Pattern"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          fetchPriority="high"
          loading="eager"
        />
      </div>

      {/* Main content container with spacing for navbar */}
      <div className="container max-w-7xl mx-auto px-4 py-20 mt-16 relative z-10">
        {/* Hero Section Component - Always render without Suspense since it's above the fold */}
        <MemoizedHeroSection />

        {/* Below the fold components wrapped in Suspense for better performance */}
        <Suspense fallback={<SectionFallback />}>
          <MemoizedBuildAgentsSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <MemoizedCompetitionSection
            agents={agents}
            isLoading={isLoading}
            error={error}
            isRefetching={isRefetching}
            handleRetry={handleRetry}
          />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <MemoizedUnderHoodSection />
        </Suspense>
      </div>
    </main>
  );
}
