"use client"

import type React from "react"
import { Provider } from "react-redux"
import { AuthProvider } from "./AuthProvider"
import { store } from "../store"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  )
}
