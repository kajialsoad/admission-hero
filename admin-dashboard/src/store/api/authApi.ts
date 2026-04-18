import { adminApiSlice } from "./adminApiSlice"

export interface AdminLoginRequest {
  phoneOrEmail: string
  password: string
}

export interface AdminUser {
  id: string
  name: string
  phone: string
  email?: string
  role: string
}

export interface AdminAuthResponse {
  success: boolean
  user: AdminUser
  token: string
  message?: string
}

export const authApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AdminAuthResponse, AdminLoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getAdminProfile: builder.query<{ success: boolean; data: AdminUser; message: string }, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),
  }),
})

export const { useAdminLoginMutation, useGetAdminProfileQuery } = authApi
