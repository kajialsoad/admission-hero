"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/hooks/useAppSelector'
import { toast } from 'sonner'
import { FileText, Save, Eye, Clock, User } from 'lucide-react'

interface ContentItem {
  _id?: string
  key: string
  title: string
  content: string
  status: 'draft' | 'published'
  updatedAt?: string
  lastUpdatedBy?: {
    name: string
    email: string
  }
  version?: number
}

const contentSections = [
  { key: 'about_app', label: 'About App', icon: FileText, description: 'Information about your application' },
  { key: 'privacy_policy', label: 'Privacy Policy', icon: FileText, description: 'Privacy and data protection policy' },
  { key: 'terms_conditions', label: 'Terms & Conditions', icon: FileText, description: 'Terms of service and usage' },
  { key: 'refund_policy', label: 'Refund Policy', icon: FileText, description: 'Refund and cancellation policy' },
  { key: 'contact_us', label: 'Contact Us', icon: FileText, description: 'Contact information and support' },
  { key: 'support_info', label: 'Support Information', icon: FileText, description: 'Help and support resources' },
]

export default function AppContentPage() {
  const [contents, setContents] = useState<Record<string, ContentItem>>({})
  const [activeTab, setActiveTab] = useState('about_app')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const { token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    fetchAllContent()
  }, [])

  const fetchAllContent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app-content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        const contentMap: Record<string, ContentItem> = {}
        data.data.forEach((item: ContentItem) => {
          contentMap[item.key] = item
        })
        setContents(contentMap)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleInitialize = async () => {
    setInitializing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app-content/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Default content initialized successfully!')
        fetchAllContent()
      } else {
        toast.error(data.message || 'Failed to initialize content')
      }
    } catch (error) {
      console.error('Error initializing content:', error)
      toast.error('Failed to initialize content')
    } finally {
      setInitializing(false)
    }
  }

  const handleSave = async (key: string, status: 'draft' | 'published' = 'published') => {
    setSaving(true)
    try {
      const content = contents[key]
      if (!content) {
        toast.error('Content not found')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: content.key,
          title: content.title,
          content: content.content,
          status: status
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${content.title} ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
        setContents(prev => ({
          ...prev,
          [key]: data.data
        }))
      } else {
        toast.error(data.message || 'Failed to save content')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (key: string, field: 'title' | 'content', value: string) => {
    setContents(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        key,
        [field]: value,
        status: prev[key]?.status || 'published'
      }
    }))
  }

  const activeContent = contents[activeTab] || { key: activeTab, title: '', content: '', status: 'published' }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            App Content Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all app static pages and legal content from one place
          </p>
        </div>
        <Button
          onClick={handleInitialize}
          disabled={initializing}
          variant="outline"
        >
          {initializing ? 'Initializing...' : 'Initialize Default Content'}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {contentSections.map((section) => {
                  const Icon = section.icon
                  const isActive = activeTab === section.key
                  const content = contents[section.key]
                  
                  return (
                    <button
                      key={section.key}
                      onClick={() => setActiveTab(section.key)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{section.label}</div>
                        {content?.updatedAt && (
                          <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            Updated {new Date(content.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {content?.status === 'draft' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Editor */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {contentSections.find(s => s.key === activeTab)?.label}
                  </CardTitle>
                  <CardDescription>
                    {contentSections.find(s => s.key === activeTab)?.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {activeContent.updatedAt && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(activeContent.updatedAt).toLocaleString()}
                    </div>
                  )}
                  {activeContent.lastUpdatedBy && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {activeContent.lastUpdatedBy.name}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={activeContent.title}
                  onChange={(e) => updateContent(activeTab, 'title', e.target.value)}
                  placeholder="Enter title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={activeContent.content}
                  onChange={(e) => updateContent(activeTab, 'content', e.target.value)}
                  placeholder="Enter content (supports basic HTML)"
                  className="mt-1 min-h-[500px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supports HTML tags: &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;br&gt;, &lt;a&gt;
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  {activeContent.version && (
                    <span className="text-sm text-gray-500">
                      Version {activeContent.version}
                    </span>
                  )}
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    activeContent.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activeContent.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(activeTab, 'draft')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSave(activeTab, 'published')}
                    disabled={saving}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {saving ? 'Publishing...' : 'Publish'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
