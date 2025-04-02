'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/app/context/wallet-context';
import { AlertCircle, ArrowRight, CheckCircle, Wallet, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateReferralCode } from '@/actions/users/validate-referral-code';
import { showToast } from '@/lib/toast';

type AccessStep = 'welcome' | 'connect' | 'referral' | 'success';

export function AccessGateModal({ 
  isConnected, 
  onClose 
}: { 
  isConnected: boolean;
  onClose: () => void;
}) {
  const { user, starknetWallet, privyAuthenticated, connectStarknet } = useWallet();
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AccessStep>(isConnected ? 'referral' : 'welcome');
  const walletAddress = starknetWallet.address || '';

  const handleConnect = useCallback(async () => {
    try {
      await connectStarknet();
      setCurrentStep('referral');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      showToast('CONNECTION_ERROR', 'error');
    }
  }, [connectStarknet]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await validateReferralCode(referralCode, user ?? undefined);
      
      if (!result.success) {
        setError(result.error || 'Invalid referral code');
        showToast('REFERRAL_ERROR', 'error');
        return;
      }

      if (isConnected && walletAddress) {
        console.log('Storing authorized wallet address:', walletAddress);
        localStorage.setItem('access_authorized_address', walletAddress);
      }

      setCurrentStep('success');
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
  }, [referralCode, user, isConnected, walletAddress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-1 rounded-xl shadow-2xl">
          <div className="bg-black p-8 rounded-lg text-white">
            <AnimatePresence mode="wait">
              {currentStep === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-3 rounded-full">
                      <LockKeyhole className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                    Exclusive Access Required
                  </h2>
                  <p className="text-gray-300 mb-8">
                    This application requires an access code or an existing account connection.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => setCurrentStep('connect')}
                      className="w-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-md py-3 px-4 text-white font-medium hover:from-orange-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black text-gray-400">or</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setCurrentStep('referral')}
                      className="w-full bg-transparent border border-orange-500/50 hover:border-orange-500 rounded-md py-3 px-4 text-white font-medium transition-all duration-200"
                    >
                      Enter Access Code
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'connect' && (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-3 rounded-full">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                    Connect Your Wallet
                  </h2>
                  <p className="text-gray-300 mb-8">
                    Connect your wallet to access the application. If you've used the app before, you'll get immediate access.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={handleConnect}
                      className="w-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-md py-3 px-4 text-white font-medium hover:from-orange-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('welcome')}
                      className="w-full bg-transparent hover:bg-gray-900 rounded-md py-3 px-4 text-gray-400 font-medium transition-all duration-200"
                    >
                      Back
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'referral' && (
                <motion.div
                  key="referral"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-3 rounded-full">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                    Enter Access Code
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {isConnected 
                      ? "Your wallet is connected but you need an access code to continue."
                      : "Enter an access code to unlock the application."}
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter your access code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500"
                        disabled={isSubmitting}
                      />
                      {error && (
                        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || !referralCode.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-md py-3 px-4 text-white font-medium hover:from-orange-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Validating...' : 'Submit Code'}
                    </Button>
                    
                    {!isConnected && (
                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-black text-gray-400">or</span>
                        </div>
                      </div>
                    )}
                    
                    {!isConnected ? (
                      <Button 
                        onClick={() => setCurrentStep('connect')}
                        className="w-full bg-transparent border border-orange-500/50 hover:border-orange-500 rounded-md py-3 px-4 text-white font-medium transition-all duration-200 flex items-center justify-center"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet Instead
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => onClose()}
                        className="w-full bg-transparent hover:bg-gray-900 rounded-md py-3 px-4 text-gray-400 font-medium transition-all duration-200 mt-2"
                      >
                        Disconnect & Try Again
                      </Button>
                    )}
                  </form>
                </motion.div>
              )}
              
              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-6"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-500 p-3 rounded-full">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    Access Granted!
                  </h2>
                  <p className="text-gray-300 mb-2">
                    Your access code has been verified.
                  </p>
                  <p className="text-gray-500">
                    Redirecting you to the application...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 