"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppSelector } from '@/hooks/useAppSelector'
import { toast } from 'sonner'

interface Package {
  _id: string
  type: string
  name: string
  durationDays: number
  price: number
  features: string[]
  videoUrl?: string
  status: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const { token } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    type: '3_months',
    name: '',
    durationDays: 90,
    price: 0,
    features: '',
    videoUrl: '',
    status: 'active'
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setPackages(data.data)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const packageData = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim())
    }

    console.log('📦 Submitting package data:', packageData)

    try {
      const url = editingPackage
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/packages/${editingPackage._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/packages`

      console.log('🌐 Request URL:', url)
      console.log('📤 Request body:', JSON.stringify(packageData, null, 2))

      const response = await fetch(url, {
        method: editingPackage ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      })

      const data = await response.json()

      console.log('📥 Response status:', response.status)
      console.log('📥 Response data:', data)

      if (data.success) {
        toast.success(editingPackage ? 'Package updated!' : 'Package created!')
        setIsDialogOpen(false)
        resetForm()
        fetchPackages()
      } else {
        toast.error(data.message || 'Failed to save package')
      }
    } catch (error) {
      console.error('Error saving package:', error)
      toast.error('Failed to save package')
    }
  }

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg)
    setFormData({
      type: pkg.type,
      name: pkg.name,
      durationDays: pkg.durationDays,
      price: pkg.price,
      features: pkg.features.join('\n'),
      videoUrl: pkg.videoUrl || '',
      status: pkg.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Package deleted!')
        fetchPackages()
      } else {
        toast.error(data.message || 'Failed to delete package')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error('Failed to delete package')
    }
  }

  const resetForm = () => {
    setFormData({
      type: '3_months',
      name: '',
      durationDays: 90,
      price: 0,
      features: '',
      videoUrl: '',
      status: 'active'
    })
    setEditingPackage(null)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>Add Package</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Package Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                    <SelectItem value="12_months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Package Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Duration (Days)</Label>
                <Input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Price (৳)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Features (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] p-2 border rounded-md"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="All Questions Access&#10;All Exams Access&#10;All Video Solutions"
                />
              </div>

              <div>
                <Label>Video URL (Optional)</Label>
                <Input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="YouTube video URL or ID (e.g., dQw4w9WgXcQ)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter YouTube video ID or full URL. This video will be shown on the subscription page.
                </p>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPackage ? 'Update' : 'Create'} Package
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{pkg.name}</span>
                <span className={`text-sm px-2 py-1 rounded ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {pkg.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">৳{pkg.price}</p>
                <p className="text-sm text-gray-600">{pkg.durationDays} days</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Features:</p>
                  <ul className="text-sm space-y-1">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)} className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(pkg._id)} className="flex-1">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No packages found. Create your first package!</p>
        </div>
      )}
    </div>
  )
}
