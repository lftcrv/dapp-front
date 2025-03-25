'use client';

import Image from 'next/image';

export default function Background() {
  return (
    <>
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Glow effects */}
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
    </>
  );
} 