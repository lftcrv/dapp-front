import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortAddress(address: string, chars = 4): string {
  if (!address) return ''
  const start = address.slice(0, chars)
  const end = address.slice(-chars)
  return `${start}...${end}`
}

export function truncateAddress(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount)
}

export function formatPrice(price: number) {
  return `${formatAmount(price)} LEFT`
}

/**
 * Calculate bonding progress based on current price and holders
 * @param price Current price of the agent token
 * @param holders Number of token holders
 * @returns Progress percentage (0-100)
 */
export function calculateBondingProgress(price: number, holders: number): number {
  return Math.min((holders * price * 1000) / 10000 * 100, 100)
}

/**
 * Check if agent is still in bonding phase
 * @param price Current price of the agent token
 * @param holders Number of token holders
 * @returns true if still in bonding phase
 */
export function isInBondingPhase(price: number, holders: number): boolean {
  return calculateBondingProgress(price, holders) < 100
}
