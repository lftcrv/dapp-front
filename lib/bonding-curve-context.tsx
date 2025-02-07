'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { getBondingCurvePercentage } from '@/actions/agents/token/getTokenInfo';

interface BondingCurveData {
  percentage: number;
  isLoading: boolean;
  error: string | null;
}

interface BondingCurveContextType {
  data: BondingCurveData;
  refresh: () => Promise<void>;
}

const BondingCurveContext = createContext<BondingCurveContextType | null>(null);

const INITIAL_STATE = {
  percentage: 0,
  isLoading: true,
  error: null,
};

// Cache for bonding curve data
const dataCache = new Map<string, { data: BondingCurveData; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

export function BondingCurveProvider({
  children,
  agentId,
  enabled = true,
}: {
  children: ReactNode;
  agentId: string;
  enabled?: boolean;
}) {
  const [data, setData] = useState<BondingCurveData>(INITIAL_STATE);
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
  }, [agentId, enabled]);

  // Initial fetch only
  useEffect(() => {
    if (!hasInitialFetch.current && enabled) {
      hasInitialFetch.current = true;
      fetchPercentage();
    }

    return () => {
      hasInitialFetch.current = false;
    };
  }, [fetchPercentage, enabled]);

  return (
    <BondingCurveContext.Provider value={{ data, refresh: fetchPercentage }}>
      {children}
    </BondingCurveContext.Provider>
  );
}

export function useBondingCurve() {
  const context = useContext(BondingCurveContext);
  if (!context) {
    throw new Error('useBondingCurve must be used within a BondingCurveProvider');
  }
  return context;
} 