"use client"

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader2, User } from 'lucide-react'

interface User {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
}

interface UserDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUserDeleted: () => void
}

export function UserDeleteModal({ isOpen, onClose, user, onUserDeleted }: UserDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserDisplayName = (user: User) => {
    if (user.display_name) return user.display_name
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.first_name) return user.first_name
    if (user.last_name) return user.last_name
    return 'Anonymous User'
  }

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Call backend delete endpoint
      const response = await fetch(`http://localhost:9000/api/bonds/customers/${user.user_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Close modal and refresh user list
        onUserDeleted()
        onClose()
      } else {
        throw new Error(result.message || 'Failed to delete user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the user')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      size="md"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to delete this user?
          </h3>
          <p className="text-gray-600">
            This action cannot be undone. The user will be permanently removed from the system.
          </p>
        </div>

        {/* User Details */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              User to be deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  {getUserDisplayName(user)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-sm">{user.user_id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
