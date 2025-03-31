'use client';

import { useBlur } from '@/providers/BlurProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface BlurOverlayProps {
  children: ReactNode;
}

export function BlurOverlay({ children }: BlurOverlayProps) {
  const { isBlurred } = useBlur();

  return (
    <>
      {children}
      <AnimatePresence>
        {isBlurred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"
            style={{ top: '96px' }}
          />
        )}
      </AnimatePresence>
    </>
  );
}