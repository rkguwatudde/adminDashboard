"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, ShoppingCart, DollarSign, Calendar, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import AuthMiddleware from '@/components/auth/AuthMiddleware'
import { useAuth } from '@/contexts/AuthContext'

const stats = [
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: 'Active Bonds',
    value: '156',
    change: '+8%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    title: 'Total Purchases',
    value: '$12.4M',
    change: '+23%',
    changeType: 'positive',
    icon: ShoppingCart,
    color: 'text-purple-600'
  },
  {
    title: 'Next Payments',
    value: '$2.1M',
    change: 'Due in 7 days',
    changeType: 'neutral',
    icon: Calendar,
    color: 'text-orange-600'
  }
]

const bondData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
]

const userActivityData = [
  { name: 'Mon', users: 65, purchases: 28 },
  { name: 'Tue', users: 59, purchases: 48 },
  { name: 'Wed', users: 80, purchases: 40 },
  { name: 'Thu', users: 81, purchases: 19 },
  { name: 'Fri', users: 56, purchases: 96 },
  { name: 'Sat', users: 55, purchases: 27 },
  { name: 'Sun', users: 40, purchases: 39 },
]

const bondTypesData = [
  { name: 'Treasury Bills', value: 45, color: '#3B82F6' },
  { name: 'Government Bonds', value: 30, color: '#10B981' },
  { name: 'Corporate Bonds', value: 15, color: '#F59E0B' },
  { name: 'Municipal Bonds', value: 10, color: '#8B5CF6' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AuthMiddleware>
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
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
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
              <CardDescription>Monthly bond value trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bondData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Weekly user registrations and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3B82F6" />
                  <Bar dataKey="purchases" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bond Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bond Types Distribution</CardTitle>
            <CardDescription>Current allocation across different bond types</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New bond purchase', user: 'John Doe', amount: '$50,000', time: '2 minutes ago' },
                { action: 'User registration', user: 'Jane Smith', amount: '', time: '5 minutes ago' },
                { action: 'Bond maturity', user: 'Mike Johnson', amount: '$25,000', time: '1 hour ago' },
                { action: 'Interest payment', user: 'Sarah Wilson', amount: '$1,200', time: '2 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && <p className="text-sm font-medium text-gray-900">{activity.amount}</p>}
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </DashboardLayout>
    </AuthMiddleware>
  )
}
