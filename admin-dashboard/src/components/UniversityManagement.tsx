"use client"

import { useState } from "react"
import { Search, Plus, MoreVertical, Pencil, Trash2, GraduationCap } from "lucide-react"
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
import Image from "next/image"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useGetUniversitiesQuery,
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
  useDeleteUniversityMutation,
  type University,
} from "../store/api/universitiesApi"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import toast from "react-hot-toast"

const AVAILABLE_UNITS = ["A", "B", "C", "D"]

export default function UniversityManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
  })

  const [selectedUnits, setSelectedUnits] = useState<string[]>([])

  // API hooks
  const { data: universitiesData, isLoading } = useGetUniversitiesQuery({
    page,
    limit: 10,
    search: searchQuery,
  })
  const [createUniversity, { isLoading: isCreating }] = useCreateUniversityMutation()
  const [updateUniversity, { isLoading: isUpdating }] = useUpdateUniversityMutation()
  const [deleteUniversity, { isLoading: isDeleting }] = useDeleteUniversityMutation()

  const universities = universitiesData?.data || []
  const pagination = universitiesData?.pagination || { page: 1, pages: 1, total: 0 }

  const handleImageUpload = async (images: File[]) => {
    if (!images?.length) {
      setLogoUrl("")
      return
    }

    setIsUploadingImage(true)
    try {
      const urls = await uploadMultipleToCloudinary(images)
      setLogoUrl(urls[0])
      toast.success("University logo uploaded successfully!")
    } catch (err) {
      console.error("Logo upload failed:", err)
      toast.error("Failed to upload university logo. Please try again.")
      setLogoUrl("")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Toggle unit selection
  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    )
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      shortName: "",
    })
    setSelectedUnits([])
    setLogoUrl("")
    setSelectedUniversity(null)
  }

  // Handle add university
  const handleAddUniversity = async () => {
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter university name")
      return
    }

    if (isUploadingImage) {
      toast.error("Please wait for image upload to complete")
      return
    }

    try {
      // Send as JSON instead of FormData
      const dataToSend = {
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || "",
        logo: logoUrl || "",
        units: selectedUnits,
      }

      console.log("Sending data:", dataToSend)

      await createUniversity({ data: dataToSend }).unwrap()
      toast.success("University created successfully")
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error("Create error:", error)
      toast.error(error?.data?.message || "Failed to create university")
    }
  }

  // Handle edit university
  const handleEditUniversity = async () => {
    if (!selectedUniversity) return

    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter university name")
      return
    }

    if (isUploadingImage) {
      toast.error("Please wait for image upload to complete")
      return
    }

    try {
      // Send as JSON instead of FormData
      const dataToSend = {
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || "",
        logo: logoUrl || "",
        units: selectedUnits,
      }

      await updateUniversity({ id: selectedUniversity._id, data: dataToSend }).unwrap()
      toast.success("University updated successfully")
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update university")
    }
  }

  // Handle delete university
  const handleDeleteUniversity = async () => {
    if (!selectedUniversity) return
    try {
      await deleteUniversity(selectedUniversity._id).unwrap()
      toast.success("University deleted successfully")
      setIsDeleteDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete university")
    }
  }

  // Open edit dialog
  const openEditDialog = (university: University) => {
    setSelectedUniversity(university)
    setFormData({
      name: university.name,
      shortName: university.shortName || "",
    })
    setLogoUrl(university.logo || "")
    setSelectedUnits(university.units || [])
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (university: University) => {
    setSelectedUniversity(university)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Universities</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{pagination.total}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Page</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{pagination.page}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{pagination.pages}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* University Management */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="md:flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                University Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">Manage all universities and their units</p>
            </div>
            <Button className="md:mt-0 mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add University
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Universities Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : universities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No universities found
                  </td>
                </tr>
              ) : (
                universities.map((university) => (
                  <tr key={university._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={university.logo || "/placeholder.svg"}
                          alt={university.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{university.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{university.shortName || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {university.units && university.units.length > 0 ? (
                          university.units.map((unit) => (
                            <span
                              key={unit}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"
                            >
                              {unit}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No units</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(university.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(university)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(university)} className="text-red-600">
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add University Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New University</DialogTitle>
            <DialogDescription>Create a new university profile</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="university-logo">University Logo</Label>
              <p className="text-sm text-gray-500 mb-2">Upload a university logo (recommended: 200x200px)</p>
              <ImageUpload
                id="university-logo"
                maxFiles={1}
                maxSize={5}
                onImagesChange={handleImageUpload}
                label="Upload University Logo"
              />
              {isUploadingImage && <p className="text-sm text-emerald-600 mt-2">Uploading logo...</p>}
              {logoUrl && <p className="text-sm text-green-600 mt-2">Logo uploaded successfully!</p>}
            </div>

            <div>
              <Label htmlFor="name">University Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter university name"
              />
            </div>

            <div>
              <Label htmlFor="shortName">Short Name</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="e.g., DU, BUET"
              />
            </div>

            {/* Units Selection */}
            <div>
              <Label>Units</Label>
              <p className="text-sm text-gray-500 mb-3">Select the units available in this university</p>
              <div className="flex flex-wrap gap-4">
                {AVAILABLE_UNITS.map((unit) => (
                  <div key={unit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${unit}`}
                      checked={selectedUnits.includes(unit)}
                      onCheckedChange={() => toggleUnit(unit)}
                    />
                    <label
                      htmlFor={`unit-${unit}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Unit {unit}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUniversity}
              disabled={isCreating || isUploadingImage || !formData.name}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUploadingImage ? "Uploading..." : isCreating ? "Creating..." : "Create University"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>Update university information</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="edit-logo">University Logo</Label>
              <p className="text-sm text-gray-500 mb-2">Upload a new logo or keep the existing one</p>
              {logoUrl && !isUploadingImage && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                  <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100 border border-gray-200">
                    <Image src={logoUrl || "/placeholder.svg"} alt="Current logo" fill className="object-contain" />
                  </div>
                </div>
              )}
              <ImageUpload
                id="edit-logo"
                maxFiles={1}
                maxSize={5}
                onImagesChange={handleImageUpload}
                label="Upload New Logo"
              />
              {isUploadingImage && <p className="text-sm text-emerald-600 mt-2">Uploading logo...</p>}
            </div>

            <div>
              <Label htmlFor="edit-name" className="mb-1">University Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter university name"
              />
            </div>

            <div>
              <Label htmlFor="edit-shortName" className="mb-1">Short Name</Label>
              <Input
                id="edit-shortName"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="e.g., DU, BUET"
              />
            </div>

            {/* Units Selection */}
            <div>
              <Label>Units</Label>
              <p className="text-sm text-gray-500 mb-3">Select the units available in this university</p>
              <div className="flex flex-wrap gap-4">
                {AVAILABLE_UNITS.map((unit) => (
                  <div key={unit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-unit-${unit}`}
                      checked={selectedUnits.includes(unit)}
                      onCheckedChange={() => toggleUnit(unit)}
                    />
                    <label
                      htmlFor={`edit-unit-${unit}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Unit {unit}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditUniversity}
              disabled={isUpdating || isUploadingImage || !formData.name}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUploadingImage ? "Uploading..." : isUpdating ? "Updating..." : "Update University"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete University</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedUniversity?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteUniversity} variant="destructive" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete University"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}