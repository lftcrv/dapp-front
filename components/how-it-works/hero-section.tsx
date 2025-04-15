'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative mb-20 overflow-hidden rounded-2xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left column with title and video - black background */}
        <div className="relative z-10 bg-black text-white p-8 md:p-12 lg:p-16">
          <h1 className="font-sketch text-6xl md:text-7xl lg:text-7xl mb-6">
            Build. <br />
            Grind. <br />
            Compete.
          </h1>
        
          <div className="relative rounded-xl overflow-hidden mt-10">
            {/* Absolutely minimal HTML5 video */}
            <video 
              width="100%" 
              height="auto" 
              controls
              poster="/hiw/Lftcrv Group 6173.png"
            >
              <source src="/hiw/Build Grind Compete.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        
        {/* Right column with image - F6ECE7 background */}
        <div className="relative z-10 bg-[#F6ECE7] p-8 md:p-12 lg:p-16 flex items-center justify-center">
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
        </div>
      </div>
    </section>
  );
} 