import { createContext, useContext } from 'react'
import { Agent } from '@/lib/types'
import { getAgentTheme } from '@/lib/styles/agent-theme'

type AgentTheme = ReturnType<typeof getAgentTheme>

const AgentThemeContext = createContext<AgentTheme | null>(null)

export function useAgentTheme() {
  const theme = useContext(AgentThemeContext)
  if (!theme) {
    throw new Error('useAgentTheme must be used within an AgentThemeProvider')
  }
  return theme
}

interface AgentThemeProviderProps {
  agent: Agent
  children: React.ReactNode
}

export function AgentThemeProvider({ agent, children }: AgentThemeProviderProps) {
  const theme = getAgentTheme(agent)
  return (
    <AgentThemeContext.Provider value={theme}>
      {children}
    </AgentThemeContext.Provider>
  )
} 