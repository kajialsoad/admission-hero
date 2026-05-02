"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/hooks/useAppSelector'
import { toast } from 'sonner'
import { CreditCard, Smartphone, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react'

interface PaymentSettings {
  _id?: string
  bkashEnabled: boolean
  googlePlayEnabled: boolean
  bkashConfig?: {
    username?: string
    password?: string
    appKey?: string
    appSecret?: string
    baseUrl?: string
  }
  googlePlayConfig?: {
    packageName?: string
    serviceAccountEmail?: string
    serviceAccountKey?: string
    productIds?: string[]
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    bkashEnabled: true,
    googlePlayEnabled: false,
    bkashConfig: {
      username: '',
      password: '',
      appKey: '',
      appSecret: '',
      baseUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta'
    },
    googlePlayConfig: {
      packageName: 'com.admissionhero.app',
      serviceAccountEmail: '',
      serviceAccountKey: '',
      productIds: ['admission_hero_monthly', 'admission_hero_yearly']
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [showGooglePlayCredentials, setShowGooglePlayCredentials] = useState(false)
  const [showBkashPassword, setShowBkashPassword] = useState(false)
  const [showBkashAppSecret, setShowBkashAppSecret] = useState(false)
  const [showGoogleServiceKey, setShowGoogleServiceKey] = useState(false)
  const { token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Payment settings updated successfully!')
        setSettings(data.data)
      } else {
        toast.error(data.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Payment Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Control which payment methods are available in the mobile app
        </p>
      </div>

      <div className="space-y-6">
        {/* bKash Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-pink-600" />
              bKash Payment
            </CardTitle>
            <CardDescription>
              Enable or disable bKash payment method for users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="bkash-enabled" className="text-base font-medium cursor-pointer">
                  Enable bKash Payment
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Users will be able to pay using bKash mobile wallet
                </p>
              </div>
              <input
                type="checkbox"
                id="bkash-enabled"
                checked={settings.bkashEnabled}
                onChange={(e) => 
                  setSettings({ ...settings, bkashEnabled: e.target.checked })
                }
                className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative cursor-pointer transition-colors
                  before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 
                  before:left-0.5 before:transition-transform checked:before:translate-x-6"
              />
            </div>

            {settings.bkashEnabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-green-900">bKash is Active</p>
                    <p className="text-sm text-green-700 mt-1">
                      Users can now make payments using bKash in the mobile app
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!settings.bkashEnabled && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-red-900">bKash is Disabled</p>
                    <p className="text-sm text-red-700 mt-1">
                      Users will not see bKash as a payment option
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* bKash Credentials Configuration */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">bKash API Credentials</h3>
                  <p className="text-sm text-gray-600">Configure your bKash payment gateway credentials</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? 'Hide' : 'Show'} Credentials
                </Button>
              </div>

              {showCredentials && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="bkash-base-url">Base URL</Label>
                    <input
                      id="bkash-base-url"
                      type="text"
                      value={settings.bkashConfig?.baseUrl || ''}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          bkashConfig: {
                            ...settings.bkashConfig,
                            baseUrl: e.target.value
                          }
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://tokenized.pay.bka.sh/v1.2.0-beta"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bkash-username">Username (Phone Number)</Label>
                    <input
                      id="bkash-username"
                      type="text"
                      value={settings.bkashConfig?.username || ''}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          bkashConfig: {
                            ...settings.bkashConfig,
                            username: e.target.value
                          }
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bkash-password">Password</Label>
                    <div className="relative">
                      <input
                        id="bkash-password"
                        type={showBkashPassword ? "text" : "password"}
                        value={settings.bkashConfig?.password || ''}
                        onChange={(e) => 
                          setSettings({
                            ...settings,
                            bkashConfig: {
                              ...settings.bkashConfig,
                              password: e.target.value
                            }
                          })
                        }
                        className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter bKash password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBkashPassword(!showBkashPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showBkashPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bkash-app-key">App Key</Label>
                    <input
                      id="bkash-app-key"
                      type="text"
                      value={settings.bkashConfig?.appKey || ''}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          bkashConfig: {
                            ...settings.bkashConfig,
                            appKey: e.target.value
                          }
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      placeholder="Enter App Key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bkash-app-secret">App Secret</Label>
                    <div className="relative">
                      <input
                        id="bkash-app-secret"
                        type={showBkashAppSecret ? "text" : "password"}
                        value={settings.bkashConfig?.appSecret || ''}
                        onChange={(e) => 
                          setSettings({
                            ...settings,
                            bkashConfig: {
                              ...settings.bkashConfig,
                              appSecret: e.target.value
                            }
                          })
                        }
                        className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder="Enter App Secret"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBkashAppSecret(!showBkashAppSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showBkashAppSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> These credentials are stored securely in the database. 
                      Make sure to use production credentials for live payments.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google Play Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Google Play Billing
            </CardTitle>
            <CardDescription>
              Enable or disable Google Play in-app purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="google-play-enabled" className="text-base font-medium cursor-pointer">
                  Enable Google Play Billing
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Users will be able to purchase subscriptions through Google Play Store
                </p>
              </div>
              <input
                type="checkbox"
                id="google-play-enabled"
                checked={settings.googlePlayEnabled}
                onChange={(e) => 
                  setSettings({ ...settings, googlePlayEnabled: e.target.checked })
                }
                className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative cursor-pointer transition-colors
                  before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 
                  before:left-0.5 before:transition-transform checked:before:translate-x-6"
              />
            </div>

            {settings.googlePlayEnabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-green-900">Google Play Billing is Active</p>
                    <p className="text-sm text-green-700 mt-1">
                      Users can now purchase subscriptions through Google Play Store
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!settings.googlePlayEnabled && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-yellow-900">Google Play Billing is Disabled</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Users will not see Google Play as a payment option
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Play Credentials Configuration */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Google Play API Credentials</h3>
                  <p className="text-sm text-gray-600">Configure your Google Play Developer API credentials</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGooglePlayCredentials(!showGooglePlayCredentials)}
                >
                  {showGooglePlayCredentials ? 'Hide' : 'Show'} Credentials
                </Button>
              </div>

              {showGooglePlayCredentials && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="google-package-name">Package Name</Label>
                    <input
                      id="google-package-name"
                      type="text"
                      value={settings.googlePlayConfig?.packageName || ''}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          googlePlayConfig: {
                            ...settings.googlePlayConfig,
                            packageName: e.target.value
                          }
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      placeholder="com.admissionhero.app"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your Android app package name from Google Play Console</p>
                  </div>

                  <div>
                    <Label htmlFor="google-service-account">Service Account Email</Label>
                    <input
                      id="google-service-account"
                      type="email"
                      value={settings.googlePlayConfig?.serviceAccountEmail || ''}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          googlePlayConfig: {
                            ...settings.googlePlayConfig,
                            serviceAccountEmail: e.target.value
                          }
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="service-account@project.iam.gserviceaccount.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Service account email from Google Cloud Console</p>
                  </div>

                  <div>
                    <Label htmlFor="google-service-key">Service Account Key (JSON)</Label>
                    <div className="relative">
                      <textarea
                        id="google-service-key"
                        value={settings.googlePlayConfig?.serviceAccountKey || ''}
                        onChange={(e) => 
                          setSettings({
                            ...settings,
                            googlePlayConfig: {
                              ...settings.googlePlayConfig,
                              serviceAccountKey: e.target.value
                            }
                          })
                        }
                        rows={6}
                        className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                        placeholder='{"type": "service_account", "project_id": "...", ...}'
                        style={{ filter: showGoogleServiceKey ? 'none' : 'blur(4px)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowGoogleServiceKey(!showGoogleServiceKey)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      >
                        {showGoogleServiceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Paste the entire JSON key file content here</p>
                  </div>

                  <div>
                    <Label htmlFor="google-product-ids">Product IDs (comma-separated)</Label>
                    <input
                      id="google-product-ids"
                      type="text"
                      value={settings.googlePlayConfig?.productIds?.join(', ') || ''}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          googlePlayConfig: {
                            ...settings.googlePlayConfig,
                            productIds: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                          }
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      placeholder="admission_hero_monthly, admission_hero_yearly"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your in-app product IDs from Google Play Console</p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Setup Guide:</strong>
                    </p>
                    <ol className="text-xs text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                      <li>Go to Google Play Console → Your App → Monetization setup</li>
                      <li>Create in-app products (subscriptions)</li>
                      <li>Go to Google Cloud Console → IAM & Admin → Service Accounts</li>
                      <li>Create a service account and download JSON key</li>
                      <li>Grant "Google Play Android Developer" API access</li>
                      <li>Paste the JSON key content above</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Active Payment Methods</CardTitle>
            <CardDescription>
              Summary of currently enabled payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-pink-600" />
                  <span className="font-medium">bKash</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings.bkashEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {settings.bkashEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Google Play</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings.googlePlayEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {settings.googlePlayEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {!settings.bkashEnabled && !settings.googlePlayEnabled && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Warning: No payment methods are enabled. Users will not be able to purchase subscriptions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
