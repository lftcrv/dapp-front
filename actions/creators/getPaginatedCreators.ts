'use server';

import { callApi } from './api-utils';
import {
  LeaderboardSortField,
  CreatorLeaderboardEntryDto,
  PaginatedResponseDto,
} from './creator-types';

interface GetPaginatedCreatorsResult {
  creators: CreatorLeaderboardEntryDto[];
  total: number;
  currentPage: number;
  totalPages: number;
  error?: string;
}

// Simple creator structure returned by the /creators endpoint
interface SimpleCreator {
  creatorId: string;
  agentCount: number;
}

// Based on our curl tests, the /api/creators/leaderboard endpoint works and provides richer data
export async function getPaginatedCreators(
  page: number = 1,
  limit: number = 10, // This will be our ITEMS_PER_PAGE
  sortBy?: LeaderboardSortField,
): Promise<GetPaginatedCreatorsResult> {
  const params: Record<string, string | number> = {
    page: page,
    limit: limit,
  };

  if (sortBy) {
    params.sortBy = sortBy;
  }

  try {
    // Using the leaderboard endpoint which provides rich creator data with PnL etc.
    const response = await callApi<
      PaginatedResponseDto<CreatorLeaderboardEntryDto>
    >(
      '/api/creators/leaderboard',
      'GET',
      undefined, // No body for GET request
      params as Record<string, string>, // queryParams
    );

    return {
      creators: response.data,
      total: response.total,
      currentPage: response.page,
      totalPages: Math.ceil(response.total / response.limit),
      error: undefined,
    };
  } catch (error) {
    console.error('[getPaginatedCreators] Error:', error);

    // If leaderboard endpoint fails, fallback to the simpler /api/creators endpoint
    try {
      console.log('Falling back to /api/creators endpoint...');
      const fallbackResponse = await callApi<
        PaginatedResponseDto<SimpleCreator>
      >('/api/creators', 'GET', undefined, params as Record<string, string>);

      // Map the simpler creator data to our more comprehensive DTO structure
      const mappedCreators: CreatorLeaderboardEntryDto[] =
        fallbackResponse.data.map((creator: SimpleCreator) => ({
          creatorId: creator.creatorId,
          totalAgents: creator.agentCount,
          runningAgents: 0, // Default since this data is not available
          totalBalanceInUSD: 0, // Default since this data is not available
          aggregatedPnlCycle: 0, // Default since this data is not available
          aggregatedPnl24h: 0, // Default since this data is not available
          totalTradeCount: 0, // Add default for totalTradeCount
          updatedAt: new Date().toISOString(), // Default to current time since not available
        }));

      return {
        creators: mappedCreators,
        total: fallbackResponse.total,
        currentPage: fallbackResponse.page,
        totalPages: Math.ceil(fallbackResponse.total / fallbackResponse.limit),
        error: undefined,
      };
    } catch (fallbackError) {
      console.error('[getPaginatedCreators] Fallback error:', fallbackError);
      return {
        creators: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      };
    }
  }
}
 