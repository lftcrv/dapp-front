import { Trade, TradeType } from '@/lib/types'
import tradesData from '@/data/trades.json'

/**
 * Service for handling trade data
 */
class TradeService {
  async getAllTrades(): Promise<Trade[]> {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500))
    return tradesData.trades.map(trade => ({
      ...trade,
      type: trade.type as TradeType
    }))
  }

  async getTradesByAgent(agentId: string): Promise<Trade[]> {
    const trades = await this.getAllTrades()
    return trades.filter(trade => trade.agentId === agentId)
  }

  async getTradeById(id: string): Promise<Trade | null> {
    const trades = await this.getAllTrades()
    return trades.find(trade => trade.id === id) || null
  }

  async getRecentTrades(limit: number = 10): Promise<Trade[]> {
    const trades = await this.getAllTrades()
    return trades
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit)
  }

  async getTradesByType(agentId: string, type: 'buy' | 'sell'): Promise<Trade[]> {
    const trades = await this.getTradesByAgent(agentId)
    return trades.filter(trade => trade.type === type)
  }
}

export const tradeService = new TradeService() 