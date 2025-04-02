'use server';

import { AssetAllocation } from '@/lib/types';

/**
 * Fetches asset allocation data for a specific agent
 * 
 * Endpoint: GET /api/performance/:agentId/assets
 * Returns asset allocation data including symbols, values, percentages
 */
export async function getAssetAllocation(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';
    
    const response = await fetch(`${apiUrl}/api/performance/${agentId}/assets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 10 }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiResponse = await response.json();
    
    // Log for debugging
    console.log('Asset allocation API response:', apiResponse);
    
    // Check if the response has the expected structure
    if (apiResponse.status !== 'success' || !apiResponse.data || !apiResponse.data.assets) {
      console.error('Unexpected API response structure:', apiResponse);
      throw new Error('Unexpected API response structure');
    }
    
    // Extract the relevant data
    const { assets, totalBalance, timestamp } = apiResponse.data;
    
    // Define the expected API asset type
    interface ApiAsset {
      symbol: string;
      allocation: number;
      balance: number;
      price: number;
      valueUsd: number;
    }
    
    // Transform the API response to match the expected AssetAllocation type
    const transformedData: AssetAllocation = {
      agentId,
      timestamp,
      assets: assets.map((asset: ApiAsset) => ({
        symbol: asset.symbol,
        name: asset.symbol, // Using symbol as name if name isn't provided
        value: asset.valueUsd,
        percentage: asset.allocation * 100, // Convert from decimal to percentage
      }))
    };
    
    return {
      success: true,
      data: transformedData
    };
  } catch (error) {
    console.error('Error fetching asset allocation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 