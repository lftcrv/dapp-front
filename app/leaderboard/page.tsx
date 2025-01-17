'use client'

import { ProtocolFees } from '@/components/protocol-fees'
import { LeaderboardTables } from "@/components/leaderboard-tables"
import { motion } from "framer-motion"
import { useAgents } from "@/hooks/use-agents"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { memo } from 'react'

const PageHeader = memo(() => (
  <motion.div 
    className="mb-8 text-center"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h1 className="font-sketch text-3xl">
      🏆 Agent Leaderboards
      <span className="text-sm font-normal text-gray-400 ml-2">
        who&apos;s the most based?
      </span>
    </h1>
    <p className="text-xs text-gray-400 mt-1">Updated every Friday</p>
  </motion.div>
))
PageHeader.displayName = 'PageHeader'

const LoadingState = memo(() => (
  <div className="space-y-4">
    <Skeleton className="w-full h-[200px] rounded-xl" />
    <Skeleton className="w-full h-[400px] rounded-xl" />
  </div>
))
LoadingState.displayName = 'LoadingState'

interface ErrorStateProps {
  onRetry: () => void
}

const ErrorState = memo(({ onRetry }: ErrorStateProps) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="flex items-center">
      Failed to load agents. Please try again.
      <button 
        onClick={onRetry}
        className="ml-2 text-red-500 hover:text-red-400"
      >
        Retry
      </button>
    </AlertDescription>
  </Alert>
))
ErrorState.displayName = 'ErrorState'

export default function LeaderboardPage() {
  const { data: agents, isLoading, error, refetch } = useAgents()

  return (
    <main className="flex-1 flex flex-col pt-24">
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="container relative">
          <PageHeader />
          <ProtocolFees />
          
          {error ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <LoadingState />
          ) : agents ? (
            <LeaderboardTables agents={agents} />
          ) : null}
        </div>
      </div>
    </main>
  )
} 