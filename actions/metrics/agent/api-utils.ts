'use server';

/**
 * Utility functions for making API calls to metrics-related endpoints
 */

/**
 * Base function to make API calls to the backend
 */
export async function callApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const apiKey = process.env.API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Missing API configuration: API_URL or API_KEY not set in environment');
  }

  // Construct the URL with query parameters if provided
  let url = `${apiUrl}${endpoint}`;
  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    next: { revalidate: 10 }, // Default caching strategy
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Handle error cases
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        throw new Error('Resource not found');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }

      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling API at ${endpoint}:`, error);
    throw error;
  }
} 