"use client"

import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { useGetDashboardStatsQuery } from "../../store/api/dashboardApi"

const mockChartData = [
  { name: "Jan", orders: 65, revenue: 12000 },
  { name: "Feb", orders: 59, revenue: 15000 },
  { name: "Mar", orders: 80, revenue: 18000 },
  { name: "Apr", orders: 81, revenue: 22000 },
  { name: "May", orders: 56, revenue: 16000 },
  { name: "Jun", orders: 95, revenue: 28000 },
]
  
export default function DashboardPage() {
  const { data, error, isLoading } = useGetDashboardStatsQuery()

  const stats = data?.data || {
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingProducts: 0,
  }

  const statCards = [
    {
      title: "Total Universtiy",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Total Questions",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Total Revenue",
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-yellow-500",
      change: "+23%",
    },
  ]

  // const quickStats = [
  //   {
  //     title: "Pending Orders",
  //     value: stats.pendingOrders,
  //     icon: Clock,
  //     color: "text-yellow-600",
  //     bgColor: "bg-yellow-100",
  //   },
  //   {
  //     title: "Approved Products",
  //     value: stats.totalProducts - stats.pendingProducts,
  //     icon: CheckCircle,
  //     color: "text-green-600",
  //     bgColor: "bg-green-100",
  //   },
  //   {
  //     title: "Rejected Products",
  //     value: 0,
  //     icon: XCircle,
  //     color: "text-red-600",
  //     bgColor: "bg-red-100",
  //   },
  //   {
  //     title: "Pending Products",
  //     value: stats.pendingProducts,
  //     icon: AlertCircle,
  //     color: "text-orange-600",
  //     bgColor: "bg-orange-100",
  //   },
  // ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load dashboard data</p>
        <p className="text-sm text-gray-500 mt-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(error as any)?.data?.message || "Please check your connection and try again"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">Welcome back! Heres what is admission hero admin panel.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">{stat.change}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-2 rounded-md`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
