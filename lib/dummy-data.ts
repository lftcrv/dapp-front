import { Agent } from "./types";

export const dummyAgents: Agent[] = [
  // LeftCurve Agents - Live
  {
    id: "LC001",
    name: "Degen Ape",
    avatar: "/avatars/degen-1.png",
    type: "leftcurve",
    status: "live",
    price: 0.15,
    holders: 850, // High holders count for live status
    creativityIndex: 9.8,
    performanceIndex: 0.78,
    createdAt: "2024-01-15",
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    symbol: "DAPE",
    marketCap: 127500, // price * holders * 1000
  },
  {
    id: "LC002",
    name: "Moon Boy",
    avatar: "/avatars/degen-2.png",
    type: "leftcurve",
    status: "live",
    price: 0.08,
    holders: 1250, // Very high holders, well past bonding
    creativityIndex: 9.5,
    performanceIndex: 0.82,
    createdAt: "2024-01-18",
    creator: "0x2345678901abcdef2345678901abcdef23456789",
    symbol: "MOON",
    marketCap: 100000, // price * holders * 1000
  },
  // LeftCurve Agents - Bonding
  {
    id: "LC003",
    name: "WAGMI Warrior",
    avatar: "/avatars/degen-3.png",
    type: "leftcurve",
    status: "bonding",
    price: 0.12,
    holders: 45, // Low holders count, still in bonding
    creativityIndex: 9.2,
    performanceIndex: 0.75,
    createdAt: "2024-01-20",
    creator: "0x3456789012abcdef3456789012abcdef34567890",
    symbol: "WAGMI",
    marketCap: 5400, // Small market cap during bonding
  },
  {
    id: "LC004",
    name: "Pepe Trader",
    avatar: "/avatars/degen-4.png",
    type: "leftcurve",
    status: "bonding",
    price: 0.05,
    holders: 80, // Growing but still in bonding
    creativityIndex: 8.9,
    performanceIndex: 0.68,
    createdAt: "2024-01-22",
    creator: "0x4567890123abcdef4567890123abcdef45678901",
    symbol: "PEPE",
    marketCap: 4000, // Very early stage market cap
  },

  // RightCurve Agents - Live
  {
    id: "RC001",
    name: "Alpha Seeker",
    avatar: "/avatars/brain-1.png",
    type: "rightcurve",
    status: "live",
    price: 0.25,
    holders: 920, // High holders for established agent
    performanceIndex: 0.92,
    creativityIndex: 7.5,
    createdAt: "2024-01-16",
    creator: "0x6789012345abcdef6789012345abcdef67890123",
    symbol: "ALPHA",
    marketCap: 230000, // Significant market cap for successful agent
  },
  {
    id: "RC002",
    name: "Quant Master",
    avatar: "/avatars/brain-2.png",
    type: "rightcurve",
    status: "live",
    price: 0.32,
    holders: 780, // Solid holder base
    performanceIndex: 0.88,
    creativityIndex: 7.2,
    createdAt: "2024-01-19",
    creator: "0x7890123456abcdef7890123456abcdef78901234",
    symbol: "QUANT",
    marketCap: 249600, // High market cap due to higher price
  },
  // RightCurve Agents - Bonding
  {
    id: "RC003",
    name: "Neural Net",
    avatar: "/avatars/brain-3.png",
    type: "rightcurve",
    status: "bonding",
    price: 0.15,
    holders: 35, // Early stage, low holders
    performanceIndex: 0.85,
    creativityIndex: 7.8,
    createdAt: "2024-01-21",
    creator: "0x8901234567abcdef8901234567abcdef89012345",
    symbol: "NEURAL",
    marketCap: 5250, // Small cap during bonding
  },
  // Special Cases
  {
    id: "RC004",
    name: "Data Wizard",
    avatar: "/avatars/brain-4.png",
    type: "rightcurve",
    status: "ended", // Example of ended agent
    price: 0.28,
    holders: 390,
    performanceIndex: 0.79,
    creativityIndex: 7.1,
    createdAt: "2024-01-23",
    creator: "0x9012345678abcdef9012345678abcdef90123456",
    symbol: "WIZARD",
    marketCap: 109200,
  },
  {
    id: "RC005",
    name: "Galaxy Brain",
    avatar: "/avatars/brain-5.png",
    type: "rightcurve",
    status: "bonding",
    price: 0.35,
    holders: 15, // Very early stage
    performanceIndex: 0.91,
    creativityIndex: 7.4,
    createdAt: "2024-01-26",
    creator: "0xa123456789abcdefa123456789abcdefa1234567",
    symbol: "BRAIN",
    marketCap: 5250, // Just started bonding
  },
];
