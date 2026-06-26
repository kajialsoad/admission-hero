"use client"

import { useState } from "react"
import { Search, UserCheck, UserX, Mail, Phone, Edit2, Zap, UserPlus } from "lucide-react"
import toast from "react-hot-toast"
import { 
  useGetUsersQuery, 
  useUpdateUserStatusMutation, 
  useUpdateUserSubscriptionMutation,
  useCreateUserMutation
} from "../../../store/api/usersApi"

interface SubscriptionModalData {
  userId: string
  currentStatus: "free" | "Premium"
  currentType?: "1-month" | "3-month" | "6-month"
  currentExpireAt?: string
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "free" | "Premium">("all")
  const [showSubModal, setShowSubModal] = useState(false)
  const [subModalData, setSubModalData] = useState<SubscriptionModalData | null>(null)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    subscriptionStatus: "free" as "free" | "Premium",
    subscriptionType: undefined as "1-month" | "3-month" | "6-month" | undefined,
  })

  const { data, error, isLoading } = useGetUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    subscriptionFilter: subscriptionFilter !== "all" ? subscriptionFilter : undefined,
    role: "user",
  })

  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [updateUserSubscription] = useUpdateUserSubscriptionMutation()
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation()

  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.phone || !userFormData.password) {
      toast.error("Name, phone, and password are required")
      return
    }

    if (userFormData.subscriptionStatus === "Premium" && !userFormData.subscriptionType) {
      toast.error("Please select a plan duration for Premium user")
      return
    }

    try {
      await createUser(userFormData).unwrap()
      toast.success("User created successfully")
      setShowCreateUserModal(false)
      setUserFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        subscriptionStatus: "free",
        subscriptionType: undefined,
      })
    } catch (error: any) {
      toast.error(error.data?.error || error.data?.message || "Failed to create user")
    }
  }

  const handleStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus({ id: userId, isActive }).unwrap()
      toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update user status")
    }
  }

  const handleSubscriptionUpdate = async (formData: SubscriptionModalData) => {
    try {
      const expireAt =
        formData.currentStatus === "Premium" && formData.currentType
          ? new Date(Date.now() + getDurationMs(formData.currentType)).toISOString()
          : undefined

      await updateUserSubscription({
        id: formData.userId,
        subscriptionStatus: formData.currentStatus,
        subscriptionType: formData.currentType,
        subscriptionExpireAt: expireAt,
      }).unwrap()

      toast.success(`User subscription updated to ${formData.currentStatus}`)
      setShowSubModal(false)
      setSubModalData(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update subscription")
    }
  }

  const getDurationMs = (type: "1-month" | "3-month" | "6-month") => {
    const daysMap = { "1-month": 30, "3-month": 90, "6-month": 180 }
    return daysMap[type] * 24 * 60 * 60 * 1000
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

  const getSubscriptionBadge = (status: "free" | "Premium", expireAt?: string) => {
    const isExpired = expireAt && new Date(expireAt) < new Date()
    const daysLeft =
      expireAt && !isExpired
        ? Math.ceil((new Date(expireAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0

    if (status === "free") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Free User
        </span>
      )
    }

    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Premium ({daysLeft}d left)
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <p className="text-red-500">Failed to load users</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage all registered users and their account status.</p>
        </div>
        <button
          onClick={() => setShowCreateUserModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 p-3 rounded-md">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{data?.pagination?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-500 p-3 rounded-md">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {data?.data?.filter((user) => user.isActive).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-500 p-3 rounded-md">
                  <UserX className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {data?.data?.filter((user) => !user.isActive).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-500 p-3 rounded-md">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Premium Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {data?.data?.filter((user) => user.subscriptionStatus === "Premium").length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-500 p-3 rounded-md">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Free Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {data?.data?.filter((user) => user.subscriptionStatus === "free").length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name or phone..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={subscriptionFilter}
                onChange={(e) => setSubscriptionFilter(e.target.value as "all" | "free" | "Premium")}
              >
                <option value="all">All Users</option>
                <option value="free">Free Users</option>
                <option value="Premium">Premium Users</option>
              </select>
            </div>
          </div> */}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.data?.map((user) => (
            <li key={user._id}>
              <div className="px-2 md:px-4 py-4 sm:px-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <div>{getStatusBadge(user.isActive)}</div>
                        <div>{getSubscriptionBadge(user.subscriptionStatus, user.subscriptionExpireAt)}</div>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 flex-wrap gap-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{user.phone}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>Role: {user.role}</span>
                        <span className="mx-2">•</span>
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>
                      {user.subscriptionStatus === "Premium" && user.subscriptionType && (
                        <div className="mt-2 text-sm text-blue-600 font-medium">
                          Plan: {user.subscriptionType.replace("-", " ")} {user.subscriptionExpireAt && `(Expires: ${formatDate(user.subscriptionExpireAt)})`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSubModalData({
                          userId: user._id,
                          currentStatus: user.subscriptionStatus,
                          currentType: user.subscriptionType,
                          currentExpireAt: user.subscriptionExpireAt,
                        })
                        setShowSubModal(true)
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Manage Subscription"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => handleStatusUpdate(user._id, false)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(user._id, true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
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
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? "Try adjusting your search criteria." : "No users have registered yet."}
          </p>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubModal && subModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Subscription</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={subModalData.currentStatus}
                  onChange={(e) => {
                    setSubModalData({
                      ...subModalData,
                      currentStatus: e.target.value as "free" | "Premium",
                      currentType: e.target.value === "free" ? undefined : subModalData.currentType,
                    })
                  }}
                >
                  <option value="free">Free User</option>
                  <option value="Premium">Premium User</option>
                </select>
              </div>

              {subModalData.currentStatus === "Premium" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Duration</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={subModalData.currentType || ""}
                    onChange={(e) => {
                      setSubModalData({
                        ...subModalData,
                        currentType: e.target.value as "1-month" | "3-month" | "6-month",
                      })
                    }}
                  >
                    <option value="">Select a plan</option>
                    <option value="1-month">1 Month</option>
                    <option value="3-month">3 Months</option>
                    <option value="6-month">6 Months</option>
                  </select>
                </div>
              )}

              {subModalData.currentStatus === "Premium" && subModalData.currentType && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  Subscription will be valid for {subModalData.currentType.split("-")[0]} month(s) from now.
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowSubModal(false)
                  setSubModalData(null)
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubscriptionUpdate(subModalData)}
                disabled={subModalData.currentStatus === "Premium" && !subModalData.currentType}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Create New User (নতুন ইউজার তৈরি করুন)</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (পূর্ণ নাম) *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter full name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (মোবাইল নম্বর) *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="01XXXXXXXXX"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (ইমেইল - ঐচ্ছিক)</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="user@example.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password (পাসওয়ার্ড) *</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Type (সাবস্ক্রিপশন টাইপ)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={userFormData.subscriptionStatus}
                  onChange={(e) => {
                    const status = e.target.value as "free" | "Premium"
                    setUserFormData({
                      ...userFormData,
                      subscriptionStatus: status,
                      subscriptionType: status === "free" ? undefined : "1-month",
                    })
                  }}
                >
                  <option value="free">Free User (ফ্রি ইউজার)</option>
                  <option value="Premium">Premium User (প্রিমিয়াম ইউজার)</option>
                </select>
              </div>

              {userFormData.subscriptionStatus === "Premium" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Duration (প্যাকেজের মেয়াদ) *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={userFormData.subscriptionType || ""}
                    onChange={(e) => {
                      setUserFormData({
                        ...userFormData,
                        subscriptionType: e.target.value as "1-month" | "3-month" | "6-month",
                      })
                    }}
                  >
                    <option value="1-month">1 Month (১ মাস)</option>
                    <option value="3-month">3 Months (৩ মাস)</option>
                    <option value="6-month">6 Months (৬ মাস)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateUserModal(false)
                  setUserFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    subscriptionStatus: "free",
                    subscriptionType: undefined,
                  })
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel (বাতিল)
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isCreatingUser}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingUser ? "Creating..." : "Create User (ইউজার তৈরি করুন)"}
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
                {/* Page numbers */}
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
