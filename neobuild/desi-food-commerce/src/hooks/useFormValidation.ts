import { useState, useCallback } from 'react'
import { ValidationRules } from '@/utils/errors'

interface ValidationError {
  field: string
  message: string
}

interface UseFormValidationReturn<T> {
  values: T
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
  setValue: (field: keyof T, value: any) => void
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  validate: (field?: keyof T) => boolean
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>
  reset: (initialValues?: T) => void
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }, [errors])

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const validate = useCallback((field?: keyof T): boolean => {
    if (!validationRules) return true

    const newErrors: Record<string, string> = {}
    
    const fieldsToValidate = field ? [field] : Object.keys(validationRules) as (keyof T)[]
    
    for (const fieldName of fieldsToValidate) {
      const rule = validationRules[fieldName]
      if (rule) {
        const error = rule(values[fieldName])
        if (error) {
          newErrors[fieldName as string] = error
        }
      }
    }

    if (field) {
      // Single field validation
      if (newErrors[field as string]) {
        setError(field as string, newErrors[field as string])
        return false
      } else {
        clearError(field as string)
        return true
      }
    } else {
      // All fields validation
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
  }, [values, validationRules, setError, clearError])

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => 
    async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (isSubmitting) return
      
      const isFormValid = validate()
      if (!isFormValid) return
      
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
        // Let the parent component handle the error
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validate, isSubmitting]
  )

  const reset = useCallback((newInitialValues?: T) => {
    setValues(newInitialValues || initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setError,
    clearError,
    clearAllErrors,
    validate,
    handleSubmit,
    reset
  }
}