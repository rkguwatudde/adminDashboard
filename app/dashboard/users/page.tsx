"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Plus, Eye, Edit, Trash2, RefreshCw, AlertCircle, Users, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { getEndpointUrl } from '@/lib/config'
import { UserViewModal } from '@/components/users/user-view-modal'
import { UserEditModal } from '@/components/users/user-edit-modal'
import { UserDeleteModal } from '@/components/users/user-delete-modal'
import AuthMiddleware from '@/components/auth/AuthMiddleware'
import { useAuth } from '@/contexts/AuthContext'

// Types based on the modal components expectations
interface User {
  user_id: string
  email: string
  phone: string | null
  status: 'pending' | 'active' | 'inactive'
  user_type: 'customer' | 'admin'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
  first_name: string | null
  last_name: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  display_name: string | null
  custodian_account_number: string | null
  custodian_account_name: string | null
  precise_fp_form_completed: boolean
  csd_account_number: string | null
  compliance_docs_sent: boolean
  agreement_submitted: boolean
  onboarding_step: number
  full_name: string | null
  dob: string | null
  gender: string | null
  marital_status: string | null
  address: string | null
  employment_status: string | null
  occupation: string | null
  employer: string | null
  onboarding_completed_at: string | null
  borabond_onboarding_completed: boolean
  citizenship: string[] | null
  us_tax_residence_status: string | null
  investment_strategy_complete: boolean
  cybrid_integration_completed: boolean
}

interface ApiResponse {
  success: boolean
  data: User[]
  count: number
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all')
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = getEndpointUrl('USERS')
      
      const response = await fetch(apiUrl, {
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
        setUsers(data.data)
      } else {
        throw new Error('Failed to fetch users')
      }
    } catch (err) {
      let errorMessage = 'An error occurred while fetching users'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'CORS Error: Unable to connect to the backend server. Please ensure:\n\n' +
            '1. The backend server is running on http://localhost:9000\n' +
            '2. CORS is properly configured on the backend\n' +
            '3. The API endpoint /api/bonds/customers is accessible'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Modal handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const handleUserUpdated = () => {
    fetchUsers() // Refresh the user list
  }

  const handleUserDeleted = () => {
    fetchUsers() // Refresh the user list
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  // Get user display name
  const getUserDisplayName = (user: User) => {
    if (user.display_name) return user.display_name
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.first_name) return user.first_name
    if (user.last_name) return user.last_name
    return user.email
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = getUserDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Loading state
  if (loading) {
    return (
      <AuthMiddleware>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage all registered users and their profiles</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading users...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage all registered users and their profiles</p>
              </div>
              <Button onClick={fetchUsers} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
            
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchUsers} variant="outline">
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">
                Manage all registered users and their profiles
                {currentUser && (
                  <span className="block text-sm text-gray-500 mt-1">
                    Logged in as: {currentUser.email} ({currentUser.role})
                  </span>
                )}
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Onboarding Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.onboarding_completed).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Find specific users or filter by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or display name..."
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
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Types</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>All registered users and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getUserDisplayName(user)}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.user_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.user_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                          user.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.verification_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`text-xs ${user.onboarding_completed ? 'text-green-600' : 'text-gray-400'}`}>
                            {user.onboarding_completed ? '✓ Complete' : '○ Pending'}
                          </div>
                          <div className={`text-xs ${user.precise_fp_form_completed ? 'text-green-600' : 'text-gray-400'}`}>
                            {user.precise_fp_form_completed ? '✓ FP Form' : '○ FP Form'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewUser(user)}
                            title="View User"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additional User Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Onboarding Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Progress</CardTitle>
                <CardDescription>User completion status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Completed', count: users.filter(u => u.onboarding_completed).length, color: 'bg-green-100 text-green-800' },
                    { label: 'In Progress', count: users.filter(u => !u.onboarding_completed).length, color: 'bg-yellow-100 text-yellow-800' },
                    { label: 'Precise FP Complete', count: users.filter(u => u.precise_fp_form_completed).length, color: 'bg-green-100 text-green-800' },
                    { label: 'Compliance Docs Sent', count: users.filter(u => u.compliance_docs_sent).length, color: 'bg-purple-100 text-purple-800' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.color}`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Types & Verification */}
            <Card>
              <CardHeader>
                <CardTitle>User Types & Verification</CardTitle>
                <CardDescription>Distribution of user categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Customers', count: users.filter(u => u.user_type === 'customer').length, color: 'bg-green-100 text-green-800' },
                    { label: 'Admins', count: users.filter(u => u.user_type === 'admin').length, color: 'bg-red-100 text-red-800' },
                    { label: 'Verified', count: users.filter(u => u.verification_status === 'verified').length, color: 'bg-green-100 text-green-800' },
                    { label: 'Pending Verification', count: users.filter(u => u.verification_status === 'pending').length, color: 'bg-yellow-100 text-yellow-800' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.color}`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modals */}
          <UserViewModal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            user={selectedUser}
          />
          
          <UserEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
          />
          
          <UserDeleteModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            user={selectedUser}
            onUserDeleted={handleUserDeleted}
          />
        </div>
      </DashboardLayout>
    </AuthMiddleware>
  )
}
