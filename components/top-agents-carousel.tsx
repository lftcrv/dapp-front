'use client'

import { Agent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentAvatar } from '@/components/ui/agent-avatar'
import { useAgents } from '@/hooks/use-agents'

function AgentCard({ agent }: { agent: Agent }) {
  const scoreToShow = agent.type === 'leftcurve' ? agent.creativityIndex : agent.performanceIndex
  const scoreLabel = agent.type === 'leftcurve' ? 'DEGEN SCORE' : 'WIN RATE'
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <AgentAvatar src={agent.avatar} alt={agent.name} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{agent.name}</h3>
          <div className="text-sm opacity-70">{agent.symbol}</div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-sm opacity-70">${agent.price.toFixed(2)}</div>
          <div className={`text-sm font-bold ${agent.type === 'leftcurve' ? 'text-pink-500' : 'text-cyan-500'}`}>
            {scoreLabel}: {(scoreToShow * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentList({ title, agents, type }: { title: string; agents: Agent[]; type: 'leftcurve' | 'rightcurve' }) {
  const sortedAgents = [...agents]
    .filter(a => a.type === type)
    .sort((a, b) => {
      const scoreA = type === 'leftcurve' ? a.creativityIndex : a.performanceIndex
      const scoreB = type === 'leftcurve' ? b.creativityIndex : b.performanceIndex
      return scoreB - scoreA
    })
    .slice(0, 5)

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className={type === 'leftcurve' ? 'text-pink-500' : 'text-cyan-500'}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAgents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </CardContent>
    </Card>
  )
}

export function TopAgentsCarousel() {
  const { agents, isLoading, error } = useAgents()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
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
} 