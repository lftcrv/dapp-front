'use server';

import { callApi } from './api-utils';
import { CreatorLeaderboardEntryDto, PaginatedResponseDto } from './creator-types';

interface GetCreatorProfileResult {
  success: boolean;
  data?: CreatorLeaderboardEntryDto;
  error?: string;
}

const MAX_LEADERBOARD_FETCH_LIMIT = 100; // Fetch up to 100 creators to find the one we need.
                                        // Adjust if your leaderboard is larger and you need to search further.

export async function getCreatorProfileData(creatorId: string): Promise<GetCreatorProfileResult> {
  console.log(`ACTION: Fetching profile data for creatorId: ${creatorId}`);
  try {
    // We fetch a page of the leaderboard and search for our creatorId.
    // This is a workaround. Ideally, there'd be a direct backend endpoint for a single creator's profile.
    const response = await callApi<PaginatedResponseDto<CreatorLeaderboardEntryDto>>(
      '/api/creators/leaderboard',
      'GET',
      undefined,
      { limit: MAX_LEADERBOARD_FETCH_LIMIT.toString(), page: '1' } // Fetch a decent chunk
    );

    if (!response.data || response.data.length === 0) {
      console.warn(`ACTION: No data returned from leaderboard for creatorId: ${creatorId}`);
      return { success: false, error: 'Creator not found in leaderboard sample.' };
    }

    const foundCreator = response.data.find(c => c.creatorId === creatorId);

    if (foundCreator) {
      console.log(`ACTION: Found creator profile for ${creatorId}:`, foundCreator);
      return { success: true, data: foundCreator };
    } else {
      // Optional: Implement pagination if the creator might be on a later page.
      // For now, we assume they are within the first MAX_LEADERBOARD_FETCH_LIMIT entries.
      console.warn(`ACTION: Creator ${creatorId} not found in the first ${MAX_LEADERBOARD_FETCH_LIMIT} leaderboard entries.`);
      return { success: false, error: 'Creator profile not found.' };
    }
  } catch (error) {
    console.error(`ACTION: Error fetching creator profile for ${creatorId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 