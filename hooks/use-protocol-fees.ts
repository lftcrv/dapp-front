import { useEffect, useState, useCallback, useMemo } from "react";
import { useWallet } from "@/app/context/wallet-context";
import { protocolFeesService } from "@/lib/services/api/protocol-fees";
import { useToast } from "@/hooks/use-toast";
import { ProtocolFeesData } from "@/lib/types";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ProtocolFeesState {
  feesData: ProtocolFeesData | null;
  timeLeft: string;
  isLoading: boolean;
  error: Error | null;
  userShare: string;
  userSharePercentage: string;
  isClaiming: boolean;
}

const DEFAULT_TIME_LEFT: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

export function useProtocolFees() {
  const { currentAddress: address } = useWallet();
  const { toast } = useToast();
  const [state, setState] = useState<ProtocolFeesState>({
    feesData: null,
    timeLeft: "--:--:--",
    isLoading: true,
    error: null,
    userShare: "0",
    userSharePercentage: "0",
    isClaiming: false,
  });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(DEFAULT_TIME_LEFT);

  // Memoize the service call to prevent re-renders
  const getFeesData = useMemo(() => protocolFeesService.getData, []);
  const claimFeesRewards = useMemo(() => protocolFeesService.claimRewards, []);

  const fetchFeesData = useCallback(async () => {
    if (!address) return;
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await getFeesData();
      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          feesData: result.data || null,
          error: null,
          isLoading: false,
        }));
      } else if (result.error) {
        setState((prev) => ({
          ...prev,
          error: result.error || null,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Unknown error"),
        isLoading: false,
      }));
    }
  }, [address, getFeesData]);

  const claimRewards = useCallback(async () => {
    if (!address) return;

    try {
      setState((prev) => ({ ...prev, isClaiming: true }));
      const result = await claimFeesRewards(address);

      if (result.success && result.data && "claimed" in result.data) {
        toast({
          title: "Success",
          description: `Claimed ${result.data.claimed} $LEFT`,
        });
        await fetchFeesData();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to claim rewards",
          variant: "destructive",
        });
      }
    } finally {
      setState((prev) => ({ ...prev, isClaiming: false }));
    }
  }, [address, claimFeesRewards, toast, fetchFeesData]);

  // Memoize time calculation to prevent re-renders
  const calculateTimeLeft = useCallback(() => {
    if (!state.feesData?.periodEndTime) return DEFAULT_TIME_LEFT;

    const now = new Date().getTime();
    const distance = new Date(state.feesData.periodEndTime).getTime() - now;

    if (distance < 0) {
      return DEFAULT_TIME_LEFT;
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  }, [state.feesData?.periodEndTime]);

  // Memoize timer effect dependencies
  const updateTimeLeft = useCallback(() => {
    setTimeLeft(calculateTimeLeft());
  }, [calculateTimeLeft]);

  useEffect(() => {
    // Initial calculation
    updateTimeLeft();

    // Only set up timer if we have an end time
    if (!state.feesData?.periodEndTime) return;

    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [state.feesData?.periodEndTime, updateTimeLeft]);

  const formatTimeLeft = useCallback((time: TimeLeft) => {
    const { hours, minutes, seconds } = time;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  interface Gainer {
    address: string;
    percentage: string;
  }

  const getUserShare = useCallback(() => {
    if (!address || !state.feesData?.userShares) return "0";
    return state.feesData.userShares[address] || "0";
  }, [address, state.feesData?.userShares]);

  const getUserSharePercentage = useCallback(() => {
    if (!address || !state.feesData?.distribution) return "0";

    const { leftCurve, rightCurve } = state.feesData.distribution;
    const leftCurveGainer = leftCurve.topGainers.find(
      (g: Gainer) => g.address === address,
    );
    const rightCurveGainer = rightCurve.topGainers.find(
      (g: Gainer) => g.address === address,
    );

    if (leftCurveGainer) return leftCurveGainer.percentage;
    if (rightCurveGainer) return rightCurveGainer.percentage;
    return "0";
  }, [address, state.feesData?.distribution]);

  // Initial data fetch with debounce
  useEffect(() => {
    if (!address) return;

    const timer = setTimeout(() => {
      fetchFeesData();
    }, 100); // Small debounce to prevent rapid re-fetches

    return () => clearTimeout(timer);
  }, [address, fetchFeesData]);

  // Memoize all computed values
  const memoizedTimeLeft = useMemo(
    () => formatTimeLeft(timeLeft),
    [formatTimeLeft, timeLeft],
  );
  const memoizedUserShare = useMemo(() => getUserShare(), [getUserShare]);
  const memoizedUserSharePercentage = useMemo(
    () => getUserSharePercentage(),
    [getUserSharePercentage],
  );
  const memoizedFeesData = useMemo(() => state.feesData, [state.feesData]);

  return {
    feesData: memoizedFeesData,
    timeLeft: memoizedTimeLeft,
    isLoading: state.isLoading,
    error: state.error,
    userShare: memoizedUserShare,
    userSharePercentage: memoizedUserSharePercentage,
    isClaiming: state.isClaiming,
    claimRewards,
  };
}
