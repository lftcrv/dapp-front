'use server';

import { unstable_cache as cache } from 'next/cache';

// Using same DTO structure defined in our components
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

// Define a return type for better error handling
interface GetTopCreatorsResult {
  success: boolean;
  data?: CreatorLeaderboardEntryDto[];
  error?: string;
}

// Function to fetch top creators from the leaderboard endpoint
const fetchTopCreators = async (
  limit: number = 5,
): Promise<GetTopCreatorsResult> => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const apiKey = process.env.API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('❌ API URL or Key not configured for getTopCreators');
    return { success: false, error: 'Server configuration error.' };
  }

  const endpoint = `${apiUrl}/api/creators/leaderboard?page=1&limit=${limit}&sortBy=pnlCycle`;

  try {
    console.log(`🚀 Fetching top creators: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      // Use the next.js fetch cache properly
      next: {
        revalidate: 300, // 5 minutes
        tags: ['creators', 'leaderboard'],
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Failed to fetch top creators: ${response.status} ${response.statusText}`,
        errorText,
      );
      return {
        success: false,
        error: `Failed to fetch top creators (Status: ${response.status})`,
      };
    }

    const result: PaginatedResponseDto<CreatorLeaderboardEntryDto> =
      await response.json();
    console.log(`✅ Successfully fetched ${result.data?.length} top creators.`);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('❌ Unexpected error fetching top creators:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.',
    };
  }
};

// Server action using unstable_cache for automatic caching and revalidation
export const getTopCreators = cache(
  async (limit: number = 5): Promise<GetTopCreatorsResult> => {
    return fetchTopCreators(limit);
  },
  ['top-creators'], // Cache key
  {
    revalidate: 60 * 5, // Revalidate every 5 minutes
    tags: ['creators', 'leaderboard'], // Cache tags for potential invalidation
  },
);
