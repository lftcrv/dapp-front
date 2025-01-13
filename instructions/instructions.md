# LeftCurve Dapp Frontend – Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Purpose

The **LeftCurve Dapp Frontend** enables users to:
1. **View** a list of existing meme/trading agents
2. **Create** new agents (with name, lore, personality, strategy, etc.)
3. **Participate** in bonding curves (buy agent tokens, track price)
4. **Check** personal agent portfolios
5. **View** dual leaderboards (LeftCurve vs. RightCurve)

This frontend will connect to a **NestJS** backend service, which manages agent data, bonding curves, and code generation. We're deploying on **Starknet**, an L2 zk-rollup that requires **starknet.js** for chain interactions.

### 1.2 Key Features & Requirements
- **Connect Starknet Wallet**: Integrate a wallet such as [Argent X](https://www.argent.xyz/argent-x/), [Braavos](https://braavos.app/), or other Starknet-compatible wallets (via **starknet.js**)
- **Agent Listing**: Display deployed agents in a table with price, # of holders, etc.
- **Agent Details**: Bonding curve chart, swap/transaction section, last trades, agent chat logs
- **Agent Creation**: Form to input agent name, personality, trading strategy, etc.
- **My Agents**: Portfolio page listing user-owned agent tokens
- **Leaderboard**: Dual scoreboard for performance (RightCurve) and memes (LeftCurve)
- **Responsiveness**: Must work on mobile, tablet, and desktop

## 2. Tech Stack & References

1. **Next.js 15**
   - [Next.js Docs](https://nextjs.org/docs)
   - Using the App Router for page-based routing

2. **Tailwind CSS**
   - [Tailwind CSS Docs](https://tailwindcss.com/docs)
   - For utility-first styling and responsive design

3. **shadcn/ui**
   - [shadcn/ui Docs](https://ui.shadcn.com/docs)
   - For pre-built React + Tailwind components

4. **Lucide Icons**
   - [Lucide Icons](https://lucide.dev/docs/lucide-react)
   - Icon library for your UI needs

5. **Starknet.js** (instead of EVM-based libraries)
   - [starknet.js Docs](https://www.starknetjs.com/)
   - For interacting with Starknet contracts (calling functions, reading states, handling wallet connections)

6. **Backend: NestJS**
   - [NestJS Docs](https://docs.nestjs.com/)
   - Manages data storage (PostgreSQL), agent logic, and bonding curve endpoints

## 3. Functional Specifications

### 3.1 Home Page

**Endpoint** (from NestJS backend): `GET /api/agents`
- **Purpose**: Fetch a list of deployed agents with basic info
- **Example Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "agentId": "123",
        "name": "SpongeBobAlpha",
        "price": "10 LEFT",
        "holders": 42,
        "status": "bonding"
      }
    ]
  }
  ```

**UI Features**:
- **Connect Starknet Wallet** (Argent X, Braavos, etc.)
- A **modal** with a brief explanation (3 sentences)
- **"Create Agent"** button redirecting to creation page
- **Agent Table** showing columns:
  - Agent Name
  - Price
  - # of Holders
  - Status (Bonding, Live, Ended, etc.)

### 3.2 Agent Page

**Dynamic Route**: `/agent/[agentId]`

**Data Required**:
- **GET** `/api/agent/:agentId` for agent details
- **GET** `/api/agent/:agentId/trades` for recent trades
- Possibly a subscription or polling approach if the bonding curve updates in near real time

**Sections**:
1. **Chart**: Bonding curve or "pump chart"
2. **Bonding Curve Status**: Current progress, how much liquidity is needed
3. **Swap Widget**: Buy/sell the agent's token (calls Starknet contract via starknet.js)
4. **Last Memecoin Activities**: Simple feed or table (optional for MVP)
5. **Last Agent Trades**: Show the agent's trading logs
6. **Agent Chat**: Comedic commentary or explanation logs from the agent

**Example GET `/api/agent/:agentId` Response**:
```json
{
  "success": true,
  "data": {
    "agentId": "123",
    "name": "SpongeBobAlpha",
    "price": "12 LEFT",
    "status": "live",
    "description": "SpongeBob quotes fused with advanced TA. YOLO life!",
    "creator": "0xCreatorStarknetAddr",
    "bondingCurve": {
      "targetAmount": 10000,
      "raised": 7500,
      "deadline": "2026-01-12T00:00:00Z"
    }
  }
}
```

### 3.3 Agent Creation Page

**Route**: `/create-agent`

**Form Fields**:
- **Agent Name**
- **Picture** (URL or upload)
- **Lore / Personality**
- **Trading Strategy** (optional or comedic)
- **Knowledge** (optional)
- Possibly a **Twitter handle** (preferred feature)

**Button**:
- **Confirm & Deploy**: Calls `POST /api/agent/create` on NestJS backend, then interacts with a Starknet contract to finalize creation
- The user pays fees in $LEFT (Starknet-based token)

**Example POST `/api/agent/create` Request**:
```json
{
  "name": "NarutoChad",
  "lore": "Believes in 'Dattebayo' Momentum Strategy",
  "personality": "Hyperactive, YOLO vibes",
  "tradingStrategy": "SPOT + shorting on dips, references anime quotes",
  "creator": "0xUserStarknetAddress"
}
```

**Example Response**:
```json
{
  "success": true,
  "agentId": "abc123",
  "message": "Agent successfully created in DB. Please finalize on-chain."
}
```

### 3.4 My Agents Page

**Route**: `/my-agents`

**Features**:
- **Portfolio** of agent tokens the user holds, plus any relevant stats
- Possibly a direct link to each agent page or a "Manage" button

**Endpoints**:
- **GET** `/api/user/:starknetAddress/agents` – returns the user's agent holdings

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "agentId": "123",
      "name": "SpongeBobAlpha",
      "balance": 500,
      "price": "10 LEFT"
    },
    {
      "agentId": "abc123",
      "name": "NarutoChad",
      "balance": 0,
      "price": "12 LEFT"
    }
  ]
}
```

### 3.5 Leaderboard Page

**Route**: `/leaderboard`

**Data**:
- **GET** `/api/leaderboard?type=left`
- **GET** `/api/leaderboard?type=right`

**UI**:
- **Two boards** (in tabs or side by side):
  - **LeftCurve** (meme/creativity score)
  - **RightCurve** (performance score)

**Example Response**:
```json
{
  "success": true,
  "type": "left",
  "data": [
    { "rank": 1, "agentName": "Dogeking420", "score": 99 },
    { "rank": 2, "agentName": "WackyWizards", "score": 95 }
  ]
}
```

## 4. File Structure

```
.
├── README.md
├── .env                    # Environment variables
├── .env.local             # Local environment variables (git ignored)
├── package.json
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── agent/
│   │   └── [agentId]/
│   │       └── page.tsx   # Single agent page
│   ├── create-agent/
│   │   └── page.tsx       # Agent creation form
│   ├── my-agents/
│   │   └── page.tsx       # User's agent holdings
│   └── leaderboard/
│       └── page.tsx       # Dual leaderboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   └── ...
│   └── [feature]/        # Feature-specific components
├── lib/                  # Core utilities
│   ├── constants.ts      # App-wide constants
│   ├── utils.ts         # Utility functions
│   └── [context]/       # React contexts
├── hooks/               # Custom React hooks
│   └── use-[name].ts
├── services/           # API service layer
│   └── [service].ts
├── types/              # TypeScript types
│   └── index.ts
└── public/            # Static assets
    └── images/
```

### Key Directories

- **`app/`**: Next.js App Router pages and layouts
- **`components/`**: React components
  - `ui/`: Reusable UI components (buttons, inputs, etc.)
  - Feature-specific components organized by feature
- **`lib/`**: Core utilities and contexts
  - App-wide constants
  - Utility functions
  - React contexts
- **`hooks/`**: Custom React hooks
- **`services/`**: API service layer
- **`types/`**: TypeScript type definitions
- **`public/`**: Static assets

### Naming Conventions

- Use kebab-case for file names: `gradient-button.tsx`
- Use PascalCase for component names: `GradientButton`
- Use camelCase for functions and variables
- Prefix hooks with `use`: `useAgents`
- Suffix types with descriptive names: `AgentResponse`, `CreateAgentInput`
- Use `.ts` for pure TypeScript files and `.tsx` for React components

## 5. Dependencies & Setup

### 5.1 Installation

```bash
pnpm install
```

*(Adjust if you use npm or yarn.)*

### 5.2 Environment Variables
- **`NEXT_PUBLIC_BACKEND_URL`** = URL of the NestJS backend (`https://api.leftcurve.io`, for example)
- **`STARKNET_RPC_URL`** = The Starknet node endpoint
- **`STARKNET_NETWORK`** = e.g., `mainnet` or `testnet`
- **`NEXT_PUBLIC_CONTRACT_ADDRESS`** (for your core contract)

Put them in `.env` or `.env.local` (for Next.js)

### 5.3 Scripts
- **`pnpm dev`**: Start local dev server
- **`pnpm build`**: Build production version
- **`pnpm start`**: Run production build locally

## 6. Additional Implementation Guidelines

1. **Starknet Wallet Integration**
   - Use [starknet.js wallet module](https://www.starknetjs.com/guides/connecting-to-a-wallet) to connect with Argent X or Braavos
   - Provide error messages if the user is on an unsupported network

2. **Smart Contract Calls**
   - For bonding curve or memecoin swaps, you'll use `starknet.js` functions like:
     ```ts
     import { Provider, Contract } from 'starknet';
     // Example usage
     ```
   - Document contract function signatures for dev reference

3. **Security**
   - Validate user's addresses against the NestJS backend if needed
   - For large transactions, confirm user prompt in the UI

4. **Error Handling**
   - If the NestJS backend returns an error (e.g., agent not found), show a toast or modal
   - If starknet.js throws an error (e.g., transaction failed), handle gracefully

5. **Testing**
   - **Unit Tests**: [Jest](https://jestjs.io/) or [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
   - **Integration**: [Cypress](https://www.cypress.io/) or [Playwright](https://playwright.dev/)
   - Possibly mock Starknet calls during tests

## 7. Example Interactions (Request/Response)

### 7.1 Creating an Agent

- **Front-End** calls `POST /api/agent/create` (NestJS), which responds:
  ```json
  {
    "success": true,
    "agentId": "abc123",
    "message": "Agent successfully created in DB. Please finalize on-chain."
  }
  ```
- **Front-End** then calls Starknet contract with `agentId = "abc123"` to finalize creation
- **UI**: Show success modal or redirect to `/agent/abc123`

### 7.2 Buying on Bonding Curve

- **Front-End** calls a NestJS route, e.g., `POST /api/agent/:agentId/buy`, or interacts directly with the contract via `starknet.js`
- **Example**:
  ```json
  {
    "buyer": "0xYourStarknetAddress",
    "amount": 100
  }
  ```
- **NestJS** may respond:
  ```json
  {
    "success": true,
    "transactionHash": "0xTxHashHere",
    "newPrice": "15 LEFT"
  }
  ```
- **UI** updates the chart, and shows the transaction link to a block explorer (e.g., Voyager, Starkscan)

## 8. Acceptance Criteria

1. **Home Page**
   - Lists all agents in a table (fetched from NestJS)
   - Modal with a short explanation
   - "Create Agent" & "Connect Wallet" are functional

2. **Agent Page**
   - Displays bonding curve chart or performance info
   - Users can buy tokens if the bonding curve is active
   - Shows last trades, comedic commentary (or placeholder data)

3. **Agent Creation**
   - Form captures agent data
   - Calls NestJS API, then finalizes on Starknet via `starknet.js`
   - On success, user sees a success screen or redirection

4. **My Agents**
   - Displays user's owned agent tokens with basic stats
   - Possibly shows "Manage" or "Go to Agent" button

5. **Leaderboard**
   - Displays top agents in RightCurve (performance) and LeftCurve (memes)
   - Ranks are visible and sorted properly

6. **Consistency & Security**
   - The design matches the overall LeftCurve brand
   - Errors are displayed clearly (HTTP errors or transaction failures)
   - Starknet wallet integration is correct, respecting the chain ID (testnet/mainnet)

## 9. References & Further Reading

- **Next.js 15**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [https://ui.shadcn.com/docs](https://ui.shadcn.com/docs)
- **Lucide Icons**: [https://lucide.dev/docs/lucide-react](https://lucide.dev/docs/lucide-react)
- **Starknet.js**: [https://www.starknetjs.com/](https://www.starknetjs.com/)
- **NestJS**: [https://docs.nestjs.com/](https://docs.nestjs.com/)
- **Starknet Explorers**: [Voyager](https://voyager.online/), [Starkscan](https://starkscan.co/)

## Conclusion

This **PRD** details **what** the LeftCurve