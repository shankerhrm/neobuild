import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { LogIn } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Attempting sign in...")
      const result = await signIn(email, password)
      console.log("Sign in result:", result)
      
      if (result?.user) {
        // Redirect to the page user was trying to access
        navigate(from, { replace: true })
      } else {
        setError("Sign in failed. Please check your credentials.")
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      
      let errorMessage = "Failed to sign in. Please try again."
      
      if (err.message) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials."
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link."
        } else if (err.message.includes("email")) {
          errorMessage = "Please enter a valid email address"
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4'>
            <LogIn className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-3xl font-bold text-gray-900'>Welcome Back</h2>
          <p className='mt-2 text-gray-600'>Sign in to your account</p>
          
          {from !== "/" && (
            <p className='mt-2 text-sm text-primary-600'>
              Please sign in to continue to your destination
            </p>
          )}
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg animate-fade-in'>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                required
                className='input'
                placeholder='Enter your email'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError("")
                }}
                required
                className='input'
                placeholder='Enter your password'
                disabled={loading}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className='text-center space-y-2'>
            <p className='text-gray-600'>
              Don't have a customer account?{" "}
              <Link to='/register' className='text-primary-600 hover:text-primary-700 font-medium'>
                Sign up here
              </Link>
            </p>
            <p className='text-gray-600'>
              Want to become a provider?{" "}
              <Link to='/provider-register' className='text-primary-600 hover:text-primary-700 font-medium'>
                Provider signup
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login