'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative mb-20 overflow-hidden rounded-2xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left column with title and video placeholder - black background */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.7, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="relative z-10 bg-black text-white p-8 md:p-12 lg:p-16"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sketch text-6xl md:text-7xl lg:text-7xl mb-6"
          >
            Build. <br />
            Grind. <br />
            Compete.
          </motion.h1>
        
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative rounded-xl overflow-hidden sketch-border bg-white/5 backdrop-blur-sm mt-10"
          >
            <Image 
              src="/hiw/Lftcrv Group 6173.png"
              alt="How It Works Video"
              width={600}
              height={400}
              className="w-full h-auto"
            />
            {/* Video overlay indicator - enhanced play button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
              >
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1"></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right column with image - F6ECE7 background */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="relative z-10 bg-[#F6ECE7] p-8 md:p-12 lg:p-16 flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            <div className="absolute -inset-4 bg-gradient-to-br rounded-3xl blur-xl"></div>
            <Image 
              src="/hiw/Lftcrv Group 6282.png"
              alt="How It Works Illustration"
              width={700}
              height={500}
              className="w-full h-auto rounded-lg relative z-10"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
} 