import { adminApiSlice } from "./adminApiSlice"

export interface University {
  _id: string
  name: string
  shortName?: string
  logo?: string
  units: string[] // ["A", "B", "C", "D"]
  createdAt: string
  updatedAt: string
}

export interface UniversitiesQuery {
  page?: number
  limit?: number
  search?: string
}

export interface UniversitiesResponse {
  success: boolean
  data: University[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message: string
}

export interface UniversityData {
  name: string
  shortName?: string
  logo?: string
  units: string[]
}

export interface CreateUniversityRequest {
  data: UniversityData
}

export interface UpdateUniversityRequest {
  id: string
  data: UniversityData
}

export const universitiesApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUniversities: builder.query<UniversitiesResponse, UniversitiesQuery>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `/universities?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: "University" as const, id: _id })),
              { type: "University", id: "LIST" },
            ]
          : [{ type: "University", id: "LIST" }],
    }),

    getUniversity: builder.query<{ success: boolean; data: University; message: string }, string>({
      query: (id) => `/universities/${id}`,
      providesTags: (result, error, id) => [{ type: "University", id }],
    }),

    createUniversity: builder.mutation<
      { success: boolean; data: University; message: string },
      CreateUniversityRequest
    >({
      query: ({ data }) => ({
        url: `/universities`,
        method: "POST",
        body: data, // Send as JSON
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: [{ type: "University", id: "LIST" }],
    }),

    updateUniversity: builder.mutation<
      { success: boolean; data: University; message: string },
      UpdateUniversityRequest
    >({
      query: ({ id, data }) => ({
        url: `/universities/${id}`,
        method: "PUT",
        body: data, // Send as JSON
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "University", id },
        { type: "University", id: "LIST" },
      ],
    }),

    deleteUniversity: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/universities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "University", id: "LIST" }],
    }),
  }),
})

export const {
  useGetUniversitiesQuery,
  useGetUniversityQuery,
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
  useDeleteUniversityMutation,
} = universitiesApi