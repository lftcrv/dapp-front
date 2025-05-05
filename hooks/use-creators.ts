'use client';

import { useState, useEffect } from 'react';
import { getTopCreators, CreatorLeaderboardEntryDto } from '@/actions/creators/getTopCreators';

interface UseCreatorsResult {
  data: CreatorLeaderboardEntryDto[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCreators(limit: number = 5): UseCreatorsResult {
  const [data, setData] = useState<CreatorLeaderboardEntryDto[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCreators = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getTopCreators(limit);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch creators');
      }
      
      setData(result.data);
    } catch (err) {
      console.error('Error in useCreators hook:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [limit]);

  const refetch = async () => {
    await fetchCreators();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
} 