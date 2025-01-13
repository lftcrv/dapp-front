import { Agent } from '@/lib/types'

export function getAgentTheme(agent: Agent) {
  const isLeftCurve = agent.type === 'leftcurve'
  
  return {
    gradientClass: isLeftCurve 
      ? 'from-yellow-500 via-orange-500 to-pink-500'
      : 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: isLeftCurve ? 'yellow' : 'purple',
    cardStyle: isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50",
    bgStyle: isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5",
    textStyle: isLeftCurve ? "text-yellow-500" : "text-purple-500",
    icon: isLeftCurve ? "🦧" : "🐙",
    mode: isLeftCurve ? "DEGEN MODE" : "GALAXY MODE"
  }
} 