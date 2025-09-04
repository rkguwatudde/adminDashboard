"use client"

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Shield, Save, Loader2 } from 'lucide-react'

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

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUserUpdated: () => void
}

export function UserEditModal({ isOpen, onClose, user, onUserUpdated }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status,
        user_type: user.user_type,
        verification_status: user.verification_status,
        display_name: user.display_name || '',
        onboarding_completed: user.onboarding_completed,
        onboarding_step: user.onboarding_step,
        dob: user.dob || '',
        gender: user.gender || '',
        marital_status: user.marital_status || '',
        address: user.address || '',
        employment_status: user.employment_status || '',
        occupation: user.occupation || '',
        employer: user.employer || '',
        precise_fp_form_completed: user.precise_fp_form_completed,
        compliance_docs_sent: user.compliance_docs_sent,
        agreement_submitted: user.agreement_submitted,
        borabond_onboarding_completed: user.borabond_onboarding_completed,
        investment_strategy_complete: user.investment_strategy_complete,
        cybrid_integration_completed: user.cybrid_integration_completed
      })
      setError(null)
      setSuccess(false)
    }
  }, [user])

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Call backend update endpoint
      const response = await fetch(`http://localhost:9000/api/bonds/customers/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onUserUpdated()
          onClose()
        }, 1500)
      } else {
        throw new Error(result.message || 'Failed to update user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the user')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User Profile"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">User updated successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <Input
                value={formData.display_name || ''}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Enter display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                value={formData.user_type || 'customer'}
                onChange={(e) => handleInputChange('user_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Status & Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Status & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
              <select
                value={formData.verification_status || 'pending'}
                onChange={(e) => handleInputChange('verification_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Step</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.onboarding_step || 1}
                onChange={(e) => handleInputChange('onboarding_step', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.onboarding_completed || false}
                  onChange={(e) => handleInputChange('onboarding_completed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Onboarding Completed</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <Input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
              <select
                value={formData.marital_status || ''}
                onChange={(e) => handleInputChange('marital_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select marital status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
              <select
                value={formData.employment_status || ''}
                onChange={(e) => handleInputChange('employment_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select employment status</option>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
                <option value="self_employed">Self Employed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <Input
                value={formData.occupation || ''}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Enter occupation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employer</label>
              <Input
                value={formData.employer || ''}
                onChange={(e) => handleInputChange('employer', e.target.value)}
                placeholder="Enter employer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Account Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.precise_fp_form_completed || false}
                onChange={(e) => handleInputChange('precise_fp_form_completed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Precise FP Form Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.compliance_docs_sent || false}
                onChange={(e) => handleInputChange('compliance_docs_sent', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Compliance Docs Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.agreement_submitted || false}
                onChange={(e) => handleInputChange('agreement_submitted', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Agreement Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.borabond_onboarding_completed || false}
                onChange={(e) => handleInputChange('borabond_onboarding_completed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">BoraBond Onboarding Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.investment_strategy_complete || false}
                onChange={(e) => handleInputChange('investment_strategy_complete', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Investment Strategy Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.cybrid_integration_completed || false}
                onChange={(e) => handleInputChange('cybrid_integration_completed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Cybrid Integration Completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update User
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
