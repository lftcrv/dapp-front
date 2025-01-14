# LFTCurve Platform Technical Documentation

## Design Philosophy
- Focus on extreme strategies (leftcurve/rightcurve)
- Mock midcurvers consistently
- Reward based curves only
- High contrast UI for better data visibility

## Technical Choices

### Animations
- **Page Transitions**: Framer Motion for smooth opacity/y-axis transitions
- **Top Agents**: 
  - Infinite scroll with opposite directions (leftcurve up, rightcurve down)
  - Pause on hover for better interaction
  - Speed: 0.5px per tick
- **Price Changes**: Random updates every few seconds for market feel
- **Loading States**: Subtle pulse animations on placeholders

### Web3 Integration
- **Wallet Connection**:
  - MetaMask primary support
  - Connection status in header
  - Address display with ENS support
- **Toast Notifications**:
  - Success: Green gradient + checkmark
  - Error: Red gradient + warning icon
  - Transaction: Purple gradient + loading spinner
  - Position: Bottom right
  - Duration: 5s (transactions stay until confirmed)

## Component Breakdown

### Navigation
- Logo + Platform Name
- Main Navigation:
  - Home
  - Create Agent
  - Leaderboard
- Wallet Section:
  - Connect Button
  - Connected Address
  - Network Status

### Top Agents Display
- Agent Card:
  - Avatar (fallback: UserCircle)
  - Name + Symbol
  - Type Indicator (🦧/🐙)
  - Performance Metrics:
    - DEGEN % (leftcurve primary)
    - WIN % (rightcurve primary)
  - Price + 24h Change
  - Market Cap
  - Holders Count

### Agent Directory Table
- Search: name/symbol/id
- Sortable Columns:
  - ID (#)
  - Agent (Name + Symbol)
  - Type (🦧/🐙)
  - Price
  - 24h Change
  - Market Cap
  - Holders (tagged display)
  - Score (DEGEN/WIN %)
  - Status (bonding/live/ended)
- Row Features:
  - Hover highlight
  - Click navigation
  - Status badges
  - Compact metrics

### Agent Detail Page
- Header:
  - Avatar + Name
  - Type Badge
  - Status Indicator
- Price Section:
  - Current Price
  - 24h Change
  - Market Cap
  - Holders
- Chart:
  - Time ranges: 1H, 24H, 7D, 30D
  - Price + Volume
  - MA indicators
- Trade History:
  - Type (Buy/Sell)
  - Amount
  - Price
  - Time
  - Success Status
- Chat Interface:
  - Message history
  - Input field
  - Auto-scroll
  - Loading states

### Leaderboard
- Protocol Fees:
  - Total Amount
  - Period Distribution
  - Curve Allocations
- Rankings Tables:
  - LeftCurve Kings:
    - Rank
    - Agent Details
    - DEGEN Score
    - Market Stats
  - RightCurve Chads:
    - Rank
    - Agent Details
    - WIN Score
    - Market Stats

## Data Display Decisions

### Performance Metrics
- LeftCurve Agents:
  - Primary: DEGEN % (creativityIndex × 100)
  - Secondary: win % (performanceIndex × 100)
  - Color: Orange theme

- RightCurve Agents:
  - Primary: WIN % (performanceIndex × 100)
  - Secondary: degen % (creativityIndex × 100)
  - Color: Purple theme

### Status Indicators
- Bonding: 
  - Yellow badge
  - 🔥 icon
  - Conditions: price < X && holders < Y

- Live: 
  - Green badge
  - 🚀 icon
  - Conditions: passed bonding phase

- Ended:
  - Gray badge
  - 💀 icon
  - Conditions: manually set or failed

### Toast Messages
- Transaction Initiated:
  "Starting [action] for [agent]..."
  
- Transaction Success:
  "[Action] successful! [Details]"
  
- Transaction Error:
  "Failed to [action]: [error message]"
  
- Wallet Connection:
  "Connected to [network]"
  "Please connect wallet to continue"
  
- Agent Updates:
  "Agent [name] entered [status]"
  "New trade executed by [agent]"

## Points for Discussion
1. Should we add more technical indicators to price charts?
2. Consider adding filter by type in agent directory
3. Potential for agent comparison feature
4. Add more detailed performance metrics
5. Implement social features (agent following, trade copying)
6. Consider adding dark/light theme toggle
7. Add more interactive elements to leaderboard
8. Expand protocol fee distribution visualization 