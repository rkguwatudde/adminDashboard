"use client"

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Download, TrendingUp, TrendingDown, DollarSign, Calendar, BookOpen } from 'lucide-react'

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    date: '2024-01-22',
    description: 'Bond Purchase - Nigeria Treasury Bill',
    type: 'Credit',
    amount: 50000,
    balance: 50000,
    reference: 'PUR-001',
    customer: 'John Doe',
    bond: 'Nigeria Treasury Bill 2024',
    status: 'Completed'
  },
  {
    id: 2,
    date: '2024-01-22',
    description: 'Interest Payment - Kenya Government Bond',
    type: 'Credit',
    amount: 1200,
    balance: 51200,
    reference: 'INT-001',
    customer: 'Jane Smith',
    bond: 'Kenya Government Bond 2025',
    status: 'Completed'
  },
  {
    id: 3,
    date: '2024-01-21',
    description: 'Bond Purchase - Ghana Corporate Bond',
    type: 'Credit',
    amount: 25000,
    balance: 26200,
    reference: 'PUR-002',
    customer: 'Mike Johnson',
    bond: 'Ghana Corporate Bond 2026',
    status: 'Completed'
  },
  {
    id: 4,
    date: '2024-01-21',
    description: 'Service Fee - Transaction Processing',
    type: 'Debit',
    amount: 50,
    balance: 26150,
    reference: 'FEE-001',
    customer: 'System',
    bond: 'N/A',
    status: 'Completed'
  },
  {
    id: 5,
    date: '2024-01-20',
    description: 'Bond Maturity - South Africa Municipal',
    type: 'Credit',
    amount: 15000,
    balance: 41200,
    reference: 'MAT-001',
    customer: 'Sarah Wilson',
    bond: 'South Africa Municipal Bond',
    status: 'Completed'
  },
  {
    id: 6,
    date: '2024-01-20',
    description: 'Bond Purchase - Nigeria Treasury Bill',
    type: 'Credit',
    amount: 100000,
    balance: 26200,
    reference: 'PUR-003',
    customer: 'Sarah Wilson',
    bond: 'Nigeria Treasury Bill 2024',
    status: 'Completed'
  }
]

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [transactions, setTransactions] = useState(mockTransactions)

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'All' || transaction.type === typeFilter
    const matchesDate = !dateFilter || transaction.date === dateFilter
    return matchesSearch && matchesType && matchesDate
  })

  const totalCredits = transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = totalCredits - totalDebits

  const getTypeColor = (type: string) => {
    return type === 'Credit' ? 'text-green-600' : 'text-red-600'
  }

  const getTypeIcon = (type: string) => {
    return type === 'Credit' ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ledger & Transactions</h1>
            <p className="text-gray-600">Track all financial transactions and account balances</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Ledger
          </Button>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${currentBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalCredits.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Debits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalDebits.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {transactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>Find specific transactions or filter by type and date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by description, customer, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Credit">Credits</option>
                  <option value="Debit">Debits</option>
                </select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-auto"
                />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Bond</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span className={`font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      ${transaction.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-mono">
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {transaction.customer}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {transaction.bond}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transaction Summary by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Credit Transactions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Credit Transactions</span>
              </CardTitle>
              <CardDescription>Summary of all incoming funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: 'Bond Purchases', amount: 175000, count: 3 },
                  { category: 'Interest Payments', amount: 1200, count: 1 },
                  { category: 'Bond Maturities', amount: 15000, count: 1 },
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${category.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Debit Transactions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span>Debit Transactions</span>
              </CardTitle>
              <CardDescription>Summary of all outgoing funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: 'Service Fees', amount: 50, count: 1 },
                  { category: 'Processing Charges', amount: 0, count: 0 },
                  { category: 'Other Deductions', amount: 0, count: 0 },
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">${category.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Timeline</CardTitle>
            <CardDescription>Chronological view of recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={transaction.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'Credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {getTypeIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.customer} • {transaction.bond} • {transaction.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'Credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
