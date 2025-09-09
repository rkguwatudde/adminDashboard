"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Calendar, DollarSign, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Clock, User, Building } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

// Types based on the JSON response structures
interface BondPurchase {
  id: string
  user_profile_id: string
  available_bond_id: string
  maturity_date: string
  coupon_frequency: number
  coupon_interval_days: number
  amount: number
  gross_income: number
  net_income: number
  next_coupon_date: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  is_active: boolean
  available_bonds: {
    id: string
    ISIN: string
    tenor: number
    country: string
    currency: string
    bid_yield: number
    is_active: boolean
    created_at: string
    updated_at: string
    coupon_rate: number
    offer_yield: number
    display_name: string
    maturity_date: string
    instrument_code: string
    withholding_tax: number
    available_amount: number
    price_update_date: string
  }
  user_profiles: {
    dob: string
    city: string
    email: string
    phone: string
    state: string
    gender: string
    status: string
    address: string
    user_id: string
    employer: string
    zip_code: string
    full_name: string
    last_name: string
    user_type: string
    created_at: string
    first_name: string
    occupation: string
    updated_at: string
    citizenship: string
    display_name: string
    marital_status: string
    street_address: string | null
    onboarding_step: number
    verification_id: string | null
    agreement_pdf_url: string | null
    employment_status: string
    veriff_session_id: string
    csd_account_number: string | null
    agreement_submitted: boolean
    agreement_timestamp: string | null
    profile_picture_url: string | null
    verification_status: string
    compliance_docs_sent: boolean
    onboarding_completed: boolean
    precise_fp_client_id: string | null
    verification_details: string | null
    agreement_document_id: string | null
    custodian_account_name: string | null
    compliance_docs_sent_at: string | null
    onboarding_completed_at: string
    us_tax_residence_status: string
    custodian_account_number: string | null
    precise_fp_form_completed: boolean
    precise_fp_completion_date: string | null
    cybrid_integration_completed: boolean
    investment_strategy_complete: boolean
    borabond_onboarding_completed: boolean
  }
}

interface AvailableBond {
  id: string
  instrument_code: string
  display_name: string
  country: string
  currency: string
  maturity_date: string
  tenor: number
  coupon_rate: number
  bid_yield: number
  offer_yield: number
  available_amount: number
  is_active: boolean
  price_update_date: string
  created_at: string
  updated_at: string
  ISIN: string | null
  withholding_tax: number
}

interface Customer {
  user_id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  display_name: string | null
  phone: string | null
  status: string
  user_type: string
  created_at: string
  updated_at: string
}

interface CreatePurchaseRequest {
  userProfileId: string
  availableBondId: string
  amount: number
}

interface CreatePurchaseResponse {
  success: boolean
  message: string
  data: {
    id: string
    user_profile_id: string
    available_bond_id: string
    maturity_date: string
    coupon_frequency: number
    coupon_interval_days: number
    amount: number
    gross_income: number
    net_income: number
    next_coupon_date: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    is_active: boolean
    availableBond: AvailableBond
    userProfile: any
    nextCouponDate: string
  }
}

interface NextPaymentResponse {
  success: boolean
  data: {
    nextPaymentDate: string
    purchase: BondPurchase
    availableBond: AvailableBond
  }
}

interface CustomerPurchasesResponse {
  success: boolean
  data: BondPurchase[]
  count: number
}

