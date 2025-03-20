'use client';


import { useRouter } from 'next/navigation';
import { Rocket, Flame } from 'lucide-react';
import { memo } from 'react';
import { motion } from 'framer-motion';

const Title = memo(() => (
  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="font-sketch text-7xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text mt-12"
  >
    Trading Agent Arena
  </motion.h1>
));
Title.displayName = 'Title';

const Description = memo(() => (
  <div className="max-w-3xl mx-auto px-6 py-4 mb-12 bg-gradient-to-r from-yellow-500/5 via-pink-500/5 to-purple-500/5 backdrop-blur-sm rounded-lg leading-relaxed space-y-3">
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="text-base font-medium text-neutral-700 font-mono"
    >
      your strategy, your agent, your edge - finally executed exactly how you
      want it. embrace the chaos or master the precision - but don&apos;t you
      dare stay in the middle 😤
    </motion.p>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="text-base font-medium text-neutral-700 font-mono"
    >
      protocol fees? split between based curves only. midcurvers stay ngmi and
      get nothing fr
    </motion.p>
  </div>
));
Description.displayName = 'Description';

const ActionButtons = memo(() => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-6 w-full max-w-[1000px] mx-auto px-4 py-6 my-4">
      <div className="flex justify-center gap-6 w-[60%] mb-4">
        <div className="relative group shadow-[0_6px_15px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden w-1/2 transition-transform duration-200 ease-in-out hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-600"></div>
          <button 
            onClick={() => router.push('/create-agent')}
            className="relative px-6 py-2 bg-gradient-to-r from-orange-300 from-5% via-orange-400 via-50% to-purple-500 to-95% text-black font-mono text-lg font-normal m-[1px] rounded-2xl w-[calc(100%-2px)] h-[calc(100%-2px)] flex items-center justify-center transition-all duration-200 ease-in-out hover:shadow-[0_0_3px_2px_rgba(0,0,0,0.7)]"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Deploy Your Agent
          </button>
        </div>
        
        <div className="relative group shadow-[0_6px_15px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden w-1/2 transition-transform duration-200 ease-in-out hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-600"></div>
          <button
            onClick={() => router.push('/leaderboard')}
            className="relative px-6 py-2 bg-white text-black font-mono text-lg m-[1px] rounded-2xl w-[calc(100%-2px)] h-[calc(100%-2px)] flex items-center justify-center transition-all duration-200 ease-in-out"
          >
            <Flame className="mr-2 h-4 w-4" />
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
});
ActionButtons.displayName = 'ActionButtons';

const HomeHeader = memo(() => {
  return (
    <div className="text-center space-y-4">
      <div className="space-y-4 mt-4">
        <Title />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl text-yellow-500/90 font-mono font-semibold"
        >
          Left, Right or Rekt 💀
        </motion.p>
        <Description />
      </div>
      <ActionButtons />
    </div>
  );
});
HomeHeader.displayName = 'HomeHeader';

export default HomeHeader;