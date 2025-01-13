export interface Agent {
  id: string
  name: string
  avatar: string
  type: 'leftcurve' | 'rightcurve'
  status: 'bonding' | 'live' | 'ended'
  price: number
  holders: number
  creativityIndex?: number
  performanceIndex?: number
  createdAt: string
  creator: string
} 