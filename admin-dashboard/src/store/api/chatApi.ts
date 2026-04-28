import { adminApiSlice } from "./adminApiSlice"

export interface ChatMessage {
  _id: string
  senderId: string
  senderName: string
  senderType: 'user' | 'admin' | 'system'
  message: string
  messageType: 'text' | 'image' | 'file'
  timestamp: string
  isRead: boolean
  conversationId: string
  metadata?: {
    fileName?: string
    fileSize?: number
    imageUrl?: string
  }
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export const chatApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get chat messages for a conversation
    getChatMessages: builder.query<{
      data: ChatMessage[]
      pagination: {
        page: number
        limit: number
        total: number
      }
    }, {
      conversationId: string
      page?: number
      limit?: number
    }>({
      query: ({ conversationId, page = 1, limit = 50 }) => 
        `chat/conversation/${conversationId}?page=${page}&limit=${limit}`,
      providesTags: ["Chat"],
    }),

    // Send chat message
    sendChatMessage: builder.mutation<
      { data: ChatMessage },
      {
        message: string
        conversationId: string
        messageType?: string
        metadata?: any
      }
    >({
      query: (messageData) => ({
        url: "chat/send",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["Chat"],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<
      { message: string },
      string
    >({
      query: (conversationId) => ({
        url: `chat/read/${conversationId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Chat"],
    }),

    // Get unread message count
    getUnreadMessageCount: builder.query<
      { data: { unreadCount: number } },
      string
    >({
      query: (conversationId) => `chat/unread/${conversationId}`,
      providesTags: ["Chat"],
    }),

    // Send auto-response
    sendAutoResponse: builder.mutation<
      { data: ChatMessage },
      {
        message: string
        conversationId: string
      }
    >({
      query: (data) => ({
        url: "chat/auto-response",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),

    // Get all conversations (admin view)
    getAllConversations: builder.query<{
      data: Conversation[]
      pagination: {
        page: number
        limit: number
        total: number
      }
    }, {
      page?: number
      limit?: number
      status?: string
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `chat/conversations?${searchParams.toString()}`
      },
      providesTags: ["Chat"],
    }),
  }),
})

export const {
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useMarkMessagesAsReadMutation,
  useGetUnreadMessageCountQuery,
  useSendAutoResponseMutation,
  useGetAllConversationsQuery,
} = chatApi