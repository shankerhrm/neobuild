import { useState, useCallback } from 'react'
import { AppError, AppErrorHandler, ErrorType } from '@/utils/errors'

interface UseErrorHandlerReturn {
  error: AppError | null
  isLoading: boolean
  clearError: () => void
  handleError: (error: any) => void
  executeWithErrorHandling: <T>(asyncFn: () => Promise<T>) => Promise<T | null>
  retry: () => Promise<void>
}

export const useErrorHandler = (onRetry?: () => Promise<void>): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryFunction, setRetryFunction] = useState<(() => Promise<void>) | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err: any) => {
    console.error('Error caught by handler:', err)
    const appError = AppErrorHandler.handleSupabaseError(err)
    setError(appError)
    setIsLoading(false)
  }, [])

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true)
      clearError()
      const result = await asyncFn()
      setIsLoading(false)
      return result
    } catch (err) {
      handleError(err)
      return null
    }
  }, [handleError, clearError])

  const retry = useCallback(async () => {
    if (retryFunction) {
      try {
        setIsLoading(true)
        clearError()
        await retryFunction()
        setIsLoading(false)
      } catch (err) {
        handleError(err)
      }
    } else if (onRetry) {
      try {
        setIsLoading(true)
        clearError()
        await onRetry()
        setIsLoading(false)
      } catch (err) {
        handleError(err)
      }
    }
  }, [retryFunction, onRetry, handleError, clearError])

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeWithErrorHandling,
    retry
  }
}