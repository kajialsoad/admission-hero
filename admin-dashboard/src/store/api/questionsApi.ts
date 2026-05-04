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
  accessType: 'free' | 'paid' // Add accessType field
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
    accessType?: 'free' | 'paid' // Add accessType field
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
    accessType?: 'free' | 'paid' // Add accessType field
  }
}

export interface AddQuestionsToSetRequest {
  setId: string
  questions: {
    text: string
    options: QuestionOption[]
    correctAnswer: string
    explanation?: string
  }[]
}

export interface UpdateQuestionRequest {
  questionId: string
  data: {
    text?: string
    options?: QuestionOption[]
    correctAnswer?: string
    explanation?: string
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

    addQuestionsToSet: builder.mutation<
      { success: boolean; data: Question[]; message: string },
      AddQuestionsToSetRequest
    >({
      query: ({ setId, questions }) => ({
        url: `/questions/sets/${setId}/questions`,
        method: "POST",
        body: { questions },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { setId }) => [
        { type: "Question", id: setId },
        { type: "QuestionSet", id: "LIST" },
      ],
    }),

    updateQuestion: builder.mutation<
      { success: boolean; data: Question; message: string },
      UpdateQuestionRequest
    >({
      query: ({ questionId, data }) => ({
        url: `/questions/${questionId}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: "Question", id: result?.data.questionSetId },
      ],
    }),

    deleteQuestion: builder.mutation<{ success: boolean; message: string }, string>({
      query: (questionId) => ({
        url: `/questions/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Question" }, { type: "QuestionSet", id: "LIST" }],
    }),
  }),
})

export const {
  useGetQuestionSetsQuery,
  useCreateQuestionSetMutation,
  useUpdateQuestionSetMutation,
  useDeleteQuestionSetMutation,
  useGetQuestionsBySetIdQuery,
  useAddQuestionsToSetMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionsApi