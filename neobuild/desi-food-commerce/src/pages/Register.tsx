import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { UserPlus, MapPin } from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear errors when user starts typing
    if (error) setError("")
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would reverse geocode to get address
            const { latitude, longitude } = position.coords
            setFormData(prev => ({
              ...prev,
              address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            }))
          } catch (err) {
            console.error("Error getting address:", err)
          } finally {
            setLocationLoading(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your location. Please enter address manually.")
          setLocationLoading(false)
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
      setLocationLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.phone || !formData.address) {
      setError("All fields are required")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9]{10,15}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Submitting registration form...", { email: formData.email })
      
      const result = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      })

      console.log("Registration result:", result)

      if (result?.user) {
        setSuccess("Account created successfully! You can now sign in.")
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      
      let errorMessage = "Registration failed. Please try again."
      
      if (err.message) {
        if (err.message.includes("email") && err.message.includes("already")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (err.message.includes("password")) {
          errorMessage = "Password must be at least 6 characters long"
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
            <UserPlus className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-3xl font-bold text-gray-900'>Create Account</h2>
          <p className='mt-2 text-gray-600'>Join us for delicious homemade food</p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg animate-fade-in'>
              {error}
            </div>
          )}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg animate-fade-in'>
              {success}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label htmlFor='fullName' className='block text-sm font-medium text-gray-700 mb-2'>
                Full Name *
              </label>
              <input
                id='fullName'
                name='fullName'
                type='text'
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className='input'
                placeholder='Enter your full name'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address *
              </label>
              <input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                required
                className='input'
                placeholder='Enter your email'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                Phone Number *
              </label>
              <input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleInputChange}
                required
                className='input'
                placeholder='Enter your phone number'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-2'>
                Delivery Address *
              </label>
              <div className='space-y-2'>
                <textarea
                  id='address'
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className='input resize-none'
                  placeholder='Enter your complete address'
                  disabled={loading}
                />
                <button
                  type='button'
                  onClick={getCurrentLocation}
                  disabled={locationLoading || loading}
                  className='w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <MapPin className='w-4 h-4' />
                  <span>{locationLoading ? "Getting location..." : "Use Current Location"}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Password *
              </label>
              <input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className='input'
                placeholder='Enter your password (min 6 characters)'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-2'>
                Confirm Password *
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className='input'
                placeholder='Confirm your password'
                disabled={loading}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className='text-center'>
            <p className='text-gray-600'>
              Already have an account?{" "}
              <Link to='/login' className='text-primary-600 hover:text-primary-700 font-medium'>
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register