# Backend Endpoints Required for Agent Actions

## Authentication

All endpoints require:

- Header: `x-api-key`: string
- Response on invalid key: 401 status

## Endpoints

### 1. Latest Agents

```
GET /api/eliza-agent/latest
Query params:
- limit: number (optional, default: 10)

Response:
{
  "agents": Agent[]
}
```

### 2. Left Curve Leaderboard

```
GET /api/eliza-agent/leaderboard/left
Query params:
- limit: number (optional, default: 10)

Response:
{
  "agents": Agent[]  // Sorted by performance metrics
}
```

### 3. Right Curve Leaderboard

```
GET /api/eliza-agent/leaderboard/right
Query params:
- limit: number (optional, default: 10)

Response:
{
  "agents": Agent[]  // Sorted by performance metrics
}
```

### 4. Search Agents

```
GET /api/eliza-agent/search
Query params:
- q: string (required)
- type: 'leftcurve' | 'rightcurve' (optional)
- status: 'live' | 'bonding' | 'ended' (optional)
- limit: number (optional)
- offset: number (optional)

Response:
{
  "agents": Agent[],
  "total": number,
  "hasMore": boolean
}
```

## Agent Type Definition

```typescript
interface Agent {
  id: string;
  name: string;
  avatar: string;
  type: "leftcurve" | "rightcurve";
  curveSide: "LEFT" | "RIGHT";
  status: "live" | "bonding" | "ended";
  symbol: string;
  price: number;
  holders: number;
  marketCap: number;
  creativityIndex: number;
  performanceIndex: number;
  creator: string;
  createdAt: string; // ISO date string
  lore: string;
}
```

## Error Handling

All endpoints should return:

- 401 for invalid API key
- 404 for not found resources
- 500 for server errors

Error response format:

```typescript
{
  "success": false,
  "message": string
}
```

Success response format:

```typescript
{
  "success": true,
  "data": {
    // Endpoint specific data
  }
}
```
