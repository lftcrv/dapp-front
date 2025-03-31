'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, memo } from 'react';

// Optimized animation variants with reduced complexity
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
      ease: "easeOut",
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Static class definitions
const FEATURE_COLOR_CLASSES = {
  0: {
    bg: "bg-violet-100",
    bgLight: "bg-violet-50",
    text: "text-violet-900",
    bullet: "bg-violet-500"
  },
  1: {
    bg: "bg-orange-100",
    bgLight: "bg-orange-50",
    text: "text-orange-900",
    bullet: "bg-orange-500"
  },
  2: {
    bg: "bg-blue-100",
    bgLight: "bg-blue-50",
    text: "text-blue-900",
    bullet: "bg-blue-500"
  },
  3: {
    bg: "bg-teal-100",
    bgLight: "bg-teal-50",
    text: "text-teal-900",
    bullet: "bg-teal-500"
  },
  4: {
    bg: "bg-amber-100",
    bgLight: "bg-amber-50",
    text: "text-amber-900",
    bullet: "bg-amber-500"
  }
} as const;

// Feature component props type
type FeatureProps = {
  title: string;
  icon: string;
  points: readonly string[];
  index: number;
  iconAlt?: string;
}

// Memoized bullet point component
const BulletPoint = memo(function BulletPoint({ 
  point, 
  bulletClass 
}: { 
  point: string; 
  bulletClass: string;
}) {
  return (
    <motion.li 
      variants={itemVariants}
      className="flex items-start"
    >
      <span className={`mt-2 mr-3 block w-1.5 h-1.5 rounded-full ${bulletClass} flex-shrink-0`} />
      <span className="font-patrick text-lg leading-relaxed text-black/80">
        {point}
      </span>
    </motion.li>
  );
});

// Optimized feature component
const Feature = memo(function Feature({ title, icon, points, index, iconAlt }: FeatureProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const isEven = index % 2 === 0;
  const colorIndex = index % 5;
  const colors = FEATURE_COLOR_CLASSES[colorIndex as keyof typeof FEATURE_COLOR_CLASSES];
  
  // Position classes based on even/odd
  const orderClasses = isEven ? 'md:order-first' : 'md:order-last';
  const contentClasses = isEven ? 'md:order-last pl-2' : 'md:order-first pr-2';
  const numPosition = isEven ? 'left-6' : 'right-6';
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={itemVariants}
      className="mb-14 last:mb-6 relative"
    >
      <div className="relative rounded-3xl overflow-hidden bg-white/10 shadow-sm transform-gpu">
        {/* Feature number indicator */}
        <div className={`absolute top-6 ${numPosition} font-sketch text-4xl opacity-10`}>
          {(index + 1).toString().padStart(2, '0')}
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 px-6 md:px-8">
          {/* Icon column */}
          <div className={`md:col-span-3 flex justify-center ${orderClasses}`}>
            <div className="relative">
              {/* Static background */}
              <div className={`absolute inset-0 rounded-full ${colors.bg} opacity-40 -z-10`} />
              
              {/* Icon with optimized animation */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "tween", duration: 0.2 }}
                className={`p-4 rounded-full ${colors.bgLight} shadow-sm transform-gpu`}
              >
                <Image 
                  src={`/hiw/${icon}`}
                  alt={iconAlt || title}
                  width={120}
                  height={120}
                  className="w-24 h-24 object-contain" 
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>
          
          {/* Content column */}
          <div className={`md:col-span-9 ${contentClasses}`}>
            <motion.h3 
              variants={itemVariants}
              className={`font-sketch text-2xl md:text-3xl mb-4 ${colors.text}`}
            >
              {title}
            </motion.h3>
            
            <motion.ul 
              variants={containerVariants}
              className="space-y-3"
            >
              {points.map((point, idx) => (
                <BulletPoint
                  key={idx}
                  point={point}
                  bulletClass={colors.bullet}
                />
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Features data
const FEATURES = [
  {
    title: "Blockchain Abstraction",
    icon: "Groupe.png",
    points: [
      "All wallets, all blockchains—one seamless arena powered by StarkNet's Layer 2 infrastructure.",
      "Cross-chain compatibility means everyone can join the action without switching wallets."
    ]
  },
  {
    title: "Hundreds of Cryptocurrencies",
    icon: "Groupe (1).png",
    points: [
      "Agents execute seamless cryptotrading via Paradex",
      "Deep liquidity and precision execution."
    ]
  },
  {
    title: "Advanced Trading Intelligence",
    icon: "Groupe 6287.png",
    points: [
      "Multi-timeframe Technical Analysis, including RSI, MACD, Ichimoku, Stochastic, pivots, candlestick patterns (Hammer, Doji, etc.).",
      "Future Enhancements, including Integration of macroeconomic signals and social sentiment analysis."
    ]
  },
  {
    title: "Fee Switch (Protocol Revenue Sharing)",
    icon: "Groupe 6173.png",
    points: [
      "Protocol fees are collected in $LEFT and distributed to holders of successful agents.",
      "Revenue isn't just about stonks—both top performers and meme champions get a slice."
    ]
  },
  {
    title: "Security",
    icon: "Groupe 6289 - lftcrv.png",
    points: [
      "All deposits are secured by StarkNet's proven L2 infrastructure."
    ]
  }
] as const;

export const UnderHoodSection = memo(function UnderHoodSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section 
      ref={ref}
      className="relative mb-16 pt-12 pb-12 px-4 rounded-[2rem] bg-[#F6ECE7] shadow-sm overflow-hidden"
    >
      {/* Static background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-100/10 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-100/10 -z-10" />
      
      {/* Section Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h2 className="font-sketch text-5xl md:text-6xl relative inline-block mb-4">
          <span className="relative z-10">Under the Hood</span>
          <span className="absolute -top-2 -right-2 left-2 bottom-2 bg-orange-100/20 rounded-full blur-lg -z-10" />
        </h2>
        
        <p className="font-patrick text-xl text-black/70 max-w-xl mx-auto leading-relaxed">
          Explore the powerful technology that powers our trading platform
        </p>
      </motion.div>

      {/* Features */}
      <div className="max-w-5xl mx-auto">
        {FEATURES.map((feature, index) => (
          <Feature 
            key={index}
            {...feature}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}); 