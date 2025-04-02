'use client'; // This component needs to be a client component for form interaction

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/app/context/wallet-context'; // Needed to get user info for validation
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { validateReferralCode } from '@/actions/users/validate-referral-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showToast } from '@/lib/toast';
import Image from 'next/image'; // Import Image for background

export function ReferralRequiredModal() {
  const { user, starknetWallet, privyAuthenticated, connectStarknet } = useWallet(); // Get user context if needed for validation
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const isConnected = starknetWallet.isConnected || privyAuthenticated;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Pass user if available, otherwise undefined. Adjust action if needed.
      const result = await validateReferralCode(referralCode, user ?? undefined);
      
      if (!result.success) {
        setError(result.error || 'Invalid referral code');
        showToast('REFERRAL_ERROR', 'error');
        return;
      }

      setSuccess(true);
      showToast('REFERRAL_SUCCESS', 'success');
      
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
  }, [referralCode, user]);

  const handleConnect = useCallback(() => {
    try {
      connectStarknet();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      showToast('CONNECTION_ERROR', 'error');
    }
  }, [connectStarknet]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Optional: Add a background image if desired */}
      {/* <Image src="/background.jpg" layout="fill" objectFit="cover" alt="Background" className="absolute inset-0 z-0 opacity-30" /> */}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mx-4"
      >
        <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                <AlertCircle className="w-6 h-6 mr-2 text-orange-500" />
                Access Required
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {isConnected 
                  ? "Please enter a valid referral code to continue." 
                  : "Connect your wallet or enter a referral code to continue."}
              </p>
            </div>
            
            {!success ? (
              <div className="space-y-4">
                {!isConnected && (
                  <Button
                    onClick={handleConnect}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md py-2 px-4 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
                
                <div className={`${!isConnected ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700' : ''}`}>
                  {!isConnected && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Or enter a referral code
                    </p>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter your referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={isSubmitting}
                      />
                      {error && (
                        <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || !referralCode.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-md py-2 px-4 text-white font-medium hover:from-orange-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Validating...' : 'Submit Code'}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-col space-y-3 py-4">
                <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                <p className="text-center text-green-500 font-medium text-lg">
                  Referral code accepted!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Refreshing access...
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 