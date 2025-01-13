import { Agent } from './types'

// Helper to generate random scores
const randomScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Helper to generate timestamps within the last month
const randomTimestamp = () => Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)

export const dummyAgents: Agent[] = [
  {
    id: '1',
    agentId: '1',
    name: 'MemeTrader-9000',
    avatar: '/avatars/agent1.png',
    score: 95,
    type: 'leftcurve',
    price: 10,
    holders: 42,
    status: 'bonding',
    createdAt: randomTimestamp(),
    creativityIndex: randomScore(80, 100)
  },
  {
    id: '2',
    agentId: '2',
    name: 'DankInvestor',
    avatar: '/avatars/agent2.png',
    score: 88,
    type: 'rightcurve',
    price: 15,
    holders: 28,
    status: 'live',
    createdAt: randomTimestamp(),
    performanceIndex: randomScore(80, 100)
  },
  {
    id: '3',
    agentId: '3',
    name: 'MoonShotBot',
    avatar: '/avatars/agent3.png',
    score: 92,
    type: 'leftcurve',
    price: 20,
    holders: 69,
    status: 'bonding',
    createdAt: randomTimestamp(),
    creativityIndex: randomScore(80, 100)
  },
  {
    id: '4',
    agentId: '4',
    name: 'DiamondHandsAI',
    avatar: '/avatars/agent4.png',
    score: 85,
    type: 'rightcurve',
    price: 8,
    holders: 35,
    status: 'live',
    createdAt: randomTimestamp(),
    performanceIndex: randomScore(80, 100)
  },
  {
    id: '5',
    agentId: '5',
    name: 'WSBPredictor',
    avatar: '/avatars/agent5.png',
    score: 90,
    type: 'leftcurve',
    price: 12,
    holders: 50,
    status: 'ended',
    createdAt: randomTimestamp(),
    creativityIndex: randomScore(80, 100)
  },
  {
    id: '6',
    agentId: '6',
    name: 'TrendMaster',
    avatar: '/avatars/agent6.png',
    score: 87,
    type: 'rightcurve',
    price: 25,
    holders: 45,
    status: 'bonding',
    createdAt: randomTimestamp(),
    performanceIndex: randomScore(80, 100)
  },
  {
    id: '7',
    agentId: '7',
    name: 'AlphaSeeker',
    avatar: '/avatars/agent7.png',
    score: 89,
    type: 'leftcurve',
    price: 18,
    holders: 33,
    status: 'live',
    createdAt: randomTimestamp(),
    creativityIndex: randomScore(80, 100)
  },
  {
    id: '8',
    agentId: '8',
    name: 'BetaBlaster',
    avatar: '/avatars/agent8.png',
    score: 86,
    type: 'rightcurve',
    price: 30,
    holders: 55,
    status: 'bonding',
    createdAt: randomTimestamp(),
    performanceIndex: randomScore(80, 100)
  },
  {
    id: '9',
    agentId: '9',
    name: 'VolumeViking',
    avatar: '/avatars/agent9.png',
    score: 91,
    type: 'leftcurve',
    price: 22,
    holders: 40,
    status: 'live',
    createdAt: randomTimestamp(),
    creativityIndex: randomScore(80, 100)
  },
  {
    id: '10',
    agentId: '10',
    name: 'PatternPro',
    avatar: '/avatars/agent10.png',
    score: 84,
    type: 'rightcurve',
    price: 16,
    holders: 38,
    status: 'ended',
    createdAt: randomTimestamp(),
    performanceIndex: randomScore(80, 100)
  }
] 