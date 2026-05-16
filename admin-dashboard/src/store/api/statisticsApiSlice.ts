import { adminApiSlice } from "./adminApiSlice"

export interface Statistics {
  _id: string
  totalExams: number
  totalQuestions: number
  totalVideos: number
  lastUpdatedBy?: {
    _id: string
    name: string
    email: string
  }
  updatedAt: string
  createdAt: string
}

export interface UpdateStatisticsRequest {
  totalExams?: number
  totalQuestions?: number
  totalVideos?: number
}

export const statisticsApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStatistics: builder.query<{ success: boolean; data: Statistics }, void>({
      query: () => "/statistics/admin",
      providesTags: ["Statistics"],
    }),
    updateStatistics: builder.mutation<
      { success: boolean; message: string; data: Statistics },
      UpdateStatisticsRequest
    >({
      query: (data) => ({
        url: "/statistics",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Statistics"],
    }),
  }),
})

export const { useGetStatisticsQuery, useUpdateStatisticsMutation } = statisticsApiSlice
