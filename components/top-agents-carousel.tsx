'use client'

import { Agent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentAvatar } from '@/components/ui/agent-avatar'
import { useAgents } from '@/hooks/use-agents'
import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const AgentCard = memo(({ agent, index }: { agent: Agent; index: number }) => {
  const scoreToShow = agent.type === 'leftcurve' ? agent.creativityIndex : agent.performanceIndex
  const scoreLabel = agent.type === 'leftcurve' ? 'DEGEN SCORE' : 'WIN RATE'
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <AgentAvatar src={agent.avatar} alt={agent.name} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold truncate">{agent.name}</h3>
          <div className="text-sm opacity-70 ml-2">{agent.symbol}</div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-sm opacity-70">${agent.price.toFixed(2)}</div>
          <div className={`text-sm font-bold ${agent.type === 'leftcurve' ? 'text-pink-500' : 'text-cyan-500'}`}>
            {scoreLabel}: {(scoreToShow * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </motion.div>
  )
})
AgentCard.displayName = 'AgentCard'

const AgentList = memo(({ title, agents, type }: { title: string; agents: Agent[]; type: 'leftcurve' | 'rightcurve' }) => {
  const sortedAgents = useMemo(() => 
    [...agents]
      .filter(a => a.type === type)
      .sort((a, b) => {
        const scoreA = type === 'leftcurve' ? a.creativityIndex : a.performanceIndex
        const scoreB = type === 'leftcurve' ? b.creativityIndex : b.performanceIndex
        return scoreB - scoreA
      })
      .slice(0, 5)
  , [agents, type])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <Card>
        <CardHeader>
          <CardTitle className={type === 'leftcurve' ? 'text-pink-500' : 'text-cyan-500'}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedAgents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
})
AgentList.displayName = 'AgentList'

const LoadingState = memo(() => (
  <div className="flex gap-8">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} className="h-[72px] w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    ))}
  </div>
))
LoadingState.displayName = 'LoadingState'

const ErrorState = memo(({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Failed to load top agents: {message}
    </AlertDescription>
  </Alert>
))
ErrorState.displayName = 'ErrorState'

const TopAgentsCarousel = memo(() => {
  const { data: agents, isLoading, error } = useAgents()

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} />
  }

  if (!agents) {
    return null
  }

  return (
    <div className="flex gap-8">
      <AgentList 
        title="🚀 TOP DEGEN SCORE" 
        agents={agents} 
        type="leftcurve" 
      />
      <AgentList 
        title="🧠 TOP WIN RATE" 
        agents={agents} 
        type="rightcurve" 
      />
    </div>
  )
})
TopAgentsCarousel.displayName = 'TopAgentsCarousel'

export { TopAgentsCarousel } 