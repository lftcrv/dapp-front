'use client';

import React, { memo, useMemo, useEffect, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';

// Add Battery API types
interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

// Extend Navigator interface
interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface TickerItem {
  id: string;
  content: React.ReactNode;
}

interface AnimatedTickerProps {
  items: TickerItem[];
  speed?: 'normal' | 'fast' | 'faster';
}

const AnimatedTicker = ({ items, speed = 'normal' }: AnimatedTickerProps) => {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  
  // Create a repeated list to ensure continuous scrolling
  const repeatedItems = useMemo(() => {
    // Ensure we have enough items for smooth scrolling but limit to avoid excessive DOM nodes
    if (items.length < 5) {
      let repeated = [...items];
      // Only duplicate up to 10 items maximum to reduce DOM nodes
      while (repeated.length < 10) {
        repeated = [...repeated, ...items.map(item => ({
          ...item,
          id: `${item.id}-repeat-${repeated.length}`
        }))];
      }
      return repeated;
    }
    return items;
  }, [items]);

  // Determine animation speed classes based on the speed prop
  const getAnimationDuration = () => {
    switch(speed) {
      case 'fast':
        return 15;
      case 'faster':
        return 8;
      default:
        return 25;
    }
  };

  const duration = getAnimationDuration();
  
  // Limit the number of emoji indicators to reduce rendering load
  // Only render 4 emojis maximum for better performance
  const indicators = useMemo(() => [
    { value: '🚀', color: 'bg-green-500', delay: 2 },
    { value: '💎', color: 'bg-blue-500', delay: 6 },
    { value: '🔥', color: 'bg-orange-500', delay: 11 },
    { value: '🌙', color: 'bg-indigo-600', delay: 17 },
  ], []);

  // Use Intersection Observer to only animate when visible in viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    const currentElement = document.getElementById('animated-ticker');
    if (currentElement) observer.observe(currentElement);
    
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, []);

  // Battery status check to reduce animations when on low battery
  useEffect(() => {
    const checkBattery = async () => {
      const nav = navigator as NavigatorWithBattery;
      if (typeof nav.getBattery !== 'function') return;
      
      try {
        const battery = await nav.getBattery();
        if (battery.level < 0.2 && !battery.charging) {
          // On low battery, reduce animations
          controls.start('reducedMotion');
        }
        
        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2 && !battery.charging) {
            controls.start('reducedMotion');
          } else {
            controls.start('normal');
          }
        });
        
        battery.addEventListener('chargingchange', () => {
          if (battery.level < 0.2 && !battery.charging) {
            controls.start('reducedMotion');
          } else {
            controls.start('normal');
          }
        });
      } catch (_) {
        console.log('Battery status not available');
      }
    };
    
    checkBattery();
  }, [controls]);

  return (
    <motion.div 
      id="animated-ticker"
      className="relative w-full overflow-hidden border border-black will-change-transform"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => {
        controls.start('hover');
        
      }}
      onMouseLeave={() => {
        controls.start('normal');
  
      }}
      whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
      {/* Flashing background effect - only runs when visible and not in reduced motion mode */}
      {isVisible && !prefersReducedMotion && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 will-change-transform"
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ 
            opacity: [0, 0.7, 0],
            x: ['100%', '-100%']
          }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "loop", 
            duration: 3.5, 
            ease: "easeInOut",
            repeatDelay: 1.5
          }}
        />
      )}
      
      {/* Dynamic emoji indicators - only show when visible and not in reduced motion mode */}
      {isVisible && !prefersReducedMotion && indicators.map((indicator, index) => (
        <motion.div
          key={`indicator-${index}`}
          className={`absolute ${indicator.color} rounded-full p-1.5 shadow-lg backdrop-blur-sm flex items-center justify-center will-change-transform`}
          style={{
            top: `${15 + (index % 4) * 20}%`,
            left: `${10 + ((index * 17) % 80)}%`,
            zIndex: 10,
            width: "28px",
            height: "28px"
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={isVisible ? {
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
            rotate: [-10, 10, -5, 10]
          } : { opacity: 0 }}
          transition={{
            duration: 3,
            times: [0, 0.2, 0.8, 1],
            repeat: Infinity,
            repeatDelay: indicator.delay,
            delay: index
          }}
        >
          <motion.span 
            className="text-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.2, 0.9, 1.1, 1] }}
            transition={{ 
              duration: 1.2, 
              repeat: 1, 
              repeatType: "reverse",
              ease: "easeInOut",
              times: [0, 0.3, 0.5, 0.8, 1]
            }}
          >
            {indicator.value}
          </motion.span>
        </motion.div>
      ))}
      
      {/* Container */}
      <div className="relative h-14 overflow-hidden">
        <motion.div 
          className="flex whitespace-nowrap h-full will-change-transform"
          initial={{ x: '0%' }}
          animate={{ x: isVisible && !prefersReducedMotion ? '-100%' : '0%' }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: prefersReducedMotion ? duration * 1.5 : duration,
            ease: "linear",
            repeatDelay: 0
          }}
        >
          {/* First set of items */}
          {repeatedItems.map((item, index) => (
            <motion.div 
              key={item.id}
              className={`h-full flex items-center justify-center px-6 
                ${index % 2 === 0 ? 'bg-[#FFD8B9]/80' : 'bg-[#E9BFFF]/80'} 
                border-r border-black min-w-max relative`}
              whileHover={{ 
                backgroundColor: index % 2 === 0 ? 'rgba(255, 216, 185, 1)' : 'rgba(233, 191, 255, 1)',
                scale: 1.04,
                y: -2,
                transition: { duration: 0.2 }
              }}
              initial={false}
            >
              <motion.div
                animate={controls}
                variants={{
                  normal: { scale: 1 },
                  hover: { scale: 1.05 },
                  reducedMotion: { scale: 1 }
                }}
                transition={{ duration: 0.2 }}
              >
                {item.content}
              </motion.div>
              
              {/* Subtle indicator dot - only animate when visible */}
              {isVisible && !prefersReducedMotion && (
                <motion.div 
                  className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  initial={{ opacity: 0.6 }}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2 % 2 // Stagger the animations
                  }}
                />
              )}
            </motion.div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {repeatedItems.map((item, index) => (
            <motion.div 
              key={`${item.id}-dup`}
              className={`h-full flex items-center justify-center px-6 
                ${index % 2 === 0 ? 'bg-[#FFD8B9]/80' : 'bg-[#E9BFFF]/80'} 
                border-r border-black min-w-max relative`}
              whileHover={{ 
                backgroundColor: index % 2 === 0 ? 'rgba(255, 216, 185, 1)' : 'rgba(233, 191, 255, 1)',
                scale: 1.04,
                y: -2,
                transition: { duration: 0.2 }
              }}
              initial={false}
            >
              <motion.div
                animate={controls}
                variants={{
                  normal: { scale: 1 },
                  hover: { scale: 1.05 },
                  reducedMotion: { scale: 1 }
                }}
                transition={{ duration: 0.2 }}
              >
                {item.content}
              </motion.div>
              
              {/* Subtle indicator dot - only animate when visible */}
              {isVisible && !prefersReducedMotion && (
                <motion.div 
                  className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  initial={{ opacity: 0.6 }}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2 % 2 // Stagger the animations
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Data pulse effect - only show when visible and not in reduced motion mode */}
      {isVisible && !prefersReducedMotion && (
        <motion.div
          className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent will-change-transform"
          animate={{
            opacity: [0, 0.7, 0],
            scaleX: [0.2, 1, 0.2],
            x: ['0%', '100%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export default memo(AnimatedTicker);
