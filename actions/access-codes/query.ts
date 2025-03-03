'use server';

import {
  AccessCode,
  AccessCodeActivity,
  AccessCodeDashboard,
  CodeType
} from '../../types/accessCode';

// API base URL for access codes
const API_URL = 'http://localhost:8080';
const API_KEY = 'carbonable-our-giga-secret-api-key';
const API_BASE_URL = '/api/access-code';

// Default empty stats to use when the endpoint is not available
const DEFAULT_EMPTY_STATS = {
  totalCodes: 0,
  activeCodes: 0,
  usedCodes: 0,
  expiringCodes: 0,
  byType: {},
  usageHistory: []
};

/**
 * Get access code statistics
 * @returns Statistics about access codes
 */
export async function getAccessCodeStats(): Promise<
  AccessCodeDashboard['stats'] & {
    byType: Record<string, number>;
    usageHistory: Array<{ date: string; count: number }>;
  }
> {
  try {
    const response = await fetch(`${API_URL}${API_BASE_URL}/access-codes/stats`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.status === 404) {
      console.warn('Stats endpoint not found (404), using default empty stats');
      return DEFAULT_EMPTY_STATS;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const responseData = await response.json();
    
    // Handle the new response format from the backend
    if (responseData.status === 'success' && responseData.data && responseData.data.stats) {
      console.log('Received stats data:', responseData.data);
      
      // Map the backend response to our expected format
      return {
        totalCodes: responseData.data.stats.totalCodes || 0,
        activeCodes: responseData.data.stats.activeCodes || 0,
        usedCodes: responseData.data.stats.usedCodes || 0,
        expiringCodes: responseData.data.stats.expiringCodes || 0,
        byType: responseData.data.stats.codesByType || {},
        usageHistory: responseData.data.stats.usageHistory || []
      };
    }
    
    // If the response doesn't match the expected format, return the original response
    return responseData;
  } catch (error) {
    console.error('Error fetching access code stats:', error);
    // Return default empty stats instead of throwing to allow the dashboard to load
    return DEFAULT_EMPTY_STATS;
  }
}

/**
 * Get access codes with filtering, sorting and pagination
 */
export async function getAccessCodes(
  filters?: {
    status?: string;
    type?: string[];
    search?: string;
    dateStart?: string;
    dateEnd?: string;
  },
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  },
  pagination?: {
    page: number;
    pageSize: number;
  },
): Promise<{ codes: AccessCode[]; total: number }> {
  try {
    // Build query string
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.type && filters.type.length)
        filters.type.forEach((t) => params.append('type', t));
      if (filters.search) params.append('search', filters.search);
      if (filters.dateStart) params.append('dateStart', filters.dateStart);
      if (filters.dateEnd) params.append('dateEnd', filters.dateEnd);
    }
    
    if (sort) {
      params.append('sortField', sort.field);
      params.append('sortDirection', sort.direction);
    }
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.pageSize.toString());
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_URL}${API_BASE_URL}/access-codes/list${queryString}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.status === 404) {
      console.warn('Access codes list endpoint not found (404), returning empty list');
      return { codes: [], total: 0 };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch access codes: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const responseData = await response.json();
    
    // Handle the new response format
    if (responseData.status === 'success' && responseData.data && responseData.data.accessCodes) {
      const accessCodes = responseData.data.accessCodes;
      console.log(`Received ${accessCodes.length} access codes`);
      return { 
        codes: accessCodes, 
        total: accessCodes.length // If the API doesn't provide a total count, use the array length
      };
    }
    
    // If the response doesn't match the expected format, return the original response
    // This maintains backward compatibility
    return responseData;
  } catch (error) {
    console.error('Error fetching access codes:', error);
    // Return empty list instead of throwing to allow the dashboard to load
    return { codes: [], total: 0 };
  }
}

/**
 * Get access code by ID with its activities
 */
export async function getAccessCodeById(id: string): Promise<{
  accessCode: AccessCode;
  activities: AccessCodeActivity[];
}> {
  try {
    const response = await fetch(`${API_URL}${API_BASE_URL}/access-codes/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.status === 404) {
      console.warn(`Access code ${id} not found (404)`);
      throw new Error(`Access code ${id} not found`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch access code details: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching access code ${id}:`, error);
    throw error;
  }
}

/**
 * Get access code status
 */
export async function getAccessCodeStatus(id: string): Promise<{
  isActive: boolean;
  isExpired: boolean;
  isFullyUsed: boolean;
}> {
  try {
    const response = await fetch(`${API_URL}${API_BASE_URL}/access-codes/status/${id}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.status === 404) {
      console.warn(`Access code status for ${id} not found (404)`);
      return { isActive: false, isExpired: false, isFullyUsed: false };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch access code status: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching access code status for ${id}:`, error);
    return { isActive: false, isExpired: false, isFullyUsed: false };
  }
}

/**
 * Get recent activities for access codes
 * @param limit Maximum number of activities to return
 * @returns Array of recent activities
 */
export async function getRecentActivities(limit: number = 10): Promise<AccessCodeActivity[]> {
  try {
    // First try the activities endpoint with the expected path
    const response = await fetch(`${API_URL}${API_BASE_URL}/access-codes/activities?limit=${limit}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.status === 404) {
      console.warn('Activities endpoint not found (404), returning empty list');
      
      // Since the activities endpoint is not available, we'll try to generate some activities
      // from the access codes list as a fallback
      try {
        const { codes } = await getAccessCodes();
        if (codes.length > 0) {
          // Create synthetic activities based on the access codes
          const syntheticActivities: AccessCodeActivity[] = codes
            .slice(0, limit)
            .map(code => ({
              id: `synthetic-${code.id}`,
              codeId: code.id,
              code: code.code,
              action: 'CREATED',
              timestamp: code.createdAt,
              userId: code.createdBy || undefined,
              details: `${code.type} code created`
            }));
          
          console.log(`Generated ${syntheticActivities.length} synthetic activities from access codes`);
          return syntheticActivities;
        }
      } catch (fallbackError) {
        console.error('Error generating synthetic activities:', fallbackError);
      }
      
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recent activities: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Handle the new response format
    if (responseData.status === 'success' && responseData.data && responseData.data.activities) {
      return responseData.data.activities;
    }
    
    // If the response doesn't match the expected format, return the original response
    return responseData;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    // Return empty array instead of throwing to allow the dashboard to load
    return [];
  }
}
