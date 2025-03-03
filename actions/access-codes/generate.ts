import { AccessCode, GenerationParams } from '../../types/accessCode';

// The API base URL should match the one in PR_BACKEND.md
const API_URL = 'http://localhost:8080';
const API_BASE_URL = '/api/access-code';
const API_KEY = 'carbonable-our-giga-secret-api-key';

/**
 * Generate one or more access codes with the provided parameters
 * @param params Configuration options for the new access code(s)
 * @returns The newly generated access code(s)
 */
export async function generateAccessCode(params: GenerationParams): Promise<AccessCode | AccessCode[]> {
  try {
    console.log('Generating access code with params:', JSON.stringify(params, null, 2));
    
    // Ensure count is a valid number between 1 and 100
    let count = 1;
    if (params.count) {
      // Convert to number if it's a string
      count = typeof params.count === 'string' ? parseInt(params.count, 10) : params.count;
      
      // Validate count is within acceptable range
      if (isNaN(count) || count < 1) {
        count = 1;
      } else if (count > 100) {
        count = 100;
      }
    }
    
    // Format the parameters for the API
    const apiParams = {
      type: params.type,
      ...(params.maxUses !== undefined && { maxUses: params.maxUses }),
      ...(params.expiresAt && { expiresAt: params.expiresAt }),
      ...(params.description && { description: params.description }),
      // Always use short code
      useShortCode: true,
      // Always include count as a number
      count: count
    };
    
    console.log('Formatted API params:', JSON.stringify(apiParams, null, 2));
    
    // Make sure we're using the correct endpoint from PR_BACKEND.md
    const response = await fetch(`${API_URL}${API_BASE_URL}/access-codes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(apiParams),
    });

    // Log the response status for debugging
    console.log(`Generate access code response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get the error message from the response
      let errorMessage = `Failed to generate access code: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      console.error(`Error generating code: ${response.status} ${response.statusText}`);
      throw new Error(errorMessage);
    }

    // Parse the response
    const responseData = await response.json();
    
    // Handle the response format from PR_BACKEND.md which includes a data wrapper
    if (responseData && responseData.status === 'success' && responseData.data) {
      // Check if we have a batch response (array of access codes)
      if (responseData.data.accessCodes && Array.isArray(responseData.data.accessCodes)) {
        console.log(`Successfully generated ${responseData.data.accessCodes.length} access codes`);
        return responseData.data.accessCodes;
      }
      
      // Single access code response
      console.log('Successfully generated access code:', responseData.data);
      return responseData.data;
    }
    
    // If the response doesn't match the expected format, return it directly
    console.log('Successfully generated access code (direct format):', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in generateAccessCode:', error);
    throw error;
  }
} 