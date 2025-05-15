'use server';

/**
 * Utility functions for making API calls to portfolio-related endpoints
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

  // Debug logging for environment variables and request setup
  console.log(`🔧 callApi DEBUG - ${endpoint}`);
  console.log('  API URL defined:', !!apiUrl);
  console.log('  API KEY defined:', !!apiKey);
  console.log('  API KEY length:', apiKey?.length || 0);

  if (!apiUrl || !apiKey) {
    console.error('❌ Missing API configuration:', { 
      hasUrl: !!apiUrl, 
      hasKey: !!apiKey 
    });
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
  
  console.log('  Full URL:', url);

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    next: { revalidate: 10 }, // Default caching strategy
  };

  console.log('  Request headers:', JSON.stringify({
    'Content-Type': 'application/json',
    'x-api-key': apiKey ? `${apiKey.substring(0, 3)}...` : undefined // Log first few chars for safety
  }));

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    console.log('  Sending request...');
    const response = await fetch(url, options);
    console.log('  Response status:', response.status);

    if (!response.ok) {
      // Handle error cases
      if (response.status === 401) {
        console.error('⛔ API Authentication error (401)');
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        console.error('⛔ Resource not found (404)');
        throw new Error('Resource not found');
      } else if (response.status >= 500) {
        console.error('⛔ Server error:', response.status);
        throw new Error('Server error - please try again later');
      }

      try {
        const errorData = await response.json();
        console.error('⛔ API error response:', errorData);
        throw new Error(errorData.message || 'API request failed');
      } catch (jsonError) {
        // If parsing JSON fails, just use status text
        console.error('⛔ Could not parse error response:', jsonError);
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('  Response successful, data received');
    return data;
  } catch (error) {
    console.error(`❌ Error calling API at ${endpoint}:`, error);
    throw error;
  }
} 