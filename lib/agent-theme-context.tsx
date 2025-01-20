import { createContext, useContext } from 'react'
import { useAgent } from '@/hooks/use-agents'
import type { AgentType } from '@/lib/types'

interface ThemeContextValue {
  cardStyle: string
  textStyle: string
  icon: string
  isLoading: boolean
  mode: 'leftcurve' | 'rightcurve'
}

interface AgentThemeProviderProps {
  agentId: string
  children: React.ReactNode
}

const defaultTheme: ThemeContextValue = {
  cardStyle: '',
  textStyle: '',
  icon: '',
  isLoading: false,
  mode: 'leftcurve'
}

const AgentThemeContext = createContext<ThemeContextValue>(defaultTheme)

export function AgentThemeProvider({ agentId, children }: AgentThemeProviderProps) {
  const { data: agent, isLoading } = useAgent({ id: agentId })
  const isLeftCurve = agent?.type === 'leftcurve'
  const mode: AgentType = isLeftCurve ? 'leftcurve' : 'rightcurve'

  const theme: ThemeContextValue = {
    cardStyle: isLeftCurve ? 'hover:border-yellow-500/50' : 'hover:border-purple-500/50',
    textStyle: isLeftCurve ? 'text-yellow-500' : 'text-purple-500',
    icon: isLeftCurve ? '🦧' : '🐙',
    isLoading,
    mode
  }

  return (
    <AgentThemeContext.Provider value={isLoading ? defaultTheme : theme}>
      {children}
    </AgentThemeContext.Provider>
  )
}

export function useAgentTheme() {
  const context = useContext(AgentThemeContext)
  if (!context) {
    throw new Error('useAgentTheme must be used within an AgentThemeProvider')
  }
  return context
} 