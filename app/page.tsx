'use client'

import { motion } from 'framer-motion'
import { AgentTable } from '@/components/agent-table'
import { TopAgents } from '@/components/top-agents'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Rocket, Flame, AlertCircle } from 'lucide-react'
import { useAgents } from '@/hooks/use-agents'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HomePage() {
  const router = useRouter()
  const { agents, isLoading, error, refetch } = useAgents()

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 pt-24">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load agents. Please try again.
            <Button 
              variant="link" 
              onClick={() => refetch()}
              className="ml-2 h-auto p-0"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          className="space-y-8 pb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h1 className="font-sketch text-5xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
                Trading Agent Arena
              </h1>
              <p className="text-sm text-yellow-500/70 font-mono">
                where midcurvers get rekt 💀
              </p>
              
              <div className="max-w-xl mx-auto space-y-1.5 text-[11px]">
                <p className="text-neutral-800">your strategy, your agent, your edge - finally executed exactly how you want it. embrace the chaos or master the precision - but don&apos;t you dare stay in the middle 😤</p>

                <p className="text-neutral-800">protocol fees? split between based curves only. midcurvers stay ngmi and get nothing fr</p>

                <p className="text-neutral-500 font-mono text-[10px]">where midcurvers get rekt 💀</p>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => router.push('/create-agent')}
                className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 hover:opacity-90 font-mono text-white"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Your Agent
              </Button>
              <Button 
                variant="outline" 
                className="group relative font-mono hover:text-yellow-500 transition-colors hover:border-yellow-500/50"
                onClick={() => router.push('/leaderboard')}
              >
                <Flame className="mr-2 h-4 w-4 transition-colors" />
                Leaderboard
              </Button>
            </div>
          </div>

          {/* Top Agents */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
              <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10 h-48 animate-pulse" />
              <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10 h-48 animate-pulse" />
            </div>
          ) : (
            <TopAgents />
          )}

          {/* Agent Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading agents...</p>
            </div>
          ) : (
            <AgentTable agents={agents} />
          )}
        </motion.div>
      </div>
    </main>
  )
}
