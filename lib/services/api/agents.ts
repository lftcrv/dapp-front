import { Agent, AgentType, AgentStatus } from '@/lib/types'
import { getAgents, getAgentById } from '@/actions/agents/query/getAgents'
import { BaseService, IServiceConfig } from '@/lib/core/service'
import { withErrorHandling, Result } from '@/lib/core/error-handler'

export class AgentService extends BaseService<Agent> {
  constructor(config: IServiceConfig = {}) {
    super(config)
  }

  async getAll(): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      console.log('AgentService: Fetching all agents')
      const result = await getAgents()
      console.log('AgentService getAll result:', {
        success: result.success,
        hasData: !!result.data,
        dataLength: result.data?.length,
        error: result.error
      })
      
      if (!result.success) {
        console.error('AgentService: Failed to fetch agents:', result.error)
        throw new Error(result.error || 'Failed to fetch agents')
      }
      
      if (!result.data || result.data.length === 0) {
        console.warn('AgentService: No agents found in response')
        throw new Error('No agents found')
      }
      
      console.log('AgentService: Successfully fetched', result.data.length, 'agents')
      return result.data
    }, 'Failed to fetch agents')
  }

  async getById(id: string): Promise<Result<Agent>> {
    return withErrorHandling(async () => {
      console.log('AgentService: Fetching agent by id:', id)
      const result = await getAgentById(id)
      console.log('AgentService getById result:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error
      })
      
      if (!result.success) {
        console.error('AgentService: Failed to fetch agent:', result.error)
        throw new Error(result.error || 'Failed to fetch agent')
      }
      
      if (!result.data) {
        console.warn('AgentService: Agent not found:', id)
        throw new Error('Agent not found')
      }
      
      console.log('AgentService: Successfully fetched agent:', id)
      return result.data
    }, 'Failed to fetch agent')
  }

  async getByType(type: AgentType): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      const result = await this.getAll()
      if (!result.success || !result.data) throw result.error || new Error('Failed to fetch agents')
      return result.data.filter(agent => agent.type === type)
    }, `Failed to fetch agents of type ${type}`)
  }

  async getByStatus(status: AgentStatus): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      const result = await this.getAll()
      if (!result.success || !result.data) throw result.error || new Error('Failed to fetch agents')
      return result.data.filter(agent => agent.status === status)
    }, `Failed to fetch agents with status ${status}`)
  }
}

export const agentService = new AgentService() 