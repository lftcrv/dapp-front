export interface Agent {
  id: string
  agentId: string
  name: string
  avatar: string
  score: number
  type: 'leftcurve' | 'rightcurve'
  price: number
  holders: number
  status: 'bonding' | 'live' | 'ended'
  createdAt: number // timestamp in milliseconds
  creativityIndex?: number // for leftcurve leaderboard
  performanceIndex?: number // for rightcurve leaderboard
} 