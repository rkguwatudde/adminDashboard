"use client"

import { Modal } from '@/components/ui/modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Shield, CheckCircle, XCircle } from 'lucide-react'

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

interface UserViewModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function UserViewModal({ isOpen, onClose, user }: UserViewModalProps) {
  if (!user) return null

  const getUserDisplayName = (user: User) => {
    if (user.display_name) return user.display_name
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.first_name) return user.first_name
    if (user.last_name) return user.last_name
    return 'Anonymous User'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile Details"
      size="xl"
    >
      <div className="space-y-6">
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
              <label className="text-sm font-medium text-gray-500">Display Name</label>
              <p className="text-gray-900 font-medium">{getUserDisplayName(user)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {user.email}
              </p>
            </div>
            {user.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {user.phone}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">User Type</label>
              <Badge variant={user.user_type === 'admin' ? 'destructive' : 'default'}>
                {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
              </Badge>
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
              <label className="text-sm font-medium text-gray-500">Account Status</label>
              <Badge className={getStatusColor(user.status)}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Verification Status</label>
              <Badge className={getVerificationColor(user.verification_status)}>
                {user.verification_status.charAt(0).toUpperCase() + user.verification_status.slice(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Onboarding Status</label>
              <div className="flex items-center gap-2">
                {user.onboarding_completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={user.onboarding_completed ? 'text-green-600' : 'text-yellow-600'}>
                  {user.onboarding_completed ? 'Completed' : 'In Progress'} (Step {user.onboarding_step})
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">BoraBond Onboarding</label>
              <div className="flex items-center gap-2">
                {user.borabond_onboarding_completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={user.borabond_onboarding_completed ? 'text-green-600' : 'text-yellow-600'}>
                  {user.borabond_onboarding_completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Custodian Account</label>
              <p className="text-gray-900">
                {user.custodian_account_number ? (
                  <span className="text-green-600 font-medium">✓ {user.custodian_account_number}</span>
                ) : (
                  <span className="text-gray-500">Not created</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CSD Account</label>
              <p className="text-gray-900">
                {user.csd_account_number ? (
                  <span className="text-green-600 font-medium">✓ {user.csd_account_number}</span>
                ) : (
                  <span className="text-gray-500">Not created</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Precise FP Form</label>
              <div className="flex items-center gap-2">
                {user.precise_fp_form_completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={user.precise_fp_form_completed ? 'text-green-600' : 'text-yellow-600'}>
                  {user.precise_fp_form_completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Compliance Docs</label>
              <div className="flex items-center gap-2">
                {user.compliance_docs_sent ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={user.compliance_docs_sent ? 'text-green-600' : 'text-yellow-600'}>
                  {user.compliance_docs_sent ? 'Sent' : 'Not sent'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        {(user.dob || user.gender || user.marital_status || user.address || user.employment_status) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.dob && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(user.dob)}
                  </p>
                </div>
              )}
              {user.gender && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900">{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</p>
                </div>
              )}
              {user.marital_status && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-gray-900">{user.marital_status.charAt(0).toUpperCase() + user.marital_status.slice(1)}</p>
                </div>
              )}
              {user.employment_status && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Status</label>
                  <p className="text-gray-900">{user.employment_status.charAt(0).toUpperCase() + user.employment_status.slice(1)}</p>
                </div>
              )}
              {user.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {user.address}
                  </p>
                </div>
              )}
              {user.occupation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-gray-900">{user.occupation}</p>
                </div>
              )}
              {user.employer && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Employer</label>
                  <p className="text-gray-900">{user.employer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-900">{formatDate(user.updated_at)}</p>
            </div>
            {user.onboarding_completed_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Onboarding Completed</label>
                <p className="text-gray-900">{formatDate(user.onboarding_completed_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
}
