'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from "@/lib/utils" // Import cn for conditional classes

interface CreatorCardProps {
  id: string
  name: string
  avatarUrl?: string
  agentCount: number
  totalPnl: number // Add totalPnl prop
  createdAt: string // Add createdAt if needed for display
}

export function CreatorCard({
  id,
  name,
  avatarUrl,
  agentCount,
  totalPnl,
  // createdAt, // Include if needed for display
}: CreatorCardProps) {
  const fallbackName = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const formatPnl = (pnl: number) => {
    return pnl.toLocaleString(undefined, { style: 'currency', currency: 'USD', signDisplay: 'always' });
  };

  return (
    <Link href={`/creators/${id}`} className="block hover:opacity-90 transition-opacity">
      <Card className="p-4 flex flex-col items-center text-center min-h-[210px]">
        <Avatar className="w-16 h-16 mb-3">
          <AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
          <AvatarFallback>{fallbackName}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg mb-1 truncate w-full" title={name}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-1">
          {agentCount} Agent{agentCount !== 1 ? 's' : ''}
        </p>
        <p className={cn(
          "text-sm font-medium",
          totalPnl > 0 ? "text-green-500" : totalPnl < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
           Total PnL: {formatPnl(totalPnl)}
        </p>
      </Card>
    </Link>
  )
}

export function CreatorCardSkeleton() {
  return (
    <Card className="p-4 flex flex-col items-center min-h-[210px]">
      <div className="w-16 h-16 mb-3 rounded-full bg-muted animate-pulse"></div>
      <div className="h-5 w-3/4 mb-1 rounded bg-muted animate-pulse"></div>
      <div className="h-4 w-1/2 mb-1 rounded bg-muted animate-pulse"></div>
      <div className="h-4 w-1/3 rounded bg-muted animate-pulse"></div>
    </Card>
  )
} 