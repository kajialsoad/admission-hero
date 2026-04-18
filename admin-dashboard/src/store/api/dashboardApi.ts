import { adminApiSlice } from "./adminApiSlice"

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  pendingProducts: number
  totalRevenue: number
}

export interface DashboardResponse {
  success: boolean
  data: DashboardStats
  message: string
}

export const dashboardApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardResponse, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
})

export const { useGetDashboardStatsQuery } = dashboardApi
