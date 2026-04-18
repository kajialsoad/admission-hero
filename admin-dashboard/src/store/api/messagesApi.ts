import { adminApiSlice } from "./adminApiSlice"

export interface Message {
  _id: string
  productId?: string
  productName?: string
  senderId: string
  senderName: string
  senderType: "user" | "admin"
  receiverId?: string
  receiverName?: string
  content: string
  isRead: boolean
  chatId: string
  unreadCount?: number
  totalMessages?: number
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  chatId: string
  userId: string
  userName: string
  userEmail: string
  lastMessage: Message
  messageCount: number
  unreadCount: number
}

export interface SendAdminMessageRequest {
  userId: string
  content: string
  productId?: string
  sendViaSMS?: boolean
}

// export interface SendSMSRequest {
//   phoneNumber: string
//   phone: string
//   content: string
//   userId?: string
// }

export interface SMSResponse {
  success: boolean
  data: {
    messageId: string
    phone: string
    content: string
    status: "sent" | "failed"
    sentAt: string
  }
  message: string
}

export interface UserSearchResult {
  _id: string
  name: string
  phone: string
  email?: string
  isActive: boolean
  lastMessageAt?: string
}

export const messagesApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all admin messages
    getAdminMessages: builder.query<{ success: boolean; data: Message[]; message: string }, void>({
      query: () => "/messages/admin/all",
      providesTags: ["Message"],
      // pollingInterval: 10000, // Poll every 10 seconds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformErrorResponse: (response: any) => {
        console.error("Admin messages API error:", response)
        return response
      },
    }),

    // Get all user conversations for admin
    getAllUserConversations: builder.query<{ success: boolean; data: Conversation[]; message: string }, void>({
      query: () => "/messages/admin/conversations",
      providesTags: ["Conversation"],
      // pollingInterval: 15000, // Poll every 15 seconds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformErrorResponse: (response: any) => {
        console.error("Admin conversations API error:", response)
        return response
      },
    }),

    // Send admin message
    sendAdminMessage: builder.mutation<{ success: boolean; data: Message; message: string }, SendAdminMessageRequest>({
      query: (messageData) => ({
        url: "/messages/admin/send",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["Message", "Conversation"],
      async onQueryStarted(messageData, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          console.log("Admin message sent successfully:", data)

          // Update the conversations cache immediately
          dispatch(
            messagesApi.util.updateQueryData("getAllUserConversations", undefined, (draft) => {
              const conversationIndex = draft.data.findIndex((conv) => conv.userId === messageData.userId)
              if (conversationIndex >= 0) {
                draft.data[conversationIndex].lastMessage = data.data
                draft.data[conversationIndex].messageCount += 1
              }
            }),
          )

          // Refresh chat messages if viewing this conversation
          dispatch(messagesApi.util.invalidateTags([{ type: "Message", id: data.data.chatId }]))
        } catch (error) {
          console.error("Failed to send admin message:", error)
        }
      },
    }),

    // Get messages for a specific chat
    getChatMessages: builder.query<{ success: boolean; data: Message[]; message: string }, string>({
      query: (chatId) => `/messages/chat/${chatId}`,
      providesTags: (result, error, chatId) => [{ type: "Message", id: chatId }],
      // pollingInterval: 5000, // Poll every 5 seconds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformErrorResponse: (response: any) => {
        console.error("Chat messages API error:", response)
        return response
      },
    }),

    // Mark message as read
    markAsRead: builder.mutation<{ success: boolean; data: Message; message: string }, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Message", "Conversation"],
    }),

    getUnreadCount: builder.query<{ success: boolean; data: { unreadCount: number }; message: string }, void>({
      query: () => "/messages/unread-count",
      providesTags: ["Message"],
      // pollingInterval: 30000, // Poll every 30 seconds
    }),

    // Send SMS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendSMS: builder.mutation<SMSResponse, any>({
      query: (smsData) => ({
        url: "/messages/admin/send-sms",
        method: "POST",
        body: smsData,
      }),
      invalidatesTags: ["Message", "Conversation"],
    }),

    // Search users by name or phone
    searchUsers: builder.query<{ success: boolean; data: UserSearchResult[]; message: string }, string>({
      query: (searchTerm) => `/messages/admin/search-users?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ["User"],
    }),

    // Send bulk SMS
    sendBulkSMS: builder.mutation<
      { success: boolean; data: { sent: number; failed: number }; message: string },
      { userIds: string[]; content: string }
    >({
      query: (bulkData) => ({
        url: "/messages/admin/send-bulk-sms",
        method: "POST",
        body: bulkData,
      }),
      invalidatesTags: ["Message"],
    }),
  }),
})

export const {
  useGetAdminMessagesQuery,
  useGetAllUserConversationsQuery,
  useSendAdminMessageMutation,
  useGetChatMessagesQuery,
  useMarkAsReadMutation,
  useGetUnreadCountQuery,
  useSendSMSMutation,
  useSearchUsersQuery,
  useSendBulkSMSMutation,
} = messagesApi
