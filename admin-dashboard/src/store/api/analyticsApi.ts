import { adminApiSlice } from "./adminApiSlice"

export interface AnalyticsEvent {
  _id: string
  userId?: string
  eventType: 'login' | 'exam_start' | 'exam_complete' | 'payment' | 'video_watch' | 'page_view'
  eventData: any
  timestamp: string
  sessionId?: string
  deviceInfo?: {
    platform: string
    version: string
    model?: string
  }
  location?: {
    country?: string
    city?: string
  }
}

export interface DashboardAnalytics {
  eventCounts: Array<{
    _id: string
    count: number
  }>
  dailyActiveUsers: Array<{
    date: string
    count: number
  }>
  platformStats: Array<{
    _id: string
    count: number
  }>
  examCompletionRate: number
  recentActivity: AnalyticsEvent[]
  summary: {
    totalEvents: number
    uniqueUsers: number
    examStarted: number
    examCompleted: number
  }
}

export interface RealtimeStats {
  activeUsersLastHour: number
  eventsLastHour: number
  activeExams: number
  recentEvents: AnalyticsEvent[]
  timestamp: string
}

export const analyticsApi = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Track analytics event
    trackEvent: builder.mutation<
      { message: string },
      {
        eventType: string
        eventData: any
        sessionId?: string
        deviceInfo?: any
        location?: any
      }
    >({
      query: (eventData) => ({
        url: "analytics/track",
        method: "POST",
        body: eventData,
      }),
      invalidatesTags: ["Analytics"],
    }),

    // Get dashboard analytics (admin only)
    getDashboardAnalytics: builder.query<
      { data: DashboardAnalytics },
      {
        startDate?: string
        endDate?: string
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `analytics/dashboard?${searchParams.toString()}`
      },
      providesTags: ["Analytics"],
    }),

    // Get user analytics
    getUserAnalytics: builder.query<
      {
        data: {
          activitySummary: Array<{
            _id: string
            count: number
            lastActivity: string
          }>
          dailyActivity: Array<{
            _id: {
              date: string
              eventType: string
            }
            count: number
          }>
          examPerformance: AnalyticsEvent[]
          totalEvents: number
        }
      },
      {
        startDate?: string
        endDate?: string
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString())
          }
        })
        return `analytics/user?${searchParams.toString()}`
      },
      providesTags: ["Analytics"],
    }),

    // Get real-time stats (admin only)
    getRealtimeStats: builder.query<{ data: RealtimeStats }, void>({
      query: () => "analytics/realtime",
      providesTags: ["Analytics"],
    }),
  }),
})

export const {
  useTrackEventMutation,
  useGetDashboardAnalyticsQuery,
  useGetUserAnalyticsQuery,
  useGetRealtimeStatsQuery,
} = analyticsApi