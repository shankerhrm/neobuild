import { useAuth } from "@/context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default PrivateRoute