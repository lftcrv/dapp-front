import { Agent, AgentType, AgentStatus } from '@/lib/types'
import { getAgents, getAgentById } from '@/actions/agents/query/getAgents'
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

export const agentService = {
  async getAllAgents(): Promise<Agent[]> {
    try {
      const result = await getAgents()
      if (result.success && result.data && result.data.length > 0) {
        return result.data
      }
      
      // TODO: REMOVE IN PRODUCTION - Start of development-only code
      console.log('No agents found from API, using dummy data for testing')
      return agentsData.agents.map(mapAgent)
      // TODO: REMOVE IN PRODUCTION - End of development-only code
    } catch {
      // TODO: REMOVE IN PRODUCTION - Start of development-only code
      console.log('Error fetching agents from API, using dummy data for testing')
      return agentsData.agents.map(mapAgent)
      // TODO: REMOVE IN PRODUCTION - End of development-only code

      // TODO: UNCOMMENT IN PRODUCTION - Start of production-only code
      // throw new Error('Failed to fetch agents')
      // TODO: UNCOMMENT IN PRODUCTION - End of production-only code
    }
  },

  async getAgentById(id: string): Promise<Agent | null> {
    try {
      const result = await getAgentById(id)
      if (result.success && result.data) {
        return result.data
      }
      
      // TODO: REMOVE IN PRODUCTION - Start of development-only code
      console.log('No agent found from API, using dummy data for testing')
      const agent = agentsData.agents.find(agent => agent.id === id)
      return agent ? mapAgent(agent) : null
      // TODO: REMOVE IN PRODUCTION - End of development-only code
    } catch {
      // TODO: REMOVE IN PRODUCTION - Start of development-only code
      console.log('Error fetching agent from API, using dummy data for testing')
      const agent = agentsData.agents.find(agent => agent.id === id)
      return agent ? mapAgent(agent) : null
      // TODO: REMOVE IN PRODUCTION - End of development-only code

      // TODO: UNCOMMENT IN PRODUCTION - Start of production-only code
      // throw new Error('Failed to fetch agent')
      // TODO: UNCOMMENT IN PRODUCTION - End of production-only code
    }
  },

  async getAgentsByType(type: AgentType): Promise<Agent[]> {
    const agents = await this.getAllAgents()
    return agents.filter(agent => agent.type === type)
  },

  async getAgentsByStatus(status: AgentStatus): Promise<Agent[]> {
    const agents = await this.getAllAgents()
    return agents.filter(agent => agent.status === status)
  }
} 