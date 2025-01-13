export interface Agent {
  id: string
  name: string
  avatar?: string
  type: 'leftcurve' | 'rightcurve'
  status: 'bonding' | 'live' | 'ended'
  price: number
  holders: number
  marketCap: number
  creativityIndex: number
  performanceIndex: number
  creator: string
  createdAt: string
  lore?: string
} 