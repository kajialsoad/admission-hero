import { adminApiSlice } from "./adminApiSlice"

export interface QuestionOption {
  key: string
  text: string
}

export interface Question {
  _id: string
  questionSetId: string
  university: {
    _id: string
    name: string
    shortName: string
  }
  unit: string
  session: string
  questionNumber: number
  text: string
  questionType: "mcq"
  options: QuestionOption[]
  correctAnswer: string
  explanations: {
    title: string
    content: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface QuestionSet {
  _id: string
  name: string
  university: {
    _id: string
    name: string
    shortName: string
  }
  unit: string
  session: string
  totalQuestions: number
  videoUrl?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface QuestionsQuery {
  page?: number
  limit?: number
  universityId?: string
  unit?: string
  session?: string
}

export interface QuestionSetResponse {
  success: boolean
  data: QuestionSet[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message: string
}

export interface CreateQuestionSetRequest {
  data: {
    name: string
    university: string
    unit: string
    session: string
    videoUrl?: string
    description?: string
    questions: {
      text: string
      options: QuestionOption[]
      correctAnswer: string
      explanation?: string
    }[]
  }
}

export interface UpdateQuestionSetRequest {
  id: string
  data: {
    name?: string
    videoUrl?: string
    description?: string
  }
}

export const questionsApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionSets: builder.query<QuestionSetResponse, QuestionsQuery>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `/questions/sets/all?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: "QuestionSet" as const, id: _id })),
              { type: "QuestionSet", id: "LIST" },
            ]
          : [{ type: "QuestionSet", id: "LIST" }],
    }),

    createQuestionSet: builder.mutation<
      { success: boolean; data: QuestionSet; message: string },
      CreateQuestionSetRequest
    >({
      query: ({ data }) => ({
        url: `/questions/sets`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "QuestionSet", id: "LIST" }],
    }),

    updateQuestionSet: builder.mutation<
      { success: boolean; data: QuestionSet; message: string },
      UpdateQuestionSetRequest
    >({
      query: ({ id, data }) => ({
        url: `/questions/sets/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "QuestionSet", id },
        { type: "QuestionSet", id: "LIST" },
      ],
    }),

    deleteQuestionSet: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/questions/sets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "QuestionSet", id: "LIST" }],
    }),

    getQuestionsBySetId: builder.query<
      { success: boolean; data: Question[]; message: string },
      string
    >({
      query: (setId) => `/questions/sets/${setId}/questions`,
      providesTags: (result, error, setId) => [{ type: "Question", id: setId }],
    }),
  }),
})

export const {
  useGetQuestionSetsQuery,
  useCreateQuestionSetMutation,
  useUpdateQuestionSetMutation,
  useDeleteQuestionSetMutation,
  useGetQuestionsBySetIdQuery,
} = questionsApi