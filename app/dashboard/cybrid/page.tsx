"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, Zap, ArrowRightLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { bondApi, cybridApi, ApiError } from '@/lib/api'

interface Customer {
  user_id?: string
  first_name?: string
  last_name?: string
  email?: string
  verification_status?: string
  created_at?: string
  total_bonds?: number
  total_value?: number
}

interface TradeFormData {
  customer_guid: string
  amount: number
  symbol: string
  side: string
  asset: string
  product_type: string
  user_id: string
}

interface CustomerIdMapping {
  user_id: string
  cybrid_customer_id: string
}

export default function CybridPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customerIdMappings, setCustomerIdMappings] = useState<CustomerIdMapping[]>([])
  const [fetchingCustomerId, setFetchingCustomerId] = useState(false)
  const [customerActions, setCustomerActions] = useState<Record<string, { initiating: boolean; finalizing: boolean }>>({})
  
  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    customer_guid: '',
    amount: 0,
    symbol: 'USDC_SOL-USD', // Hardcoded
    side: 'buy', // Hardcoded
    asset: 'USDC', // Hardcoded
    product_type: 'trading',
    user_id: ''
  })

  // Load customer ID mappings from localStorage on component mount
  useEffect(() => {
    const storedMappings = localStorage.getItem('cybrid_customer_mappings')
    if (storedMappings) {
      try {
        const mappings = JSON.parse(storedMappings) as CustomerIdMapping[]
        setCustomerIdMappings(mappings)
      } catch (error) {
        console.error('Error parsing stored customer mappings:', error)
      }
    }
  }, [])

  // Save customer ID mappings to localStorage
  const saveCustomerIdMapping = (mapping: CustomerIdMapping) => {
    const updatedMappings = [...customerIdMappings, mapping]
    setCustomerIdMappings(updatedMappings)
    localStorage.setItem('cybrid_customer_mappings', JSON.stringify(updatedMappings))
  }

  // Get customer ID mapping by user_id
  const getCustomerIdMapping = (userId: string): CustomerIdMapping | undefined => {
    return customerIdMappings.find(mapping => mapping.user_id === userId)
  }

  // Helper functions for customer actions
  const setCustomerAction = (userId: string, action: 'initiating' | 'finalizing', value: boolean) => {
    setCustomerActions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [action]: value
      }
    }))
  }

  const getCustomerAction = (userId: string, action: 'initiating' | 'finalizing'): boolean => {
    return customerActions[userId]?.[action] || false
  }

  // Fetch customers from the API
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer => {
        const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        return (
          (customer.first_name && customer.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.last_name && customer.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (fullName && fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.user_id && customer.user_id.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await bondApi.getCustomers()
      
      if (response.success && response.data) {
        setCustomers(response.data as Customer[])
        setFilteredCustomers(response.data as Customer[])
      } else {
        throw new Error(response.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      
      if (error instanceof ApiError) {
        toast({ 
          title: `Failed to fetch customers: ${error.message}`, 
          variant: 'destructive',
          description: 'Please ensure the backend server is running on http://localhost:9000'
        })
      } else {
        toast({ 
          title: 'Failed to fetch customers', 
          variant: 'destructive',
          description: 'Unable to connect to the backend API. Please check your connection.'
        })
      }
      
      // Set empty arrays on error - no fallback data
      setCustomers([])
      setFilteredCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerClick = async (customer: Customer) => {
    if (!customer.user_id) {
      toast({ title: 'Customer ID is missing', variant: 'destructive' })
      return
    }

    // Check if we already have the customer ID mapping
    const existingMapping = getCustomerIdMapping(customer.user_id)
    
    if (existingMapping) {
      // Use existing mapping
      setSelectedCustomer(customer)
      setTradeForm(prev => ({
        ...prev,
        customer_guid: existingMapping.cybrid_customer_id,
        user_id: customer.user_id || ''
      }))
      setTradeDialogOpen(true)
      return
    }

    // Fetch customer ID from API
    try {
      setFetchingCustomerId(true)
      const response = await cybridApi.getCustomerId(customer.user_id)
      
      if (response.success && response.data) {
        const data = response.data as { user_id: string; cybrid_customer_id: string }
        const mapping: CustomerIdMapping = {
          user_id: data.user_id,
          cybrid_customer_id: data.cybrid_customer_id
        }
        
        // Save to local storage
        saveCustomerIdMapping(mapping)
        
        // Set up trade form
        setSelectedCustomer(customer)
        setTradeForm(prev => ({
          ...prev,
          customer_guid: data.cybrid_customer_id,
          user_id: customer.user_id || ''
        }))
        setTradeDialogOpen(true)
        
        toast({ 
          title: 'Customer ID fetched successfully', 
          variant: 'success' 
        })
      } else {
        throw new Error(response.message || 'Failed to fetch customer ID')
      }
    } catch (error) {
      console.error('Error fetching customer ID:', error)
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          toast({ 
            title: 'Customer not found in Cybrid', 
            description: 'This customer does not have a Cybrid account yet.',
            variant: 'destructive' 
          })
        } else {
          toast({ 
            title: 'Error fetching customer ID', 
            description: error.message,
            variant: 'destructive' 
          })
        }
      } else {
        toast({ 
          title: 'Error fetching customer ID', 
          description: 'An unexpected error occurred',
          variant: 'destructive' 
        })
      }
    } finally {
      setFetchingCustomerId(false)
    }
  }

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      toast({ title: 'No customer selected', variant: 'destructive' })
      return
    }

    if (tradeForm.amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' })
      return
    }

    // Note: account_guid and counterparty_guid are now fetched automatically by the backend

    try {
      setSubmitting(true)
      
      // Log the request payload before sending
      console.log('🚀 Sending trade request with payload:', JSON.stringify(tradeForm, null, 2))
      
      const response = await cybridApi.createTrade(tradeForm)

      if (response.success) {
        toast({ title: 'Trade initiated successfully!', variant: 'success' })
        setTradeDialogOpen(false)
        setTradeForm({
          customer_guid: '',
          amount: 0,
          symbol: 'USDC_SOL-USD', // Hardcoded
          side: 'buy', // Hardcoded
          asset: 'USDC', // Hardcoded
          product_type: 'trading',
          user_id: ''
        })
      } else {
        throw new Error(response.message || 'Trade failed')
      }
    } catch (error) {
      console.error('Error submitting trade:', error)
      
      if (error instanceof ApiError) {
        toast({ title: `Trade failed: ${error.message}`, variant: 'destructive' })
      } else {
        toast({ title: `Trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' })
      }
    } finally {
      setSubmitting(false)
    }
  }


  // Action button handlers for customer rows
  const handleInitiateTradeFromRow = async (customer: Customer) => {
    if (!customer.user_id) {
      toast({ title: 'Customer ID is missing', variant: 'destructive' })
      return
    }

    // Check if we already have the customer ID mapping
    const existingMapping = getCustomerIdMapping(customer.user_id)
    
    if (existingMapping) {
      // Use existing mapping and open dialog
      setSelectedCustomer(customer)
      setTradeForm(prev => ({
        ...prev,
        customer_guid: existingMapping.cybrid_customer_id,
        user_id: customer.user_id || ''
      }))
      setTradeDialogOpen(true)
      return
    }

    // Fetch customer ID from API
    try {
      setCustomerAction(customer.user_id, 'initiating', true)
      const response = await cybridApi.getCustomerId(customer.user_id)
      
      if (response.success && response.data) {
        const data = response.data as { user_id: string; cybrid_customer_id: string }
        const mapping: CustomerIdMapping = {
          user_id: data.user_id,
          cybrid_customer_id: data.cybrid_customer_id
        }
        
        // Save to local storage
        saveCustomerIdMapping(mapping)
        
        // Set up trade form and open dialog
        setSelectedCustomer(customer)
        setTradeForm(prev => ({
          ...prev,
          customer_guid: data.cybrid_customer_id,
          user_id: customer.user_id || ''
        }))
        setTradeDialogOpen(true)
        
        toast({ 
          title: 'Customer ID fetched successfully', 
          variant: 'success' 
        })
      } else {
        throw new Error(response.message || 'Failed to fetch customer ID')
      }
    } catch (error) {
      console.error('Error fetching customer ID:', error)
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          toast({ 
            title: 'Customer not found in Cybrid', 
            description: 'This customer does not have a Cybrid account yet.',
            variant: 'destructive' 
          })
        } else {
          toast({ 
            title: 'Error fetching customer ID', 
            description: error.message,
            variant: 'destructive' 
          })
        }
      } else {
        toast({ 
          title: 'Error fetching customer ID', 
          description: 'An unexpected error occurred',
          variant: 'destructive' 
        })
      }
    } finally {
      setCustomerAction(customer.user_id, 'initiating', false)
    }
  }

  const handleFinalizeTradeFromRow = async (customer: Customer) => {
    if (!customer.user_id) {
      toast({ title: 'Customer ID is missing', variant: 'destructive' })
      return
    }

    // Check if we have the customer ID mapping
    const existingMapping = getCustomerIdMapping(customer.user_id)
    
    if (!existingMapping) {
      toast({ 
        title: 'Customer ID not found', 
        description: 'Please initiate a trade first to fetch the customer ID.',
        variant: 'destructive' 
      })
      return
    }

    try {
      setCustomerAction(customer.user_id, 'finalizing', true)
      
      const finalizeData = {
        customer_guid: existingMapping.cybrid_customer_id,
        user_id: customer.user_id
      }
      
      // Log the request payload before sending
      console.log('🚀 Sending finalize trade request with payload:', JSON.stringify(finalizeData, null, 2))
      
      const response = await cybridApi.finalizeTrade(finalizeData)

      if (response.success) {
        toast({ 
          title: 'Trade finalized successfully!', 
          description: `Trade completed for ${customer.first_name || customer.last_name || 'customer'}`,
          variant: 'success' 
        })
      } else {
        throw new Error(response.message || 'Trade finalization failed')
      }
    } catch (error) {
      console.error('Error finalizing trade:', error)
      
      if (error instanceof ApiError) {
        toast({ 
          title: `Trade finalization failed: ${error.message}`, 
          variant: 'destructive' 
        })
      } else {
        toast({ 
          title: `Trade finalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          variant: 'destructive' 
        })
      }
    } finally {
      setCustomerAction(customer.user_id, 'finalizing', false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'unknown':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cybrid Trading</h1>
            <p className="text-gray-600">
              Manage customer trades through Cybrid's trading infrastructure.
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Role:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'ADMIN' ? 'bg-green-100 text-green-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Customer Search
                  </CardTitle>
                  <CardDescription>
                    Search and filter customers to access trade actions
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchCustomers}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Customers List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers ({filteredCustomers.length})
              </CardTitle>
              <CardDescription>
                Use action buttons to initiate or finalize trades, or click customer info to open trade dialog
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  <span className="ml-2 text-gray-600">Loading customers...</span>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No customers found matching your search' : 'No customers available'}
                  </p>
                  {searchTerm ? (
                    <p className="text-sm text-gray-500 mt-2">
                      Try adjusting your search terms
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      Customers will appear here once they are loaded from the backend
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => {
                    const hasCybridId = getCustomerIdMapping(customer.user_id || '')
                    const isFetching = fetchingCustomerId && selectedCustomer?.user_id === customer.user_id
                    const isInitiating = getCustomerAction(customer.user_id || '', 'initiating')
                    const isFinalizing = getCustomerAction(customer.user_id || '', 'finalizing')
                    
                    return (
                      <div
                        key={customer.user_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div 
                          className="flex items-center space-x-4 flex-1 cursor-pointer"
                          onClick={() => handleCustomerClick(customer)}
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {isFetching ? (
                              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                            ) : (
                              <Zap className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {customer.first_name && customer.last_name 
                                ? `${customer.first_name} ${customer.last_name}`
                                : customer.first_name || customer.last_name || 'Unknown Name'
                              }
                            </h3>
                            <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
                            <p className="text-xs text-gray-400">ID: {customer.user_id || 'No ID'}</p>
                            {hasCybridId && (
                              <p className="text-xs text-blue-600 font-medium">
                                ✓ Cybrid ID: {hasCybridId.cybrid_customer_id}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {customer.total_bonds || 0} bonds
                            </p>
                            <p className="text-sm text-gray-500">
                              ${customer.total_value?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(customer.verification_status || 'unknown')}>
                            {customer.verification_status || 'unknown'}
                          </Badge>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInitiateTradeFromRow(customer)
                              }}
                              disabled={isInitiating || isFinalizing}
                              className="text-xs px-3 py-1"
                            >
                              {isInitiating ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Loading...
                                </>
                              ) : (
                                'Initiate Trade'
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFinalizeTradeFromRow(customer)
                              }}
                              disabled={isInitiating || isFinalizing || !hasCybridId}
                              className="text-xs px-3 py-1"
                            >
                              {isFinalizing ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Finalizing...
                                </>
                              ) : (
                                'Finalize Trade'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trade Dialog */}
          <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Initiate Trade
                </DialogTitle>
                <DialogDescription>
                  Create a new trade for {selectedCustomer?.first_name && selectedCustomer?.last_name 
                    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                    : selectedCustomer?.first_name || selectedCustomer?.last_name || 'this customer'
                  }
                  {tradeForm.customer_guid && (
                    <div className="mt-2 text-sm text-blue-600">
                      ✓ Using Cybrid Customer ID: {tradeForm.customer_guid}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Trade Information */}
                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                  <p><strong>Account GUIDs:</strong> Automatically fetched from customer's Cybrid accounts</p>
                  <p className="text-xs text-gray-400 mt-1">Trading account and fiat account GUIDs are retrieved dynamically</p>
                </div>

                {/* Hardcoded values - not shown to user */}
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  <p><strong>Symbol:</strong> USDC_SOL-USD</p>
                  <p><strong>Side:</strong> Buy</p>
                  <p><strong>Asset:</strong> USDC</p>
                  <p className="text-xs text-gray-400 mt-1">These values are automatically set for all trades</p>
                </div>

                {/* Trade Form */}
                <form onSubmit={handleTradeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount"
                      value={tradeForm.amount || ''}
                      onChange={(e) => setTradeForm(prev => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0
                      }))}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the amount for the trade</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Initiating Trade...
                        </>
                      ) : (
                        'Initiate Trade'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTradeDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    
  )
}
