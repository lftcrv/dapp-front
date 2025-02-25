'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from 'react';
import {
  getCompleteAgentData,
  getBondingCurvePercentage,
} from '@/actions/agents/token/getTokenInfo';
// import { Rocket } from 'lucide-react';
// import { cn } from '@/lib/utils';

interface MarketData {
  price: number;
  priceChange24h: number;
  holders: number;
  marketCap: number;
  bondingStatus: 'BONDING' | 'LIVE';
}

interface BondingCurveData {
  currentPrice: string;
  marketCap: string;
  priceChange24h: number;
  holders: number;
  bondingStatus: 'BONDING' | 'LIVE';
  progress: number;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: BondingCurveData = {
  currentPrice: '0',
  marketCap: '0',
  priceChange24h: 0,
  holders: 0,
  bondingStatus: 'BONDING',
  progress: 0,
  isLoading: true,
  error: null,
};

const BondingCurveContext = createContext<{
  data: BondingCurveData;
  refresh: () => Promise<void>;
}>({
  data: INITIAL_STATE,
  refresh: async () => {},
});

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

// Add bonding progress calculation
function calculateBondingProgress(price: number, holders: number): number {
  if (!price || !holders) return 0;
  const targetLiquidity = 10000;
  const currentLiquidity = holders * Number(price) * 1000;
  return Math.min(100, (currentLiquidity / targetLiquidity) * 100);
}

export function BondingCurveProvider({
  children,
  agentId,
}: {
  children: ReactNode;
  agentId: string;
}) {
  const [data, setData] = useState<BondingCurveData>(INITIAL_STATE);
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (!agentId || isFetching.current) {
      return;
    }

    isFetching.current = true;

    try {
      // Fetch agent data and bonding percentage in parallel
      const [agentResult, bondingResult] = await Promise.all([
        getCompleteAgentData(agentId),
        getBondingCurvePercentage(agentId),
      ]);

      if (!agentResult.success || !agentResult.data) {
        throw new Error(agentResult.error || 'Failed to fetch agent data');
      }

      if (!bondingResult.success) {
        console.warn('⚠️ Failed to fetch bonding percentage:', {
          error: bondingResult.error,
          agentId,
        });
      }

      // Extract market data from the agent response
      const marketData: MarketData = {
        price: agentResult.data.price || 0,
        priceChange24h: agentResult.data.priceChange24h || 0,
        holders: agentResult.data.holders || 0,
        marketCap: agentResult.data.marketCap || 0,
        bondingStatus:
          agentResult.data.status === 'bonding' ? 'BONDING' : ('LIVE' as const),
      };

      // Use raw percentage from blockchain (already x100) or calculate locally
      const bondingProgress =
        bondingResult.success && bondingResult.data !== undefined
          ? bondingResult.data
          : calculateBondingProgress(marketData.price, marketData.holders);

      setData({
        currentPrice: marketData.price.toString(),
        marketCap: marketData.marketCap.toString(),
        priceChange24h: marketData.priceChange24h,
        holders: marketData.holders,
        bondingStatus: marketData.bondingStatus,
        progress: bondingProgress,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Error fetching bonding curve data:', {
        agentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    } finally {
      isFetching.current = false;
    }
  }, [agentId]);

  // Only fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <BondingCurveContext.Provider value={{ data, refresh: fetchData }}>
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
