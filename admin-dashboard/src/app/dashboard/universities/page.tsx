"use client"

import UniversityManagement from "@/components/UniversityManagement"
import { Suspense, useState } from "react"

export default function UniversitiesPage() {
  return (
    <Suspense fallback={null}>
      <UniversityManagement />
    </Suspense>
  )
}