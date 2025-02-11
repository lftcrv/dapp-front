import type { AgentType, AgentStatus } from '@/lib/types';

// Type for UI preview data only
type AgentPreview = {
  id: string;
  name: string;
  avatar: string;
  type: AgentType;
  status: AgentStatus;
  price: number;
  holders: number;
  creativityIndex: number;
  performanceIndex: number;
  createdAt: string;
  creator: string;
  symbol: string;
  marketCap: number;
};

// Note: This dummy data is only used for UI/avatar previews
export const dummyAgents: readonly AgentPreview[] = [
  // LeftCurve Agents - Live
  {
    id: 'LC001',
    name: 'Degen Ape',
    avatar: '/avatars/degen-1.png',
    type: 'leftcurve',
    status: 'live',
    price: 0.15,
    holders: 850,
    creativityIndex: 9.8,
    performanceIndex: 0.78,
    createdAt: '2024-01-15',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    symbol: 'DAPE',
    marketCap: 127500
  },
  {
    id: 'LC002',
    name: 'Moon Rocket',
    avatar: '/avatars/moon-1.png',
    type: 'leftcurve',
    status: 'bonding',
    price: 0.08,
    holders: 250,
    creativityIndex: 8.5,
    performanceIndex: 0.65,
    createdAt: '2024-02-01',
    creator: '0xabcdef1234567890abcdef1234567890abcdef12',
    symbol: 'MOON',
    marketCap: 20000
  },
  // LeftCurve Agents - Bonding
  {
    id: 'LC003',
    name: 'WAGMI Warrior',
    avatar: '/avatars/degen-3.png',
    type: 'leftcurve',
    status: 'bonding',
    price: 0.12,
    holders: 45, // Low holders count, still in bonding
    creativityIndex: 9.2,
    performanceIndex: 0.75,
    createdAt: '2024-01-20',
    creator: '0x3456789012abcdef3456789012abcdef34567890',
    symbol: 'WAGMI',
    marketCap: 5400, // Small market cap during bonding
  },
  {
    id: 'LC004',
    name: 'Pepe Trader',
    avatar: '/avatars/degen-4.png',
    type: 'leftcurve',
    status: 'bonding',
    price: 0.05,
    holders: 80, // Growing but still in bonding
    creativityIndex: 8.9,
    performanceIndex: 0.68,
    createdAt: '2024-01-22',
    creator: '0x4567890123abcdef4567890123abcdef45678901',
    symbol: 'PEPE',
    marketCap: 4000, // Very early stage market cap
  },

  // RightCurve Agents - Live
  {
    id: 'RC001',
    name: 'Alpha Seeker',
    avatar: '/avatars/brain-1.png',
    type: 'rightcurve',
    status: 'live',
    price: 0.25,
    holders: 920, // High holders for established agent
    performanceIndex: 0.92,
    creativityIndex: 7.5,
    createdAt: '2024-01-16',
    creator: '0x6789012345abcdef6789012345abcdef67890123',
    symbol: 'ALPHA',
    marketCap: 230000, // Significant market cap for successful agent
  },
  {
    id: 'RC002',
    name: 'Quant Master',
    avatar: '/avatars/brain-2.png',
    type: 'rightcurve',
    status: 'live',
    price: 0.32,
    holders: 780, // Solid holder base
    performanceIndex: 0.88,
    creativityIndex: 7.2,
    createdAt: '2024-01-19',
    creator: '0x7890123456abcdef7890123456abcdef78901234',
    symbol: 'QUANT',
    marketCap: 249600, // High market cap due to higher price
  },
  // RightCurve Agents - Bonding
  {
    id: 'RC003',
    name: 'Neural Net',
    avatar: '/avatars/brain-3.png',
    type: 'rightcurve',
    status: 'bonding',
    price: 0.15,
    holders: 35, // Early stage, low holders
    performanceIndex: 0.85,
    creativityIndex: 7.8,
    createdAt: '2024-01-21',
    creator: '0x8901234567abcdef8901234567abcdef89012345',
    symbol: 'NEURAL',
    marketCap: 5250, // Small cap during bonding
  },
  // Special Cases
  {
    id: 'RC004',
    name: 'Quantum Bot',
    avatar: '/avatars/quantum-1.png',
    type: 'rightcurve',
    status: 'bonding',
    price: 0.12,
    holders: 180,
    performanceIndex: 0.72,
    creativityIndex: 8.9,
    createdAt: '2024-02-28',
    creator: '0x9012345678901234567890123456789012345678',
    symbol: 'QBOT',
    marketCap: 21600,
  },
  {
    id: 'RC005',
    name: 'Galaxy Brain',
    avatar: '/avatars/brain-5.png',
    type: 'rightcurve',
    status: 'bonding',
    price: 0.35,
    holders: 15, // Very early stage
    performanceIndex: 0.91,
    creativityIndex: 7.4,
    createdAt: '2024-01-26',
    creator: '0xa123456789abcdefa123456789abcdefa1234567',
    symbol: 'BRAIN',
    marketCap: 5250, // Just started bonding
  },
] as const; // Using const assertion to make it readonly
