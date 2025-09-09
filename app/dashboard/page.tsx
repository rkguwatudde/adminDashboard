"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, ShoppingCart, DollarSign, Calendar, Activity, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { bondApi, RecentActivity } from '@/lib/api'
import { useState, useEffect } from 'react'

// Dashboard metrics interface
interface DashboardMetrics {
  totalUsers: number
  activeBonds: number
  totalPurchases: number
  loading: boolean
  error: string | null
}

// Chart data interfaces
interface BondPerformanceData {
  name: string
  value: number
  yield: number
  country: string
  originalAmount?: number
}

interface UserActivityData {
  name: string
  users: number
  purchases: number
}

interface BondTypesData {
  name: string
  value: number
  color: string
}

// Static data removed - now using real data from APIs

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeBonds: 0,
    totalPurchases: 0,
    loading: true,
    error: null
  })

  // Chart data state
  const [bondPerformanceData, setBondPerformanceData] = useState<BondPerformanceData[]>([])
  const [userActivityData, setUserActivityData] = useState<UserActivityData[]>([])
  const [bondTypesData, setBondTypesData] = useState<BondTypesData[]>([])
  const [chartsLoading, setChartsLoading] = useState(true)

  // Recent activity state
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Helper function to format large numbers
  const formatAmount = (amount: number): number => {
    if (amount >= 1000000000) {
      return Math.round(amount / 1000000000) // Convert to billions
    } else if (amount >= 1000000) {
      return Math.round(amount / 1000000) // Convert to millions
    } else if (amount >= 1000) {
      return Math.round(amount / 1000) // Convert to thousands
    }
    return amount
  }

  // Helper function to get amount suffix
  const getAmountSuffix = (amount: number): string => {
    if (amount >= 1000000000) {
      return 'B'
    } else if (amount >= 1000000) {
      return 'M'
    } else if (amount >= 1000) {
      return 'K'
    }
    return ''
  }

  // Data processing functions
  const processBondPerformanceData = (bonds: any[]): BondPerformanceData[] => {
    return bonds
      .filter(bond => bond && typeof bond === 'object') // Filter out null/undefined entries
      .map(bond => {
        const originalAmount = bond.available_amount || 0
        const formattedAmount = formatAmount(originalAmount)
        const suffix = getAmountSuffix(originalAmount)
        
        return {
          name: `${bond.display_name || bond.instrument_code || 'Unknown Bond'} (${formattedAmount}${suffix})`,
          value: formattedAmount,
          yield: bond.bid_yield || 0,
          country: bond.country || 'Unknown',
          originalAmount: originalAmount // Keep original for tooltips
        }
      })
  }

  const processUserActivityData = (customers: any[], purchases: any[]): UserActivityData[] => {
    // Filter out null/undefined entries
    const validCustomers = customers.filter(customer => customer && customer.created_at)
    const validPurchases = purchases.filter(purchase => purchase && purchase.created_at)

    // Group users by month of registration
    const userRegistrations = validCustomers.reduce((acc, customer) => {
      const date = new Date(customer.created_at)
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group purchases by month
    const purchaseRegistrations = validPurchases.reduce((acc, purchase) => {
      const date = new Date(purchase.created_at)
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get last 6 months
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }

    return months.map(month => ({
      name: month,
      users: userRegistrations[month] || 0,
      purchases: purchaseRegistrations[month] || 0
    }))
  }

  const processBondTypesData = (bonds: any[]): BondTypesData[] => {
    const validBonds = bonds.filter(bond => bond && typeof bond === 'object')
    const countryCounts = validBonds.reduce((acc, bond) => {
      const country = bond.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']
    
    return Object.entries(countryCounts).map(([country, count], index) => ({
      name: country,
      value: count as number,
      color: colors[index % colors.length]
    }))
  }

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true)
      const response = await bondApi.getRecentActivity()
      
      if (response.success && response.data) {
        setRecentActivity(Array.isArray(response.data) ? response.data : [])
      } else {
        console.error('Failed to fetch recent activity:', response.message)
        setRecentActivity([])
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      setRecentActivity([])
    } finally {
      setActivityLoading(false)
    }
  }

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetrics(prev => ({ ...prev, loading: true, error: null }))
        
        // Fetch all data in parallel
        const [customersResponse, bondsResponse, purchasesResponse] = await Promise.all([
          bondApi.getCustomers(),
          bondApi.getBonds(),
          bondApi.getPurchases()
        ])

        if (customersResponse.success && bondsResponse.success && purchasesResponse.success) {
          const customers = Array.isArray(customersResponse.data) ? customersResponse.data : []
          const bonds = Array.isArray(bondsResponse.data) ? bondsResponse.data : []
          const purchases = Array.isArray(purchasesResponse.data) ? purchasesResponse.data : []

          const totalUsers = customers.length
          const activeBonds = bonds.length
          const totalPurchases = purchases.length

          // Process chart data
          const bondPerformance = processBondPerformanceData(bonds)
          const userActivity = processUserActivityData(customers, purchases)
          const bondTypes = processBondTypesData(bonds)

          setMetrics({
            totalUsers,
            activeBonds,
            totalPurchases,
            loading: false,
            error: null
          })

          setBondPerformanceData(bondPerformance)
          setUserActivityData(userActivity)
          setBondTypesData(bondTypes)
          setChartsLoading(false)
        } else {
          throw new Error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load dashboard data'
        }))
      }
    }

    fetchMetrics()
  }, [])

  // Fetch recent activity on component mount
  useEffect(() => {
    fetchRecentActivity()
  }, [])

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤'
      case 'purchase':
        return '🛒'
      case 'bond':
        return '📈'
      case 'payment':
        return '💳'
      default:
        return '📋'
    }
  }

  // Helper function to get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600'
      case 'purchase':
        return 'text-green-600'
      case 'bond':
        return 'text-purple-600'
      case 'payment':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  // Create stats array with dynamic data
