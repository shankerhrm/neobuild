import { useNavigate, useLocation } from "react-router-dom"
import { ShoppingCart, User, LogOut, Menu as MenuIcon, Store, Home } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { useState } from "react"

const Navbar = () => {
  const { user, provider, userType, signOut } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate("/", { replace: true })
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path)
    setIsMobileMenuOpen(false)
    navigate(path)
  }

  const getDisplayName = () => {
    if (userType === 'provider' && provider) {
      return provider.business_name
    }
    return user?.email?.split('@')[0] || "User"
  }

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const NavLink = ({ 
    to, 
    children, 
    className = "", 
    icon: Icon 
  }: { 
    to: string; 
    children: React.ReactNode; 
    className?: string;
    icon?: React.ComponentType<{ className?: string }>
  }) => {
    return (
      <button
        onClick={() => handleNavigation(to)}
        className={`transition-colors hover:text-primary-600 flex items-center space-x-1 ${
          isActivePath(to) ? 'text-primary-600 font-medium' : 'text-gray-600'
        } ${className}`}
      >
        {Icon && <Icon className='w-4 h-4' />}
        <span>{children}</span>
      </button>
    )
  }

  return (
    <nav className='bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('/')} 
            className='flex items-center space-x-2 hover:opacity-80 transition-opacity'
          >
            <div className='w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>DF</span>
            </div>
            <span className='font-bold text-xl text-gray-900'>Desi Foods</span>
          </button>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-6'>
            <NavLink to='/' icon={Home}>Home</NavLink>
            
            {userType === 'provider' ? (
              <>
                <NavLink to='/provider/dashboard'>Dashboard</NavLink>
                <NavLink to='/provider/orders'>Orders</NavLink>
                <NavLink to='/provider/menu'>Menu</NavLink>
                <NavLink to='/provider/payments'>Payments</NavLink>
              </>
            ) : (
              <>
                <NavLink to='/menu'>Menu</NavLink>
                {user && (
                  <>
                    <NavLink to='/orders'>Orders</NavLink>
                    <button
                      onClick={() => handleNavigation('/cart')}
                      className={`relative p-2 transition-colors hover:text-primary-600 ${
                        isActivePath('/cart') ? 'text-primary-600' : 'text-gray-600'
                      }`}
                      title='Shopping Cart'
                    >
                      <ShoppingCart className='w-5 h-5' />
                      {cartItemsCount > 0 && (
                        <span className='absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse'>
                          {cartItemsCount > 99 ? '99+' : cartItemsCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
            
            {/* User Menu */}
            {user ? (
              <div className='relative group'>
                <button className='flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-100'>
                  {userType === 'provider' ? <Store className='w-5 h-5' /> : <User className='w-5 h-5' />}
                  <span className='max-w-32 truncate'>{getDisplayName()}</span>
                </button>
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className='w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center space-x-2'
                  >
                    <User className='w-4 h-4' />
                    <span>Profile</span>
                  </button>
                  {userType === 'provider' && (
                    <button
                      onClick={() => handleNavigation('/provider/dashboard')}
                      className='w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2'
                    >
                      <Store className='w-4 h-4' />
                      <span>Dashboard</span>
                    </button>
                  )}
                  <hr className='border-gray-100' />
                  <button
                    onClick={handleSignOut}
                    className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg flex items-center space-x-2'
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <NavLink to='/login'>Login</NavLink>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className='btn-primary text-sm px-3 py-2'
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => handleNavigation('/provider-register')}
                    className='btn-secondary text-sm px-3 py-2'
                  >
                    Provider
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label='Toggle mobile menu'
          >
            <MenuIcon className='w-6 h-6 text-gray-600' />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-100 animate-fade-in'>
            <div className='flex flex-col space-y-3'>
              <NavLink to='/' className='block py-2'>Home</NavLink>
              
              {userType === 'provider' ? (
                <>
                  <NavLink to='/provider/dashboard' className='block py-2'>Dashboard</NavLink>
                  <NavLink to='/provider/orders' className='block py-2'>Orders</NavLink>
                  <NavLink to='/provider/menu' className='block py-2'>Menu</NavLink>
                  <NavLink to='/provider/payments' className='block py-2'>Payments</NavLink>
                </>
              ) : (
                <>
                  <NavLink to='/menu' className='block py-2'>Menu</NavLink>
                  {user && (
                    <>
                      <NavLink to='/orders' className='block py-2'>Orders</NavLink>
                      <button
                        onClick={() => handleNavigation('/cart')}
                        className='flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors text-left py-2'
                      >
                        <ShoppingCart className='w-5 h-5' />
                        <span>Cart ({cartItemsCount})</span>
                      </button>
                    </>
                  )}
                </>
              )}
              
              {user ? (
                <>
                  <hr className='border-gray-200 my-2' />
                  <NavLink to='/profile' className='block py-2'>Profile</NavLink>
                  <button
                    onClick={handleSignOut}
                    className='text-left text-red-600 hover:text-red-700 transition-colors flex items-center space-x-2 py-2'
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <hr className='border-gray-200 my-2' />
                  <NavLink to='/login' className='block py-2'>Login</NavLink>
                  <div className='space-y-2 pt-2'>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className='btn-primary w-full text-center'
                    >
                      Customer Signup
                    </button>
                    <button
                      onClick={() => handleNavigation('/provider-register')}
                      className='btn-secondary w-full text-center'
                    >
                      Provider Signup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar