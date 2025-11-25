import { useAuth } from "@/context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

interface ProviderRouteProps {
  children: React.ReactNode
}

const ProviderRoute = ({ children }: ProviderRouteProps) => {
  const { user, userType, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (userType !== 'provider') {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

export default ProviderRoute