const stats = [
  {
    title: 'Total Users',
      value: metrics.loading ? '...' : metrics.totalUsers.toLocaleString(),
    change: '+12%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: 'Active Bonds',
      value: metrics.loading ? '...' : metrics.activeBonds.toLocaleString(),
    change: '+8%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    title: 'Total Purchases',
      value: metrics.loading ? '...' : metrics.totalPurchases.toLocaleString(),
    change: '+23%',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
    icon: ShoppingCart,
    color: 'text-purple-600'
  },
  {
    title: 'Next Payments',
    value: '$2.1M',
    change: 'Due in 7 days',
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
    icon: Calendar,
    color: 'text-orange-600'
  }
]

  return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">
              Welcome back, {user?.email}! Here's what's happening with BoraBond today.
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                {metrics.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : metrics.error ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : (
                    stat.value
                  )}
                </div>
                {!metrics.loading && !metrics.error && (
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 
                    stat.changeType === 'neutral' ? 'text-gray-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
                )}
                {metrics.error && (
                  <p className="text-xs text-red-500">
                    {metrics.error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bond Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Bond Performance</CardTitle>
              <CardDescription>Available bond amounts (formatted for readability)</CardDescription>
            </CardHeader>
            <CardContent>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading bond data...</span>
                  </div>
                </div>
              ) : bondPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bondPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      fontSize={12}
                      interval={0}
                    />
                    <YAxis 
                      label={{ value: 'Amount (B/M/K)', angle: -90, position: 'insideLeft' }}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string, props: any) => {
                        if (name === 'value') {
                          const originalAmount = props.payload?.originalAmount || value
                          const suffix = originalAmount >= 1000000000 ? 'B' : 
                                       originalAmount >= 1000000 ? 'M' : 
                                       originalAmount >= 1000 ? 'K' : ''
                          return [
                            `${value}${suffix} (${originalAmount.toLocaleString()})`,
                            'Available Amount'
                          ]
                        }
                        return [`${value}%`, 'Yield']
                      }}
                      labelFormatter={(label) => `Bond: ${label}`}
                    />
                    <Bar dataKey="value" fill="#3B82F6" name="Available Amount" />
                  </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No bond data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Monthly user registrations and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading activity data...</span>
                  </div>
                </div>
              ) : userActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        value,
                        name === 'users' ? 'New User Registrations' : 'New Purchases'
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="users" fill="#3B82F6" name="New User Registrations" />
                    <Bar dataKey="purchases" fill="#10B981" name="New Purchases" />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No activity data available
                </div>
              )}
              
              {/* Activity Summary */}
              {!chartsLoading && userActivityData.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total User Registrations:</span>
                      <span className="ml-2 text-blue-600 font-semibold">
                        {userActivityData.reduce((sum, month) => sum + month.users, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Peak Month:</span>
                      <span className="ml-2 text-green-600 font-semibold">
                        {userActivityData.reduce((peak, month) => 
                          month.users > peak.users ? month : peak, 
                          { name: 'N/A', users: 0 }
                        ).name} ({userActivityData.reduce((peak, month) => 
                          month.users > peak.users ? month : peak, 
                          { name: 'N/A', users: 0 }
                        ).users} users)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bond Distribution and Recent Activity - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bond Types Distribution */}
        <Card>
          <CardHeader>
              <CardTitle>Bond Distribution by Country</CardTitle>
              <CardDescription>Current allocation across different countries</CardDescription>
          </CardHeader>
          <CardContent>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading distribution data...</span>
                  </div>
                </div>
              ) : bondTypesData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bondTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bondTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${value} bonds`, 'Count']}
                      />
                </PieChart>
              </ResponsiveContainer>
            </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No distribution data available
                </div>
              )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading recent activity...</span>
                  </div>
                </div>
              ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
                  {recentActivity.slice(0, 6).map((activity, index) => (
                    <div key={activity.entity_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                        <div className={`text-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                    <div>
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} activity
                          </p>
                    </div>
                  </div>
                  <div className="text-right">
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</p>
                        <p className="text-xs text-gray-400">ID: {activity.entity_id.slice(0, 8)}...</p>
                  </div>
                </div>
              ))}
            </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No recent activity found</p>
                    <p className="text-sm">Activity will appear here as users interact with the system</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
        </div>
      </div>
      </DashboardLayout>
  )
}
