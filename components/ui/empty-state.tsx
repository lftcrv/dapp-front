'use client';

import { motion } from 'framer-motion';
import { Sparkles, Rocket, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'agents' | 'table' | 'generic';
  onRetry?: () => void;
  isLoading?: boolean;
}

const EmptyState = ({ 
  title, 
  description, 
  icon = 'generic',
  onRetry,
  isLoading = false
}: EmptyStateProps) => {
  const icons = {
    agents: <Sparkles className="h-12 w-12 text-orange-500 mb-4" />,
    table: <Rocket className="h-12 w-12 text-purple-500 mb-4" />,
    generic: <Sparkles className="h-12 w-12 text-yellow-500 mb-4" />
  };

  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl bg-[#F6ECE7] border border-black/30 p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-xl" />
      
      <div className="relative z-10 flex flex-col items-center justify-center py-8">
        {icons[icon]}
        
        <h3 className="font-sketch text-2xl mb-2 bg-gradient-to-r from-orange-500 to-purple-500 text-transparent bg-clip-text">
          {title}
        </h3>
        
        <p className="font-mono text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {description}
        </p>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-purple-500 text-white hover:opacity-90 font-mono rounded-full px-6"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        )}
      </div>
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full border border-orange-500" />
        <div className="absolute top-12 right-8 w-6 h-6 rounded-full border border-purple-500" />
        <div className="absolute bottom-6 left-10 w-5 h-5 rounded-full border border-yellow-500" />
        <div className="absolute bottom-10 right-12 w-3 h-3 rounded-full border border-orange-500" />
      </div>
    </motion.div>
  );
};

export default memo(EmptyState); 