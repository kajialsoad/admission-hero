"use client"

import { useState } from "react"
import { Plus, MoreVertical, Pencil, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  type Banner,
} from "../store/api/bannersApi"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import toast from "react-hot-toast"

export default function BannerManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    order: 0,
    isActive: true,
  })

  // API hooks
  const { data: bannersData, isLoading } = useGetBannersQuery()
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation()
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation()
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation()

  const banners = bannersData?.data || []

  const handleImageUpload = async (images: File[]) => {
    if (!images?.length) {
      setImageUrl("")
      return
    }

    setIsUploadingImage(true)
    try {
      const urls = await uploadMultipleToCloudinary(images)
      setImageUrl(urls[0])
      toast.success("Banner image uploaded successfully!")
    } catch (err) {
      console.error("Image upload failed:", err)
      toast.error("Failed to upload banner image. Please try again.")
      setImageUrl("")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      link: "",
      order: 0,
      isActive: true,
    })
    setImageUrl("")
    setSelectedBanner(null)
  }

  // Handle add banner
  const handleAddBanner = async () => {
    if (!formData.title || !formData.title.trim()) {
      toast.error("Please enter banner title")
      return
    }

    if (!imageUrl) {
      toast.error("Please upload a banner image")
      return
    }

    if (isUploadingImage) {
      toast.error("Please wait for image upload to complete")
      return
    }

    try {
      await createBanner({
        title: formData.title.trim(),
        link: formData.link.trim() || "",
        imageUrl,
        order: formData.order,
        isActive: formData.isActive,
      }).unwrap()
      toast.success("Banner created successfully")
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create banner")
    }
  }

  // Handle edit banner
  const handleEditBanner = async () => {
    if (!selectedBanner) return

    if (!formData.title || !formData.title.trim()) {
      toast.error("Please enter banner title")
      return
    }

    if (!imageUrl) {
      toast.error("Please upload a banner image")
      return
    }

    if (isUploadingImage) {
      toast.error("Please wait for image upload to complete")
      return
    }

    try {
      await updateBanner({
        id: selectedBanner._id,
        data: {
          title: formData.title.trim(),
          link: formData.link.trim() || "",
          imageUrl,
          order: formData.order,
          isActive: formData.isActive,
        }
      }).unwrap()
      toast.success("Banner updated successfully")
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update banner")
    }
  }

  // Handle delete banner
  const handleDeleteBanner = async () => {
    if (!selectedBanner) return
    try {
      await deleteBanner(selectedBanner._id).unwrap()
      toast.success("Banner deleted successfully")
      setIsDeleteDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete banner")
    }
  }

  // Open edit dialog
  const openEditDialog = (banner: Banner) => {
    setSelectedBanner(banner)
    setFormData({
      title: banner.title,
      link: banner.link || "",
      order: banner.order || 0,
      isActive: banner.isActive,
    })
    setImageUrl(banner.imageUrl)
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (banner: Banner) => {
    setSelectedBanner(banner)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <ImageIcon className="h-5 w-5 text-emerald-600" />
                Banner Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">Manage home screen slider banners</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>
        </div>

        {/* Banners Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No banners found</td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="h-16 w-32 rounded overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      {banner.link ? (
                        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 flex items-center hover:underline">
                          Link <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{banner.order}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(banner)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(banner)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialogs */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update banner details' : 'Create a new slider banner'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Banner Image *</Label>
              <p className="text-xs text-gray-500 mb-2">Recommended aspect ratio 16:9</p>
              <ImageUpload
                id="banner-image"
                maxFiles={1}
                onImagesChange={handleImageUpload}
              />
              {imageUrl && <div className="mt-2 h-24 w-48 relative rounded overflow-hidden border">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Promotion title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Action Link (Optional)</Label>
              <Input id="link" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="active" checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
              <Label htmlFor="active">Active (Visible in app)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={isEditDialogOpen ? handleEditBanner : handleAddBanner} disabled={isCreating || isUpdating || isUploadingImage}>
              {isUploadingImage ? "Uploading..." : (isCreating || isUpdating) ? "Saving..." : "Save Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>Are you sure you want to delete this banner? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteBanner} variant="destructive" disabled={isDeleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
