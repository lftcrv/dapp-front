'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrambleTextProps {
  text: string;
  duration?: number;
}

const ScrambleText = ({ text, duration = 1.5 }: ScrambleTextProps) => {
  const [scrambledText, setScrambledText] = useState(text);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let iterations = 0;
    const maxIterations = 10;
    
    if (!isComplete) {
      interval = setInterval(() => {
        iterations += 1;
        
        // Calculate progress (0 to 1)
        const progress = iterations / maxIterations;
        
        // As progress increases, more characters are locked in place
        const newText = text
          .split('')
          .map((char, index) => {
            // If character is a space, keep it
            if (char === ' ') return ' ';
            
            // If we've passed the threshold for this character, lock it in
            if (index / text.length < progress) {
              return text[index];
            }
            
            // Otherwise, return a random character
            return characters.charAt(Math.floor(Math.random() * characters.length));
          })
          .join('');
        
        setScrambledText(newText);
        
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setScrambledText(text);
          setIsComplete(true);
        }
      }, duration * 100);
    }
    
    return () => clearInterval(interval);
  }, [text, duration, isComplete]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {scrambledText}
    </motion.span>
  );
};

export default ScrambleText; 