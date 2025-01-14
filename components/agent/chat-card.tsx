import { MessageCircle } from 'lucide-react'
import { Agent } from '@/lib/types'
import { AgentCard } from '@/components/ui/agent-card'
import { AgentChat } from '@/components/agent-chat'
import { useAgentTheme } from '@/contexts/agent-theme-context'

interface ChatCardProps {
  agent: Agent
}

export function ChatCard({ agent }: ChatCardProps) {
  const theme = useAgentTheme()
  const badge = `${theme.icon} ${agent.type === 'leftcurve' ? 'APE TOGETHER' : 'ALPHA ZONE'}`

  return (
    <AgentCard
      title="Community Chat"
      icon={MessageCircle}
      badge={badge}
    >
      <AgentChat agentId={agent.id} />
    </AgentCard>
  )
} 