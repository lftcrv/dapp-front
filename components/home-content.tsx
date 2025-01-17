'use client'

import dynamic from 'next/dynamic'
import { Suspense, memo } from 'react'
import { TopAgentsSkeleton, AgentTableSkeleton } from '@/components/home-skeleton'
import { Agent } from '@/lib/types'
import type { FC } from 'react'

// Preload components during idle time
const TopAgents = dynamic(() => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('@/components/top-agents')
    })
  }
  return import('@/components/top-agents').then(mod => {
    const Component = mod.TopAgents as FC
    Component.displayName = 'TopAgents'
    return Component
  })
}, {
  loading: () => <TopAgentsSkeleton />,
  ssr: false
})

const AgentTable = dynamic(() => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('@/components/agent-table')
    })
  }
  return import('@/components/agent-table').then(mod => {
    const Component = mod.AgentTable as FC<{ agents: Agent[] }>
    Component.displayName = 'AgentTable'
    return Component
  })
}, {
  loading: () => <AgentTableSkeleton />,
  ssr: false
})

interface HomeContentProps {
  agents: Agent[]
}

export const HomeContent = memo(({ agents }: HomeContentProps) => {
  return (
    <>
      <Suspense fallback={<TopAgentsSkeleton />}>
        <TopAgents />
      </Suspense>

      <Suspense fallback={<AgentTableSkeleton />}>
        <AgentTable agents={agents} />
      </Suspense>
    </>
  )
})
HomeContent.displayName = 'HomeContent' 