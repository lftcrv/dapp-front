# Feature: Creators Domain API Documentation

**Parent Feature:** Creator Management & Performance Tracking (#88)
**Related Issues:** #88, #90, #91

## 1. Overview

This document provides details for frontend developers on how to interact with the Creators domain API endpoints. These endpoints allow retrieving information about creators, their agents, performance summaries, and the global creator leaderboard.

## 2. Authentication

All endpoints within the `/api/creators` path require API key authentication. Include your API key in the `x-api-key` header for all requests.

**Example Header:**

```
x-api-key: YOUR_SECRET_API_KEY
```

**Error Response (401 Unauthorized):** If the API key is missing or invalid.

## 3. Common DTOs

These DTOs are used across multiple endpoints for pagination and standardized responses.

**3.1. `PageQueryDto` (Query Parameters)**

Used for endpoints that support pagination.

-   `page` (number, optional, default: 1): The page number to retrieve (starts at 1).
-   `limit` (number, optional, default: 10): The number of items to retrieve per page (max: 100).

**3.2. `PaginatedResponseDto<T>` (Response Body)**

The standard structure for responses containing paginated data.

-   `data` (T[]): An array of items for the current page (the type `T` depends on the endpoint).
-   `total` (number): The total number of items available across all pages.
-   `page` (number): The current page number.
-   `limit` (number): The number of items requested per page.

---

## 4. Endpoints

### 4.1. Get All Creators

Retrieves a paginated list of all unique creators, identified by their wallet addresses, along with the count of agents they have created.

-   **Purpose:** Display a list of creators on the platform.
-   **Method:** `GET`
-   **Path:** `/api/creators`
-   **Authentication:** Required (`x-api-key` header)
-   **Request Query Parameters:** `PageQueryDto` (`page`, `limit`)
-   **Success Response (200 OK):** `PaginatedResponseDto<CreatorDto>`
    -   `data`: Array of `CreatorDto` objects.
        -   `creatorId` (string): The creator's wallet address.
        -   `agentCount` (number): The total number of agents created by this creator.
-   **Error Responses:**
    -   `401 Unauthorized`

**Example Usage:**

```bash
curl -X GET "http://127.0.0.1:8080/api/creators?page=1&limit=20" \
     -H "x-api-key: YOUR_SECRET_API_KEY" | jq .
```

### 4.2. Get Creator by ID

Retrieves basic information about a specific creator using their wallet address.

-   **Purpose:** Get details for a specific creator profile page.
-   **Method:** `GET`
-   **Path:** `/api/creators/{creatorId}`
-   **Authentication:** Required (`x-api-key` header)
-   **Request Path Parameter:**
    -   `creatorId` (string): The wallet address of the creator.
-   **Success Response (200 OK):** `CreatorDto`
    -   `creatorId` (string): The creator's wallet address.
    -   `agentCount` (number): The total number of agents created by this creator.
-   **Error Responses:**
    -   `401 Unauthorized`
    -   `404 Not Found`: If no creator exists with the given `creatorId` (i.e., no agents associated).

**Example Usage:**

```bash
curl -X GET "http://127.0.0.1:8080/api/creators/0xSomeCreatorWalletAddress" \
     -H "x-api-key: YOUR_SECRET_API_KEY" | jq .
```

### 4.3. Get Agents by Creator ID

Retrieves a paginated list of agents created by a specific creator.

-   **Purpose:** List the agents belonging to a specific creator.
-   **Method:** `GET`
-   **Path:** `/api/creators/{creatorId}/agents`
-   **Authentication:** Required (`x-api-key` header)
-   **Request Path Parameter:**
    -   `creatorId` (string): The wallet address of the creator.
-   **Request Query Parameters:** `PageQueryDto` (`page`, `limit`)
-   **Success Response (200 OK):** `PaginatedResponseDto<AgentSummaryDto>`
    -   `data`: Array of `AgentSummaryDto` objects.
        -   `id` (string): The agent's unique ID.
        -   `name` (string): The agent's name.
        -   `status` (enum: `STARTING`, `RUNNING`, `STOPPED`, `FAILED`, `ERROR`): The current status of the agent.
        -   `createdAt` (Date): The timestamp when the agent was created.
-   **Error Responses:**
    -   `401 Unauthorized`
    -   `404 Not Found`: If no creator exists with the given `creatorId`.

**Example Usage:**

```bash
curl -X GET "http://127.0.0.1:8080/api/creators/0xSomeCreatorWalletAddress/agents?page=1&limit=10" \
     -H "x-api-key: YOUR_SECRET_API_KEY" | jq .
```

### 4.4. Get Creator Performance Summary

Retrieves an aggregated performance summary for a specific creator, including overall metrics and details for each of their agents.

-   **Purpose:** Display detailed performance metrics on a creator's profile page.
-   **Method:** `GET`
-   **Path:** `/api/creators/{creatorId}/performance`
-   **Authentication:** Required (`x-api-key` header)
-   **Request Path Parameter:**
    -   `creatorId` (string): The wallet address of the creator.
-   **Success Response (200 OK):** `CreatorPerformanceSummaryDto` (See detailed DTO definition below)
-   **Error Responses:**
    -   `401 Unauthorized`
    -   `404 Not Found`: If no creator exists with the given `creatorId`.

**Example Usage:**

```bash
curl -X GET "http://127.0.0.1:8080/api/creators/0xSomeCreatorWalletAddress/performance" \
     -H "x-api-key: YOUR_SECRET_API_KEY" | jq .
```

### 4.5. Get Creator Leaderboard

Retrieves a paginated and sortable list of creators ranked by aggregated performance metrics.

-   **Purpose:** Display a global leaderboard of creators.
-   **Method:** `GET`
-   **Path:** `/api/creators/leaderboard`
-   **Authentication:** Required (`x-api-key` header)
-   **Request Query Parameters:** `LeaderboardQueryDto`
    -   `page` (number, optional, default: 1)
    -   `limit` (number, optional, default: 10)
    -   `sortBy` (enum, optional, default: `pnlCycle`): Field to sort by. Possible values:
        -   `balance`: Sort by `totalBalanceInUSD` (descending).
        -   `pnlCycle`: Sort by `aggregatedPnlCycle` (descending).
        -   `pnl24h`: Sort by `aggregatedPnl24h` (descending).
        -   `runningAgents`: Sort by `runningAgents` (descending).
-   **Success Response (200 OK):** `PaginatedResponseDto<CreatorLeaderboardEntryDto>` (See detailed DTO definition below)
-   **Error Responses:**
    -   `400 Bad Request`: If an invalid value is provided for `sortBy`.
    -   `401 Unauthorized`
-   **Notes:**
    -   The leaderboard data is pre-calculated periodically (e.g., hourly) for performance. The `updatedAt` field in each entry indicates the time of the last calculation.
    -   The default sort is by `pnlCycle` descending.

**Example Usage (Sort by Balance):**

```bash
curl -X GET "http://127.0.0.1:8080/api/creators/leaderboard?page=1&limit=10&sortBy=balance" \
     -H "x-api-key: YOUR_SECRET_API_KEY" | jq .
```

---

## 5. Detailed DTO Definitions

These are the specific DTOs used in the responses for the endpoints above.

**5.1. `CreatorDto`**

*(Used in: `GET /api/creators`, `GET /api/creators/{creatorId}`)*

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreatorDto {
  @ApiProperty({ description: 'Creator ID (Wallet Address)', example: '0x123abc...' })
  creatorId: string;

  @ApiProperty({ description: 'Total number of agents managed by the creator', example: 10 })
  agentCount: number;
}
```

**5.2. `AgentSummaryDto`**

*(Used in: `GET /api/creators/{creatorId}/agents`)*

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '@prisma/client';

export class AgentSummaryDto {
  @ApiProperty({ description: 'Agent ID', example: 'agent-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Agent Name', example: 'TradingBot Alpha' })
  name: string;

  @ApiProperty({ description: 'Agent Status', enum: AgentStatus, example: AgentStatus.RUNNING })
  status: AgentStatus;

  @ApiProperty({ description: 'Agent Creation Timestamp' })
  createdAt: Date;
}
```

**5.3. `CreatorPerformanceAgentDetailDto`**

*(Used within `CreatorPerformanceSummaryDto`)*

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '@prisma/client';

export class CreatorPerformanceAgentDetailDto {
  @ApiProperty({ description: 'Agent ID', example: 'agent-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Agent Name', example: 'TradingBot Alpha' })
  name: string;

  @ApiProperty({ description: 'Agent Status', enum: AgentStatus, example: AgentStatus.RUNNING })
  status: AgentStatus;

  @ApiProperty({ description: 'Agent Profile Picture URL', required: false, example: '/uploads/profile-pictures/image.jpg' })
  profilePicture?: string;

  @ApiProperty({ description: 'Agent Current Balance in USD', required: false, type: Number, nullable: true, example: 1500.50 })
  balanceInUSD?: number | null;

  @ApiProperty({ description: 'Agent Current TVL', required: false, type: Number, nullable: true, example: 2500.00 })
  tvl?: number | null;

  @ApiProperty({ description: "Agent PnL (Cycle/Total) - Based on LatestMarketData's pnlCycle", required: false, type: Number, nullable: true, example: 450.20 })
  pnlCycle?: number | null;

  @ApiProperty({ description: "Agent PnL (24h) - Based on LatestMarketData's pnl24h", required: false, type: Number, nullable: true, example: 50.10 })
  pnl24h?: number | null;

  @ApiProperty({ description: "Agent Total Trades - Based on LatestMarketData's tradeCount", required: false, type: Number, nullable: true, example: 150 })
  tradeCount?: number | null;

  @ApiProperty({ description: "Agent Market Cap - Based on LatestMarketData's marketCap", required: false, type: Number, nullable: true, example: 275000.00 })
  marketCap?: number | null;

  @ApiProperty({ description: 'Agent Creation Timestamp', required: true })
  createdAt: Date;
}
```

**5.4. `CreatorPerformanceSummaryDto`**

*(Used in: `GET /api/creators/{creatorId}/performance`)*

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { CreatorPerformanceAgentDetailDto } from './creator-performance-agent-detail.dto';

export class CreatorPerformanceSummaryDto {
  @ApiProperty({ description: 'Creator ID (Wallet Address)', example: '0x123abc...' })
  creatorId: string;

  @ApiProperty({ description: 'Total number of agents managed by the creator', example: 10 })
  totalAgents: number;

  @ApiProperty({ description: 'Number of currently RUNNING agents', example: 8 })
  runningAgents: number;

  @ApiProperty({ description: 'Aggregated Total Value Locked (TVL) across all agents with data', example: 50000.00, type: Number })
  totalTvl: number;

  @ApiProperty({ description: 'Aggregated Balance in USD across all agents with data', example: 35000.00, type: Number })
  totalBalanceInUSD: number;

  @ApiProperty({ description: 'Aggregated PnL (Cycle/Total) across all agents with data', example: 1250.75, type: Number })
  totalPnlCycle: number;

  @ApiProperty({ description: 'Aggregated PnL (24h) across all agents with data', example: 300.15, type: Number })
  totalPnl24h: number;

  @ApiProperty({ description: 'Total number of trades executed across all agents with data', example: 1200, type: Number })
  totalTradeCount: number;

  @ApiProperty({
    description: "Agent with the highest PnL (Cycle/Total). Null if no agents have performance data.",
    type: () => CreatorPerformanceAgentDetailDto,
    required: false,
    nullable: true,
  })
  bestPerformingAgentPnlCycle?: CreatorPerformanceAgentDetailDto | null;

  @ApiProperty({
    description: 'Detailed performance list for each agent associated with the creator.',
    type: [CreatorPerformanceAgentDetailDto],
  })
  agentDetails: CreatorPerformanceAgentDetailDto[];

  @ApiProperty({ description: 'Timestamp of the latest data included in the summary', required: false })
  lastUpdated?: Date;
}
```

**5.5. `CreatorLeaderboardEntryDto`**

*(Used in: `GET /api/creators/leaderboard`)*

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreatorLeaderboardEntryDto {
  @ApiProperty({
    description: 'Creator wallet address',
    example: '0x046494be4b665b6182152e656d5eae6ec9dc8e8d8870851f11422fff1457736a',
  })
  creatorId: string;

  @ApiProperty({ description: 'Total number of agents created by this creator', example: 3 })
  totalAgents: number;

  @ApiProperty({ description: 'Number of agents in RUNNING status', example: 2 })
  runningAgents: number;

  @ApiProperty({ description: 'Total USD balance across all agents', example: 15000.5 })
  totalBalanceInUSD: number;

  @ApiProperty({ description: 'Aggregated PnL for the current cycle across all agents', example: 2500.75 })
  aggregatedPnlCycle: number;

  @ApiProperty({ description: 'Aggregated 24-hour PnL across all agents', example: 750.25 })
  aggregatedPnl24h: number;

  @ApiProperty({ description: 'ID of the best performing agent by PnL cycle', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  bestAgentId?: string;

  @ApiProperty({ description: 'PnL cycle of the best performing agent', example: 1250.5, required: false })
  bestAgentPnlCycle?: number;

  @ApiProperty({ description: 'Timestamp when the leaderboard data was last updated', example: '2023-04-30T14:30:00Z' })
  updatedAt: Date; // Note: Corresponds to CreatorLeaderboardData.updatedAt
}
```

**5.6. `LeaderboardQueryDto` (and `LeaderboardSortField` enum)**

*(Used in: `GET /api/creators/leaderboard`)*

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Enum defining valid sort fields for the leaderboard
export enum LeaderboardSortField {
  BALANCE = 'balance',
  PNL_CYCLE = 'pnlCycle',
  PNL_24H = 'pnl24h',
  RUNNING_AGENTS = 'runningAgents',
}

// Query DTO for the leaderboard endpoint
export class LeaderboardQueryDto {
  @ApiProperty({
    description: 'Page number (starts at 1)',
    example: 1,
    default: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    maximum: 100,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100) // Ensure Max matches PageQueryDto if inheriting, or define here
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    enum: LeaderboardSortField,
    default: LeaderboardSortField.PNL_CYCLE,
    required: false,
  })
  @IsEnum(LeaderboardSortField)
  @IsOptional()
  sortBy?: LeaderboardSortField = LeaderboardSortField.PNL_CYCLE;
}
```

---

## 6. Frontend Implementation Plan (Issue #115: Top Creators Section)

This section outlines the steps to implement the "Top Creators" section on the homepage (`app/page.tsx`).

1.  **Server Action (`actions/creators/getTopCreators.ts`):**
    *   Create a new server action `getTopCreators`.
    *   This action will internally call the `GET /api/creators/leaderboard` endpoint.
    *   It should accept an optional `limit` parameter (defaulting to 5).
    *   Use the default sorting (`sortBy=pnlCycle`).
    *   Handle API key authentication securely.
    *   Perform basic error handling (network errors, non-200 responses) and return either the leaderboard data (`CreatorLeaderboardEntryDto[]`) or an error object.

2.  **UI Components (`components/home/top-creators-section.tsx` & `components/home/creator-card.tsx`):**
    *   Create the main section component `TopCreatorsSection`.
        *   This component will receive the fetched creator leaderboard data (`CreatorLeaderboardEntryDto[]`), loading state, and error state as props from `app/page.tsx`.
        *   It will handle displaying loading indicators or error messages.
        *   It will map over the creator data and render a `CreatorCard` for each.
        *   Apply overall section styling (e.g., title "Top Creators", background, padding).
    *   Create a sub-component `CreatorCard`.
        *   Receives a single `CreatorLeaderboardEntryDto` as a prop.
        *   Displays creator information based on available leaderboard data:
            *   **Avatar:** Placeholder (pending profile data).
            *   **Name:** Truncated `creatorId` (pending profile data).
            *   **Agents:** `totalAgents` count.
            *   **Best PnL Cycle:** `aggregatedPnlCycle` (formatted).
            *   *(Other potential stats like `runningAgents` can be added if space/design allows)*.
        *   **Color Coding:** Implement basic logic to assign a background color (e.g., purple/orange based on `creatorId` hash/modulo) as a placeholder for left/right curve type.
        *   **Linking:** Wrap the card content in a `next/link` pointing to `/creators/[creatorId]`.
        *   Style the card loosely based on the provided image design (rectangular boxes).

3.  **Homepage Integration (`app/page.tsx`):**
    *   Add state management within the `HomePage` component to handle the fetched top creators data, loading status, and potential errors.
    *   Call the `getTopCreators` server action (e.g., within a `useEffect` hook or using a data-fetching library hook if integrated).
    *   Import the `TopCreatorsSection` component.
    *   Render the `TopCreatorsSection` component at an appropriate location within the page structure (e.g., after `TopAgentsSection` or `StatsSection`).
    *   Pass the fetched data, loading, and error states as props to `TopCreatorsSection`.

4.  **Styling & Consistency:**
    *   Ensure Tailwind CSS classes align with the existing homepage design tokens (colors, fonts, spacing).
    *   Use placeholder elements gracefully for missing data (avatar, name).

5.  **Dependencies & Future Work:**
    *   This implementation relies solely on the `/api/creators/leaderboard` endpoint.
    *   Displaying actual creator names and avatars depends on future implementation of creator profile data endpoints.
    *   Accurate color coding based on agent type requires either endpoint updates or additional logic to infer type from agents.

## 7. Implementation Details and Decisions

### 7.1 Type Definitions

Since the project doesn't have dedicated DTO files, we defined the necessary types directly in the relevant files:

```typescript
// In actions/creators/getTopCreators.ts
export interface CreatorLeaderboardEntryDto {
  creatorId: string;
  totalAgents: number;
  runningAgents: number;
  totalBalanceInUSD: number;
  aggregatedPnlCycle: number;
  aggregatedPnl24h: number;
  bestAgentId?: string;
  bestAgentPnlCycle?: number;
  updatedAt: Date;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

### 7.2 Custom Hook

A dedicated hook was created to manage fetching creator data:

```typescript
// In hooks/use-creators.ts
export function useCreators(limit: number = 5): UseCreatorsResult {
  const [data, setData] = useState<CreatorLeaderboardEntryDto[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch logic and state management
  // ...
  
  return { data, isLoading, error, refetch };
}
```

### 7.3 Visual Design Decisions

1. **Color Coding**: Due to lack of API data about which curve type (left/right) a creator primarily uses, we implemented a simple alternating color pattern based on index:
   ```typescript
   const isEven = index % 2 === 0;
   const bgColor = isEven ? 'bg-[#B27CF4]' : 'bg-[#D97B4F]'; // Purple : Orange
   ```

2. **Layout**: We utilized a responsive grid layout that shows larger cards for the top 2 creators on larger screens:
   ```tsx
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
     <motion.div className="xl:col-span-3">
       <CreatorCard creator={creators[0]} index={0} />
     </motion.div>
     {/* ... */}
   </div>
   ```
   
3. **Animations**: We added subtle animations using Framer Motion for a staggered appearance of cards when the section loads.

### 7.4 Future Enhancements

1. **Creator Profiles**: Once creator profile data becomes available, update the cards to display real names and avatars instead of ID truncation.

2. **Accurate Color Coding**: Implement logic to determine the curve type that a creator is most associated with and color-code accordingly.

3. **Additional Metrics**: Add more creator metrics like success rates or historical performance as they become available through the API.

4. **Filtering/Sorting**: Add UI controls to allow users to sort creators by different metrics (balance, PnL, agent count, etc.).

---

## 8. Frontend Refactoring Plan: `app/creators/page.tsx` (Main Creators List)

This section details the plan to refactor `app/creators/page.tsx` and its related components to use live data from the `/api/creators/leaderboard` endpoint, replacing the current mock implementation.

**Goal:** Connect the main "Creators" page to the backend API, enabling dynamic loading, pagination, sorting, and searching of creators based on the `CreatorLeaderboardEntryDto`.

### 8.1. New Server Action (`actions/creators/getPaginatedCreators.ts`)

*   **Purpose:** Fetch paginated and potentially sorted creator data from the `/api/creators/leaderboard` endpoint.
*   **File:** `actions/creators/getPaginatedCreators.ts`
*   **Function Signature (approximate):**
    ```typescript
    export async function getPaginatedCreators(
      page: number = 1,
      limit: number = 10,
      sortBy?: LeaderboardSortField // Optional: from LeaderboardQueryDto
    ): Promise<{ creators: CreatorLeaderboardEntryDto[]; total: number; currentPage: number; error?: string }>
    ```
*   **Implementation Details:**
    *   Utilize `makeApiRequest` from `actions/creators/api-utils.ts` for the actual API call.
    *   Target endpoint: `/api/creators/leaderboard`.
    *   Pass `page`, `limit`, and `sortBy` (if provided) as query parameters.
    *   Handle API key authentication securely via `api-utils.ts`.
    *   Perform error handling (network errors, non-200 responses) and return a structured response including the data array, total count, current page, and an optional error message.
    *   Define `CreatorLeaderboardEntryDto` and `PaginatedResponseDto` interfaces within this file or import from a shared types location if available, based on Section 5.5.

### 8.2. `app/creators/page.tsx` Refactoring

*   **`Creator` Interface Update:**
    *   The existing `Creator` interface in `app/creators/page.tsx` will be updated to align with the fields available in `CreatorLeaderboardEntryDto`.
    ```typescript
    interface Creator {
      id: string; // Mapped from creatorId
      name: string; // Will use creatorId initially, as full name is not in leaderboard DTO
      avatarUrl?: string; // Placeholder, as avatar is not in leaderboard DTO
      agentCount: number; // Mapped from totalAgents
      createdAt: string; // Mapped from updatedAt (timestamp of leaderboard data)
      totalPnl: number; // Mapped from aggregatedPnlCycle
      // Add other relevant fields from CreatorLeaderboardEntryDto if needed
    }
    ```

*   **Data Fetching Logic:**
    *   Remove the mock `fetchCreators` function.
    *   Implement a new function (e.g., `loadCreatorsData`) that calls the `getPaginatedCreators` server action.
    *   This function will be called in `useEffect` on initial load and when pagination or sorting parameters change (if server-side sorting is implemented for a specific sort option).

*   **State Management:**
    *   `allCreators`: Will store an array of `Creator` objects fetched from the API. This array will accumulate data as the user clicks "Load More".
    *   `isLoading`: Boolean state for loading indicators.
    *   `error`: String state for displaying error messages.
    *   `searchTerm`: Remains for client-side filtering.
    *   `sortBy`: Remains for controlling sort order.
    *   `currentPage`: Number state to track the current page fetched (for "Load More"). Default to 1.
    *   `totalCreators`: Number state to store the total number of creators available from the API, used to determine if "Load More" should be shown.
    *   `hasMore`: Boolean derived from `allCreators.length < totalCreators`.

*   **Pagination ("Load More"):**
    *   The `handleLoadMore` function will increment `currentPage` and call `loadCreatorsData` to fetch the next set of creators.
    *   Fetched creators will be appended to the `allCreators` state array.
    *   The "Load More" button's visibility (`canLoadMore`) will depend on `hasMore`.
    *   `ITEMS_PER_PAGE` will correspond to the `limit` parameter passed to `getPaginatedCreators`.

*   **Sorting Logic:**
    *   The `filteredAndSortedCreators` memoized value will perform sorting and filtering on the `allCreators` array.
    *   **PnL (High to Low):** Can be potentially offloaded to the server by calling `getPaginatedCreators` with `sortBy: LeaderboardSortField.PNL_CYCLE`. If fetched with default sort, client-side sort on `totalPnl` (descending).
    *   **PnL (Low to High):** Client-side sort on `totalPnl` (ascending).
    *   **Newest/Oldest:** Client-side sort on `createdAt` (which maps to `updatedAt` from the API).
    *   **Name (A-Z, Z-A):** Client-side sort on `name` (which maps to `creatorId`).
    *   When a sort option is selected, if it's a sort that *could* be server-side (like PnL Desc), the component *could* reset `allCreators` and `currentPage`, then re-fetch from page 1 with the new server-side sort parameter. However, to maintain consistency with current "load more and sort all loaded" behavior, all sorting will initially be implemented client-side on the accumulated `allCreators` list. The `getPaginatedCreators` will be called with a default sort (e.g., by `pnlCycle`) or no specific sort if the API has a sensible default.

*   **Search Logic:**
    *   Client-side filtering will continue to operate on the `name` field (i.e., `creatorId`) of the `allCreators` array.
    *   Changing the search term will reset the `visibleCount` (or rather, it will filter the existing `allCreators` and pagination will apply to the filtered result).

### 8.3. `components/creators/creator-card.tsx` Updates

*   **Props:** The component will be updated to accept a `Creator` object matching the new interface defined in `app/creators/page.tsx`.
*   **Data Display:**
    *   Display `creator.id` (which is `creatorId`) as the creator's name.
    *   Use a placeholder for the avatar as this data is not available from the `/api/creators/leaderboard` endpoint.
    *   Display `creator.agentCount`.
    *   Display `creator.totalPnl`.
    *   Display `creator.createdAt` (formatted nicely).

### 8.4. Environment Variables

*   The API key will be managed securely within the server actions (`api-utils.ts`) and will not be exposed to the client. `process.env.DEPIN_API_KEY` should be used.

### 8.5. Limitations and Future Considerations

*   **Creator Names & Avatars:** The `/api/creators/leaderboard` endpoint provides `creatorId` but not full names or avatar URLs. The UI will display `creatorId` as the name and use placeholders for avatars. Future integration with a creator profile endpoint (e.g., `GET /api/creators/{creatorId}`) will be needed to fetch and display this richer information.
*   **Sorting Complexity:** Complex multi-field server-side sorting or advanced filtering (beyond what `/api/creators/leaderboard` `sortBy` offers) is not covered. Client-side sorting applies only to data loaded so far. For true global sorting on fields not supported by the API's `sortBy`, all data would need to be fetched, which is not scalable.
*   **Data Source:** This plan assumes `/api/creators/leaderboard` is the most suitable endpoint. If `/api/creators` were enhanced to include PnL and date fields, and supported robust sorting/pagination, it could become a more direct alternative.
*   **"Newest" Definition:** `updatedAt` from the leaderboard entry is used as the proxy for "newest". This reflects when the leaderboard data for that creator was last updated, not necessarily the creator's account creation date on the platform. If a true `creator.createdAt` field becomes available, that should be used.

---

## 9. Implementation Steps (High-Level for `app/creators/page.tsx` refactor)

1.  **Create `actions/creators/getPaginatedCreators.ts`:**
    *   Define `CreatorLeaderboardEntryDto` and `PaginatedResponseDto<T>` types (or import if shared).
    *   Implement the `getPaginatedCreators` function using `makeApiRequest` to call `/api/creators/leaderboard` with `page`, `limit`, and optional `sortBy` parameters.
    *   Include error handling and return structure `{ creators, total, currentPage, error? }`.
2.  **Update `Creator` interface in `app/creators/page.tsx`:**
    *   Align fields with `CreatorLeaderboardEntryDto` (e.g., `id: string` (from `creatorId`), `name: string` (from `creatorId`), `agentCount: number` (from `totalAgents`), `createdAt: string` (from `updatedAt`), `totalPnl: number` (from `aggregatedPnlCycle`)).
3.  **Refactor data fetching in `app/creators/page.tsx`:**
    *   Introduce `currentPage` and `totalCreators` states.
    *   Replace `fetchCreators` mock with `loadCreatorsData` that calls `getPaginatedCreators`.
    *   Handle initial load in `useEffect`.
    *   Implement `handleLoadMore` to fetch and append data.
4.  **Adjust sorting and filtering in `app/creators/page.tsx`:**
    *   Ensure `filteredAndSortedCreators` correctly processes the new `Creator` objects and `allCreators` list.
    *   Client-side sorting for PnL Asc/Desc, Newest/Oldest (on `createdAt`), Name (on `id`).
    *   Client-side search on `id`.
5.  **Update `CreatorCard` component (`components/creators/creator-card.tsx`):**
    *   Modify props to accept the new `Creator` type.
    *   Display `creator.id` as name, placeholder for avatar, `creator.agentCount`, `creator.totalPnl`, formatted `creator.createdAt`.
6.  **Testing:**
    *   Thoroughly test pagination, sorting options, search, loading states, and error handling.
    *   Verify API calls in the network tab (though server actions abstract this from the browser's view).
