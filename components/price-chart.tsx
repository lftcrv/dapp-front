'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface PriceChartProps {
  symbol: string
}

export function PriceChart({ symbol }: PriceChartProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_legend": true,
        "save_image": false,
        "calendar": false,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com"
      }`

    if (container.current) {
      container.current.innerHTML = ''
      const div = document.createElement('div')
      div.className = 'tradingview-widget-container'
      container.current.appendChild(div)
      div.appendChild(script)
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = ''
      }
    }
  }, [symbol])

  return (
    <Card className="w-full overflow-hidden">
      <div ref={container} className="h-[400px] w-full" />
    </Card>
  )
} 