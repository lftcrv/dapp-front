'use server';

/**
 * Utility functions for making API calls to creator-related endpoints
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
  console.log(`🔧 CREATORS callApi DEBUG - ${endpoint}`);
  console.log('  CREATORS API URL defined:', !!apiUrl);
  console.log('  CREATORS API KEY defined:', !!apiKey);
  console.log('  CREATORS API KEY length:', apiKey?.length || 0);

  if (!apiUrl || !apiKey) {
    console.error('❌ CREATORS Missing API configuration:', { 
      hasUrl: !!apiUrl, 
      hasKey: !!apiKey 
    });
    throw new Error('Missing API configuration: API_URL or API_KEY not set in environment for creators');
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
  
  console.log('  CREATORS Full URL:', url);

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    next: { revalidate: 10 }, // Default caching strategy
  };

  console.log('  CREATORS Request headers:', JSON.stringify({
    'Content-Type': 'application/json',
    'x-api-key': apiKey ? `${apiKey.substring(0, 3)}...${apiKey.slice(-3)}` : undefined // Log first/last 3 chars for safety
  }));

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    console.log('  CREATORS Sending request...');
    const response = await fetch(url, options);
    console.log('  CREATORS Response status:', response.status, response.statusText);

    if (!response.ok) {
      // Handle error cases
      if (response.status === 401) {
        console.error('⛔ CREATORS API Authentication error (401)');
        throw new Error('Invalid API key for creators');
      } else if (response.status === 404) {
        console.error('⛔ CREATORS Resource not found (404) at', url);
        throw new Error('Resource not found for creators at ' + url);
      } else if (response.status >= 500) {
        console.error('⛔ CREATORS Server error:', response.status, response.statusText);
        throw new Error('Server error - please try again later for creators');
      }

      try {
      const errorData = await response.json();
        console.error('⛔ CREATORS API error response:', errorData);
        throw new Error(errorData.message || 'API request failed for creators');
      } catch (jsonError) {
        // If parsing JSON fails, just use status text
        console.error('⛔ CREATORS Could not parse error response body:', await response.text(), jsonError);
        throw new Error(`API request failed for creators with status ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('  CREATORS Response successful, data received.');
    // console.log('  CREATORS Response data:', JSON.stringify(data, null, 2)); // Optionally log full data for deep debug
    return data;
  } catch (error) {
    console.error(`❌ Error calling CREATORS API at ${endpoint}:`, error);
    throw error;
  }
} 