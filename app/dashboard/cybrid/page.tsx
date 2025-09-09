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

interface Customer {
  id: string
  name: string
  email: string
  status: string
  created_at: string
  total_bonds?: number
  total_value?: number
}

interface TransferFormData {
  receive_amount: number
  source_account_guid: string
  customerGuid: string
  asset: string
  side: string
}

export default function CybridPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [transferForm, setTransferForm] = useState<TransferFormData>({
    receive_amount: 0,
    source_account_guid: '',
    customerGuid: '',
    asset: 'USD',
    side: 'withdrawal'
  })

  // Fetch customers from the API
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bonds/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setCustomers(data.data)
        setFilteredCustomers(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      showToast('Failed to fetch customers', 'error')
      
      // Fallback mock data for development
      const mockCustomers: Customer[] = [
        {
          id: 'cbf96fd1a5eb21b0348d9168e68f3197',
          name: 'John Doe',
          email: 'john.doe@example.com',
          status: 'active',
          created_at: '2024-01-15T10:30:00Z',
          total_bonds: 5,
          total_value: 50000
        },
        {
          id: 'df913d789bb234bb2d9dfc1f0d33088c',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'active',
          created_at: '2024-02-20T14:45:00Z',
          total_bonds: 3,
          total_value: 25000
        },
        {
          id: 'a1b2c3d4e5f6789012345678901234ab',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          status: 'pending',
          created_at: '2024-03-10T09:15:00Z',
          total_bonds: 1,
          total_value: 10000
        }
      ]
      setCustomers(mockCustomers)
      setFilteredCustomers(mockCustomers)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setTransferForm(prev => ({
      ...prev,
      customerGuid: customer.id
    }))
    setTransferDialogOpen(true)
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      showToast('No customer selected', 'error')
      return
    }

    if (transferForm.receive_amount <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }

    if (!transferForm.source_account_guid.trim()) {
      showToast('Please enter a source account GUID', 'error')
      return
    }

    try {
      setSubmitting(true)
      
      const response = await fetch('/api/cybrid/transfers/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferForm)
      })

      const data = await response.json()

      if (data.success) {
        showToast('Transfer initiated successfully!', 'success')
        setTransferDialogOpen(false)
        setTransferForm({
          receive_amount: 0,
          source_account_guid: '',
          customerGuid: '',
          asset: 'USD',
          side: 'withdrawal'
        })
      } else {
        throw new Error(data.message || 'Transfer failed')
      }
    } catch (error) {
      console.error('Error submitting transfer:', error)
      showToast(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
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
            <h1 className="text-3xl font-bold text-gray-900">Cybrid Integration</h1>
            <p className="text-gray-600">
              Manage customer transfers and wallet operations through Cybrid.
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
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Customer Search
              </CardTitle>
              <CardDescription>
                Search and filter customers to initiate transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or customer ID..."
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
                Click on a customer to initiate a transfer
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
                  <p className="text-gray-600">No customers found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-400">ID: {customer.id}</p>
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
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                        <ArrowRightLeft className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
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
                  Initiate Transfer
                </DialogTitle>
                <DialogDescription>
                  Create a transfer for {selectedCustomer?.name}
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

                <div>
                  <Label htmlFor="source_account_guid">Source Account GUID</Label>
                  <Input
                    id="source_account_guid"
                    type="text"
                    placeholder="Enter source account GUID"
                    value={transferForm.source_account_guid}
                    onChange={(e) => setTransferForm(prev => ({
                      ...prev,
                      source_account_guid: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="asset">Asset</Label>
                  <Select
                    value={transferForm.asset}
                    onValueChange={(value) => setTransferForm(prev => ({
                      ...prev,
                      asset: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDC_SOL">USDC_SOL</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="side">Side</Label>
                  <Select
                    value={transferForm.side}
                    onValueChange={(value) => setTransferForm(prev => ({
                      ...prev,
                      side: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                    </SelectContent>
                  </Select>
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
                      'Initiate Transfer'
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
