'use client';

import React, { memo, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TickerItem {
  id: string;
  content: React.ReactNode;
  isNew?: boolean;
  isShaking?: boolean;
}

interface AnimatedTickerProps {
  items: TickerItem[];
  onAddItem?: (item: TickerItem) => void;
}

const AnimatedTicker = ({ items }: AnimatedTickerProps) => {
  const [tickerItems, setTickerItems] = useState(items);
  
  // Create a repeated list to ensure continuous scrolling
  const repeatedItems = useMemo(() => {
    // If we have fewer than 5 items, repeat them to ensure continuous scrolling
    if (tickerItems.length < 5) {
      let repeated = [...tickerItems];
      while (repeated.length < 10) {
        repeated = [...repeated, ...tickerItems.map(item => ({
          ...item,
          id: `${item.id}-repeat-${repeated.length}`
        }))];
      }
      return repeated;
    }
    return tickerItems;
  }, [tickerItems]);
  
  // Function to add a new item with animation
  const addNewItem = (newItem: TickerItem) => {
    setTickerItems(prev => [{ ...newItem, isNew: true }, ...prev]);
    
    // Remove the "new" flag after animation completes
    setTimeout(() => {
      setTickerItems(prev => 
        prev.map(item => 
          item.id === newItem.id ? { ...item, isNew: false } : item
        )
      );
    }, 3000);
  };

  // Random shake animation for ticker items
  useEffect(() => {
    const shakeRandomItem = () => {
      if (tickerItems.length === 0) return;
      
      // Select a random item to shake
      const randomIndex = Math.floor(Math.random() * tickerItems.length);
      const itemToShake = tickerItems[randomIndex];
      
      // Set the shaking flag
      setTickerItems(prev => 
        prev.map((item, index) => 
          index === randomIndex ? { ...item, isShaking: true } : item
        )
      );
      
      // Remove the shaking flag after animation completes
      setTimeout(() => {
        setTickerItems(prev => 
          prev.map(item => 
            item.id === itemToShake.id ? { ...item, isShaking: false } : item
          )
        );
      }, 1500); // Increased duration for more visibility
    };
    
    // Set up interval for random shaking
    const interval = setInterval(() => {
      // Random interval between 3 and 10 seconds
      const randomDelay = Math.floor(Math.random() * 7000) + 3000;
      setTimeout(shakeRandomItem, randomDelay);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [tickerItems]);

  // Demo: Add a new item every 15 seconds (remove in production)
  useEffect(() => {
    const interval = setInterval(() => {
      const demoItems = [
        {
          id: `new-${Date.now()}`,
          content: (
            <div className="flex items-center font-patrick text-sm">
              <motion.span 
                className="text-yellow-500 mr-2"
                animate={tickerItems.some(item => item.id === `new-${Date.now()}` && item.isShaking) ? 
                  { y: [0, -5, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              >
                🚀
              </motion.span> 
              sigma4life earned 320 $STRK | <span className="text-green-500 font-bold">24% PnL</span>
            </div>
          )
        },
        {
          id: `new-${Date.now() + 1}`,
          content: (
            <div className="flex items-center font-patrick text-sm">
              <motion.span 
                className="text-green-500 mr-2"
                animate={tickerItems.some(item => item.id === `new-${Date.now() + 1}` && item.isShaking) ? 
                  { y: [0, -5, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              >
                🐸
              </motion.span> 
              0x8a72...F19B launched new agent
            </div>
          )
        }
      ];
      
      addNewItem(demoItems[Math.floor(Math.random() * demoItems.length)]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [tickerItems]);

  // Enhanced shake animation variants
  const shakeAnimation = {
    x: [0, -8, 8, -8, 8, -5, 5, -3, 3, 0],
    y: [0, 3, -3, 3, -3, 2, -2, 1, -1, 0],
    rotate: [0, -2, 2, -2, 2, -1, 1, -0.5, 0.5, 0],
    scale: [1, 1.1, 1.1, 1.1, 1.1, 1.05, 1.05, 1.02, 1.02, 1],
    transition: { 
      duration: 1.5,
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1]
    }
  };

  return (
    <motion.div 
      className="relative overflow-hidden h-12 shadow-sm ticker-container w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex absolute whitespace-nowrap animate-marquee h-full items-center">
        {repeatedItems.map((item, index) => {
          const originalItem = tickerItems.find(i => i.id === item.id || item.id.startsWith(`${i.id}-repeat`));
          const isShaking = originalItem?.isShaking;
          
          return (
            <motion.div 
              key={item.id} 
              className={`h-full flex items-center px-6 ${index % 2 === 0 ? 'ticker-item-orange' : 'ticker-item-purple'} border-r border-black/10 ${isShaking ? 'ticker-item-highlight' : ''}`}
              whileHover={{ scale: 1.02 }}
              animate={isShaking ? shakeAnimation : item.isNew ? { opacity: 1, y: 0, transition: { duration: 0.5 } } : {}}
              initial={item.isNew ? { opacity: 0, y: -10, backgroundColor: '#FFEB3B' } : {}}
              transition={{ duration: 0.2 }}
            >
              {item.content}
            </motion.div>
          );
        })}
      </div>
      <div className="flex absolute whitespace-nowrap animate-marquee2 h-full items-center">
        {repeatedItems.map((item, index) => {
          const originalItem = tickerItems.find(i => i.id === item.id || item.id.startsWith(`${i.id}-repeat`));
          const isShaking = originalItem?.isShaking;
          
          return (
            <motion.div 
              key={`${item.id}-dup`} 
              className={`h-full flex items-center px-6 ${index % 2 === 0 ? 'ticker-item-orange' : 'ticker-item-purple'} border-r border-black/10 ${isShaking ? 'ticker-item-highlight' : ''}`}
              whileHover={{ scale: 1.02 }}
              animate={isShaking ? shakeAnimation : {}}
              transition={{ duration: 0.2 }}
            >
              {item.content}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default memo(AnimatedTicker);
