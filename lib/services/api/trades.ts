import { Trade, TradeType } from '@/lib/types';
import { getTrades } from '@/actions/trades/getTrades';
import { BaseService, IServiceConfig } from '@/lib/core/service';
import { withErrorHandling, Result } from '@/lib/core/error-handler';
// TODO: REMOVE IN PRODUCTION - Development-only imports
import tradesData from '@/data/trades.json';

const mapTrade = (trade: Omit<Trade, 'type'> & { type: string }): Trade => ({
  ...trade,
  type: trade.type as TradeType,
});

export class TradeService extends BaseService<Trade> {
  constructor(config: IServiceConfig = {}) {
    super(config);
  }

  async getAll(): Promise<Result<Trade[]>> {
    return withErrorHandling(async () => {
      const result = await getTrades();
      if (result.success && result.data && result.data.length > 0) {
        return result.data;
      }

      // TODO: REMOVE IN PRODUCTION
      return tradesData.trades.map(mapTrade);
    }, 'Failed to fetch trades');
  }

  async getById(id: string): Promise<Result<Trade>> {
    return withErrorHandling(async () => {
      const result = await this.getAll();
      if (!result.success || !result.data)
        throw result.error || new Error('Failed to fetch trades');

      const trade = result.data.find((trade) => trade.id === id);
      if (!trade) throw new Error('Trade not found');
      return trade;
    }, 'Failed to fetch trade');
  }

  async getByAgent(agentId: string): Promise<Result<Trade[]>> {
    return withErrorHandling(async () => {
      if (process.env.NEXT_PUBLIC_USE_TEST_DATA === 'true') {
        return tradesData.trades
          .filter((trade) => trade.agentId === agentId)
          .map(mapTrade);
      }

      const result = await getTrades(agentId);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch trades');
      }

      return result.data;
    }, `Failed to fetch trades for agent ${agentId}`);
  }

  async getRecent(limit: number = 10): Promise<Result<Trade[]>> {
    return withErrorHandling(async () => {
      const result = await this.getAll();
      if (!result.success || !result.data)
        throw result.error || new Error('Failed to fetch trades');

      return result.data
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, limit);
    }, 'Failed to fetch recent trades');
  }

  async getByType(agentId: string, type: TradeType): Promise<Result<Trade[]>> {
    return withErrorHandling(async () => {
      const result = await this.getByAgent(agentId);
      if (!result.success || !result.data)
        throw result.error || new Error('Failed to fetch trades');

      return result.data.filter((trade) => trade.type === type);
    }, `Failed to fetch trades of type ${type}`);
  }
}

export const tradeService = new TradeService();
