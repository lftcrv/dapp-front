import { Agent } from '@/lib/types';
import { BaseService, IServiceConfig } from '@/lib/core/service';
import { withErrorHandling, Result } from '@/lib/core/error-handler';
import { getCompleteAgentData, getTokenMarketData, getAgentAvatar } from '@/actions/agents/token/getTokenInfo';

export class AgentDetailsService extends BaseService<Agent> {
  constructor(config: IServiceConfig = {}) {
    super(config);
  }

  // Implement required base methods
  async getAll(): Promise<Result<Agent[]>> {
    throw new Error('Method not implemented - use agentService for listing');
  }

  async getById(id: string): Promise<Result<Agent>> {
    return this.getFullAgentData(id);
  }

  async getFullAgentData(id: string): Promise<Result<Agent>> {
    return withErrorHandling(async () => {
      const result = await getCompleteAgentData(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch agent details');
      }

      return result.data;
    }, 'Failed to fetch agent details');
  }

  async getMarketData(id: string) {
    return withErrorHandling(async () => {
      const result = await getTokenMarketData(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch market data');
      }

      return result.data;
    }, 'Failed to fetch market data');
  }

  async getAvatar(id: string) {
    return withErrorHandling(async () => {
      const result = await getAgentAvatar(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch avatar');
      }

      return result.data;
    }, 'Failed to fetch avatar');
  }
}

export const agentDetailsService = new AgentDetailsService(); 