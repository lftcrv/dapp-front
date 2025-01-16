'use client'

import { memo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function PriceChangeComponent() {
  const [change, setChange] = useState({ value: 0, isPositive: true })

  useEffect(() => {
    setChange({
      value: Math.random() * 20,
      isPositive: Math.random() > 0.5
    })
  }, [])

  if (change.value === 0) return null

  return (
    <span className={cn(
      "text-xs font-mono",
      change.isPositive ? "text-green-500" : "text-red-500"
    )}>
      {change.isPositive ? "+" : "-"}{change.value.toFixed(2)}%
    </span>
  )
}

export const PriceChange = memo(PriceChangeComponent) 