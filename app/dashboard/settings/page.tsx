'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Key,
  Mail,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import AuthMiddleware from '@/components/auth/AuthMiddleware'
import { useAuth } from '@/contexts/AuthContext'

interface SettingsData {
  // General Settings
  siteName: string
  siteDescription: string
  timezone: string
  language: string
  
  // Security Settings
  enableTwoFactor: boolean
  sessionTimeout: number
  passwordMinLength: number
  requireStrongPasswords: boolean
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  adminAlerts: boolean
  
  // API Settings
  apiRateLimit: number
  enableApiLogging: boolean
  cybridApiUrl: string
  yellowcardApiUrl: string
  
  // Database Settings
  backupFrequency: string
  enableAuditLog: boolean
  dataRetentionDays: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SettingsData>({
    // General Settings
    siteName: 'BoraBond Admin Dashboard',
    siteDescription: 'Administrative dashboard for BoraBond bond management platform',
    timezone: 'Africa/Kampala',
    language: 'en',
    
    // Security Settings
    enableTwoFactor: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPasswords: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    
    // API Settings
    apiRateLimit: 1000,
    enableApiLogging: true,
    cybridApiUrl: 'https://bank.production.cybrid.app',
    yellowcardApiUrl: 'http://localhost:9001',
    
    // Database Settings
    backupFrequency: 'daily',
    enableAuditLog: true,
    dataRetentionDays: 365
  })

  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setSettings({
      siteName: 'BoraBond Admin Dashboard',
      siteDescription: 'Administrative dashboard for BoraBond bond management platform',
      timezone: 'Africa/Kampala',
      language: 'en',
      enableTwoFactor: true,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireStrongPasswords: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      apiRateLimit: 1000,
      enableApiLogging: true,
      cybridApiUrl: 'https://bank.production.cybrid.app',
      yellowcardApiUrl: 'http://localhost:9001',
      backupFrequency: 'daily',
      enableAuditLog: true,
      dataRetentionDays: 365
    })
  }

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Save className="h-4 w-4" />
    }
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved!'
      case 'error':
        return 'Error'
      default:
        return 'Save Settings'
    }
  }

  return (
    <AuthMiddleware>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your BoraBond admin dashboard configuration
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {getSaveButtonIcon()}
                <span className="ml-2">{getSaveButtonText()}</span>
              </Button>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic configuration for your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kampala">Africa/Kampala (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security and authentication options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) || 8 }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strong Password Requirements</Label>
                    <p className="text-sm text-muted-foreground">
                      Require uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireStrongPasswords}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Admin Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical system alerts and warnings
                    </p>
                  </div>
                  <Switch
                    checked={settings.adminAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, adminAlerts: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* API Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Settings
                </CardTitle>
                <CardDescription>
                  Configure API endpoints and rate limiting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) || 1000 }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all API requests and responses
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableApiLogging}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableApiLogging: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cybridApiUrl">Cybrid API URL</Label>
                  <Input
                    id="cybridApiUrl"
                    value={settings.cybridApiUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, cybridApiUrl: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yellowcardApiUrl">Yellowcard API URL</Label>
                  <Input
                    id="yellowcardApiUrl"
                    value={settings.yellowcardApiUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, yellowcardApiUrl: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Database Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Settings
                </CardTitle>
                <CardDescription>
                  Configure database backup and retention policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all administrative actions
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAuditLog}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAuditLog: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) || 365 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Current system health and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Connection</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cybrid API</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yellowcard API</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  <p>Last backup: 2 hours ago</p>
                  <p>System uptime: 15 days, 8 hours</p>
                  <p>Active users: 79</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthMiddleware>
  )
}
