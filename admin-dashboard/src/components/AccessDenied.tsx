"use client"

import React from "react"
import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="relative w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-red-100 shadow-xl overflow-hidden text-center transition-all duration-300 hover:shadow-2xl">
        {/* Decorative Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
        
        {/* Glow behind the icon */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-100/50 rounded-full blur-xl -z-10" />

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100 animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Text Details */}
        <h2 className="mt-6 text-xl font-bold text-gray-900 tracking-tight">এক্সেস সীমিত (Access Restricted)</h2>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          আপনার এই পেজটি দেখার অনুমতি নেই। অনুগ্রহ করে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
        <p className="mt-1 text-xs text-gray-400 font-mono bg-gray-50 py-1.5 px-3 rounded-lg inline-block">
          ERR_CODE: FORBIDDEN_ROUTE
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 w-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-xl transition-all duration-200 shadow-md shadow-red-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            ড্যাশবোর্ড হোমে ফিরুন (Go to Dashboard)
          </Link>
        </div>
      </div>
    </div>
  )
}
