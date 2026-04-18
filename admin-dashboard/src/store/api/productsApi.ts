import { adminApiSlice } from "./adminApiSlice"

export interface AdminProduct {
  _id: string
  name: string
  description: string
  price: number
  quantity: string
  category: string
  image: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export interface AdminProductsQuery {
  page?: number
  limit?: number
  status?: string
  category?: string
  search?: string
}

export interface AdminProductsResponse {
  success: boolean
  data: AdminProduct[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message: string
}

export interface UpdateProductRequest {
  id: string
  data: FormData
}

export const adminProductsApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query<AdminProductsResponse, AdminProductsQuery>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `/admin/products?${searchParams.toString()}`
      },
      providesTags: ["Product"],
    }),
    updateProduct: builder.mutation<{ success: boolean; data: AdminProduct; message: string }, UpdateProductRequest>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    approveProduct: builder.mutation<AdminProduct, string>({
      query: (productId) => ({
        url: `/admin/products/${productId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    rejectProduct: builder.mutation<AdminProduct, string>({
      query: (productId) => ({
        url: `/admin/products/${productId}/reject`,
        method: "PUT",
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
  }),
})

export const {
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  useApproveProductMutation,
  useRejectProductMutation,
} = adminProductsApi
