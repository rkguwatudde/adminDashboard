/**
 * API Utility Service
 * Centralized API calls with proper error handling and configuration
 */

import { API_CONFIG, buildApiUrl, getEndpointUrl, getCybridEndpointUrl } from './config'

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: any
}

// Recent Activity interface
export interface RecentActivity {
  type: 'user' | 'purchase' | 'bond' | 'payment'
  message: string
  entity_id: string
  created_at: string
  icon: string
  color: string
}

// Custom error class for API errors
export class ApiError extends Error {
  status?: number
  details?: any

  constructor(message: string, status?: number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

// Base API class with common functionality
class ApiService {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken')
    }
    return null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }

  /**
   * Clear authentication token
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    }
  }

  /**
   * Make a generic API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Simplified URL construction
    const url = this.baseURL + endpoint
    
    // Get authentication token
    const token = this.getAuthToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    }

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      
      // Parse response
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      // Handle non-2xx responses
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.clearAuth()
          // Redirect to login page if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
        
        throw new ApiError(
          data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        )
      }

      console.log(`API Response: ${response.status} ${url}`)
      return data

    } catch (error) {
      console.error(`API Error: ${options.method || 'GET'} ${url}`, error)
      
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408)
        }
        throw new ApiError(error.message, 0)
      }
      
      throw new ApiError('Unknown error occurred', 0)
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (endpoint === '/api/cybrid/trade' && data) {
      console.log('🌐 HTTP POST Request to:', this.baseURL + endpoint)
      console.log('📦 Request Body:', JSON.stringify(data, null, 2))
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create singleton instance
const apiService = new ApiService()

// Bond-related API calls
export const bondApi = {
  /**
   * Get all customers
   */
  getCustomers: () => apiService.get('/api/bonds/customers'),

  /**
   * Get bonds
   */
  getBonds: () => apiService.get('/api/bonds'),

  /**
   * Get purchases
   */
  getPurchases: () => apiService.get('/api/bonds/purchases'),

  /**
   * Get ledger data
   */
  getLedger: () => apiService.get('/api/ledger'),

  /**
   * Get recent activity data
   */
  getRecentActivity: () => apiService.get('/api/admin/recent-activity'),

  /**
   * Get filtered recent activity data
   */
  getFilteredRecentActivity: (params?: {
    type?: 'all' | 'user' | 'purchase' | 'bond' | 'payment';
    limit?: number;
    days?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.days) queryParams.append('days', params.days.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/api/admin/recent-activity/filtered${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get(endpoint);
  },
}

// Cybrid-related API calls
export const cybridApi = {
  /**
   * Get Cybrid access token
   */
  getToken: () => apiService.get('/api/cybrid/token'),

  /**
   * Get Cybrid configuration
   */
  getConfig: () => apiService.get('/api/cybrid/config'),

  /**
   * Test Cybrid authentication
   */
  testAuth: () => apiService.post('/api/cybrid/test'),

  /**
   * Create a transfer (frontend-friendly endpoint)
   */
  createTransfer: (transferData: {
    receive_amount: number
    customerGuid: string
    asset?: string
    side?: string
  }) => apiService.post('/api/cybrid/transfers/frontend', transferData),

  /**
   * Create a trade
   */
  createTrade: (tradeData: {
    customer_guid: string
    amount: number
    symbol: string
    side: string
    asset?: string
    product_type?: string
    user_id: string
  }) => {
    console.log('📡 API Service - createTrade called with data:', JSON.stringify(tradeData, null, 2))
    return apiService.post('/api/cybrid/trade', tradeData)
  },

  /**
   * Create complete trade flow (trade + Yellowcard + external wallet)
   */
  createTradeWithWallet: (tradeData: {
    customer_guid: string
    account_guid: string
    counterparty_guid: string
    amount: number
    symbol: string
    side: string
    userId: string
    asset?: string
    product_type?: string
  }) => apiService.post('/api/cybrid/trade-with-wallet', tradeData),

  /**
   * Get external wallet details
   */
  getExternalWallet: (walletId: string) => 
    apiService.get(`/api/cybrid/external-wallet/${walletId}`),

  /**
   * Validate external wallet parameters
   */
  validateExternalWallet: (walletData: {
    name: string
    customer_guid: string
    asset: string
    address: string
    tag?: string
  }) => apiService.post('/api/cybrid/external-wallet/validate', walletData),

  /**
   * Get Cybrid customer ID by user ID
   */
  getCustomerId: (userId: string) => 
    apiService.get(`/api/cybrid/customer-id?user_id=${userId}`),

  /**
   * Get all Cybrid customers (admin only)
   */
  getAllCustomers: () => apiService.get('/api/cybrid/customers'),

  /**
   * Create Cybrid customer mapping (admin only)
   */
  createCustomer: (customerData: {
    user_id: string
    cybrid_customer_id: string
  }) => apiService.post('/api/cybrid/customers', customerData),
}

// Generic API utilities
export const api = {
  /**
   * Generic GET request
   */
  get: <T>(endpoint: string) => apiService.get<T>(endpoint),

  /**
   * Generic POST request
   */
  post: <T>(endpoint: string, data?: any) => apiService.post<T>(endpoint, data),

  /**
   * Generic PUT request
   */
  put: <T>(endpoint: string, data?: any) => apiService.put<T>(endpoint, data),

  /**
   * Generic DELETE request
   */
  delete: <T>(endpoint: string) => apiService.delete<T>(endpoint),
}

// Export the service instance for advanced usage
export { apiService }

// Export authentication utilities
export const authUtils = {
  isAuthenticated: () => apiService.isAuthenticated(),
  clearAuth: () => apiService.clearAuth(),
}

// All exports are already declared above
