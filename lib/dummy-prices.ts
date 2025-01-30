import pricesData from "../data/prices.json";
import { UTCTimestamp } from "lightweight-charts";

interface PriceData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PricesData {
  prices: {
    [symbol: string]: {
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }[];
  };
}

export const getDummyPriceData = (symbol: string): PriceData[] => {
  const prices = (pricesData as PricesData).prices[symbol] || [];

  // If no prices found for symbol, return empty array
  if (!prices.length) {
    return [];
  }

  // Convert timestamps to UTCTimestamp and sort by time
  return prices
    .map((price) => ({
      ...price,
      time: price.time as UTCTimestamp,
    }))
    .sort((a, b) => (a.time as number) - (b.time as number));
};

// Export the latest price for a given symbol
export const getLatestPrice = (symbol: string): number | null => {
  const prices = (pricesData as PricesData).prices[symbol] || [];
  if (!prices.length) return null;

  // Sort by time and get the latest price
  const sortedPrices = [...prices].sort((a, b) => b.time - a.time);
  return sortedPrices[0].close;
};
