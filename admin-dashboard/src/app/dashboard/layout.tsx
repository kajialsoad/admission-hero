"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector } from "../../hooks/useAppSelector"
import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header"
import AccessDenied from "../../components/AccessDenied"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait until AuthProvider finishes its async check before deciding
    if (loading) return

    if (!isAuthenticated || !user || user.role !== "admin") {
      router.push("/")
    }
  }, [user, loading, isAuthenticated, router])

  // While auth is being restored from cookies/API, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Auth resolved but not valid - show spinner briefly while redirect fires
  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Determine active page ID
  let activePageId = ""
  if (pathname === "/dashboard") {
    activePageId = "dashboard"
  } else if (pathname.startsWith("/dashboard/universities")) {
    activePageId = "universities"
  } else if (pathname.startsWith("/dashboard/questions")) {
    activePageId = "questions"
  } else if (pathname.startsWith("/dashboard/users")) {
    activePageId = "users"
  } else if (pathname.startsWith("/dashboard/admins")) {
    activePageId = "admins"
  } else if (pathname.startsWith("/dashboard/packages")) {
    activePageId = "packages"
  } else if (pathname.startsWith("/dashboard/promo-codes")) {
    activePageId = "promo-codes"
  } else if (pathname.startsWith("/dashboard/banners")) {
    activePageId = "banners"
  } else if (pathname.startsWith("/dashboard/statistics")) {
    activePageId = "statistics"
  } else if (pathname.startsWith("/dashboard/payments")) {
    activePageId = "payments"
  } else if (pathname.startsWith("/dashboard/app-content")) {
    activePageId = "app-content"
  } else if (pathname.startsWith("/dashboard/settings")) {
    activePageId = "settings"
  }

  const isSuperAdmin = user?.email === "admin@admissionhero.com" || user?.phone === "01700000000"
  const isAllowed = isSuperAdmin || (activePageId === "" || user?.allowedPages?.includes(activePageId))

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isAllowed ? children : <AccessDenied />}
          </div>
        </main>
      </div>
    </div>
  )
}

