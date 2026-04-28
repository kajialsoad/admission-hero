import { adminApiSlice } from "./adminApiSlice"

export interface UploadResponse {
  url: string
  publicId: string
  width?: number
  height?: number
  format: string
  size: number
  originalName?: string
}

export interface UploadSignature {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  resourceType: string
}

export const uploadsApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload single image
    uploadImage: builder.mutation<
      { data: UploadResponse },
      FormData
    >({
      query: (formData) => ({
        url: "uploads/image",
        method: "POST",
        body: formData,
      }),
    }),

    // Upload multiple images
    uploadImages: builder.mutation<
      { data: UploadResponse[] },
      FormData
    >({
      query: (formData) => ({
        url: "uploads/images",
        method: "POST",
        body: formData,
      }),
    }),

    // Upload document
    uploadDocument: builder.mutation<
      { data: UploadResponse },
      FormData
    >({
      query: (formData) => ({
        url: "uploads/document",
        method: "POST",
        body: formData,
      }),
    }),

    // Delete uploaded file
    deleteUploadedFile: builder.mutation<
      { message: string },
      {
        publicId: string
        resourceType?: string
      }
    >({
      query: ({ publicId, resourceType = "image" }) => ({
        url: `uploads/${publicId}?resourceType=${resourceType}`,
        method: "DELETE",
      }),
    }),

    // Get upload signature for client-side uploads
    getUploadSignature: builder.mutation<
      { data: UploadSignature },
      {
        folder?: string
        resourceType?: string
      }
    >({
      query: (params = {}) => ({
        url: "uploads/signature",
        method: "POST",
        body: params,
      }),
    }),
  }),
})

export const {
  useUploadImageMutation,
  useUploadImagesMutation,
  useUploadDocumentMutation,
  useDeleteUploadedFileMutation,
  useGetUploadSignatureMutation,
} = uploadsApi