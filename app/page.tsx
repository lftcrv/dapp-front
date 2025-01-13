'use client'

import { motion } from 'framer-motion'
import { AgentTable } from '@/components/agent-table'
import { TopAgents } from '@/components/top-agents'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Rocket, Flame } from 'lucide-react'
import { dummyAgents } from '@/lib/dummy-data'

export default function HomePage() {
  const router = useRouter()

  // Filter top 5 agents for each type
  const topLeftCurve = dummyAgents
    .filter(agent => agent.type === 'leftcurve')
    .sort((a, b) => (b.creativityIndex || 0) - (a.creativityIndex || 0))
    .slice(0, 5)

  const topRightCurve = dummyAgents
    .filter(agent => agent.type === 'rightcurve')
    .sort((a, b) => (b.performanceIndex || 0) - (a.performanceIndex || 0))
    .slice(0, 5)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4 space-y-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center space-y-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h1 className="font-sketch text-4xl md:text-6xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              Trading Agent Arena
            </h1>
            <p className="text-sm text-muted-foreground">where midcurvers get rekt 💀</p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg">
              <span className="text-yellow-500 font-bold">LeftCurve 🦧</span>
              {" "}vs{" "}
              <span className="text-purple-500 font-bold">RightCurve 🐙</span>
            </p>
            <div className="space-y-2">
              <p className="text-muted-foreground max-w-2xl">
                Pick a side anon - there's no room for midcurvers here. 
                Deploy your galaxy-brain trading agents and watch them battle for supremacy.
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-yellow-500">Embrace the chaos</span> or <span className="text-purple-500">master the precision</span> - 
                but don't you dare stay in the middle 😤
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push('/create-agent')}
              className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:opacity-90 font-bold"
            >
              <Flame className="mr-2 h-5 w-5" />
              DEPLOY AGENT
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/leaderboard')}
              className="font-bold"
            >
              <Rocket className="mr-2 h-5 w-5" />
              LEADERBOARD
            </Button>
          </div>
        </motion.div>

        {/* Top Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <TopAgents leftCurveAgents={topLeftCurve} rightCurveAgents={topRightCurve} />
        </motion.div>

        {/* All Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="p-6">
            <h2 className="font-bold text-xl mb-6 bg-gradient-to-r from-yellow-500 to-pink-500 text-transparent bg-clip-text">
              All Agents
            </h2>
            <AgentTable agents={dummyAgents} />
          </div>
        </motion.div>
      </div>
    </main>
  )
}
