"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, Wallet, ArrowRightLeft, Loader2 } from 'lucide-react'
import AuthMiddleware from '@/components/auth/AuthMiddleware'
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

interface TransferFormData {
  receive_amount: number
  customerGuid: string
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
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customerIdMappings, setCustomerIdMappings] = useState<CustomerIdMapping[]>([])
  const [fetchingCustomerId, setFetchingCustomerId] = useState(false)
  
  const [transferForm, setTransferForm] = useState<TransferFormData>({
    receive_amount: 0,
    customerGuid: ''
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
      setTransferForm(prev => ({
        ...prev,
        customerGuid: existingMapping.cybrid_customer_id
      }))
      setTransferDialogOpen(true)
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
        
        // Set up transfer form
        setSelectedCustomer(customer)
        setTransferForm(prev => ({
          ...prev,
          customerGuid: data.cybrid_customer_id
        }))
        setTransferDialogOpen(true)
        
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

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      toast({ title: 'No customer selected', variant: 'destructive' })
      return
    }

    if (transferForm.receive_amount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' })
      return
    }

    // Note: source_account_guid is now fetched automatically by the backend

    try {
      setSubmitting(true)
      
      // Add default values for asset and side
      const requestPayload = {
        ...transferForm,
        asset: 'USD',
        side: 'withdrawal'
      }
      
      console.log('🚀 Sending book transfer request with payload:', JSON.stringify(requestPayload, null, 2))
      
      const response = await cybridApi.createTransfer(requestPayload)

      if (response.success) {
        toast({ title: 'Book transfer initiated successfully!', variant: 'success' })
        setTransferDialogOpen(false)
        setTransferForm({
          receive_amount: 0,
          customerGuid: ''
        })
      } else {
        throw new Error(response.message || 'Book transfer failed')
      }
    } catch (error) {
      console.error('Error submitting book transfer:', error)
      
      if (error instanceof ApiError) {
        toast({ title: `Book transfer failed: ${error.message}`, variant: 'destructive' })
      } else {
        toast({ title: `Book transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' })
      }
    } finally {
      setSubmitting(false)
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
    <AuthMiddleware>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cybrid Book Transfers</h1>
            <p className="text-gray-600">
              Manage customer book transfers through Cybrid's banking infrastructure.
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
                    Search and filter customers to initiate book transfers
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
                Click on a customer to initiate a book transfer
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
                    
                    return (
                      <div
                        key={customer.user_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleCustomerClick(customer)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            {isFetching ? (
                              <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                            ) : (
                              <Users className="h-5 w-5 text-green-600" />
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
                              <p className="text-xs text-green-600 font-medium">
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
                          <ArrowRightLeft className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Dialog */}
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Initiate Book Transfer
                </DialogTitle>
                <DialogDescription>
                  Create a book transfer for {selectedCustomer?.first_name && selectedCustomer?.last_name 
                    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                    : selectedCustomer?.first_name || selectedCustomer?.last_name || 'this customer'
                  }
                  {transferForm.customerGuid && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ Using Cybrid Customer ID: {transferForm.customerGuid}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="receive_amount">Amount</Label>
                  <Input
                    id="receive_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={transferForm.receive_amount || ''}
                    onChange={(e) => setTransferForm(prev => ({
                      ...prev,
                      receive_amount: parseFloat(e.target.value) || 0
                    }))}
                    required
                  />
                </div>

                {/* Source Account GUID is now fetched automatically by the backend */}
                <div className="text-sm text-gray-500 bg-green-50 p-3 rounded-md">
                  <p><strong>Source Account GUID:</strong> Automatically fetched from customer's fiat account</p>
                  <p className="text-xs text-gray-400 mt-1">The fiat account GUID is retrieved dynamically from Cybrid</p>
                </div>

                {/* Asset and Side are now set as default values */}
                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                  <p><strong>Asset:</strong> USD (automatically set)</p>
                  <p><strong>Side:</strong> Withdrawal (automatically set)</p>
                  <p className="text-xs text-gray-400 mt-1">These values are automatically configured for all book transfers</p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTransferDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Initiate Book Transfer'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthMiddleware>
  )
}
