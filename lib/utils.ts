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
