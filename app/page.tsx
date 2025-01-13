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
  
  // Fetch all agents at once
  const { 
    agents, 
    isLoading, 
    error,
    refetch 
  } = useAgents()

  // Filter agents client-side to avoid multiple API calls
  const leftCurveAgents = agents.filter(agent => agent.type === 'leftcurve')
  const rightCurveAgents = agents.filter(agent => agent.type === 'rightcurve')

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
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-sketch text-4xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              Agent Explorer
            </h1>
            <p className="text-sm text-muted-foreground">discover, deploy, and trade agent tokens</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => router.push('/create-agent')}
                className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 hover:from-yellow-600 hover:via-pink-600 hover:to-purple-600"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Agent
              </Button>
              <Button variant="outline">
                <Flame className="mr-2 h-4 w-4" />
                Learn More
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
            <TopAgents
              leftCurveAgents={leftCurveAgents}
              rightCurveAgents={rightCurveAgents}
            />
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
