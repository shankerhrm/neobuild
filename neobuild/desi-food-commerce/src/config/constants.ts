// Application constants
export const APP_CONFIG = {
  name: 'Desi Food Commerce',
  version: '1.0.0',
  description: 'Authentic homemade food delivery platform',
  
  // Business rules
  deliveryRadius: 2, // km
  estimatedDeliveryTime: 10, // minutes
  taxRate: 0.05, // 5%
  
  // UI constants
  itemsPerPage: 12,
  maxCartItems: 50,
  
  // Validation rules
  minPasswordLength: 6,
  maxOrderNotes: 500,
  
  // Contact info (can be public)
  supportEmail: 'support@desifoods.com',
  supportPhone: '+91 98765 43210'
} as const

// Feature flags
export const FEATURES = {
  enableReviews: true,
  enableRealTimeTracking: true,
  enablePaymentGateway: true,
  enableNotifications: true,
  enableAnalytics: false // Disabled for privacy
} as const

// API endpoints (relative paths)
export const API_ENDPOINTS = {
  auth: '/auth/v1',
  database: '/rest/v1',
  storage: '/storage/v1'
} as const