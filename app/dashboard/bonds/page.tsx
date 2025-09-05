"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Plus, TrendingUp, Calendar, DollarSign, Globe, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthMiddleware from '@/components/auth/AuthMiddleware'

// Types based on the response.json structure
interface Bond {
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

interface ApiResponse {
  success: boolean
  data: Bond[]
  count: number
}

export default function BondsPage() {
  const { user: currentUser } = useAuth()
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [tenorFilter, setTenorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch bonds from API
  const fetchBonds = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/bonds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setBonds(data.data)
      } else {
        throw new Error('Failed to fetch bonds')
      }
    } catch (err) {
      let errorMessage = 'An error occurred while fetching bonds'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network Error: Unable to connect to the backend server. Please ensure:\n\n' +
            '1. The backend server is running on http://localhost:9000\n' +
            '2. The API endpoint /api/bonds is accessible\n' +
            '3. CORS is properly configured'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching bonds:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBonds()
  }, [])

  // Filter bonds based on search and filters
  const filteredBonds = bonds.filter(bond => {
    const matchesSearch = 
      bond.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bond.instrument_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bond.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bond.ISIN && bond.ISIN.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCountry = countryFilter === 'all' || bond.country === countryFilter
    const matchesTenor = tenorFilter === 'all' || bond.tenor.toString() === tenorFilter
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? bond.is_active : !bond.is_active)
    
    return matchesSearch && matchesCountry && matchesTenor && matchesStatus
  })

  // Get unique countries and tenors for filters
  const uniqueCountries = Array.from(new Set(bonds.map(bond => bond.country)))
  const uniqueTenors = Array.from(new Set(bonds.map(bond => bond.tenor))).sort((a, b) => a - b)

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

  // Calculate days to maturity
  const getDaysToMaturity = (maturityDate: string) => {
    const today = new Date()
    const maturity = new Date(maturityDate)
    const diffTime = maturity.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Loading state
  if (loading) {
    return (
      <AuthMiddleware>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bond Management</h1>
                <p className="text-gray-600">Manage and monitor all available bonds</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading bonds...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthMiddleware>
    )
  }

  // Error state
  if (error) {
    return (
      <AuthMiddleware>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bond Management</h1>
                <p className="text-gray-600">Manage and monitor all available bonds</p>
              </div>
              <Button onClick={fetchBonds} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
            
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bonds</h3>
                  <p className="text-gray-600 mb-4 whitespace-pre-line">{error}</p>
                  <Button onClick={fetchBonds} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthMiddleware>
    )
  }

  return (
    <AuthMiddleware>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bond Management</h1>
              <p className="text-gray-600">
                Manage and monitor all available bonds
                {currentUser && (
                  <span className="block text-sm text-gray-500 mt-1">
                    Logged in as: {currentUser.email} ({currentUser.role})
                  </span>
                )}
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Bond
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Bonds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{bonds.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Bonds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {bonds.filter(b => b.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    bonds.reduce((sum, bond) => sum + bond.available_amount, 0),
                    'UGX'
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Coupon Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(bonds.reduce((sum, bond) => sum + bond.coupon_rate, 0) / bonds.length).toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Find specific bonds or filter by criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, code, country, or ISIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Countries</option>
                    {uniqueCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <select
                    value={tenorFilter}
                    onChange={(e) => setTenorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Tenors</option>
                    {uniqueTenors.map(tenor => (
                      <option key={tenor} value={tenor.toString()}>{tenor} Years</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonds Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bonds ({filteredBonds.length})</CardTitle>
              <CardDescription>All available bonds with current market data</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBonds.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bonds found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || countryFilter !== 'all' || tenorFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters'
                      : 'No bonds are currently available'
                    }
                  </p>
                  {(searchTerm || countryFilter !== 'all' || tenorFilter !== 'all' || statusFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('')
                        setCountryFilter('all')
                        setTenorFilter('all')
                        setStatusFilter('all')
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
                        <TableHead>Bond Details</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Tenor</TableHead>
                        <TableHead>Coupon Rate</TableHead>
                        <TableHead>Yields</TableHead>
                        <TableHead>Available Amount</TableHead>
                        <TableHead>Maturity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBonds.map((bond) => {
                        const daysToMaturity = getDaysToMaturity(bond.maturity_date)
                        const isNearMaturity = daysToMaturity <= 365 // Within 1 year
                        
                        return (
                          <TableRow key={bond.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{bond.display_name}</div>
                                <div className="text-sm text-gray-500">{bond.instrument_code}</div>
                                {bond.ISIN && (
                                  <div className="text-xs text-gray-400">ISIN: {bond.ISIN}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <span>{bond.country}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {bond.tenor} Years
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-green-600">
                                {bond.coupon_rate}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-xs">
                                  <span className="text-gray-500">Bid: </span>
                                  <span className="font-medium text-green-600">{bond.bid_yield}%</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-gray-500">Offer: </span>
                                  <span className="font-medium text-green-600">{bond.offer_yield}%</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                {formatCurrency(bond.available_amount, bond.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(bond.maturity_date)}
                                </div>
                                <div className={`text-xs ${
                                  isNearMaturity ? 'text-orange-600' : 'text-gray-500'
                                }`}>
                                  {daysToMaturity > 0 ? `${daysToMaturity} days` : 'Matured'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={bond.is_active ? "default" : "secondary"}
                                className={bond.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {bond.is_active ? 'Active' : 'Inactive'}
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

          {/* Additional Bond Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bonds by Country</CardTitle>
                <CardDescription>Distribution across different countries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    bonds.reduce((acc, bond) => {
                      acc[bond.country] = (acc[bond.country] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{country}</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tenor Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bonds by Tenor</CardTitle>
                <CardDescription>Distribution across different maturities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    bonds.reduce((acc, bond) => {
                      acc[`${bond.tenor} Years`] = (acc[`${bond.tenor} Years`] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([tenor, count]) => (
                    <div key={tenor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{tenor}</span>
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
    </AuthMiddleware>
  )
}
