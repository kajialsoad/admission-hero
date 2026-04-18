"use client"

import QuestionManagement from "@/components/QuestionManagement"
import { Suspense } from "react"

export default function UniversitiesPage() {
  return (
    <Suspense fallback={null}>
      <QuestionManagement />
    </Suspense>
  )
}