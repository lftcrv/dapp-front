'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Rocket, Info } from 'lucide-react';
import { memo } from 'react';
import { motion } from 'framer-motion';

const CTAButtons = () => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={() => router.push('/how-it-works')}
          className="bg-[#F6ECE7] text-black hover:bg-[#F6ECE7]/90 font-mono rounded-full px-6 py-6 border border-black/30 w-full sm:w-auto"
          size="lg"
        >
          <Info className="mr-2 h-4 w-4" />
          How it works
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={() => router.push('/create-agent')}
          className="bg-gradient-to-r from-orange-500 to-purple-500 text-white hover:opacity-90 font-mono rounded-full px-6 py-6 w-full sm:w-auto"
          size="lg"
        >
          <Rocket className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </motion.div>
    </div>
  );
};

export default memo(CTAButtons); 