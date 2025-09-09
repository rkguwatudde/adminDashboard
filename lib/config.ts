// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000',
  
  // API Endpoints
  ENDPOINTS: {
    // Bond-related endpoints
    USERS: '/api/bonds/customers',
    BONDS: '/api/bonds',
    PURCHASES: '/api/purchases',
    LEDGER: '/api/ledger',
    
    // Cybrid endpoints
    CYBRID: {
      TOKEN: '/api/cybrid/token',
      CONFIG: '/api/cybrid/config',
      TEST: '/api/cybrid/test',
      TRANSFER: '/api/cybrid/transfer',
      TRANSFERS: '/api/cybrid/transfers',
      TRANSFERS_FRONTEND: '/api/cybrid/transfers/frontend',
      QUOTE: '/api/cybrid/quote',
      TRADE: '/api/cybrid/trade',
      TRADE_WITH_WALLET: '/api/cybrid/trade-with-wallet',
      EXTERNAL_WALLET: '/api/cybrid/external-wallet',
      CUSTOMER_ID: '/api/cybrid/customer-id',
      CUSTOMERS: '/api/cybrid/customers',
    },
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000, // Increased for Cybrid operations
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get endpoint URL (for non-Cybrid endpoints)
export const getEndpointUrl = (key: 'USERS' | 'BONDS' | 'PURCHASES' | 'LEDGER'): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[key])
}

// Helper function to get Cybrid endpoint URL
export const getCybridEndpointUrl = (key: keyof typeof API_CONFIG.ENDPOINTS.CYBRID): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.CYBRID[key])
}

// Environment configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000',
}
