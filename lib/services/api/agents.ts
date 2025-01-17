import { Agent, AgentType, AgentStatus } from '@/lib/types'
import { getAgents, getAgentById } from '@/actions/agents/query/getAgents'
import { BaseService, IServiceConfig } from '@/lib/core/service'
import { withErrorHandling, Result } from '@/lib/core/error-handler'
// TODO: REMOVE IN PRODUCTION - Development-only imports
import agentsData from '@/data/agents.json'

interface RawAgent extends Omit<Agent, 'type' | 'status'> {
  type: string
  status: string
}

const mapAgent = (agent: RawAgent): Agent => ({
  ...agent,
  type: agent.type as AgentType,
  status: agent.status as AgentStatus
})

export class AgentService extends BaseService<Agent> {
  constructor(config: IServiceConfig = {}) {
    super(config)
  }

  async getAll(): Promise<Result<Agent[]>> {
    return withErrorHandling(async () => {
      const result = await getAgents()
      if (result.success && result.data && result.data.length > 0) {
        return result.data
      }
      
      // TODO: REMOVE IN PRODUCTION
      return agentsData.agents.map(mapAgent)
    }, 'Failed to fetch agents')
  }

  async getById(id: string): Promise<Result<Agent>> {
    return withErrorHandling(async () => {
      const result = await getAgentById(id)
      if (result.success && result.data) {
        return result.data
      }
      
      // TODO: REMOVE IN PRODUCTION
      const agent = agentsData.agents.find(agent => agent.id === id)
      if (!agent) throw new Error('Agent not found')
      return mapAgent(agent)
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