'use server';

import { AssetAllocation } from '@/lib/types/portfolio';

/**
 * Fetches asset allocation data for a specific agent
 * This uses the /api/kpi/agent-portfolio/{agentId} endpoint
 */
export async function getAssetAllocation(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';
    
    try {
      // Use the correct endpoint for portfolio allocation
      const response = await fetch(`${apiUrl}/api/kpi/agent-portfolio/${agentId}`, {
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

      // The API response format matches our AssetAllocation type
      const data = await response.json() as AssetAllocation;
      console.log('Portfolio allocation data:', data);
      
      return {
        success: true,
        data
      };
    } catch (apiError) {
      console.error('API error, using fallback data:', apiError);
      
      // Use mock data as fallback
      const mockData: AssetAllocation = {
        agentId: agentId,
        runtimeAgentId: agentId,
        name: "Agent Portfolio",
        timestamp: new Date().toISOString(),
        balanceInUSD: 1536,
        portfolio: [
          {
            symbol: "ETH",
            balance: 0.3,
            price: 3300,
            valueUsd: 990,
            percentage: 64.45
          },
          {
            symbol: "BTC",
            balance: 0.004,
            price: 66500,
            valueUsd: 266,
            percentage: 17.32
          },
          {
            symbol: "SOL",
            balance: 1.5,
            price: 140,
            valueUsd: 210,
            percentage: 13.67
          },
          {
            symbol: "USDC",
            balance: 70,
            price: 1,
            valueUsd: 70,
            percentage: 4.56
          }
        ]
      };
      
      return {
        success: true,
        data: mockData
      };
    }
  } catch (error) {
    console.error('Error fetching asset allocation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 