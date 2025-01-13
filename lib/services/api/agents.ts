import agentsData from '@/data/agents.json'
import { Agent, AgentType, AgentStatus } from '@/lib/types'

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
    await new Promise(resolve => setTimeout(resolve, 500))
    return agentsData.agents.map(mapAgent)
  },

  async getAgentById(id: string): Promise<Agent | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const agent = agentsData.agents.find(agent => agent.id === id)
    return agent ? mapAgent(agent) : null
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