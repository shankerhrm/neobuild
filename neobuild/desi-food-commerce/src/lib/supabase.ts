import { createClient } from "@supabase/supabase-js"

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error("Invalid VITE_SUPABASE_URL format. Please check your environment variables.")
}

// Create Supabase client with security configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'desi-food-commerce'
    }
  }
})

// Optional: Add connection test in development only
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(({ error }) => {
    if (error) {
      console.warn('Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connected successfully')
    }
  })
}