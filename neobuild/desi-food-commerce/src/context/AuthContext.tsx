import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Provider } from "@/types"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { AppErrorHandler, ErrorType } from "@/utils/errors"

interface AuthContextType {
  user: User | null
  provider: Provider | null
  userType: 'customer' | 'provider' | null
  loading: boolean
  error: any
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signUpProvider: (email: string, password: string, providerData: any) => Promise<any>
  signIn: (email: string, password: string, userType?: 'customer' | 'provider') => Promise<any>
  signOut: () => Promise<void>
  switchUserType: (type: 'customer' | 'provider') => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null)
  const [loading, setLoading] = useState(true)
  const { error, handleError, clearError } = useErrorHandler()

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.warn('Session retrieval error:', sessionError)
        // Don't throw here, user might not be logged in
      }

      if (session?.user) {
        setUser(session.user)
        await checkUserType(session.user.id)
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
          try {
            if (session?.user) {
              setUser(session.user)
              await checkUserType(session.user.id)
            } else {
              setUser(null)
              setProvider(null)
              setUserType(null)
            }
          } catch (error) {
            console.error('Auth state change error:', error)
            handleError(error)
          }
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Auth initialization error:', error)
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserType = async (userId: string) => {
    try {
      // Check if user is a provider
      const { data: providerData, error } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle() // Use maybeSingle to avoid error when no rows found

      if (error) {
        console.warn('Provider check error:', error)
        // If table doesn't exist or permission denied, assume customer
        setProvider(null)
        setUserType('customer')
        return
      }

      if (providerData) {
        setProvider(providerData)
        setUserType('provider')
      } else {
        setProvider(null)
        setUserType('customer')
      }
    } catch (error) {
      console.error('Error checking user type:', error)
      // Default to customer on error
      setProvider(null)
      setUserType('customer')
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true)
      clearError()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            address: userData.address,
            user_type: 'customer',
          }
        }
      })

      if (error) {
        throw error
      }

      // Try to create user profile (non-blocking)
      if (data.user) {
        try {
          await supabase
            .from("users")
            .insert([{
              id: data.user.id,
              email: data.user.email,
              full_name: userData.fullName,
              phone: userData.phone,
              address: userData.address,
            }])
        } catch (profileError) {
          console.warn('Profile creation failed (non-blocking):', profileError)
        }
      }

      return data
    } catch (error) {
      handleError(error)
      throw AppErrorHandler.handleSupabaseError(error)
    } finally {
      setLoading(false)
    }
  }

  const signUpProvider = async (email: string, password: string, providerData: any) => {
    try {
      setLoading(true)
      clearError()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: providerData.businessName,
            phone: providerData.phone,
            business_address: providerData.businessAddress,
            user_type: 'provider',
          }
        }
      })

      if (error) {
        throw error
      }

      // Try to create provider profile (non-blocking)
      if (data.user) {
        try {
          await supabase
            .from("providers")
            .insert([{
              user_id: data.user.id,
              business_name: providerData.businessName,
              business_address: providerData.businessAddress,
              phone: providerData.phone,
              email: data.user.email,
              cuisine_types: providerData.cuisineTypes || [],
              delivery_radius: providerData.deliveryRadius || 2,
              is_verified: false,
              is_active: false,
              rating: 0,
              total_orders: 0,
            }])
        } catch (profileError) {
          console.warn('Provider profile creation failed (non-blocking):', profileError)
        }
      }

      return data
    } catch (error) {
      handleError(error)
      throw AppErrorHandler.handleSupabaseError(error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        await checkUserType(data.user.id)
      }

      return data
    } catch (error) {
      handleError(error)
      throw AppErrorHandler.handleSupabaseError(error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      clearError()
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      setUser(null)
      setProvider(null)
      setUserType(null)
    } catch (error) {
      handleError(error)
      throw AppErrorHandler.handleSupabaseError(error)
    } finally {
      setLoading(false)
    }
  }

  const switchUserType = (type: 'customer' | 'provider') => {
    setUserType(type)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      provider, 
      userType, 
      loading, 
      error,
      signUp, 
      signUpProvider, 
      signIn, 
      signOut,
      switchUserType,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  )
}