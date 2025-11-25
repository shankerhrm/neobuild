import { AlertCircle, Wifi, RefreshCw, X } from 'lucide-react'
import { AppError, ErrorType } from '@/utils/errors'

interface ErrorAlertProps {
  error: AppError
  onRetry?: () => void
  onDismiss: () => void
  className?: string
}

const ErrorAlert = ({ error, onRetry, onDismiss, className = '' }: ErrorAlertProps) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return <Wifi className='w-5 h-5' />
      default:
        return <AlertCircle className='w-5 h-5' />
    }
  }

  const getErrorStyle = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'bg-red-50 border-red-200 text-red-800'
      case ErrorType.VALIDATION:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case ErrorType.DATABASE:
      case ErrorType.SERVER:
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  return (
    <div className={`border rounded-lg p-4 animate-slide-up ${getErrorStyle()} ${className}`}>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          {getErrorIcon()}
          <div className='flex-1'>
            <h3 className='font-medium text-sm mb-1'>
              {error.type === ErrorType.NETWORK ? 'Connection Problem' :
               error.type === ErrorType.AUTHENTICATION ? 'Authentication Error' :
               error.type === ErrorType.AUTHORIZATION ? 'Access Denied' :
               error.type === ErrorType.VALIDATION ? 'Validation Error' :
               error.type === ErrorType.DATABASE ? 'Database Error' :
               'Something went wrong'}
            </h3>
            <p className='text-sm opacity-90'>{error.message}</p>
            
            {error.code && import.meta.env.DEV && (
              <p className='text-xs mt-1 opacity-70'>Error Code: {error.code}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className='ml-3 opacity-70 hover:opacity-100 transition-opacity'
          aria-label='Dismiss error'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
      
      {(error.retryable || onRetry) && (
        <div className='mt-3 flex space-x-2'>
          <button
            onClick={onRetry}
            className='flex items-center space-x-1 text-sm font-medium hover:underline'
          >
            <RefreshCw className='w-3 h-3' />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ErrorAlert