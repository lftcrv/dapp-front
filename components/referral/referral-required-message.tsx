'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/app/context/wallet-context';
import { useBlur } from '@/providers/BlurProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { validateReferralCode } from '@/actions/users/validate-referral-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showToast } from '@/lib/toast';

export function ReferralRequiredMessage() {
  const { shouldShowReferralMessage, isBlurred, resetError } = useBlur();
  const { starknetWallet, hasValidReferral, user } = useWallet();
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('User data is not available');
      return;
    }

    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    if (!starknetWallet.address) {
      setError('Your wallet address is not available');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate and register the referral code
      const result = await validateReferralCode(referralCode, user);
      
      if (!result.success) {
        setError(result.error || 'Invalid referral code');
        return;
      }

      // Show success state
      setSuccess(true);
      showToast('REFERRAL_SUCCESS', 'success');
      
      // Wait a short moment before reloading for a better UX
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error submitting referral code:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showToast('REFERRAL_ERROR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [referralCode, starknetWallet.address, user]);

  if (!shouldShowReferralMessage || !isBlurred || hasValidReferral) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50 max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-1">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Referral Code Required
              </h3>
              <button 
                onClick={resetError} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              To access the full features of the platform, please enter a valid referral code.
            </p>
            
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter your referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={isSubmitting}
                  />
                  {error && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting || !referralCode.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-md py-2 text-white font-medium hover:from-orange-600 hover:to-purple-600 transition-all duration-200"
                >
                  {isSubmitting ? 'Validating...' : 'Submit Referral Code'}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center flex-col space-y-2 py-2">
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-center text-green-500 font-medium">
                  Referral code accepted! Refreshing...
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}