import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect, Suspense, lazy } from "react"
import Navbar from "@/components/Navbar"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorBoundary from "@/components/ErrorBoundary"
import NetworkStatus from "@/components/NetworkStatus"
import ErrorAlert from "@/components/ErrorAlert"
import { useAuth } from "@/context/AuthContext"

// Lazy load components
const Home = lazy(() => import("@/pages/Home"))
const Login = lazy(() => import("@/pages/Login"))
const Register = lazy(() => import("@/pages/Register"))
const ProviderRegister = lazy(() => import("@/pages/ProviderRegister"))
const Menu = lazy(() => import("@/pages/Menu"))
const Cart = lazy(() => import("@/pages/Cart"))
const Checkout = lazy(() => import("@/pages/Checkout"))
const Profile = lazy(() => import("@/pages/Profile"))
const Orders = lazy(() => import("@/pages/Orders"))
const ProviderDashboard = lazy(() => import("@/pages/ProviderDashboard"))
const ProviderOrders = lazy(() => import("@/pages/ProviderOrders"))
const ProviderMenu = lazy(() => import("@/pages/ProviderMenu"))
const ProviderPayments = lazy(() => import("@/pages/ProviderPayments"))
const PrivateRoute = lazy(() => import("@/components/PrivateRoute"))
const ProviderRoute = lazy(() => import("@/components/ProviderRoute"))
const NotFound = lazy(() => import("@/pages/NotFound"))

function App() {
  const location = useLocation()
  const { error: authError, clearError } = useAuth()

  // Debug routing in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Current route:", location.pathname)
    }
  }, [location])

  // Remove loading screen once app is loaded
  useEffect(() => {
    const loadingElement = document.querySelector('.loading')
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.remove()
      }, 100)
    }
  }, [])

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-gray-50'>
        <NetworkStatus />
        <Navbar />
        
        {/* Global Auth Error Display */}
        {authError && (
          <div className='container mx-auto px-4 pt-4'>
            <ErrorAlert 
              error={authError} 
              onDismiss={clearError}
              onRetry={authError.retryable ? () => window.location.reload() : undefined}
            />
          </div>
        )}
        
        <main className='container mx-auto px-4 py-8'>
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<Home />} />
                <Route path='/home' element={<Navigate to='/' replace />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/provider-register' element={<ProviderRegister />} />
                <Route path='/menu' element={<Menu />} />
                
                {/* Customer Private Routes */}
                <Route 
                  path='/cart' 
                  element={
                    <ErrorBoundary>
                      <PrivateRoute>
                        <Cart />
                      </PrivateRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path='/checkout' 
                  element={
                    <ErrorBoundary>
                      <PrivateRoute>
                        <Checkout />
                      </PrivateRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path='/profile' 
                  element={
                    <ErrorBoundary>
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path='/orders' 
                  element={
                    <ErrorBoundary>
                      <PrivateRoute>
                        <Orders />
                      </PrivateRoute>
                    </ErrorBoundary>
                  } 
                />
                
                {/* Provider Routes */}
                <Route 
                  path='/provider/dashboard' 
                  element={
                    <ErrorBoundary>
                      <ProviderRoute>
                        <ProviderDashboard />
                      </ProviderRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path='/provider/orders' 
                  element={
                    <ErrorBoundary>
                      <ProviderRoute>
                        <ProviderOrders />
                      </ProviderRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path='/provider/menu' 
                  element={
                    <ErrorBoundary>
                      <ProviderRoute>
                        <ProviderMenu />
                      </ProviderRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path='/provider/payments' 
                  element={
                    <ErrorBoundary>
                      <ProviderRoute>
                        <ProviderPayments />
                      </ProviderRoute>
                    </ErrorBoundary>
                  } 
                />
                
                {/* Redirect old provider routes */}
                <Route path='/provider' element={<Navigate to='/provider/dashboard' replace />} />
                
                {/* 404 and catch all */}
                <Route path='/404' element={<NotFound />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App