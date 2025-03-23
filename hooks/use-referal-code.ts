'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { validateAccessCode } from '@/actions/access-codes/validate';

interface UseReferralCodeReturn {
  referralCode: string | null;
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  validateReferral: (userId: string) => Promise<boolean>;
  setReferralInUrl: (code: string) => void;
  removeReferralFromUrl: () => void;
}

export function useReferralCode(): UseReferralCodeReturn {
  // State
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extract referral code from URL when component mounts or URL changes
  useEffect(() => {
    const code = searchParams.get('referral');
    setReferralCode(code);

    // Reset validation state when referral code changes
    if (code) {
      setIsValid(null);
      setError(null);
    }
  }, [searchParams]);

  // Validate referral code with userId
  const validateReferral = useCallback(async (userId: string): Promise<boolean> => {
    if (!referralCode) {
      setError('No referral code provided');
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateAccessCode(referralCode, userId);

      setIsValid(result.isValid);
      
      if (!result.isValid) {
        setError(result.error || 'Invalid referral code');
      }
      
      return result.isValid;
    } catch (err) {
      console.error('Error validating referral code:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate referral code');
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [referralCode]);

  // Set referral code in URL
  const setReferralInUrl = useCallback((code: string) => {
    // Create new URLSearchParams object with current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or add the referral parameter
    params.set('referral', code);
    
    // Update the URL without refreshing the page
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Remove referral code from URL
  const removeReferralFromUrl = useCallback(() => {
    // Create new URLSearchParams object with current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove the referral parameter
    params.delete('referral');
    
    // Get the new query string
    const newQueryString = params.toString();
    
    // Update the URL without refreshing the page
    router.replace(newQueryString ? `${pathname}?${newQueryString}` : pathname);
  }, [searchParams, router, pathname]);

  return {
    referralCode,
    isValidating,
    isValid,
    error,
    validateReferral,
    setReferralInUrl,
    removeReferralFromUrl
  };
}