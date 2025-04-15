'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import HeroBox from '@/components/ui/hero-box';
import CTAButtons from '@/components/ui/cta-buttons';
import ScrambleText from '@/components/ui/scramble-text';
import AnimatedTicker from '@/components/ui/animated-ticker';
import { useTickerAgents } from '@/hooks/useTickerAgents';
import { Skeleton } from '@/components/ui/skeleton';

type HeroSectionProps = {
  scrollToContent: () => void;
}

export default function HeroSection({ scrollToContent }: HeroSectionProps) {
  const { tickerItems, isLoading, error, refreshTickerData } = useTickerAgents();
  
  return (
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
              priority
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
              priority
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
          className="w-full mt-auto overflow-hidden bg-white/10 backdrop-blur-sm rounded-lg shadow-sm border border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <AnimatePresence>
            {isLoading ? (
              <div className="px-4 py-3 flex items-center">
                <Skeleton className="h-5 w-full" />
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-sm text-red-500">
                Unable to load market data. <button onClick={refreshTickerData} className="underline">Retry</button>
              </div>
            ) : tickerItems.length > 0 ? (
              <AnimatedTicker items={tickerItems} speed="fast" />
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No market data available
              </div>
            )}
          </AnimatePresence>
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
  );
} 