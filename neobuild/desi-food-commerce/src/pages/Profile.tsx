import { useState, useEffect } from "react"
import { User, MapPin, Phone, Mail, Edit } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  created_at: string
}

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Profile fetch error:", error)
        // Create a default profile if none exists
        setProfile({
          id: user.id,
          email: user.email || "",
          full_name: "",
          phone: "",
          address: "",
          created_at: new Date().toISOString(),
        })
      } else {
        setProfile(data)
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    setError("")

    try {
      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email,
          ...formData,
        })

      if (error) {
        setError(error.message)
      } else {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setEditing(false)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    })
    setEditing(false)
    setError("")
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Profile not found</h2>
          <p className='text-gray-600'>Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      <div className='text-center'>
        <div className='w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4'>
          <User className='w-12 h-12 text-white' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Profile</h1>
        <p className='text-gray-600'>Manage your account information</p>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className='card space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'>
              {error}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
            <input
              type='text'
              name='full_name'
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className='input'
              placeholder='Enter your full name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
            <input
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              required
              className='input'
              placeholder='Enter your phone number'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Address</label>
            <textarea
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              required
              rows={3}
              className='input resize-none'
              placeholder='Enter your complete address'
            />
          </div>

          <div className='flex space-x-4'>
            <button
              type='submit'
              disabled={saving}
              className='flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type='button'
              onClick={handleCancel}
              className='flex-1 btn-secondary'
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className='card space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>Personal Information</h2>
            <button
              onClick={() => setEditing(true)}
              className='flex items-center space-x-2 text-primary-600 hover:text-primary-700'
            >
              <Edit className='w-4 h-4' />
              <span>Edit</span>
            </button>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
              <Mail className='w-5 h-5 text-gray-400' />
              <div>
                <div className='text-sm text-gray-500'>Email</div>
                <div className='font-medium'>{profile.email}</div>
              </div>
            </div>

            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
              <User className='w-5 h-5 text-gray-400' />
              <div>
                <div className='text-sm text-gray-500'>Full Name</div>
                <div className='font-medium'>{profile.full_name || "Not provided"}</div>
              </div>
            </div>

            <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
              <Phone className='w-5 h-5 text-gray-400' />
              <div>
                <div className='text-sm text-gray-500'>Phone Number</div>
                <div className='font-medium'>{profile.phone || "Not provided"}</div>
              </div>
            </div>

            <div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
              <MapPin className='w-5 h-5 text-gray-400 mt-1' />
              <div className='flex-1'>
                <div className='text-sm text-gray-500'>Address</div>
                <div className='font-medium'>{profile.address || "Not provided"}</div>
              </div>
            </div>
          </div>

          <div className='pt-4 border-t border-gray-200'>
            <div className='text-sm text-gray-500'>
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile