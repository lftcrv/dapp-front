'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlur } from '@/providers/BlurProvider';

export function ReferralRequiredMessage() {
  const { shouldShowReferralMessage, error } = useBlur();

  // Don't render anything if message shouldn't be shown
  if (!shouldShowReferralMessage) return null;

  return (
    <AnimatePresence>
      {shouldShowReferralMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
          style={{ top: '96px' }}
        >
          <div className="mx-auto max-w-md p-4">
            <Card className="border-red-400/50 bg-black/75 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Access Restricted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">
                  This app is by invitation only. <br />
                  You need a valid referral code to access it.
                </p>
                <p className="text-white">Follow <a href='https://x.com/lftcrv'>@lftcrv</a> for codes.</p>
                {error && (
                  <div className="mt-4 p-3 bg-red-950/50 border border-red-500/20 rounded-md flex items-start">
                    <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}