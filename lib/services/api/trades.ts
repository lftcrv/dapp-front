import { Trade, TradeType } from '@/lib/types'
import { getTrades } from '@/actions/trades/getTrades'
// TODO: REMOVE IN PRODUCTION - Development-only imports
import tradesData from '@/data/trades.json'

/**
 * Service for handling trade data
 */
class TradeService {
  async getAllTrades(): Promise<Trade[]> {
    try {
      const result = await getTrades()
      if (result.success && result.data && result.data.length > 0) {
        return result.data
      }
      
      // TODO: REMOVE IN PRODUCTION - Start of development-only code
      console.log('No trades found from API, using dummy data for testing')
      return tradesData.trades.map(trade => ({
        ...trade,
        type: trade.type as TradeType
      }))
      // TODO: REMOVE IN PRODUCTION - End of development-only code
    } catch {
      // TODO: REMOVE IN PRODUCTION - Start of development-only code
      console.log('Error fetching trades from API, using dummy data for testing')
      return tradesData.trades.map(trade => ({
        ...trade,
        type: trade.type as TradeType
      }))
      // TODO: REMOVE IN PRODUCTION - End of development-only code

      // TODO: UNCOMMENT IN PRODUCTION - Start of production-only code
      // throw new Error('Failed to fetch trades')
      // TODO: UNCOMMENT IN PRODUCTION - End of production-only code
    }
  }

  async getTradesByAgent(agentId: string): Promise<Trade[]> {
    if (process.env.NEXT_PUBLIC_USE_TEST_DATA === 'true') {
      return tradesData.trades
        .filter(trade => trade.agentId === agentId)
        .map(trade => ({
          ...trade,
          type: trade.type as TradeType
        }))
    }

    const result = await getTrades(agentId)
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch trades')
    }

    return result.data
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

  async getTradesByType(agentId: string, type: TradeType): Promise<Trade[]> {
    const trades = await this.getTradesByAgent(agentId)
    return trades.filter(trade => trade.type === type)
  }
}

export const tradeService = new TradeService() 