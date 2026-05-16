"use client"

import type React from "react"
import { useState } from "react"
import { Upload, AlertCircle, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateQuestionSetMutation } from "../store/api/questionsApi"
import { useGetUniversitiesQuery } from "../store/api/universitiesApi"
import toast from "react-hot-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const UNITS = ["A", "B", "C", "D"]

interface BulkQuestionSetUploadProps {
  isOpen: boolean
  onClose: () => void
}

interface BulkQuestion {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  videoUrl?: string
  explanation?: string
}

export function BulkQuestionSetUpload({ isOpen, onClose }: BulkQuestionSetUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [setName, setSetName] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState<string>("")
  const [selectedUnit, setSelectedUnit] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [filePreview, setFilePreview] = useState<string>("")
  const [parsedQuestions, setParsedQuestions] = useState<BulkQuestion[]>([])
  const [description, setDescription] = useState("")
  const [accessType, setAccessType] = useState<"free" | "Premium">("Premium") // New field

  const { data: universitiesData } = useGetUniversitiesQuery({})
  const [createSet, { isLoading: isCreating }] = useCreateQuestionSetMutation()

  const universities = universitiesData?.data || []

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)

    // Preview and parse file
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split("\n").filter((line) => line.trim())

      // Show preview of first 5 lines
      setFilePreview(lines.slice(0, 5).join("\n"))

      // Parse all questions
      if (lines.length > 1) {
        const questions: BulkQuestion[] = []
        for (let i = 1; i < lines.length && i <= 100; i++) {
          const parts = lines[i].split(",").map((p) => p.trim())
          if (parts.length >= 6) {
            questions.push({
              text: parts[0],
              optionA: parts[1],
              optionB: parts[2],
              optionC: parts[3],
              optionD: parts[4],
              correctAnswer: parts[5]?.toUpperCase() || "A",
              videoUrl: parts[6] || undefined,
              explanation: parts[7] || undefined,
            })
          }
        }
        setParsedQuestions(questions)
      }
    }
    reader.readAsText(selectedFile, "UTF-8")
  }

  const handleBulkUpload = async () => {
    if (!file || !selectedUniversity || !selectedUnit || !selectedSession || !setName) {
      toast.error("Please fill in all required fields and select a file")
      return
    }

    if (parsedQuestions.length !== 100) {
      toast.error(`File must contain exactly 100 questions. Found: ${parsedQuestions.length}`)
      return
    }

    try {
      const questions = parsedQuestions.map((q) => ({
        text: q.text,
        options: [
          { key: "A", text: q.optionA },
          { key: "B", text: q.optionB },
          { key: "C", text: q.optionC },
          { key: "D", text: q.optionD },
        ],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        videoUrl: q.videoUrl,
      }))

      await createSet({
        data: {
          name: setName.trim(),
          university: selectedUniversity,
          unit: selectedUnit,
          session: selectedSession,
          description: description?.trim() || undefined,
          accessType, // Add access type
          questions,
        },
      }).unwrap()

      toast.success(`Question set created with 100 questions!`)
      handleClose()
    } catch (error: any) {
      console.error("[v0] Bulk upload error:", error)
      toast.error(error.data?.message || "Failed to create question set")
    }
  }

  const handleClose = () => {
    setFile(null)
    setSetName("")
    setSelectedUniversity("")
    setSelectedUnit("")
    setSelectedSession("")
    setFilePreview("")
    setParsedQuestions([])
    setDescription("")
    setAccessType("Premium")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload 100 MCQ Questions</DialogTitle>
          <DialogDescription>
            Upload a CSV file with exactly 100 questions to create a complete question set
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* CSV Format Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">CSV Format (comma-separated):</p>
              <code className="text-xs bg-gray-100 p-2 block overflow-x-auto">
                Question Text,Option A,Option B,Option C,Option D,Correct Answer,Video URL,Explanation
              </code>
              <p className="text-xs mt-2">Example:</p>
              <code className="text-xs bg-gray-100 p-2 block">
                What is 2+2?,3,4,5,6,B,https://youtube.com/...,The sum of 2 and 2 is 4
              </code>
              <p className="text-xs mt-2">• Correct Answer: A, B, C, or D</p>
              <p className="text-xs">• Video URL and Explanation are optional</p>
              <p className="text-xs">• File must contain exactly 100 questions (plus header row)</p>
            </AlertDescription>
          </Alert>

          {/* Set Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="setName">Question Set Name *</Label>
              <Input
                id="setName"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g., BUET 2024 Unit A"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="university">University *</Label>
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni._id} value={uni._id}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        Unit {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session">Session *</Label>
                <Input 
                  value={selectedSession} 
                  onChange={(e) => setSelectedSession(e.target.value)} 
                  placeholder="e.g., 2020-2021"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this question set..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="accessType">Access Type *</Label>
              <Select value={accessType} onValueChange={(value: "free" | "Premium") => setAccessType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">✅ Free (No payment required)</SelectItem>
                  <SelectItem value="Premium">🔒 Premium (Requires subscription)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6">
            <label htmlFor="csvFile" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-600">CSV file only, max 10MB</p>
              </div>
              <input id="csvFile" type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          {/* File Info */}
          {file && (
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-sm font-semibold text-green-900">✓ File Selected: {file.name}</p>
              <p className="text-sm text-green-800 mt-1">Questions parsed: {parsedQuestions.length}/100</p>
            </div>
          )}

          {/* File Preview */}
          {filePreview && (
            <div>
              <p className="text-sm font-semibold mb-2">File Preview (first 5 rows):</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">{filePreview}</pre>
            </div>
          )}

          {/* Error Message */}
          {parsedQuestions.length > 0 && parsedQuestions.length !== 100 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Found {parsedQuestions.length} questions. Exactly 100 required.</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleBulkUpload} disabled={isCreating || !file || parsedQuestions.length !== 100}>
            {isCreating ? "Creating..." : "Create Question Set"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
