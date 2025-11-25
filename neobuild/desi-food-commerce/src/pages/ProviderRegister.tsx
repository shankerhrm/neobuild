import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Store, MapPin } from "lucide-react"

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    phone: "",
    businessAddress: "",
    cuisineTypes: [] as string[],
    deliveryRadius: 2,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  
  const { signUpProvider } = useAuth()
  const navigate = useNavigate()

  const cuisineOptions = [
    "North Indian", "South Indian", "Chinese", "Italian", "Continental",
    "Bengali", "Punjabi", "Gujarati", "Maharashtrian", "Street Food",
    "Desserts", "Beverages", "Healthy", "Vegan", "Fast Food"
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
    
    if (error) setError("")
  }

  const handleCuisineChange = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }))
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            setFormData(prev => ({
              ...prev,
              businessAddress: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
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
    if (!formData.email || !formData.password || !formData.businessName || 
        !formData.phone || !formData.businessAddress) {
      setError("All required fields must be filled")
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    const phoneRegex = /^[\+]?[0-9]{10,15}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number")
      return false
    }

    if (formData.cuisineTypes.length === 0) {
      setError("Please select at least one cuisine type")
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
      console.log("Submitting provider registration...")
      
      const result = await signUpProvider(formData.email, formData.password, {
        businessName: formData.businessName,
        phone: formData.phone,
        businessAddress: formData.businessAddress,
        cuisineTypes: formData.cuisineTypes,
        deliveryRadius: formData.deliveryRadius,
      })

      console.log("Provider registration result:", result)

      if (result?.user) {
        setSuccess("Provider account created successfully! Please wait for verification.")
        setTimeout(() => {
          navigate("/provider/dashboard")
        }, 2000)
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Provider registration error:", err)
      
      let errorMessage = "Registration failed. Please try again."
      
      if (err.message) {
        if (err.message.includes("email") && err.message.includes("already")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (err.message.includes("password")) {
          errorMessage = "Password must be at least 6 characters long"
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
      <div className='max-w-2xl w-full space-y-8'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Store className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-3xl font-bold text-gray-900'>Become a Provider</h2>
          <p className='mt-2 text-gray-600'>Join our platform and start serving delicious homemade food</p>
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

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Business Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>Business Information</h3>
              
              <div>
                <label htmlFor='businessName' className='block text-sm font-medium text-gray-700 mb-2'>
                  Business Name *
                </label>
                <input
                  id='businessName'
                  name='businessName'
                  type='text'
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  className='input'
                  placeholder='Enter your business name'
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
                <label htmlFor='businessAddress' className='block text-sm font-medium text-gray-700 mb-2'>
                  Business Address *
                </label>
                <div className='space-y-2'>
                  <textarea
                    id='businessAddress'
                    name='businessAddress'
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className='input resize-none'
                    placeholder='Enter your complete business address'
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
                <label htmlFor='deliveryRadius' className='block text-sm font-medium text-gray-700 mb-2'>
                  Delivery Radius (km)
                </label>
                <input
                  id='deliveryRadius'
                  name='deliveryRadius'
                  type='number'
                  min='1'
                  max='10'
                  step='0.5'
                  value={formData.deliveryRadius}
                  onChange={handleInputChange}
                  className='input'
                  disabled={loading}
                />
              </div>
            </div>

            {/* Account & Cuisine Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>Account Information</h3>
              
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
          </div>

          {/* Cuisine Types */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Cuisine Types *</h3>
            <p className='text-sm text-gray-600 mb-4'>Select the types of cuisine you offer (choose at least one):</p>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
              {cuisineOptions.map(cuisine => (
                <label key={cuisine} className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={formData.cuisineTypes.includes(cuisine)}
                    onChange={() => handleCuisineChange(cuisine)}
                    disabled={loading}
                    className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                  />
                  <span className='text-sm text-gray-700'>{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "Creating Provider Account..." : "Create Provider Account"}
          </button>

          <div className='text-center'>
            <p className='text-gray-600'>
              Already have an account?{" "}
              <Link to='/login' className='text-primary-600 hover:text-primary-700 font-medium'>
                Sign in here
              </Link>
            </p>
            <p className='text-gray-600 mt-2'>
              Want to register as a customer?{" "}
              <Link to='/register' className='text-primary-600 hover:text-primary-700 font-medium'>
                Customer signup
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProviderRegister