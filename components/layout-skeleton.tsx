'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { memo } from "react"

const NavigationSkeleton = memo(() => (
  <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-white/5">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
          <Skeleton className="h-6 w-24 animate-pulse delay-75" />
        </div>
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Skeleton className="h-4 w-16 animate-pulse delay-100" />
          <Skeleton className="h-4 w-16 animate-pulse delay-150" />
          <Skeleton className="h-4 w-16 animate-pulse delay-200" />
          <Skeleton className="h-9 w-[140px] animate-pulse delay-300" />
        </div>
      </div>
    </div>
  </div>
))
NavigationSkeleton.displayName = 'NavigationSkeleton'

const ContentSkeleton = memo(() => (
  <div className="mt-16 p-4">
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px] animate-pulse delay-400" />
      <Skeleton className="h-4 w-[200px] animate-pulse delay-500" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-[200px] rounded-xl animate-pulse delay-${(i + 6) * 100}`} 
          />
        ))}
      </div>
    </div>
  </div>
))
ContentSkeleton.displayName = 'ContentSkeleton'

const LayoutSkeleton = memo(() => {
  return (
    <div className="w-full space-y-4">
      <NavigationSkeleton />
      <ContentSkeleton />
    </div>
  )
})
LayoutSkeleton.displayName = 'LayoutSkeleton'

export { LayoutSkeleton } 