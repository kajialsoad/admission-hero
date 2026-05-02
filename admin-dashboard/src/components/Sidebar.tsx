"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  LogOut, 
  Menu, 
  ChevronLeft,
  Settings,
  Bell,
  LucideFileQuestion,
  Package,
  Tag,
  CreditCard,
} from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { logout } from "../store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard Home", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "University Manage", href: "/dashboard/universities", icon: GraduationCap, badge: null },
  { name: "Question Manage", href: "/dashboard/questions", icon: LucideFileQuestion, badge: null },
  { name: "User Manage", href: "/dashboard/users", icon: Users, badge: null },
  { name: "Packages", href: "/dashboard/packages", icon: Package, badge: null },
  { name: "Promo Codes", href: "/dashboard/promo-codes", icon: Tag, badge: null },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard, badge: null },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, badge: null },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 shadow-md bg-white border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-white">
          <SidebarContent onLogout={handleLogout} pathname={pathname} isMobile />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 shadow-sm",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent 
          onLogout={handleLogout} 
          pathname={pathname} 
          collapsed={collapsed} 
        />
        
        {/* Collapse Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-md"
        >
          <ChevronLeft className={cn("h-4 w-4 text-gray-600 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </aside>

      {/* Spacer for desktop */}
      <div className={cn("hidden lg:block transition-all duration-300", collapsed ? "w-20" : "w-64")} />
    </>
  )
}

function SidebarContent({
  onLogout,
  pathname,
  collapsed = false,
  isMobile = false,
}: {
  onLogout: () => void
  pathname: string
  collapsed?: boolean
  isMobile?: boolean
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={cn("p-6 border-b border-gray-100", collapsed && !isMobile && "p-4")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admission Hero</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                isActive
                  ? "bg-emerald-50 text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && !isMobile && "justify-center px-2"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />
              )}
              
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-emerald-600" : "text-gray-500"
                )}
              />
              
              {(!collapsed || isMobile) && (
                <span className="font-medium flex-1">{item.name}</span>
              )}
              
              {(!collapsed || isMobile) && item.badge && (
                <Badge 
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                >
                  {item.badge}
                </Badge>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100">
        {(!collapsed || isMobile) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-6 hover:bg-gray-50 text-gray-700"
              >
                <Avatar className="h-10 w-10 border-2 border-emerald-100">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold">AD</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@gmail.com</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {/* <DropdownMenuItem className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full hover:bg-gray-50">
                <Avatar className="h-8 w-8 border-2 border-emerald-100">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-semibold">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}