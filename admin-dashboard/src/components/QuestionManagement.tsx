"use client"

import type React from "react"
import { useState } from "react"
import { Plus, MoreVertical, Trash2, BookOpen, Upload, X, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useGetQuestionSetsQuery,
  useCreateQuestionSetMutation,
  useDeleteQuestionSetMutation,
  useGetQuestionsBySetIdQuery,
  type QuestionSet,
} from "../store/api/questionsApi"
import { useGetUniversitiesQuery } from "../store/api/universitiesApi"
import toast from "react-hot-toast"

const UNITS = ["A", "B", "C", "D"]

interface MCQQuestion {
  questionNumber: number
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: "A" | "B" | "C" | "D"
  explanation?: string
}

export default function QuestionSetManagement() {
  const [page, setPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isViewQuestionsOpen, setIsViewQuestionsOpen] = useState(false)
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<string>("")
  const [selectedUnit, setSelectedUnit] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<string>("")

  const { data: universitiesData } = useGetUniversitiesQuery({})
  const { data: questionSetsData, isLoading } = useGetQuestionSetsQuery({
    page,
    limit: 10,
    universityId: selectedUniversity || undefined,
    unit: selectedUnit || undefined,
    session: selectedSession || undefined,
  })
  const [deleteQuestionSet, { isLoading: isDeleting }] = useDeleteQuestionSetMutation()

  const questionSets = questionSetsData?.data || []
  const pagination = questionSetsData?.pagination || { page: 1, pages: 1, total: 0 }
  const universities = universitiesData?.data || []

  const handleDeleteQuestionSet = async () => {
    if (!selectedQuestionSet) return
    try {
      await deleteQuestionSet(selectedQuestionSet._id).unwrap()
      toast.success("Question set and all 100 questions deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedQuestionSet(null)
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete question set")
    }
  }

  const clearFilters = () => {
    setSelectedUniversity("")
    setSelectedUnit("")
    setSelectedSession("")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Question Sets</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{pagination.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {questionSets.reduce((sum, set) => sum + set.totalQuestions, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Page</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{pagination.page}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="md:flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Question Set Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Each set contains exactly 100 MCQ questions with a single video tutorial
              </p>
            </div>
            <div className="md:mt-0 mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkUploadOpen(true)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                CSV Upload
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Question
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[150px]">
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by unit" />
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

              <div className="w-[180px]">
                <Input 
                  value={selectedSession} 
                  onChange={(e) => setSelectedSession(e.target.value)} 
                  placeholder="e.g., 2020-2021"
                  className="h-10"
                />
              </div>
              
              {(selectedUniversity || selectedUnit || selectedSession) && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Set Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit/Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : questionSets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No question sets found</td>
                </tr>
              ) : (
                questionSets.map((set) => (
                  <tr key={set._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{set.name}</p>
                        {set.description && <p className="text-xs text-gray-500 mt-1">{set.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{set.university?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">Unit {set.unit} / {set.session}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700">
                        {set.totalQuestions} Questions
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {set.videoUrl ? (
                        <a href={set.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Video
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No video</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedQuestionSet(set); setIsViewQuestionsOpen(true); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Questions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedQuestionSet(set); setIsDeleteDialogOpen(true); }} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing page {pagination.page} of {pagination.pages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === pagination.pages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ManualCreateDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} universities={universities} />
      <ViewQuestionsDialog isOpen={isViewQuestionsOpen} onClose={() => { setIsViewQuestionsOpen(false); setSelectedQuestionSet(null); }} questionSet={selectedQuestionSet} />
      <CSVUploadDialog isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} universities={universities} />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Question Set?</DialogTitle>
            <DialogDescription>This will delete the set and all 100 questions. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteQuestionSet} disabled={isDeleting} variant="destructive">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Manual Create Dialog
function ManualCreateDialog({ isOpen, onClose, universities }: any) {
  const [setName, setSetName] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [selectedSession, setSelectedSession] = useState("")
  const [questions, setQuestions] = useState<MCQQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion>({
    questionNumber: 1,
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
  })

  const [createQuestionSet, { isLoading }] = useCreateQuestionSetMutation()

  const resetForm = () => {
    setSetName("")
    setDescription("")
    setVideoUrl("")
    setSelectedUniversity("")
    setSelectedUnit("")
    setSelectedSession("")
    setQuestions([])
    setCurrentQuestion({ questionNumber: 1, text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", explanation: "" })
  }

  const addQuestion = () => {
    if (!currentQuestion.text.trim() || !currentQuestion.optionA.trim() || !currentQuestion.optionB.trim() || !currentQuestion.optionC.trim() || !currentQuestion.optionD.trim()) {
      toast.error("Please fill question text and all options")
      return
    }

    setQuestions([...questions, currentQuestion])
    setCurrentQuestion({
      questionNumber: questions.length + 2,
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
    })
    toast.success(`Question ${questions.length + 1}/100 added`)
  }

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, questionNumber: i + 1 }))
    setQuestions(updated)
    setCurrentQuestion({ ...currentQuestion, questionNumber: updated.length + 1 })
  }

  const handleCreate = async () => {
    if (!setName.trim() || !selectedUniversity || !selectedUnit || !selectedSession) {
      toast.error("Please fill all required fields")
      return
    }
    // if (questions.length === 0) {
    //   toast.error(`Need exactly 100 questions. Current: ${questions.length}`)
    //   return
    // }

    try {
      await createQuestionSet({
        data: {
          name: setName.trim(),
          university: selectedUniversity,
          unit: selectedUnit,
          session: selectedSession,
          description: description.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          questions: questions.map(q => ({
            text: q.text.trim(),
            options: [
              { key: "A", text: q.optionA.trim() },
              { key: "B", text: q.optionB.trim() },
              { key: "C", text: q.optionC.trim() },
              { key: "D", text: q.optionD.trim() },
            ],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation?.trim() || undefined,
          })),
        },
      }).unwrap()

      toast.success("Question set created successfully!")
      resetForm()
      onClose()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create question set")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Question Set - Manual Entry (MCQ Questions)</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm">Progress: {questions.length}/100</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${questions.length}%` }} />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Set Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label>Set Name *</Label>
              <Input value={setName} onChange={(e) => setSetName(e.target.value)} placeholder="e.g., DU 2024 Unit A Mock Test 1" />
            </div>
            <div>
              <Label>Video URL (YouTube/Vimeo)</Label>
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." type="url" />
            </div>
            <div>
              <Label>University *</Label>
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                <SelectContent>
                  {universities.map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit *</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>Unit {u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Session *</Label>
              <Input 
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)} 
                placeholder="e.g., 2020-2021"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows={2} />
            </div>
          </div>

          {/* Current Question Form */}
          <div className="border rounded-lg p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Question #{currentQuestion.questionNumber}</h3>
              <span className="text-sm text-gray-500">MCQ Format</span>
            </div>
            
            <div>
              <Label>Question Text *</Label>
              <Textarea 
                value={currentQuestion.text} 
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })} 
                placeholder="Enter the question" 
                rows={4} 
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {["A", "B", "C", "D"].map((key) => (
                <div key={key}>
                  <Label>Option {key} *</Label>
                  <Input 
                    value={currentQuestion[`option${key}` as keyof MCQQuestion] as string} 
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, [`option${key}`]: e.target.value })} 
                    placeholder={`Enter option ${key}`} 
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Correct Answer *</Label>
                <Select value={currentQuestion.correctAnswer} onValueChange={(value: any) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((key) => (
                      <SelectItem key={key} value={key}>Option {key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Explanation (Optional)</Label>
                <Textarea 
                  value={currentQuestion.explanation} 
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })} 
                  placeholder="Brief explanation" 
                  rows={3}
                />
              </div>
            </div>

            <Button onClick={addQuestion} className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Question ({questions.length + 1}/100)
            </Button>
          </div>

          {/* Added Questions List */}
          {questions.length > 0 && (
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
              <h3 className="font-medium mb-3">Added Questions ({questions.length}/100)</h3>
              <div className="space-y-2">
                {questions.map((q, index) => (
                  <div key={index} className="flex items-start justify-between bg-white p-3 rounded border">
                    <div className="flex-1">
                      <span className="text-sm font-medium">#{q.questionNumber}</span>
                      <p className="text-sm text-gray-700 mt-1">{q.text.substring(0, 80)}{q.text.length > 80 ? "..." : ""}</p>
                      <p className="text-xs text-gray-500 mt-1">Correct: {q.correctAnswer}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeQuestion(index)} 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={isLoading} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Creating..." : `Create Question Set (${questions.length}/100)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// CSV Upload Dialog
function CSVUploadDialog({ isOpen, onClose, universities }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [setName, setSetName] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [selectedSession, setSelectedSession] = useState("")
  const [filePreview, setFilePreview] = useState("")

  const [createQuestionSet, { isLoading }] = useCreateQuestionSetMutation()

  const resetForm = () => {
    setFile(null)
    setSetName("")
    setDescription("")
    setVideoUrl("")
    setSelectedUniversity("")
    setSelectedUnit("")
    setSelectedSession("")
    setFilePreview("")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split("\n").slice(0, 6)
      setFilePreview(lines.join("\n"))
    }
    reader.readAsText(selectedFile)
  }

  // const handleUpload = async () => {
  //   if (!file || !setName.trim() || !selectedUniversity || !selectedUnit || !selectedSession) {
  //     toast.error("Please fill all required fields and select a file")
  //     return
  //   }

  //   try {
  //     const text = await file.text()
  //     const lines = text.split("\n").filter((line) => line.trim())

  //     // if (lines.length < 101) {
  //     //   toast.error(`CSV must have header + 100 questions. Found: ${lines.length - 1} questions`)
  //     //   return
  //     // }

  //     const questions: any[] = []

  //     for (let i = 1; i <= 100; i++) {
  //       const line = lines[i]
  //       if (!line) {
  //         toast.error(`Missing question at line ${i + 1}`)
  //         return
  //       }

  //     const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || []

    
        
  //       if (values.length < 6) {
  //         toast.error(`Invalid format at line ${i + 1}. Expected at least 6 columns`)
  //         return
  //       }

  //       const correctAnswer = values[5].toUpperCase()
  //       if (!["A", "B", "C", "D"].includes(correctAnswer)) {
  //         toast.error(`Invalid correct answer at line ${i + 1}. Must be A, B, C, or D`)
  //         return
  //       }

  //       questions.push({
  //         text: values[0],
  //         options: [
  //           { key: "A", text: values[1] },
  //           { key: "B", text: values[2] },
  //           { key: "C", text: values[3] },
  //           { key: "D", text: values[4] },
  //         ],
  //         correctAnswer: correctAnswer,
  //         explanation: values[6] || undefined,
  //       })
  //     }

  //     await createQuestionSet({
  //       data: {
  //         name: setName.trim(),
  //         university: selectedUniversity,
  //         unit: selectedUnit,
  //         session: selectedSession,
  //         description: description.trim() || undefined,
  //         videoUrl: videoUrl.trim() || undefined,
  //         questions,
  //       },
  //     }).unwrap()

  //     toast.success("Question set created successfully!")
  //     resetForm()
  //     onClose()
  //   } catch (error: any) {
  //     toast.error(error?.data?.message || "Failed to create question set")
  //   }
  // }


  const handleUpload = async () => {
  if (!file || !setName.trim() || !selectedUniversity || !selectedUnit || !selectedSession) {
    toast.error("Please fill all required fields and select a file")
    return
  }

  try {
    const text = await file.text()
    const lines = text.split("\n").filter(line => line.trim()) // remove empty lines

    if (lines.length < 2) {
      toast.error("CSV must have at least 1 question")
      return
    }

    const questions: any[] = []

    // Start from 1 assuming line 0 is header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      if (!line) {
        toast.error(`Missing question at line ${i + 1}`)
        return
      }

      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        ?.map(v => v.replace(/^"|"$/g, '').trim()) || []

      if (values.length < 6) {
        toast.error(`Invalid format at line ${i + 1}. Expected at least 6 columns`)
        return
      }

      const correctAnswer = values[5].toUpperCase()
      if (!["A", "B", "C", "D"].includes(correctAnswer)) {
        toast.error(`Invalid correct answer at line ${i + 1}. Must be A, B, C, or D`)
        return
      }

      questions.push({
        text: values[0],
        options: [
          { key: "A", text: values[1] },
          { key: "B", text: values[2] },
          { key: "C", text: values[3] },
          { key: "D", text: values[4] },
        ],
        correctAnswer: correctAnswer,
        explanation: values[6] || undefined,
      })
    }

    await createQuestionSet({
      data: {
        name: setName.trim(),
        university: selectedUniversity,
        unit: selectedUnit,
        session: selectedSession,
        description: description.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        questions,
      },
    }).unwrap()

    toast.success("Question set created successfully!")
    resetForm()
    onClose()
  } catch (error: any) {
    toast.error(error?.data?.message || "Failed to create question set")
  }
}

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload via CSV ( MCQ Questions)</DialogTitle>
          <DialogDescription>Upload a CSV file containing  questions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-blue-900 mb-2">CSV Format Requirements:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>7 columns:</strong> Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Explanation (optional)</li>
              <li>• <strong>First row:</strong> Header row (will be skipped)</li>
              <li>• <strong>Next 100 rows:</strong> Your questions</li>
              <li>• <strong>Example:</strong> "What is 2+2?","2","3","4","5","C","Basic addition"</li>
            </ul>
          </div>

          <div className="">
            <div>
              <Label>Set Name *</Label>
              <Input value={setName} onChange={(e) => setSetName(e.target.value)} placeholder="e.g., DU 2024 Unit A" />
            </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
              <Label>University *</Label>
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {universities.map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit *</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>Unit {u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Session *</Label>
              <Input 
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)} 
                placeholder="e.g., 2020-2021"
              />
            </div>
            <div>
              <Label>Video URL (Optional)</Label>
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." type="url" />
            </div>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows={2} />
          </div>

          <div>
            <Label>Select CSV File *</Label>
            <Input type="file" accept=".csv" onChange={handleFileSelect} className="cursor-pointer" />
          </div>

          {filePreview && (
            <div className="bg-gray-50 border rounded-lg p-3 w-[450px]">
              <h4 className="font-medium text-sm mb-2">File Preview (First 5 lines):</h4>
              <pre className="text-xs bg-white p-2 rounded border overflow-y-auto">{filePreview}</pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isLoading || !file} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? "Uploading..." : "Upload & Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// View Questions Dialog
function ViewQuestionsDialog({ isOpen, onClose, questionSet }: any) {
  const { data, isLoading } = useGetQuestionsBySetIdQuery(questionSet?._id || "", {
    skip: !questionSet?._id,
  })

  const questions = data?.data || []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>View Questions - {questionSet?.name}</DialogTitle>
          <DialogDescription>
            {questionSet?.university?.name} • Unit {questionSet?.unit} • {questionSet?.session} • Total: {questions.length} questions
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-4 p-1">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No questions found</div>
          ) : (
            questions.map((q: any) => (
              <div key={q._id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-sm">Question #{q.questionNumber}</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">MCQ</span>
                </div>
                <p className="text-sm mb-3">{q.text}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt: any) => (
                    <div 
                      key={opt.key} 
                      className={`text-xs p-2 rounded border ${opt.key === q.correctAnswer ? 'bg-green-50 border-green-300' : 'bg-white'}`}
                    >
                      <span className="font-medium">{opt.key}.</span> {opt.text}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600 font-medium">Correct Answer: {q.correctAnswer}</span>
                  {q.explanations?.[0]?.content && (
                    <span className="text-gray-600">📝 Has explanation</span>
                  )}
                </div>
                
                {q.explanations?.[0]?.content && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong>Explanation:</strong> {q.explanations[0].content}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}