"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { useAdminLoginMutation } from "../store/api/authApi"
import { setCredentials } from "../store/slices/authSlice"

export default function LoginForm() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const [adminLogin, { isLoading }] = useAdminLoginMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneOrEmail || !password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      console.log("Attempting login with:", { phoneOrEmail, password: "***" })

      const result = await adminLogin({ phoneOrEmail, password }).unwrap()

      console.log("Login result:", result)

      if (result && result.success && result.user) {
        console.log("User role:", result.user.role)

        if (result.user.role === "admin") {
          dispatch(
            setCredentials({
              user: result.user,
              token: result.token,
            }),
          )
          toast.success("Login successful")

          router.push("/dashboard")
        } else {
          toast.error("Access denied. Admin privileges required.")
        }
      } else {
        toast.error("Invalid response from server")
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Login failed. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="phoneOrEmail" className="block text-sm font-medium text-gray-700">
          Phone Number or Email
        </label>
        <div className="mt-1">
          <input
            id="phoneOrEmail"
            name="phoneOrEmail"
            type="text"
            autoComplete="username"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Enter your phone number or email"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  )
}