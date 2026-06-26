"use client"

import { useState } from "react"
import { Search, UserCheck, UserX, Mail, Phone, Shield, UserPlus } from "lucide-react"
import toast from "react-hot-toast"
import { 
  useGetUsersQuery, 
  useUpdateUserStatusMutation, 
  useCreateAdminMutation,
  useUpdateUserPermissionsMutation
} from "../../../store/api/usersApi"

const AVAILABLE_PAGES = [
  { id: "dashboard", name: "Dashboard Home (ড্যাশবোর্ড হোম)" },
  { id: "universities", name: "University Manage (বিশ্ববিদ্যালয় ম্যানেজ)" },
  { id: "questions", name: "Question Manage (প্রশ্ন ম্যানেজ)" },
  { id: "users", name: "User Manage (ইউজার ম্যানেজ)" },
  { id: "admins", name: "Admin Manage (অ্যাডমিন ম্যানেজ)" },
  { id: "packages", name: "Packages (প্যাকেজ সমূহ)" },
  { id: "promo-codes", name: "Promo Codes (প্রোমো কোড)" },
  { id: "banners", name: "Banner Manage (ব্যানার ম্যানেজ)" },
  { id: "statistics", name: "App Statistics (অ্যাপ পরিসংখ্যান)" },
  { id: "payments", name: "Payments (পেমেন্ট সমূহ)" },
  { id: "app-content", name: "App Content (অ্যাপ কনটেন্ট)" },
  { id: "settings", name: "Settings (সেটিংস)" },
]

export default function AdminsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    allowedPages: [] as string[]
  })
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [permissionsModalData, setPermissionsModalData] = useState<{ userId: string; allowedPages: string[] } | null>(null)

  // Fetch only users with role === 'admin'
  const { data, error, isLoading } = useGetUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: "admin",
  })

  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation()
  const [updateUserPermissions, { isLoading: isUpdatingPermissions }] = useUpdateUserPermissionsMutation()

  const handleCreateAdmin = async () => {
    if (!adminFormData.name || !adminFormData.email || !adminFormData.phone || !adminFormData.password) {
      toast.error("All fields are required")
      return
    }

    try {
      await createAdmin(adminFormData).unwrap()
      toast.success("Admin created successfully")
      setShowCreateAdminModal(false)
      setAdminFormData({ name: "", email: "", phone: "", password: "", allowedPages: [] })
    } catch (error: any) {
      toast.error(error.data?.error || error.data?.message || "Failed to create admin")
    }
  }

  const handleUpdatePermissions = async () => {
    if (!permissionsModalData) return
    try {
      await updateUserPermissions({
        id: permissionsModalData.userId,
        allowedPages: permissionsModalData.allowedPages,
      }).unwrap()
      toast.success("Permissions updated successfully")
      setShowPermissionsModal(false)
      setPermissionsModalData(null)
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update permissions")
    }
  }

  const handleStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus({ id: userId, isActive }).unwrap()
      toast.success(`Admin ${isActive ? "activated" : "deactivated"} successfully`)
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update status")
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load admin users</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage admin accounts, status, and page permissions.</p>
        </div>
        <button
          onClick={() => setShowCreateAdminModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Create Admin
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search admins by name, email, or phone..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.data?.map((admin) => (
            <li key={admin._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">{admin.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                        <div>{getStatusBadge(admin.isActive)}</div>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 flex-wrap gap-4">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{admin.phone}</span>
                        </div>
                        {admin.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{admin.email}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">Joined: {formatDate(admin.createdAt)}</span>
                      </div>
                      
                      {/* Permissions List Tag rendering */}
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs font-semibold text-gray-500 mr-1">Allowed Pages:</span>
                        {admin.email === "admin@admissionhero.com" || admin.phone === "01700000000" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm">
                            Super Admin (All Access)
                          </span>
                        ) : admin.allowedPages && admin.allowedPages.length > 0 ? (
                          admin.allowedPages.map((pageId) => {
                            const matched = AVAILABLE_PAGES.find(p => p.id === pageId)
                            return (
                              <span key={pageId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                {matched ? matched.name.split(" ")[0] : pageId}
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic">None (No page access)</span>
                        )}
                      </div>

                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    {/* Only show Shield button for non-super admins to prevent restricting super admin */}
                    {!(admin.email === "admin@admissionhero.com" || admin.phone === "01700000000") && (
                      <button
                        onClick={() => {
                          setPermissionsModalData({
                            userId: admin._id,
                            allowedPages: admin.allowedPages || [],
                          })
                          setShowPermissionsModal(true)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-all"
                        title="Manage Permissions"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Permissions
                      </button>
                    )}
                    
                    {/* Status toggle */}
                    {!(admin.email === "admin@admissionhero.com" || admin.phone === "01700000000") && (
                      admin.isActive ? (
                        <button
                          onClick={() => handleStatusUpdate(admin._id, false)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all"
                          title="Deactivate Admin"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(admin._id, true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all"
                          title="Activate Admin"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      {data?.data?.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria.
          </p>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Admin</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter full name"
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="admin@example.com"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="01XXXXXXXXX"
                  value={adminFormData.phone}
                  onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter password"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">Page Permissions (পেজ এক্সেসসমূহ)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  {AVAILABLE_PAGES.map((page) => {
                    const isChecked = adminFormData.allowedPages?.includes(page.id)
                    return (
                      <label key={page.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-1.5 rounded hover:bg-white transition-all">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                          checked={isChecked}
                          onChange={(e) => {
                            let updatedPages = [...(adminFormData.allowedPages || [])]
                            if (e.target.checked) {
                              updatedPages.push(page.id)
                            } else {
                              updatedPages = updatedPages.filter((id) => id !== page.id)
                            }
                            setAdminFormData({ ...adminFormData, allowedPages: updatedPages })
                          }}
                        />
                        <span>{page.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                <strong>Note:</strong> The new admin will be able to login with the provided email/phone and password.
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateAdminModal(false)
                  setAdminFormData({ name: "", email: "", phone: "", password: "", allowedPages: [] })
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={isCreatingAdmin}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingAdmin ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {showPermissionsModal && permissionsModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <h3 className="text-lg font-medium">Manage Admin Permissions</h3>
              <p className="text-xs text-amber-50 mt-1">Select which pages this admin is allowed to access.</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-72 overflow-y-auto">
                {AVAILABLE_PAGES.map((page) => {
                  const isChecked = permissionsModalData.allowedPages.includes(page.id)
                  return (
                    <label key={page.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer p-2 rounded-lg hover:bg-white transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4.5 w-4.5"
                        checked={isChecked}
                        onChange={(e) => {
                          let updatedPages = [...permissionsModalData.allowedPages]
                          if (e.target.checked) {
                            updatedPages.push(page.id)
                          } else {
                            updatedPages = updatedPages.filter((id) => id !== page.id)
                          }
                          setPermissionsModalData({ ...permissionsModalData, allowedPages: updatedPages })
                        }}
                      />
                      <span className="font-medium">{page.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowPermissionsModal(false)
                  setPermissionsModalData(null)
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermissions}
                disabled={isUpdatingPermissions}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md shadow-amber-200"
              >
                {isUpdatingPermissions ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * 20, data.pagination.total)}</span> of{" "}
                <span className="font-medium">{data.pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-green-50 border-green-500 text-green-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
