import { adminApiSlice } from "./adminApiSlice"

export interface Banner {
  _id: string
  title: string
  imageUrl: string
  link?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export const bannersApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<{ success: boolean; data: Banner[] }, void>({
      query: () => "/banners",
      providesTags: ["Banners"],
    }),
    getActiveBanners: builder.query<{ success: boolean; data: Banner[] }, void>({
      query: () => "/banners/active",
      providesTags: ["Banners"],
    }),
    createBanner: builder.mutation<{ success: boolean; data: Banner }, Partial<Banner>>({
      query: (data) => ({
        url: "/banners",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Banners"],
    }),
    updateBanner: builder.mutation<{ success: boolean; data: Banner }, { id: string; data: Partial<Banner> }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banners"],
    }),
  }),
})

export const {
  useGetBannersQuery,
  useGetActiveBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannersApi
