/**
 * Common response type for all API actions
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  limit?: number
  offset?: number
}

/**
 * Common API error types
 */
export enum ApiErrorType {
  CONFIGURATION = 'Missing API configuration',
  UNAUTHORIZED = 'Invalid API key',
  NOT_FOUND = 'Resource not found',
  SERVER_ERROR = 'Server error - please try again later',
  VALIDATION = 'Validation error',
  UNKNOWN = 'An unexpected error occurred'
}

/**
 * Common validation error response
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Common search parameters
 */
export interface SearchParams extends PaginationParams {
  query: string
  filters?: Record<string, string | number | boolean>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
} 