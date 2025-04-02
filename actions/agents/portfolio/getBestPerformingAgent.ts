'use server';

import { callApi } from './api-utils';
import { BestPerformingAgentResponse, AgentPnL } from '@/lib/types/portfolio';

/**
 * Fetches data about the best performing agent
 * Falls back to getting all agents and finding the best one if the /best endpoint
 * isn't implemented yet
 */
export async function getBestPerformingAgent() {
  try {
    try {
      // First try the direct endpoint
      const response = await callApi<BestPerformingAgentResponse>(
        '/api/kpi/pnl/best',
        'GET'
      );

      return {
        success: true,
        data: response.bestAgent
      };
    } catch (directEndpointError) {
      console.log('Best agent endpoint not available, falling back to getting all agents');
      
      // If the direct endpoint fails, get all agents and find the best one
      const allAgentsResponse = await callApi<AgentPnL[]>(
        '/api/kpi/pnl',
        'GET'
      );

      if (allAgentsResponse?.length > 0) {
        // Find the agent with the highest PnL percentage
        const bestAgent = allAgentsResponse.reduce((best: AgentPnL, current: AgentPnL) => {
          return (current.pnlPercentage > best.pnlPercentage) ? current : best;
        }, allAgentsResponse[0]);
        
        return {
          success: true,
          data: bestAgent
        };
      }
      
      throw new Error('No agents available');
    }
  } catch (error) {
    console.error('Error fetching best performing agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 