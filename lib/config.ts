// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000',
  
  // API Endpoints
  ENDPOINTS: {
    USERS: '/api/bonds/customers',
    BONDS: '/api/bonds',
    PURCHASES: '/api/purchases',
    LEDGER: '/api/ledger',
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get endpoint URL
export const getEndpointUrl = (key: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[key])
}
