import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function truncateAddress(address: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount);
}

export function formatPrice(price: number) {
  return `${formatAmount(price)} LEFT`;
}

/**
 * Calculate bonding progress based on current price and holders
 * @param price Current price of the agent token
 * @param holders Number of token holders
 * @returns Progress percentage (0-100)
 */
export function calculateBondingProgress(
  price: number,
  holders: number,
): number {
  return Math.min(((holders * price * 1000) / 10000) * 100, 100);
}

/**
 * Check if agent is still in bonding phase
 * @param price Current price of the agent token
 * @param holders Number of token holders
 * @returns true if still in bonding phase
 */
export function isInBondingPhase(price: number, holders: number): boolean {
  return calculateBondingProgress(price, holders) < 100;
}

/**
 * Formats a PnL value consistently
 * @param value PnL value (absolute USD value from API)
 * @param asPercentage Whether to format as currency string with $ symbol
 * @returns Formatted string or the numeric value
 */
export function formatPnL(
  value: number | undefined | null, 
  asPercentage: boolean = false,
  isAlreadyPercentage: boolean = false
): string | number {
  if (value === undefined || value === null) return "N/A";
  
  // This is the absolute PnL value in USD, not a percentage
  const isPositive = value > 0;
  
  if (asPercentage) {
    return `${isPositive ? "+" : ""}$${Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
  
  // Return the numeric value
  return value;
}

/**
 * Determines if a PnL value is positive
 */
export function isPnLPositive(value: number | undefined | null): boolean {
  return value !== undefined && value !== null && value > 0;
}
