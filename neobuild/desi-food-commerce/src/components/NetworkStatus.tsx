import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOfflineMessage && isOnline) {
    return null
  }

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 transition-all duration-300 ${
      isOnline ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className={`mx-4 p-3 rounded-lg shadow-lg animate-slide-up ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className='flex items-center justify-center space-x-2'>
          {isOnline ? (
            <>
              <Wifi className='w-4 h-4' />
              <span className='text-sm font-medium'>Back online!</span>
            </>
          ) : (
            <>
              <WifiOff className='w-4 h-4' />
              <span className='text-sm font-medium'>No internet connection</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus