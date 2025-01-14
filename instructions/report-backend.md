# LFTCurve Backend Integration Guide

## Current Dapp Structure
```
dapp/
├── app/                    # Next.js app router pages
├── components/            
│   ├── ui/                # Reusable UI components
│   └── [component].tsx    # Page-specific components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── services/         
│   │   ├── api/          # API service implementations
│   │   └── [service].ts  # Other services
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Helper functions
└── data/                 # Mock JSON data files
```

## Data Structure

### Agent Data
```typescript
interface Agent {
  id: string;              // Format: "LC001" or "RC001"
  name: string;            // e.g., "Degen Ape"
  avatar: string;          // Path to avatar image
  type: "leftcurve" | "rightcurve";
  status: "bonding" | "live" | "ended";
  symbol: string;          // e.g., "DAPE"
  price: number;           // Current price in ETH
  holders: number;         // Number of token holders
  marketCap: number;       // Price * Total Supply
  creativityIndex: number; // 0-10 scale
  performanceIndex: number;// 0-1 scale
  creator: string;         // Ethereum address
  createdAt: string;       // ISO date string
}

// Example:
{
  "id": "LC001",
  "name": "Degen Ape",
  "avatar": "/avatars/degen-1.png",
  "type": "leftcurve",
  "status": "live",
  "symbol": "DAPE",
  "price": 0.15,
  "holders": 850,
  "marketCap": 127500,
  "creativityIndex": 9.8,
  "performanceIndex": 0.78,
  "createdAt": "2024-01-15",
  "creator": "0x1234..."
}
```

### Trade Data
```typescript
interface Trade {
  id: string;
  agentId: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  time: string;
  summary: string;
  txHash: string;
  success: boolean;
}

// Example:
{
  "id": "trade-1",
  "agentId": "LC001",
  "type": "buy",
  "amount": 100,
  "price": 0.15,
  "time": "2024-01-20T14:30:00Z",
  "summary": "Aped in because number go up",
  "txHash": "0xabcd...",
  "success": true
}
```

### Chat Message Data
```typescript
interface ChatMessage {
  id: string;
  agentId: string;
  content: string;
  sender: string;
  time: string;
  isCurrentUser: boolean;
}

// Example:
{
  "id": "msg-1",
  "agentId": "LC001",
  "content": "gm frens! just aped into a new position 🦍",
  "sender": "agent",
  "time": "2024-01-20T14:35:00Z",
  "isCurrentUser": false
}
```

### Protocol Fees Data
```typescript
interface ProtocolFeesData {
  totalFees: string;
  periodFees: string;
  periodEndTime: string;
  distribution: {
    leftCurve: {
      percentage: number;
      description: string;
      color: string;
      totalShares: string;
      topGainers: Array<{
        address: string;
        shares: string;
        percentage: string;
      }>;
    };
    rightCurve: {
      // Same structure as leftCurve
    };
  };
  userShares: {
    [key: string]: string;
  };
}
```

## Current API Implementation

### Service Structure
```typescript
// Example of API service pattern
export const agentService = {
  getAll: async () => {
    // Currently reads from JSON
    // TODO: Replace with API call
    return agents;
  },
  
  getById: async (id: string) => {
    // TODO: Replace with API endpoint
    return agents.find(a => a.id === id);
  },
  
  create: async (data: CreateAgentForm) => {
    // TODO: Implement POST request
  }
};
```

### Required Endpoints

#### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/{id}` - Get agent details
- `POST /api/agents` - Create new agent
- `GET /api/agents/{id}/trades` - Get agent trades
- `GET /api/agents/{id}/chat` - Get agent chat history

#### Trading
- `GET /api/trades` - List recent trades
- `POST /api/trades` - Execute trade
- `GET /api/prices/{agentId}` - Get price history

#### Protocol
- `GET /api/protocol/fees` - Get protocol fees
- `POST /api/protocol/claim` - Claim rewards
- `GET /api/stats` - Get platform statistics

## Migration Steps

### Phase 1: API Setup
1. Set up REST API endpoints matching current service structure
2. Implement proper error handling and status codes
3. Add authentication middleware
4. Set up rate limiting

### Phase 2: Data Migration
1. Design database schema matching current interfaces
2. Create migrations for all data structures
3. Add indexes for frequently queried fields
4. Implement data validation

### Phase 3: Integration
1. Update service layer to use new API endpoints
2. Add retry logic and error handling
3. Implement proper caching strategy
4. Add real-time updates via WebSocket

### Phase 4: Testing
1. Create API tests matching current behavior
2. Test data consistency
3. Performance testing
4. Security audit

## Required Actions

### Backend Team
1. Review data structures and propose optimizations
2. Design database schema
3. Set up development environment
4. Implement authentication system
5. Create API documentation

### Frontend Team
1. Update service implementations
2. Add loading states for API calls
3. Implement error handling
4. Add retry logic
5. Update tests

### DevOps
1. Set up staging environment
2. Configure CI/CD pipeline
3. Set up monitoring
4. Configure backups

## Current Mock Data Usage

### Location
```
dapp/data/
├── agents.json       # Agent listings
├── trades.json       # Trade history
├── chat-messages.json# Chat messages
├── protocol-fees.json# Protocol metrics
└── prices.json      # Historical prices
```

### Migration Notes
- All timestamps use ISO format
- Amounts are stored as numbers (will need BigNumber conversion)
- IDs follow consistent patterns
- Images are stored as paths (need CDN strategy)
- Status changes need event tracking
- Real-time updates needed for:
  - Price changes
  - New trades
  - Chat messages
  - Protocol fee updates

## Security Considerations
1. Implement proper authentication
2. Add rate limiting
3. Validate all input data
4. Sanitize response data
5. Add API key management
6. Implement proper CORS policy
7. Add request logging
8. Set up monitoring for unusual patterns

## Performance Requirements
1. API response time < 100ms
2. Support for 1000+ concurrent users
3. Real-time updates < 500ms delay
4. Cache frequently accessed data
5. Optimize database queries
6. Implement pagination
7. Use CDN for static assets
8. Set up proper indexing 