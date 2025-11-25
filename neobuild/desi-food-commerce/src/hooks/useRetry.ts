import { useState, useCallback } from 'react'

interface UseRetryOptions {
  maxRetries?: number
  delay?: number
  backoffFactor?: number
  onRetry?: (attempt: number) => void
  onMaxRetriesReached?: () => void
}

interface UseRetryReturn {
  retry: <T>(fn: () => Promise<T>) => Promise<T>
  isRetrying: boolean
  retryCount: number
  canRetry: boolean
  reset: () => void
}

export const useRetry = (options: UseRetryOptions = {}): UseRetryReturn => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffFactor = 2,
    onRetry,
    onMaxRetriesReached
  } = options

  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const retry = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    let currentDelay = delay
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true)
          onRetry?.(attempt)
          await sleep(currentDelay)
          currentDelay *= backoffFactor
        }
        
        const result = await fn()
        
        if (attempt > 0) {
          setRetryCount(attempt)
          setIsRetrying(false)
        }
        
        return result
      } catch (error) {
        if (attempt === maxRetries) {
          setIsRetrying(false)
          setRetryCount(maxRetries)
          onMaxRetriesReached?.()
          throw error
        }
        
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms...`, error)
      }
    }
    
    throw new Error('Max retries reached')
  }, [delay, backoffFactor, maxRetries, onRetry, onMaxRetriesReached])

  const reset = useCallback(() => {
    setIsRetrying(false)
    setRetryCount(0)
  }, [])

  const canRetry = retryCount < maxRetries

  return {
    retry,
    isRetrying,
    retryCount,
    canRetry,
    reset
  }
}