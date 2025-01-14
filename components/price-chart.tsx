'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, UTCTimestamp, IChartApi, CrosshairMode, SeriesDataItemTypeMap, Time } from 'lightweight-charts'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Rocket, LineChart } from 'lucide-react'

type Interval = '15m' | '1h' | '4h' | '1d'

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface PriceChartProps {
  data: {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
  symbol?: string
  baseToken?: string
  quoteToken?: string
  inBondingCurve?: boolean
}

export function PriceChart({ 
  data, 
  symbol = '', 
  baseToken = symbol, 
  quoteToken = 'USDC',
  inBondingCurve = true 
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const legendRef = useRef<HTMLDivElement>(null)
  const [interval, setInterval] = useState<Interval>('15m')
  const [showMarketCap, setShowMarketCap] = useState(false)
  const [chartData, setChartData] = useState<CandleData[]>([])
  const tradingPair = `${baseToken}/${quoteToken}`

  // Aggregate data based on interval
  const aggregateData = useCallback((rawData: CandleData[], intervalType: Interval) => {
    if (intervalType === '15m') return rawData

    const intervalMinutes = {
      '1h': 60,
      '4h': 240,
      '1d': 1440
    }[intervalType] || 15

    const groupedData = new Map<number, CandleData>()
    
    rawData.forEach(candle => {
      const timestamp = candle.time
      const intervalIndex = Math.floor(timestamp / (intervalMinutes * 60)) * (intervalMinutes * 60)
      
      if (!groupedData.has(intervalIndex)) {
        groupedData.set(intervalIndex, {
          time: intervalIndex,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        })
      } else {
        const existing = groupedData.get(intervalIndex)!
        existing.high = Math.max(existing.high, candle.high)
        existing.low = Math.min(existing.low, candle.low)
        existing.close = candle.close
        existing.volume += candle.volume
      }
    })

    return Array.from(groupedData.values())
  }, [])

  useEffect(() => {
    if (!data) return
    const aggregated = aggregateData(data, interval)
    setChartData(aggregated)
  }, [data, interval, aggregateData])

  useEffect(() => {
    if (!chartContainerRef.current || !chartData.length) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: 'transparent'
        },
        textColor: '#999',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2A2E39',
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000)
          return interval === '1d' 
            ? date.toLocaleDateString()
            : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a50',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })

    // Format and set data based on interval
    const aggregatedData = aggregateData(data, interval)
    const formattedData = aggregatedData.map(d => {
      const multiplier = showMarketCap ? 1000 : 1 // Use 1000 for market cap view
      return {
        time: (d.time) as UTCTimestamp,
        open: d.open * multiplier,
        high: d.high * multiplier,
        low: d.low * multiplier,
        close: d.close * multiplier,
      }
    })

    const volumeData = aggregatedData.map(d => ({
      time: (d.time) as UTCTimestamp,
      value: d.volume,
      color: d.close > d.open ? '#22c55e44' : '#ef444444',
    }))

    candlestickSeries.setData(formattedData)
    volumeSeries.setData(volumeData)

    // Add legend with price info
    if (legendRef.current) {
      const legend = legendRef.current
      chart.subscribeCrosshairMove(param => {
        if (!param.time || param.point === undefined) {
          legend.innerHTML = formattedData.length > 0 
            ? formatLegend(formattedData[formattedData.length - 1], tradingPair, interval, showMarketCap)
            : ''
          return
        }

        const price = param.seriesData.get(candlestickSeries) as SeriesDataItemTypeMap['Candlestick']
        if (price && 'open' in price) {
          legend.innerHTML = formatLegend(price, tradingPair, interval, showMarketCap)
        }
      })

      // Show latest price initially
      if (formattedData.length > 0) {
        legend.innerHTML = formatLegend(formattedData[formattedData.length - 1], tradingPair, interval, showMarketCap)
      }
    }

    // Fit content
    chart.timeScale().fitContent()

    // Store chart reference
    chartRef.current = chart

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [chartData, interval, showMarketCap, aggregateData, tradingPair])

  return (
    <div className="space-y-2">
      {/* Header with trading pair, intervals, and status */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm font-medium">
            {tradingPair}
          </div>
          <div className="flex items-center gap-4">
            {/* Market Cap Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMarketCap(!showMarketCap)}
              className={cn(
                "text-xs font-mono flex items-center gap-1.5",
                showMarketCap && "bg-primary text-primary-foreground"
              )}
            >
              <LineChart className="h-3 w-3" />
              {showMarketCap ? 'MCAP' : 'PRICE'}
            </Button>
            {/* Time Intervals */}
            <div className="flex items-center gap-2">
              {(['15m', '1h', '4h', '1d'] as const).map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={interval === i ? 'default' : 'outline'}
                  onClick={() => setInterval(i)}
                  className="text-xs font-mono"
                >
                  {i.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {inBondingCurve ? (
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/50 text-orange-400 animate-pulse"
            >
              <Rocket className="w-3 h-3 mr-1" />
              Bonding
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-500/10 border-green-500/50 text-green-400">
              Live Trading
            </Badge>
          )}
          <div 
            ref={legendRef}
            className="text-xs font-mono bg-background/80 backdrop-blur-sm rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartContainerRef} 
        className={cn(
          "w-full h-[400px]",
          "bg-background/50 backdrop-blur-sm rounded-lg",
          inBondingCurve && "bg-gradient-to-b from-orange-500/[0.02] to-purple-500/[0.02]"
        )}
      />
    </div>
  )
}

// Helper to format the legend text
function formatLegend(
  price: { time: Time, open: number, high: number, low: number, close: number }, 
  tradingPair: string, 
  interval: string,
  showMarketCap: boolean
) {
  const date = new Date((price.time as number) * 1000)
  const timeStr = interval === '1d' 
    ? date.toLocaleDateString() 
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  const formatValue = (value: number) => {
    if (showMarketCap) {
      return `$${value.toLocaleString()}`
    }
    return `$${value.toFixed(6)}`
  }
  
  return `
    <div class="space-x-4">
      <span class="text-muted-foreground">${interval}</span>
      <span>${tradingPair} • ${timeStr}</span>
      <span class="text-muted-foreground">O</span>
      <span>${formatValue(price.open)}</span>
      <span class="text-muted-foreground">H</span>
      <span>${formatValue(price.high)}</span>
      <span class="text-muted-foreground">L</span>
      <span>${formatValue(price.low)}</span>
      <span class="text-muted-foreground">C</span>
      <span>${formatValue(price.close)}</span>
    </div>
  `
} 