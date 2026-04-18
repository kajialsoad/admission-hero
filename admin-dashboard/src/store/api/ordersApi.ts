import { adminApiSlice } from "./adminApiSlice"

export interface AdminOrder {
  _id: string
  productId: string
  productName: string
  productPrice: number
  buyerId: string
  buyerName: string
  buyerPhone: string
  sellerPhone?: string
  sellerId: string
  sellerName: string
  deliveryAddress: string
  paymentMethod: "bkash" | "nagad"
  paymentAccountLastFour: string
  advanceAmount: number
  remainingAmount: number
  totalAmount: number
  status: "pending" | "confirmed" | "delivered" | "cancelled"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AdminOrdersQuery {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface AdminOrdersResponse {
  data: AdminOrder[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const adminOrdersApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOrders: builder.query<AdminOrdersResponse, AdminOrdersQuery>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `/admin/orders?${searchParams.toString()}`
      },
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<AdminOrder, { id: string; status: string; notes?: string }>({
      query: ({ id, ...data }) => ({
        url: `/orders/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Order", "Dashboard"],
    }),
  }),
})

export const { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } = adminOrdersApi
