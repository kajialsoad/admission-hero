"use client"

import type React from "react"
import { useEffect } from "react"
import Cookies from "js-cookie"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { restoreAuth, setCredentials, setLoading } from "../store/slices/authSlice"


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      dispatch(setLoading(true))

      const token = Cookies.get("admin_token")
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "your_host_link/api"}/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              // Successfully got user profile, restore full auth state
              dispatch(setCredentials({ user: result.data, token }))
            } else {
              // Invalid response, clear auth
              Cookies.remove("admin_token")
              dispatch(restoreAuth(null))
            }
          } else {
            // API call failed (token might be expired), clear auth
            Cookies.remove("admin_token")
            dispatch(restoreAuth(null))
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          // Network error or other issue, clear auth
          Cookies.remove("admin_token")
          dispatch(restoreAuth(null))
        }
      } else {
        dispatch(restoreAuth(null))
      }
    } catch (error) {
      console.error("Error loading stored auth:", error)
      dispatch(restoreAuth(null))
    }
  }

  return <>{children}</>
}
