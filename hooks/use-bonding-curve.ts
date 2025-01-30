"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  simulateBuyTokens,
  simulateSellTokens,
  getBondingCurvePercentage,
} from "@/actions/agents/token/getTokenInfo";

interface UseBondingCurveProps {
  agentId: string;
  enabled?: boolean;
  interval?: number;
}

interface BondingCurveData {
  buyPrice: bigint | null;
  sellPrice: bigint | null;
  percentage: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const INITIAL_STATE = {
  buyPrice: null,
  sellPrice: null,
  percentage: 0,
  isLoading: true,
  error: null,
};

export function useBondingCurve({
  agentId,
}: UseBondingCurveProps): BondingCurveData {
  const [data, setData] =
    useState<Omit<BondingCurveData, "refresh">>(INITIAL_STATE);
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (!agentId || isFetching.current) return;

    isFetching.current = true;

    try {
      const percentageResult = await getBondingCurvePercentage(agentId);
      if (!percentageResult.success) throw new Error(percentageResult.error);

      const percentage = percentageResult.data ?? 0;

      /// WIth 6 decimals instead of 18 (it's token not ether)
      const [buyResult, sellResult] = await Promise.all([
        simulateBuyTokens(agentId, "1000000"),
        simulateSellTokens(agentId, "1000000"),
      ]);

      if (!buyResult.success || !sellResult.success) {
        throw new Error("Simulation failed");
      }

      setData({
        buyPrice: buyResult.data ?? null,
        sellPrice: sellResult.data ?? null,
        percentage,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    } finally {
      isFetching.current = false;
    }
  }, [agentId]);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      setData((prev) => ({ ...prev, isLoading: true }));
      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  return {
    ...data,
    refresh: fetchData,
  };
}
