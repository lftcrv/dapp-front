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
import {
  getBondingCurvePercentage,
  getCurrentPrice,
  getMarketCap,
} from '@/actions/agents/token/getTokenInfo';
// import { Rocket } from 'lucide-react';
// import { cn } from '@/lib/utils';

interface BondingCurveData {
  percentage: number;
  currentPrice: string;
  marketCap: string;
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
  currentPrice: '0',
  marketCap: '0',
  isLoading: true,
  error: null,
};

// Cache for bonding curve data
const dataCache = new Map<
  string,
  { data: BondingCurveData; timestamp: number }
>();
const CACHE_DURATION = 5000; // 5 seconds

// function BondingIcon({ percentage }: { percentage: number }) {
//   if (percentage <= 0 || percentage >= 100) return null;

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <div className={cn(
//         "flex items-center gap-2 px-3 py-2 rounded-full",
//         "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
//         "border border-yellow-500/30 shadow-lg",
//         "animate-pulse transition-all duration-500"
//       )}>
//         <Rocket className={cn(
//           "h-4 w-4 text-yellow-500",
//           "animate-bounce transition-all duration-500"
//         )} />
//         <span className="text-sm font-medium text-yellow-500">
//           {percentage.toFixed(1)}% Bonding
//         </span>
//       </div>
//     </div>
//   );
// }

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
      const [percentageResult, priceResult, marketCapResult] =
        await Promise.all([
          getBondingCurvePercentage(agentId),
          getCurrentPrice(agentId),
          getMarketCap(agentId),
        ]);

      // Handle each result independently, keeping previous values if there's an error
      const newData: BondingCurveData = {
        percentage: percentageResult.success
          ? (percentageResult.data ?? 0) / 100
          : data.percentage,
        currentPrice:
          priceResult.success && priceResult.data
            ? priceResult.data
            : data.currentPrice || '0',
        marketCap:
          marketCapResult.success && marketCapResult.data
            ? marketCapResult.data
            : data.marketCap || '0',
        isLoading: false,
        error: null,
      };

      // Collect any errors but don't reset the data
      const errors: string[] = [];
      if (!percentageResult.success)
        errors.push(`Percentage: ${percentageResult.error}`);
      if (!priceResult.success) errors.push(`Price: ${priceResult.error}`);
      if (!marketCapResult.success)
        errors.push(`Market Cap: ${marketCapResult.error}`);

      if (errors.length > 0) {
        const errorMessage = errors.join(', ');

        newData.error = errorMessage;
      }

      dataCache.set(agentId, {
        data: newData,
        timestamp: Date.now(),
      });

      setData(newData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    } finally {
      isFetching.current = false;
    }
  }, [agentId, enabled, data.percentage, data.currentPrice, data.marketCap]);

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
      {/* <BondingIcon percentage={data.percentage} /> */}
    </BondingCurveContext.Provider>
  );
}

export function useBondingCurve() {
  const context = useContext(BondingCurveContext);
  if (!context) {
    throw new Error(
      'useBondingCurve must be used within a BondingCurveProvider',
    );
  }
  return context;
}