export default function PurchasesPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [purchases, setPurchases] = useState<BondPurchase[]>([])
  const [availableBonds, setAvailableBonds] = useState<AvailableBond[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  
  // Create purchase modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreatePurchaseRequest>({
    userProfileId: '',
    availableBondId: '',
    amount: 0
  })
  
  // Customer selection state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // Next payment state
  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null)
  const [nextPaymentLoading, setNextPaymentLoading] = useState(false)

  // Fetch all bond purchases
  const fetchPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/bonds/purchases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: CustomerPurchasesResponse = await response.json()
      
      if (data.success) {
        setPurchases(data.data)
      } else {
        throw new Error('Failed to fetch purchases')
      }
    } catch (err) {
      let errorMessage = 'An error occurred while fetching purchases'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network Error: Unable to connect to the backend server. Please ensure:\n\n' +
            '1. The backend server is running on http://localhost:9000\n' +
            '2. The API endpoint /api/bonds/purchases is accessible\n' +
            '3. CORS is properly configured'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching purchases:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch available bonds for purchase creation
  const fetchAvailableBonds = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/bonds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAvailableBonds(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching available bonds:', err)
    }
  }

  // Fetch customers for purchase creation
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/bonds/customers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        if (data.success) {
          console.log('Customers data:', data.data)
          
          // Validate customer data structure
          const validCustomers = data.data.filter((customer: any) => {
            const isValid = customer && customer.user_id && (customer.full_name || customer.email || customer.display_name || (customer.first_name && customer.last_name))
            if (!isValid) {
              console.warn('Invalid customer data:', customer)
            }
            return isValid
          })
          
          console.log('Valid customers:', validCustomers)
          setCustomers(validCustomers)
          setFilteredCustomers(validCustomers)
          
          toast({
            title: "Customers loaded",
            description: `Successfully loaded ${validCustomers.length} customers`,
            variant: "default",
          })
        } else {
          console.error('Failed to fetch customers:', data.message)
          toast({
            title: "Error loading customers",
            description: data.message || "Failed to fetch customers",
            variant: "destructive",
          })
        }
      } else {
        console.error('HTTP error! status:', response.status)
        toast({
          title: "Error loading customers",
          description: `HTTP error! status: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
      toast({
        title: "Error loading customers",
        description: "Network error occurred while fetching customers",
        variant: "destructive",
      })
    } finally {
      setCustomersLoading(false)
    }
  }

  // Fetch next payment date
  const fetchNextPaymentDate = async () => {
    try {
      setNextPaymentLoading(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/bonds/purchases/next-payment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data: NextPaymentResponse = await response.json()
        if (data.success) {
          setNextPaymentDate(data.data.nextPaymentDate)
        }
      }
    } catch (err) {
      console.error('Error fetching next payment date:', err)
    } finally {
      setNextPaymentLoading(false)
    }
  }

  // Create new bond purchase
  const handleCreatePurchase = async () => {
    try {
      setCreateLoading(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/bonds/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: CreatePurchaseResponse = await response.json()
      
      if (data.success) {
        // Refresh purchases list
        await fetchPurchases()
        // Reset form and close modal
        setCreateForm({
          userProfileId: '',
          availableBondId: '',
          amount: 0
        })
        setSelectedCustomer(null) // Clear selected customer
        setFilteredCustomers(customers) // Reset search filter
        setIsCreateModalOpen(false)
        // Show success message
        toast({
          title: "Purchase created",
          description: "Bond purchase created successfully!",
          variant: "default",
        })
      } else {
        throw new Error(data.message || 'Failed to create purchase')
      }
    } catch (err) {
      let errorMessage = 'An error occurred while creating the purchase'
      
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      toast({
        title: "Error creating purchase",
        description: errorMessage,
        variant: "destructive",
      })
      console.error('Error creating purchase:', err)
    } finally {
      setCreateLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchPurchases()
    fetchAvailableBonds()
    fetchCustomers()
    fetchNextPaymentDate()
  }, [])

  // Filter purchases based on search and filters
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.user_profiles.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.available_bonds.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.available_bonds.ISIN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.user_profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || purchase.is_active.toString() === statusFilter
    const matchesCustomer = customerFilter === 'all' || purchase.user_profile_id === customerFilter
    
    return matchesSearch && matchesStatus && matchesCustomer
  })

  // Get unique customers for filter
  const uniqueCustomers = Array.from(new Set(purchases.map(p => p.user_profile_id)))

  // Format currency amounts
  const formatCurrency = (amount: number, currency: string) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B ${currency}`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${currency}`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ${currency}`
    }
    return `${amount.toLocaleString()} ${currency}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate days to next coupon
  const getDaysToNextCoupon = (nextCouponDate: string) => {
    const today = new Date()
    const nextCoupon = new Date(nextCouponDate)
    const diffTime = nextCoupon.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Search customers
  const searchCustomers = (searchTerm: string) => {
    if (!customers || customers.length === 0) {
      setFilteredCustomers([])
      return
    }
    
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers)
      return
    }
    
    const filtered = customers.filter(customer =>
      (customer.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    setFilteredCustomers(filtered)
  }

  // Get customer display name safely
  const getCustomerDisplayName = (customer: Customer) => {
    if (!customer) return 'Unknown Customer'
    
    const name = customer.full_name || 
                 (customer.first_name && customer.last_name ? `${customer.first_name} ${customer.last_name}` : null) ||
                 customer.display_name ||
                 customer.email?.split('@')[0] || 
                 'Unknown Name'
    const email = customer.email || 'No Email'
    
    return `${name} — ${email}`
  }

  // Get selected customer display name
  const getSelectedCustomerDisplay = () => {
    console.log('getSelectedCustomerDisplay called with:', selectedCustomer)
    if (!selectedCustomer) return ''
    return getCustomerDisplayName(selectedCustomer)
  }

  // Handle customer selection
  const handleCustomerSelection = (customerId: string) => {
    if (!customerId || customerId === '') {
      console.log('No customer ID provided')
      setSelectedCustomer(null)
      setCreateForm(prev => ({ ...prev, userProfileId: '' }))
      return
    }
    
    console.log('Selecting customer ID:', customerId)
    console.log('Available customers:', customers)
    
    const customer = customers.find(c => c.user_id === customerId)
    console.log('Found customer:', customer)
    
    if (!customer) {
      console.error('Customer not found for ID:', customerId)
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      })
      setSelectedCustomer(null)
      setCreateForm(prev => ({ ...prev, userProfileId: '' }))
      return
    }
    
    setSelectedCustomer(customer)
    setCreateForm(prev => ({ ...prev, userProfileId: customerId }))
    
    toast({
      title: "Customer selected",
      description: `${customer.full_name || 'Unknown Name'} selected successfully`,
      variant: "default",
    })
  }

  // Check if form is valid
  const isFormValid = () => {
    return createForm.userProfileId && 
           createForm.availableBondId && 
           createForm.amount > 0
  }

  // Loading state
  if (loading) {
    return (
      
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bond Purchases</h1>
                <p className="text-gray-600">Manage and monitor customer bond purchases</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading purchases...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      
    )
  }

  // Error state
  if (error) {
    return (
      
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bond Purchases</h1>
                <p className="text-gray-600">Manage and monitor customer bond purchases</p>
              </div>
              <Button onClick={fetchPurchases} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
            
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Purchases</h3>
                  <p className="text-gray-600 mb-4 whitespace-pre-line">{error}</p>
                  <Button onClick={fetchPurchases} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      
    )
  }

  return (
    
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bond Purchases</h1>
              <p className="text-gray-600">
                Manage and monitor customer bond purchases
                {currentUser && (
                  <span className="block text-sm text-gray-500 mt-1">
                    Logged in as: {currentUser.email} ({currentUser.role})
                  </span>
                )}
              </p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={(open: boolean) => {
              setIsCreateModalOpen(open)
              if (open) {
                // Reset form and selections when opening modal
                setCreateForm({
                  userProfileId: '',
                  availableBondId: '',
                  amount: 0
                })
                setSelectedCustomer(null)
                setFilteredCustomers(customers)
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Bond Purchase</DialogTitle>
                  <DialogDescription>
                    Create a new bond purchase for a customer
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="userProfileId" className="text-right">
                      Customer
                    </Label>
                    <div className="col-span-3 flex flex-col gap-2">
                      {customers.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {filteredCustomers.length === customers.length 
                            ? `${customers.length} customers available`
                            : `${filteredCustomers.length} of ${customers.length} customers shown`
                          }
                        </div>
                      )}
                      <div className="flex gap-2">
                      <Select 
                        value={createForm.userProfileId} 
                        onValueChange={handleCustomerSelection}
                        disabled={customersLoading || filteredCustomers.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {selectedCustomer 
                              ? getCustomerDisplayName(selectedCustomer)
                              : customersLoading 
                                ? "Loading customers..." 
                                : filteredCustomers.length === 0 
                                  ? "No customers available" 
                                  : "Select a customer"
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {customersLoading ? (
                            <div className="px-3 py-2 text-center text-gray-500 flex items-center justify-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Loading customers...
                            </div>
                          ) : filteredCustomers.length === 0 ? (
                            <div className="px-3 py-2 text-center text-gray-500">
                              {customers.length === 0 ? "No customers available" : "No customers match your search"}
                            </div>
                          ) : (
                            <>
                              <div className="px-3 py-2 border-b">
                                <Input
                                  placeholder="Search customers..."
                                  className="h-8 text-sm"
                                  onChange={(e) => searchCustomers(e.target.value)}
                                />
                              </div>
                              {filteredCustomers.map((customer) => (
                                <SelectItem key={customer.user_id} value={customer.user_id}>
                                                                      <div className="flex flex-col">
                                      <span className="font-medium">{customer.full_name || (customer.first_name && customer.last_name ? `${customer.first_name} ${customer.last_name}` : null) || customer.display_name || customer.email?.split('@')[0] || 'Unknown Name'}</span>
                                      <span className="text-sm text-gray-500">{customer.email || 'No Email'}</span>
                                    </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                        {(filteredCustomers.length === 0 || customersLoading) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fetchCustomers}
                            disabled={customersLoading}
                            className="px-3"
                          >
                            <RefreshCw className={`h-4 w-4 ${customersLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                      </div>
                      {selectedCustomer && (
                        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border">
                          ✓ Selected: {selectedCustomer.full_name || 'Unknown Name'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="availableBondId" className="text-right">
                      Bond
                    </Label>
                    <Select 
                      value={createForm.availableBondId} 
                      onValueChange={(value: string) => setCreateForm({...createForm, availableBondId: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a bond" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBonds.map((bond) => (
                          <SelectItem key={bond.id} value={bond.id}>
                            {bond.display_name} - {bond.tenor}Y {bond.coupon_rate}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({...createForm, amount: parseInt(e.target.value) || 0})}
                      className="col-span-3"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleCreatePurchase}
                    disabled={createLoading || !createForm.userProfileId || !createForm.availableBondId || createForm.amount <= 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Purchase'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{purchases.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {purchases.filter(p => p.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
                    'UGX'
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Next Payment</CardTitle>
              </CardHeader>
              <CardContent>
                {nextPaymentLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                ) : nextPaymentDate ? (
                  <div className="text-lg font-bold text-purple-600">
                    {formatDate(nextPaymentDate)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No upcoming payments</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Find specific purchases or filter by criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by customer name, bond name, ISIN, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Customers</option>
                    {uniqueCustomers.map(customerId => {
                      const customer = purchases.find(p => p.user_profile_id === customerId)
                      return customer ? (
                        <option key={customerId} value={customerId}>
                          {customer.user_profiles.display_name}
                        </option>
                      ) : null
                    })}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchases ({filteredPurchases.length})</CardTitle>
              <CardDescription>All customer bond purchases with details</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || customerFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters'
                      : 'No bond purchases are currently available'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all' || customerFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setCustomerFilter('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Bond Details</TableHead>
                        <TableHead>Purchase Amount</TableHead>
                        <TableHead>Income</TableHead>
                        <TableHead>Next Coupon</TableHead>
                        <TableHead>Maturity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase) => {
                        const daysToNextCoupon = getDaysToNextCoupon(purchase.next_coupon_date)
                        const isNearCoupon = daysToNextCoupon <= 30 // Within 30 days
                        
                        return (
                          <TableRow key={purchase.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{purchase.user_profiles.display_name}</div>
                                <div className="text-sm text-gray-500">{purchase.user_profiles.email}</div>
                                <div className="text-xs text-gray-400">{purchase.user_profiles.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{purchase.available_bonds.display_name}</div>
                                <div className="text-sm text-gray-500">{purchase.available_bonds.instrument_code}</div>
                                {purchase.available_bonds.ISIN && (
                                  <div className="text-xs text-gray-400">ISIN: {purchase.available_bonds.ISIN}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {formatCurrency(purchase.amount, purchase.available_bonds.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-xs">
                                  <span className="text-gray-500">Gross: </span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(purchase.gross_income, purchase.available_bonds.currency)}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-gray-500">Net: </span>
                                  <span className={`font-medium ${
                                    purchase.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {formatCurrency(purchase.net_income, purchase.available_bonds.currency)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(purchase.next_coupon_date)}
                                </div>
                                <div className={`text-xs ${
                                  isNearCoupon ? 'text-orange-600' : 'text-gray-500'
                                }`}>
                                  {daysToNextCoupon > 0 ? `${daysToNextCoupon} days` : 'Due today'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {formatDate(purchase.maturity_date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={purchase.is_active ? "default" : "secondary"}
                                className={purchase.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {purchase.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Purchases by Customer</CardTitle>
                <CardDescription>Distribution across different customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    purchases.reduce((acc, purchase) => {
                      const customerName = purchase.user_profiles.display_name
                      acc[customerName] = (acc[customerName] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([customerName, count]) => (
                    <div key={customerName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{customerName}</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bond Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Purchases by Bond Type</CardTitle>
                <CardDescription>Distribution across different bond types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    purchases.reduce((acc, purchase) => {
                      const bondType = `${purchase.available_bonds.tenor}Y ${purchase.available_bonds.coupon_rate}%`
                      acc[bondType] = (acc[bondType] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([bondType, count]) => (
                    <div key={bondType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{bondType}</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    
  )
}
