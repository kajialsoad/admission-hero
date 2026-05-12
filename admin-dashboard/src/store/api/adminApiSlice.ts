import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import Cookies from "js-cookie"
import type { RootState } from "../index"

const baseQuery = fetchBaseQuery({
  // baseUrl: process.env.NEXT_PUBLIC_API_URL || "your_host_link.app/api",
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || Cookies.get("admin_token")

    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }

    return headers
  },
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Token expired, logout admin
    Cookies.remove("admin_token")
    api.dispatch({ type: "auth/logout" })
    window.location.href = "/"
  }

  return result
}

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Order", "Message", "User", "Dashboard", "Conversation", "University", "Question", "QuestionSet", "Notification", "Analytics", "Chat", "Banners"],
  endpoints: () => ({}),
})
