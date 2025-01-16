'use client'

import { Skeleton } from "@/components/ui/skeleton"

export function WalletButtonSkeleton() {
  return (
    <Skeleton className="h-10 w-[140px] bg-gradient-to-r from-yellow-500/20 to-pink-500/20" />
  )
} 