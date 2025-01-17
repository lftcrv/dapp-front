'use client'

import { ProtocolFees } from '@/components/protocol-fees'
import { LeaderboardTables } from "@/components/leaderboard-tables"
import { motion } from "framer-motion"
import { useAgents } from "@/hooks/use-agents"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LeaderboardPage() {
  const { 
    agents, 
    isLoading, 
    error,
    refetch 
  } = useAgents()

  if (error) {
    return (
      <div className="flex-1 flex flex-col pt-24">
        <div className="container">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load agents. Please try again.
              <button 
                onClick={() => refetch()}
                className="ml-2 text-red-500 hover:text-red-400"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col pt-24">
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="container relative">
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-sketch text-3xl">
              🏆 Agent Leaderboards</h1>
              <span className="text-sm font-normal text-gray-400 ml-2">who&apos;s the most based?</span>
            
            <p className="text-xs text-gray-400 mt-1">Updated every Friday</p>
          </motion.div>

          <ProtocolFees />

          {isLoading ? (
            <div className="w-full h-[600px] rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          ) : (
            <LeaderboardTables agents={agents} />
          )}
        </div>
      </div>
    </main>
  )
} 