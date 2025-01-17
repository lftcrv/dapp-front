'use client'

import { AlertCircle } from 'lucide-react'
import { useAgents } from '@/hooks/use-agents'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { HomeSkeleton } from '@/components/home-skeleton'
import { HomeContent } from '@/components/home-content'
import dynamic from 'next/dynamic'
import { memo } from 'react'
import type { FC } from 'react'

const HomeHeader = dynamic(() => import('@/components/home-header').then(mod => {
  const Component = mod.default as FC
  Component.displayName = 'HomeHeader'
  return Component
}), {
  loading: () => (
    <div className="text-center space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-12 w-[300px] mx-auto bg-white/5 rounded" />
        <div className="h-4 w-[200px] mx-auto bg-white/5 rounded" />
      </div>
    </div>
  ),
  ssr: false
})

const ErrorState = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="container max-w-7xl mx-auto px-4 pt-24">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to load agents. Please try again.
        <Button 
          variant="link" 
          onClick={onRetry}
          className="ml-2 h-auto p-0"
        >
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  </div>
))
ErrorState.displayName = 'ErrorState'

export const HomePageContent = memo(() => {
  const { data: agents, isLoading, error, refetch } = useAgents()

  if (error) {
    return <ErrorState onRetry={refetch} />
  }

  if (isLoading) {
    return <HomeSkeleton />
  }

  if (!agents) {
    return null
  }

  return (
    <div className="space-y-8 pb-20">
      <HomeHeader />
      <HomeContent agents={agents} />
    </div>
  )
})
HomePageContent.displayName = 'HomePageContent' 