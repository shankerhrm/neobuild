// Error types and handling utilities

export enum ErrorType {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: number
  retryable: boolean
}

export class AppErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any,
    retryable: boolean = false
  ): AppError {
    return {
      type,
      message,
      code,
      details,
      timestamp: Date.now(),
      retryable
    }
  }

  static handleSupabaseError(error: any): AppError {
    console.error('Supabase Error:', error)
    
    // Network errors
    if (!navigator.onLine) {
      return this.createError(
        ErrorType.NETWORK,
        'No internet connection. Please check your network and try again.',
        'NETWORK_OFFLINE',
        error,
        true
      )
    }

    // Parse Supabase error
    const message = error?.message || 'An unknown error occurred'
    const code = error?.code || error?.error_code

    // Authentication errors
    if (message.includes('Invalid login credentials') || code === 'invalid_credentials') {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Invalid email or password. Please check your credentials.',
        'AUTH_INVALID_CREDENTIALS',
        error
      )
    }

    if (message.includes('Email not confirmed') || code === 'email_not_confirmed') {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Please confirm your email address before signing in.',
        'AUTH_EMAIL_NOT_CONFIRMED',
        error
      )
    }

    if (message.includes('User already registered') || code === 'user_already_exists') {
      return this.createError(
        ErrorType.VALIDATION,
        'An account with this email already exists. Please sign in instead.',
        'AUTH_USER_EXISTS',
        error
      )
    }

    // Authorization errors
    if (message.includes('JWT') || message.includes('unauthorized') || code === 'unauthorized') {
      return this.createError(
        ErrorType.AUTHORIZATION,
        'Your session has expired. Please sign in again.',
        'AUTH_SESSION_EXPIRED',
        error
      )
    }

    // Database errors
    if (message.includes('relation') && message.includes('does not exist')) {
      return this.createError(
        ErrorType.DATABASE,
        'Database table not found. Please contact support.',
        'DB_TABLE_NOT_FOUND',
        error
      )
    }

    if (message.includes('permission denied') || code === 'permission_denied') {
      return this.createError(
        ErrorType.AUTHORIZATION,
        'You do not have permission to perform this action.',
        'DB_PERMISSION_DENIED',
        error
      )
    }

    // Network/Connection errors
    if (message.includes('fetch') || message.includes('network') || code === 'network_error') {
      return this.createError(
        ErrorType.NETWORK,
        'Connection failed. Please check your internet connection.',
        'NETWORK_ERROR',
        error,
        true
      )
    }

    // Validation errors
    if (message.includes('violates') || code === 'validation_error') {
      return this.createError(
        ErrorType.VALIDATION,
        'The data provided is invalid. Please check your input.',
        'VALIDATION_ERROR',
        error
      )
    }

    // Not found errors
    if (message.includes('not found') || code === 'not_found') {
      return this.createError(
        ErrorType.NOT_FOUND,
        'The requested resource was not found.',
        'RESOURCE_NOT_FOUND',
        error
      )
    }

    // Default to server error
    return this.createError(
      ErrorType.SERVER,
      'Something went wrong on our end. Please try again later.',
      'SERVER_ERROR',
      error,
      true
    )
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return error.message
      case ErrorType.AUTHENTICATION:
        return error.message
      case ErrorType.AUTHORIZATION:
        return error.message
      case ErrorType.VALIDATION:
        return error.message
      case ErrorType.NOT_FOUND:
        return 'The page or resource you are looking for was not found.'
      case ErrorType.DATABASE:
        return 'We are experiencing technical difficulties. Please try again later.'
      case ErrorType.SERVER:
        return 'Something went wrong. Please try again in a moment.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }
}

// Form validation utilities
export const ValidationRules = {
  email: (value: string): string | null => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return null
  },

  password: (value: string): string | null => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters long'
    return null
  },

  phone: (value: string): string | null => {
    if (!value) return 'Phone number is required'
    const phoneRegex = /^[\+]?[0-9]{10,15}$/
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return 'Please enter a valid phone number'
    }
    return null
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`
    }
    return null
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters long`
    }
    return null
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value && value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`
    }
    return null
  }
}