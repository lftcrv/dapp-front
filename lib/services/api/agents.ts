import { Agent, AgentType, AgentStatus } from '@/lib/types';
import { getAgentById } from '@/actions/agents/query/getAgents';
import { getLatestAgents } from '@/actions/agents/query/getLatestAgents';
import { BaseService, IServiceConfig } from '@/lib/core/service';
import { withErrorHandling, Result } from '@/lib/core/error-handler';

export class AgentService extends BaseService<Agent> {
  constructor(config: IServiceConfig = {}) {
    super(config);
  }

  async getAll(): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      const result = await getLatestAgents();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch agents');
      }

      if (!result.data || result.data.length === 0) {
        throw new Error('No agents found');
      }

      return result.data;
    }, 'Failed to fetch agents');
  }

  async getById(id: string): Promise<Result<Agent>> {
    return withErrorHandling(async () => {
      const result = await getAgentById(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch agent');
      }

      if (!result.data) {
        throw new Error('Agent not found');
      }

      // Force revalidation for deployment status checks
      if (!result.data.contractAddress || result.data.contractAddress === '0x0') {
        result.data.status = 'bonding';
      }

      return result.data;
    }, 'Failed to fetch agent');
  }

  async getByType(type: AgentType): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      const result = await this.getAll();
      if (!result.success || !result.data)
        throw result.error || new Error('Failed to fetch agents');
      return result.data.filter((agent) => agent.type === type);
    }, `Failed to fetch agents of type ${type}`);
  }

  async getByStatus(status: AgentStatus): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      const result = await this.getAll();
      if (!result.success || !result.data)
        throw result.error || new Error('Failed to fetch agents');
      return result.data.filter((agent) => agent.status === status);
    }, `Failed to fetch agents with status ${status}`);
  }
}

export const agentService = new AgentService();
