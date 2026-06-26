"use client"

import { useAppSelector } from "../hooks/useAppSelector"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { Search, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../store/slices/authSlice"
import toast from "react-hot-toast"

export default function Header() {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-gray-200 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left Section - Search */}
          <div className="flex items-center flex-1 gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent lg:hidden ms-16">
              Admission Hero
            </h1>
            
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search anything..."
                className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon - Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Notifications */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-gray-500">John Doe just signed up</p>
                        <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New university added</p>
                        <p className="text-xs text-gray-500">Dhaka University was created</p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">System update</p>
                        <p className="text-xs text-gray-500">Version 2.0 is available</p>
                        <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-emerald-600 font-medium cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-200" />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-2 hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8 border-2 border-emerald-100">
                    {/* No external avatar image - fallback shows user initial */}
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.phone}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.phone}</p>
                    <p className="text-xs text-gray-500">{user?.email || "admin@gmail.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Profile</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-gray-500">
                  <span className="text-xs">Version 2.0.0</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}