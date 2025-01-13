import { Agent } from '@/lib/types'

// Theme configuration types
export interface ThemeConfig {
  gradientClass: string
  accentColor: string
  cardStyle: string
  bgStyle: string
  textStyle: string
  icon: string
  mode: string
}

// Default theme values
const defaultTheme: ThemeConfig = {
  gradientClass: 'from-gray-500 via-gray-600 to-gray-700',
  accentColor: 'gray',
  cardStyle: "hover:border-gray-500/50",
  bgStyle: "bg-gray-500/5",
  textStyle: "text-gray-500",
  icon: "🤖",
  mode: "NEUTRAL MODE"
}

// Theme configurations by agent type
const themeConfigs: Record<string, ThemeConfig> = {
  leftcurve: {
    gradientClass: 'from-yellow-500 via-orange-500 to-pink-500',
    accentColor: 'yellow',
    cardStyle: "hover:border-yellow-500/50",
    bgStyle: "bg-yellow-500/5",
    textStyle: "text-yellow-500",
    icon: "🦧",
    mode: "DEGEN MODE"
  },
  rightcurve: {
    gradientClass: 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: 'purple',
    cardStyle: "hover:border-purple-500/50",
    bgStyle: "bg-purple-500/5",
    textStyle: "text-purple-500",
    icon: "🐙",
    mode: "GALAXY MODE"
  }
}

export function getAgentTheme(agent: Agent): ThemeConfig {
  // Get theme based on agent type, fallback to default if type is unknown
  return themeConfigs[agent.type] || defaultTheme
}

// Export theme utilities for reuse
export const themeUtils = {
  getStatusColor: (status: string) => {
    switch (status) {
      case 'live': return 'text-green-500 bg-green-500/10'
      case 'bonding': return 'text-yellow-500 bg-yellow-500/10'
      case 'ended': return 'text-gray-500 bg-gray-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  },
  
  getPerformanceColor: (value: number) => {
    if (value >= 0.8) return 'text-green-500'
    if (value >= 0.5) return 'text-yellow-500'
    return 'text-red-500'
  }
} 