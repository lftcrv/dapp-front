'use client'

import { Skeleton } from "@/components/ui/skeleton"

// Extracted components for better code splitting
export function HeaderSkeleton() {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-12 w-[300px] mx-auto" />
        <Skeleton className="h-4 w-[200px] mx-auto" />
        <div className="max-w-xl mx-auto space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[90%] mx-auto" />
          <Skeleton className="h-3 w-[80%] mx-auto" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  )
}

export function TopAgentsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function AgentTableSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[120px]" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 pt-24">
      <HeaderSkeleton />
      <TopAgentsSkeleton />
      <AgentTableSkeleton />
    </div>
  )
} 