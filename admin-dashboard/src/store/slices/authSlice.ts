import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import Cookies from "js-cookie"

interface AdminUser {
  id: string
  name: string
  phone: string
  email?: string
  role: string
}

interface AdminAuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AdminAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AdminUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false

      // Store in cookies
      Cookies.set("admin_token", action.payload.token, { expires: 30 })
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false

      // Remove from cookies
      Cookies.remove("admin_token")
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    restoreAuth: (state, action: PayloadAction<{ user: AdminUser; token: string } | null>) => {
      if (action.payload) {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      } else {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      }
      state.loading = false
    },
  },
})

export const { setCredentials, logout, setLoading, restoreAuth } = authSlice.actions
export default authSlice.reducer
