import { adminApiSlice } from "./adminApiSlice"

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: 'exam' | 'payment' | 'system' | 'chat' | 'announcement'
  isRead: boolean
  timestamp: string
  data?: any
  priority: 'low' | 'medium' | 'high'
  expiresAt?: string
}

export interface NotificationStats {
  byType: Array<{
    _id: string
    total: number
    unread: number
  }>
  totalUnread: number
}

export const notificationsApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications (admin view)
    getAllNotifications: builder.query<{
      data: Notification[]
      pagination: {
        page: number
        limit: number
        total: number
        unreadCount: number
      }
    }, {
      page?: number
      limit?: number
      type?: string
      isRead?: boolean
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `notifications?${searchParams.toString()}`
      },
      providesTags: ["Notification"],
    }),

    // Create notification (admin only)
    createNotification: builder.mutation<
      { data: Notification },
      {
        userId?: string
        title: string
        message: string
        type?: string
        priority?: string
        data?: any
        expiresAt?: string
      }
    >({
      query: (notification) => ({
        url: "notifications",
        method: "POST",
        body: notification,
      }),
      invalidatesTags: ["Notification"],
    }),

    // Get notification statistics
    getNotificationStats: builder.query<{ data: NotificationStats }, void>({
      query: () => "notifications/stats",
      providesTags: ["Notification"],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<
      { data: Notification },
      string
    >({
      query: (id) => ({
        url: `notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Bulk operations
    markAllNotificationsAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
})

export const {
  useGetAllNotificationsQuery,
  useCreateNotificationMutation,
  useGetNotificationStatsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi