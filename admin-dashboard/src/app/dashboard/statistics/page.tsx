"use client"

import { useState, useEffect } from "react"
import { useGetStatisticsQuery, useUpdateStatisticsMutation } from "@/store/api/statisticsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, TrendingUp, BookOpen, HelpCircle, Video } from "lucide-react"

export default function StatisticsPage() {
  const { data: statsData, isLoading, error } = useGetStatisticsQuery()
  const [updateStatistics, { isLoading: isUpdating }] = useUpdateStatisticsMutation()

  const [formData, setFormData] = useState({
    totalExams: 0,
    totalQuestions: 0,
    totalVideos: 0,
  })

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (statsData?.data) {
      setFormData({
        totalExams: statsData.data.totalExams,
        totalQuestions: statsData.data.totalQuestions,
        totalVideos: statsData.data.totalVideos,
      })
    }
  }, [statsData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const result = await updateStatistics(formData).unwrap()
      setMessage({ type: "success", text: result.message || "Statistics updated successfully!" })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.data?.message || "Failed to update statistics",
      })
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 0) {
      setFormData((prev) => ({ ...prev, [field]: numValue }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load statistics. Please try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">App Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Manage the statistics displayed on the mobile app home screen
        </p>
      </div>

      {/* Current Statistics Display */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.data.totalExams || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Displayed in app</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.data.totalQuestions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Displayed in app</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.data.totalVideos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Displayed in app</p>
          </CardContent>
        </Card>
      </div>

      {/* Update Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Update Statistics
          </CardTitle>
          <CardDescription>
            These numbers will be displayed in the &quot;Live Statistics&quot; section of the mobile app home screen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalExams">Total Exams</Label>
                <Input
                  id="totalExams"
                  type="number"
                  min="0"
                  value={formData.totalExams}
                  onChange={(e) => handleChange("totalExams", e.target.value)}
                  placeholder="Enter total exams"
                />
                <p className="text-xs text-muted-foreground">Number of exams available</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalQuestions">Total Questions</Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  min="0"
                  value={formData.totalQuestions}
                  onChange={(e) => handleChange("totalQuestions", e.target.value)}
                  placeholder="Enter total questions"
                />
                <p className="text-xs text-muted-foreground">Number of questions in database</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalVideos">Total Videos</Label>
                <Input
                  id="totalVideos"
                  type="number"
                  min="0"
                  value={formData.totalVideos}
                  onChange={(e) => handleChange("totalVideos", e.target.value)}
                  placeholder="Enter total videos"
                />
                <p className="text-xs text-muted-foreground">Number of learning videos</p>
              </div>
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Statistics
                  </>
                )}
              </Button>
            </div>
          </form>

          {statsData?.data.lastUpdatedBy && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Last updated by{" "}
                <span className="font-medium text-foreground">
                  {statsData.data.lastUpdatedBy.name}
                </span>{" "}
                on{" "}
                <span className="font-medium text-foreground">
                  {new Date(statsData.data.updatedAt).toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">ℹ️ How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            • These statistics are displayed in the <strong>&quot;Live Statistics&quot;</strong> section on the mobile app home screen
          </p>
          <p>
            • Users will see these numbers when they open the app, giving them an overview of available content
          </p>
          <p>
            • Update these numbers whenever you add new exams, questions, or videos to keep users informed
          </p>
          <p>
            • The statistics are cached on the mobile app and refresh when users pull to refresh the home screen
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
