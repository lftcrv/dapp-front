'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  simulateBuyTokens,
  simulateSellTokens,
  getBondingCurvePercentage,
} from '@/actions/agents/token/getTokenInfo';

interface UseBondingCurveProps {
  agentId: string;
  enabled?: boolean;
}

interface BondingCurveData {
  buyPrice: bigint | null;
  sellPrice: bigint | null;
  percentage: number;
  isLoading: boolean;
  error: string | null;
  simulateBuy: () => Promise<void>;
  simulateSell: () => Promise<void>;
}

const INITIAL_STATE = {
  buyPrice: null,
  sellPrice: null,
  percentage: 0,
  isLoading: true,
  error: null,
};

// Cache for bonding curve data
const dataCache = new Map<string, { data: Omit<BondingCurveData, 'simulateBuy' | 'simulateSell'>; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

export function useBondingCurve({
  agentId,
  enabled = true,
}: UseBondingCurveProps): BondingCurveData {
  const [data, setData] = useState<Omit<BondingCurveData, 'simulateBuy' | 'simulateSell'>>(INITIAL_STATE);
  const isFetching = useRef(false);
  const hasInitialFetch = useRef(false);

  const fetchPercentage = useCallback(async () => {
    if (!agentId || isFetching.current || !enabled) return;

    // Check cache first
    const cached = dataCache.get(agentId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      return;
    }

    isFetching.current = true;

    try {
      const percentageResult = await getBondingCurvePercentage(agentId);
      if (!percentageResult.success) throw new Error(percentageResult.error);

      const newData = {
        ...data,
        percentage: percentageResult.data ?? 0,
        isLoading: false,
        error: null,
      };

      // Update cache
      dataCache.set(agentId, {
        data: newData,
        timestamp: Date.now(),
      });

      setData(newData);
    } catch (error) {
      console.error('Error fetching bonding curve percentage:', error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      isFetching.current = false;
    }
  }, [agentId, enabled, data]);

  const simulateBuy = useCallback(async () => {
    if (!agentId || isFetching.current) return;
    
    try {
      setData(prev => ({ ...prev, isLoading: true }));
      const result = await simulateBuyTokens(agentId, '1000000');
      if (!result.success) throw new Error(result.error);
      
      setData(prev => ({
        ...prev,
        buyPrice: result.data ?? null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [agentId]);

  const simulateSell = useCallback(async () => {
    if (!agentId || isFetching.current) return;
    
    try {
      setData(prev => ({ ...prev, isLoading: true }));
      const result = await simulateSellTokens(agentId, '1000000');
      if (!result.success) throw new Error(result.error);
      
      setData(prev => ({
        ...prev,
        sellPrice: result.data ?? null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [agentId]);

  // Initial fetch of percentage only
  useEffect(() => {
    if (!hasInitialFetch.current && enabled) {
      hasInitialFetch.current = true;
      fetchPercentage();
    }

    return () => {
      hasInitialFetch.current = false;
    };
  }, [fetchPercentage, enabled]);

  return {
    ...data,
    simulateBuy,
    simulateSell,
  };
}
