'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';

const HeroBox = () => {
  return (
    <div className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
      {/* Glowing border with blur effect - matching the image */}
      <div className="absolute inset-0 -z-10 blur-2xl rounded-2xl bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500 opacity-70"></div>
      <div className="absolute inset-[-5px] -z-20 blur-3xl rounded-3xl bg-gradient-to-tr from-orange-400 via-purple-500 to-pink-600 opacity-60 animate-tilt"></div>
      <div className="absolute inset-[-10px] -z-30 blur-[40px] rounded-3xl bg-gradient-to-r from-orange-400 to-purple-600 opacity-50"></div>
      
      {/* Content container */}
      <div className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden w-full z-10">
        {/* Left column - Launch Agents */}
        <motion.div
          className="flex-1 bg-[#F6ECE7] p-8 md:p-10 flex flex-col items-center justify-center text-black border-r border-black/30"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.7, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        >
          <motion.h2 
            className="font-sketch text-3xl md:text-4xl mb-3 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Launch Agents
          </motion.h2>
          <motion.div 
            className="flex items-center justify-center gap-2 mb-4 w-full px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Grid container - matching the trophy section layout */}
            <div className="grid grid-cols-7 items-center gap-4 w-full max-w-md">
              {/* Money emoji column */}
              <div className="col-span-2 flex justify-end">
                <motion.span 
                  className="text-5xl rotate-10 inline-block"
                  animate={{ 
                    rotate: [10, 15, 10],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  💸
                </motion.span>
              </div>

              {/* Text column */}
              <div className="col-span-5 flex justify-center items-center">
                <p className="text-3xl font-patrick text-center">Print the gains</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="text-xl md:text-2xl font-sketch text-center text-orange-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Forever
          </motion.div>
        </motion.div>

        {/* Right column - Compete */}
        <motion.div
          className="flex-1 bg-black p-8 md:p-10 flex flex-col items-center justify-center text-white"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.7, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        >
          <motion.h2 
            className="font-sketch text-3xl md:text-4xl mb-3 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Compete
          </motion.h2>
          <motion.div 
            className="flex items-center justify-center gap-2 w-full px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Grid container */}
            <div className="grid grid-cols-7 items-center gap-4 w-full max-w-md">
              {/* Trophy emoji column */}
              <div className="col-span-2 flex justify-end">
                <motion.span 
                  className="text-5xl -rotate-10 inline-block"
                  animate={{ 
                    rotate: [-10, -15, -10],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  🏆
                </motion.span>
              </div>

              {/* Amount column with background */}
              <div className="col-span-5 relative flex justify-center items-center h-16">
                {/* Background image - positioned to match example */}
                <div className="absolute inset-0 flex justify-center items-center">
                  <Image
                    src="/surligneur_home.png"
                    alt="highlight"
                    width={240}
                    height={60}
                    className="object-contain h-20"
                    priority
                  />
                </div>
                
                {/* Amount text - perfectly centered on the image */}
                <span className="text-black font-patrick text-3xl font-bold relative z-10">
                  1, 500 $
                </span>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="font-mono text-center mt-4 text-yellow-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <CountdownTimer targetDate={new Date('2025-04-30T23:59:00Z')} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(HeroBox);
