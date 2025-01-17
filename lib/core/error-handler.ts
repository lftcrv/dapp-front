import { showToast } from '@/lib/toast'

export type Result<T> = {
  data?: T
  error?: Error
  success: boolean
}

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<Result<T>> => {
  try {
    const data = await operation()
    return { data, success: true }
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error(errorMessage)
    showToast('DEFAULT_ERROR', 'error')
    return { error: finalError, success: false }
  }
}

export const createErrorResult = (message: string): Result<never> => ({
  error: new Error(message),
  success: false
}) 