import { adminApiSlice } from "./adminApiSlice"

export interface AdminUser {
  _id: string
  name: string
  phone: string
  email?: string
  role: "user" | "admin"
  isActive: boolean
  subscriptionStatus: "free" | "paid"
  subscriptionType?: "1-month" | "3-month" | "6-month"
  subscriptionExpireAt?: string
  createdAt: string
  updatedAt: string
}

export interface AdminUsersQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  subscriptionFilter?: "all" | "free" | "paid"
  sortBy?: "newest" | "expiring"
}

export interface AdminUsersResponse {
  success: boolean
  data: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message: string
}

export interface UpdateUserStatusRequest {
  id: string
  isActive: boolean
}

export interface UpdateSubscriptionRequest {
  id: string
  subscriptionStatus: "free" | "paid"
  subscriptionType?: "1-month" | "3-month" | "6-month"
  subscriptionExpireAt?: string
}

export interface CreateAdminRequest {
  name: string
  email: string
  phone: string
  password: string
}

export const adminUsersApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<AdminUsersResponse, AdminUsersQuery>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `/users?${searchParams.toString()}`
      },
      providesTags: ["User"],
    }),
    getUserById: builder.query<{ success: boolean; data: AdminUser; message: string }, string>({
      query: (id) => `/users/${id}`,
      providesTags: ["User"],
    }),
    updateUserStatus: builder.mutation<{ success: boolean; data: AdminUser; message: string }, UpdateUserStatusRequest>(
      {
        query: ({ id, isActive }) => ({
          url: `/users/${id}/status`,
          method: "PUT",
          body: { isActive },
        }),
        invalidatesTags: ["User", "Dashboard"],
      },
    ),
    updateUserSubscription: builder.mutation<
      { success: boolean; data: AdminUser; message: string },
      UpdateSubscriptionRequest
    >({
      query: ({ id, subscriptionStatus, subscriptionType, subscriptionExpireAt }) => ({
        url: `/users/${id}/subscription`,
        method: "PUT",
        body: { subscriptionStatus, subscriptionType, subscriptionExpireAt },
      }),
      invalidatesTags: ["User", "Dashboard"],
    }),
    createAdmin: builder.mutation<{ success: boolean; data: AdminUser; message: string }, CreateAdminRequest>({
      query: (body) => ({
        url: `/admin/create-admin`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateUserSubscriptionMutation,
  useCreateAdminMutation,
} = adminUsersApi
