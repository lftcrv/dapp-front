"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

const HeaderSkeleton = memo(() => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-12 w-[300px] mx-auto animate-pulse" />
        <Skeleton className="h-4 w-[200px] mx-auto animate-pulse delay-75" />
        <div className="max-w-xl mx-auto space-y-1.5">
          <Skeleton className="h-3 w-full animate-pulse delay-100" />
          <Skeleton className="h-3 w-[90%] mx-auto animate-pulse delay-150" />
          <Skeleton className="h-3 w-[80%] mx-auto animate-pulse delay-200" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-10 w-[160px] animate-pulse delay-300" />
        <Skeleton className="h-10 w-[140px] animate-pulse delay-300" />
      </div>
    </div>
  );
});
HeaderSkeleton.displayName = "HeaderSkeleton";

const TopAgentsSkeleton = memo(() => {
  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <Skeleton className="h-48 rounded-xl animate-pulse delay-400" />
      <Skeleton className="h-48 rounded-xl animate-pulse delay-400" />
    </div>
  );
});
TopAgentsSkeleton.displayName = "TopAgentsSkeleton";

const AgentTableSkeleton = memo(() => {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px] animate-pulse delay-500" />
        <Skeleton className="h-8 w-[120px] animate-pulse delay-500" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className={`h-16 w-full rounded-lg animate-pulse delay-${(i + 6) * 100}`}
          />
        ))}
      </div>
    </div>
  );
});
AgentTableSkeleton.displayName = "AgentTableSkeleton";

const HomeSkeleton = memo(() => {
  return (
    <div className="container max-w-7xl mx-auto px-4 pt-24">
      <HeaderSkeleton />
      <TopAgentsSkeleton />
      <AgentTableSkeleton />
    </div>
  );
});
HomeSkeleton.displayName = "HomeSkeleton";

export { HeaderSkeleton, TopAgentsSkeleton, AgentTableSkeleton, HomeSkeleton };
