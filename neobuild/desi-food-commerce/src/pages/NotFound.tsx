import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"

const NotFound = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-primary-600 mb-4'>404</h1>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Page Not Found</h2>
          <p className='text-gray-600 max-w-md mx-auto mb-8'>
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link 
            to='/' 
            className='btn-primary flex items-center space-x-2 justify-center'
          >
            <Home className='w-5 h-5' />
            <span>Go Home</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className='btn-secondary flex items-center space-x-2 justify-center'
          >
            <ArrowLeft className='w-5 h-5' />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound