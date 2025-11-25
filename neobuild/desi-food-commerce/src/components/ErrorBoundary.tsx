import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  public state: State = {
    hasError: false,
    errorId: ''
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('🚨 Error Boundary Caught Error')
    console.error('Error ID:', this.state.errorId)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error Stack:', error.stack)
    console.groupEnd()

    // Log error to external service in production
    if (!import.meta.env.DEV) {
      this.logErrorToService(error, errorInfo)
    }

    this.setState({ errorInfo })
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In a real app, send to error tracking service like Sentry
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    // Example: Send to your error tracking service
    console.log('Would send to error service:', errorData)
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: ''
      })
    } else {
      // Max retries reached, reload the page
      window.location.reload()
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
          <div className='max-w-lg w-full'>
            <div className='bg-white rounded-lg shadow-lg p-8 text-center'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <AlertTriangle className='w-8 h-8 text-red-600' />
              </div>
              
              <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                Oops! Something went wrong
              </h1>
              
              <p className='text-gray-600 mb-6'>
                We encountered an unexpected error. Don't worry, our team has been notified 
                and we're working to fix it.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className='text-left bg-gray-100 p-4 rounded-lg mb-6 text-sm'>
                  <summary className='cursor-pointer font-medium text-gray-700 mb-2'>
                    Error Details (Development)
                  </summary>
                  <div className='space-y-2'>
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className='text-xs mt-1 overflow-auto bg-white p-2 rounded border'>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className='space-y-3'>
                {this.retryCount < this.maxRetries ? (
                  <button
                    onClick={this.handleRetry}
                    className='w-full btn-primary flex items-center justify-center space-x-2'
                  >
                    <RefreshCw className='w-4 h-4' />
                    <span>Try Again ({this.maxRetries - this.retryCount} attempts left)</span>
                  </button>
                ) : (
                  <button
                    onClick={this.handleReload}
                    className='w-full btn-primary flex items-center justify-center space-x-2'
                  >
                    <RefreshCw className='w-4 h-4' />
                    <span>Reload Page</span>
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className='w-full btn-secondary flex items-center justify-center space-x-2'
                >
                  <Home className='w-4 h-4' />
                  <span>Go Home</span>
                </button>
              </div>
              
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <p className='text-sm text-gray-500'>
                  If this problem persists, please contact support with error ID: 
                  <code className='bg-gray-100 px-2 py-1 rounded text-xs ml-1'>
                    {this.state.errorId}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary