// API Error Types
export enum ApiErrorType {
  CONFIGURATION = 'Missing API configuration',
  UNAUTHORIZED = 'Invalid API key',
  NOT_FOUND = 'Resource not found',
  SERVER_ERROR = 'Server error - please try again later',
  VALIDATION = 'Validation error',
  UNKNOWN = 'An unexpected error occurred',
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates API configuration
 */
export function validateApiConfig(apiUrl?: string, apiKey?: string): void {
  if (!apiUrl || !apiKey) {
    throw new Error(ApiErrorType.CONFIGURATION);
  }
}

/**
 * Validates pagination parameters
 */
export function validatePagination(
  limit?: number,
  offset?: number,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (limit !== undefined && (limit < 1 || limit > 100)) {
    errors.push({
      field: 'limit',
      message: 'Limit must be between 1 and 100',
    });
  }

  if (offset !== undefined && offset < 0) {
    errors.push({
      field: 'offset',
      message: 'Offset must be non-negative',
    });
  }

  return errors;
}

/**
 * Validates search parameters
 */
export function validateSearchQuery(query?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!query?.trim()) {
    errors.push({
      field: 'query',
      message: 'Search query is required',
    });
  }

  if (query && query.length < 2) {
    errors.push({
      field: 'query',
      message: 'Search query must be at least 2 characters',
    });
  }

  return errors;
}

/**
 * Handles API response validation
 */
export function validateApiResponse(response: Response): void {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(ApiErrorType.UNAUTHORIZED);
    } else if (response.status === 404) {
      throw new Error(ApiErrorType.NOT_FOUND);
    } else if (response.status >= 500) {
      throw new Error(ApiErrorType.SERVER_ERROR);
    }
  }
}

/**
 * Normalizes a wallet address to a consistent format
 * - Converts to lowercase
 * - Ensures it has 0x prefix
 * 
 * @param address The wallet address to normalize
 * @returns The normalized address
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  
  // Convert to lowercase
  let normalized = address.trim().toLowerCase();
  
  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = `0x${normalized}`;
  }
  
  return normalized;
}
