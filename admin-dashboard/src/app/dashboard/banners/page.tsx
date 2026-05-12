"use client"

import BannerManagement from "@/components/BannerManagement"
import { Suspense } from "react"

export default function BannersPage() {
  return (
    <Suspense fallback={null}>
      <BannerManagement />
    </Suspense>
  )
}
