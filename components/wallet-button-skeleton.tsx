'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { memo } from 'react';

const WalletButtonSkeleton = memo(() => {
  return (
    <Skeleton
      className="
        h-10 w-[140px] 
        bg-gradient-to-r from-yellow-500/20 to-pink-500/20 
        animate-pulse 
        hover:from-yellow-500/30 hover:to-pink-500/30 
        transition-colors
      "
    />
  );
});
WalletButtonSkeleton.displayName = 'WalletButtonSkeleton';

export { WalletButtonSkeleton };
