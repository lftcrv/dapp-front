interface PriceData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const generatePriceData = (
  basePrice: number,
  currentPrice: number,
  volatility: number,
  daysBack: number = 30,
  upTrend: boolean = true,
  intervalMinutes: number = 15
): PriceData[] => {
  const data: PriceData[] = []
  let price = basePrice
  const now = Math.floor(Date.now() / 1000)
  const intervalsPerDay = Math.floor(24 * 60 / intervalMinutes)
  const totalIntervals = daysBack * intervalsPerDay
  
  // Calculate price increment to reach current price
  const priceChangePerInterval = (currentPrice - basePrice) / totalIntervals
  
  for (let i = totalIntervals; i >= 0; i--) {
    const time = now - (i * intervalMinutes * 60)
    
    // For the last data point, ensure we hit the exact current price
    if (i === 0) {
      const open = price
      const close = currentPrice
      const high = Math.max(open, close) + (Math.random() * volatility * open * 0.1)
      const low = Math.min(open, close) - (Math.random() * volatility * open * 0.1)
      const volume = Math.floor(Math.random() * 10000) + 5000
      
      data.push({ time, open, high, low, close, volume })
      break
    }
    
    const trendFactor = upTrend ? 1.0002 : 0.9998
    const randomFactor = Math.random() * 2 - 1
    const change = priceChangePerInterval + (randomFactor * volatility * price * trendFactor)
    
    const open = price
    const close = price + change
    const high = Math.max(open, close) + (Math.random() * volatility * price)
    const low = Math.min(open, close) - (Math.random() * volatility * price)
    
    const priceChange = Math.abs(close - open) / open
    const volumeBase = Math.floor(Math.random() * 10000) + 5000
    const volumeSpike = priceChange > volatility ? Math.floor(Math.random() * 50000) : 0
    const volume = volumeBase + volumeSpike
    
    price = close
    data.push({ time, open, high, low, close, volume })
  }
  
  return data
}

export const getDummyPriceData = (symbol: string, currentPrice: number) => {
  // Base price will be 20-40% lower than current price for uptrends
  // or 20-40% higher for downtrends
  let basePrice: number
  let volatility = 0.02
  let upTrend = true
  let daysBack = 30

  switch (symbol) {
    // Live LeftCurve Agents - Strong uptrends
    case 'DAPE':
      basePrice = currentPrice * 0.6  // Started 40% lower
      volatility = 0.08
      upTrend = true
      daysBack = 45
      break
    case 'MOON':
      basePrice = currentPrice * 0.7  // Started 30% lower
      volatility = 0.1
      upTrend = true
      daysBack = 20
      break
      
    // Bonding LeftCurve Agents - Early stage growth
    case 'WAGMI':
      basePrice = currentPrice * 0.9  // Recent start, 10% lower
      volatility = 0.06
      upTrend = true
      daysBack = 10
      break
    case 'PEPE':
      basePrice = currentPrice * 0.95  // Very recent start
      volatility = 0.15
      upTrend = true
      daysBack = 5
      break
      
    // Live RightCurve Agents - Steady growth
    case 'ALPHA':
      basePrice = currentPrice * 0.5  // Long history, started 50% lower
      volatility = 0.03
      upTrend = true
      daysBack = 60
      break
    case 'QUANT':
      basePrice = currentPrice * 0.6
      volatility = 0.02
      upTrend = true
      daysBack = 50
      break
      
    // Bonding RightCurve Agents - Early stage
    case 'NEURAL':
      basePrice = currentPrice * 0.98  // Just started
      volatility = 0.05
      upTrend = true
      daysBack = 3
      break
    case 'BRAIN':
      basePrice = currentPrice  // Brand new
      volatility = 0.02
      upTrend = true
      daysBack = 1
      break
      
    // Special Cases
    case 'WIZARD':
      basePrice = currentPrice * 1.2  // Ended - downtrend
      volatility = 0.04
      upTrend = false
      daysBack = 40
      break
      
    default:
      basePrice = currentPrice * 0.8
      volatility = 0.05
      upTrend = true
      daysBack = 30
  }

  return generatePriceData(basePrice, currentPrice, volatility, daysBack, upTrend, 15)
} 