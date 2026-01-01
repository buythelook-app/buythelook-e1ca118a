"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Type, Check, X, Sparkles, Bell, Mail, Loader2 } from "lucide-react"
import { storage } from "@/lib/storage"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

const QUIZ_STEPS = [
  {
    id: "start",
    question: "How would you like to start?",
    options: [
      {
        value: "quiz",
        label: "Take Style Quiz",
        icon: <Type className="w-6 h-6" />,
        description: "Answer questions to build your profile",
      },
      {
        value: "upload",
        label: "Upload Photo",
        icon: <Upload className="w-6 h-6" />,
        description: "Let AI analyze your look from a photo",
      },
    ],
  },
  {
    id: "gender",
    question: "What is your gender preference?",
    options: [
      { value: "male", label: "Male", icon: "👔" },
      { value: "female", label: "Female", icon: "👗" },
      { value: "unisex", label: "Unisex", icon: "👕" },
    ],
  },
  {
    id: "height",
    question: "What is your height?",
    options: [
      { value: "petite", label: "Petite (< 5'3\")", description: "Shorter stature" },
      { value: "average", label: "Average (5'3\" - 5'7\")", description: "Medium height" },
      { value: "tall", label: "Tall (> 5'7\")", description: "Taller stature" },
    ],
  },
  {
    id: "bodyShape",
    question: "How would you describe your body shape?",
    options: [
      { value: "hourglass", label: "Hourglass", description: "Balanced shoulders and hips with defined waist" },
      { value: "pear", label: "Pear", description: "Hips wider than shoulders" },
      { value: "apple", label: "Apple", description: "Broader shoulders and bust" },
      { value: "rectangle", label: "Rectangle", description: "Shoulders, waist and hips similar width" },
      { value: "athletic", label: "Athletic", description: "Broad shoulders and muscular build" },
    ],
  },
  {
    id: "style",
    question: "What is your style?",
    options: [
      {
        value: "Nordic",
        label: "Nordic",
        description: "Clean, cozy, and nature-inspired style",
        image: "/casual.jpg",
      },
      {
        value: "Modern",
        label: "Modern",
        description: "Professional, sharp, and fashion-forward",
        image: "/formal.jpg",
      },
      {
        value: "Classic",
        label: "Classic",
        description: "Timeless, elegant, and structured style",
        image: "/028933c6-ec95-471c-804c-0aa31a0e1f15.png",
      },
      {
        value: "BohoChic",
        label: "Boho Chic",
        description: "Free-spirited, artistic, and earthy aesthetic",
        image: "/elegants.jpg",
      },
      {
        value: "Casual",
        label: "Casual",
        description: "Relaxed, everyday, and comfortable style",
        image: "/street.jpg",
      },
      {
        value: "Minimalist",
        label: "Minimalist",
        description: "Simple, clean, and essential-focused look",
        image: "/Bohemian.jpg",
      },
    ],
  },
  {
    id: "occasion",
    question: "What occasion are you dressing for?",
    options: [
      { value: "everyday", label: "Everyday Wear", description: "Daily casual outfits" },
      { value: "work", label: "Work/Office", description: "Professional settings" },
      { value: "date", label: "Date Night", description: "Romantic occasions" },
      { value: "party", label: "Party/Event", description: "Social gatherings" },
      { value: "workout", label: "Workout", description: "Fitness activities" },
      { value: "vacation", label: "Vacation", description: "Travel and leisure" },
    ],
  },
  {
    id: "budget",
    question: "What is your budget range?",
    options: [
      { value: "budget", label: "Budget Friendly", description: "$50 - $150" },
      { value: "moderate", label: "Moderate", description: "$150 - $300" },
      { value: "premium", label: "Premium", description: "$300 - $500" },
      { value: "luxury", label: "Luxury", description: "$500+" },
    ],
  },
  {
    id: "colors",
    question: "What are your preferred colors? (Select up to 3)",
    multiple: true,
    maxSelections: 3,
    options: [
      { value: "black", label: "Black", color: "#000000" },
      { value: "white", label: "White", color: "#FFFFFF" },
      { value: "navy", label: "Navy", color: "#001f3f" },
      { value: "beige", label: "Beige", color: "#d4a574" },
      { value: "gray", label: "Gray", color: "#808080" },
      { value: "brown", label: "Brown", color: "#8B4513" },
      { value: "red", label: "Red", color: "#DC143C" },
      { value: "blue", label: "Blue", color: "#4169E1" },
      { value: "green", label: "Green", color: "#228B22" },
      { value: "pink", label: "Pink", color: "#FFB6C1" },
      { value: "yellow", label: "Yellow", color: "#FFD700" },
      { value: "purple", label: "Purple", color: "#9370DB" },
    ],
  },
]

export function QuizFlow({ styledProfile }) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isUploadMode, setIsUploadMode] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showServiceUnavailable, setShowServiceUnavailable] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [waitlistError, setWaitlistError] = useState("")
  const fileInputRef = useRef(null)

  const [styleComparisonIndex, setStyleComparisonIndex] = useState(0)
  const [styleWinner, setStyleWinner] = useState(null)

  const [quizData, setQuizData] = useState({
    gender: "",
    height: "",
    bodyShape: "",
    style: "",
    occasion: "",
    budget: "",
    colors: [],
    uploadedImage: null,
  })

  const getFilteredSteps = () => {
    if (isUploadMode) {
      return QUIZ_STEPS.filter((step) => !["height", "bodyShape"].includes(step.id))
    }
    return QUIZ_STEPS
  }

  const activeSteps = getFilteredSteps()
  const currentQuestion = activeSteps[currentStep]
  const progress = ((currentStep + 1) / activeSteps.length) * 100

  const getDisplayLabel = (stepId, value) => {
    const step = QUIZ_STEPS.find((s) => s.id === stepId)
    if (!step) return value

    if (Array.isArray(value)) {
      return value
        .map((v) => {
          const option = step.options.find((opt) => opt.value === v)
          return option ? option.label : v
        })
        .join(", ")
    }

    const option = step.options.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const getCompletedSteps = () => {
    const completed = []
    activeSteps.forEach((step, index) => {
      if (index < currentStep) {
        const value = quizData[step.id]
        if (value && (Array.isArray(value) ? value.length > 0 : value)) {
          completed.push({
            question: step.question,
            value: getDisplayLabel(step.id, value),
            id: step.id,
          })
        }
      }
    })
    return completed
  }

  const completedSteps = getCompletedSteps()

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault()
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      setWaitlistError("Please enter a valid email address")
      return
    }

    setWaitlistLoading(true)
    setWaitlistError("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail, category: "mens_fashion" }),
      })

      const data = await response.json()

      if (response.ok) {
        setWaitlistSuccess(true)
      } else {
        setWaitlistError(data.error || "Failed to join waitlist")
      }
    } catch (err) {
      setWaitlistError("Something went wrong. Please try again.")
    } finally {
      setWaitlistLoading(false)
    }
  }

  const handleSelect = (value) => {
    const currentQuestion = activeSteps[currentStep]

    if (currentQuestion.id === "style") {
      const styleOptions = currentQuestion.options

      console.log(" Style Knockout Debug:")
      console.log(" styleComparisonIndex:", styleComparisonIndex)
      console.log(" selected value:", value)
      console.log(" current winner:", styleWinner)

      // Find the selected option object
      const selectedOption = styleOptions.find((opt) => opt.value === value)
      console.log(" selectedOption:", selectedOption)

      setStyleWinner(selectedOption)

      const nextIndex = styleComparisonIndex + 1
      console.log(" nextIndex:", nextIndex)
      console.log(" styleOptions.length:", styleOptions.length)

      if (nextIndex < styleOptions.length) {
        // More challengers to face
        console.log(" Moving to next challenger")
        setStyleComparisonIndex(nextIndex)
      } else {
        // Tournament complete - save the winner
        console.log(" Tournament complete, saving:", selectedOption.value)
        setQuizData({ ...quizData, [currentQuestion.id]: selectedOption.value })

        // Reset state
        setStyleComparisonIndex(0)
        setStyleWinner(null)

        // Move to next step
        setTimeout(() => {
          if (currentStep < activeSteps.length - 1) {
            setCurrentStep(currentStep + 1)
          }
        }, 300)
      }
      return
    }

    if (currentQuestion.id === "start") {
      if (value === "upload") {
        setShowComingSoon(true)
        return
      } else {
        setIsUploadMode(false)
        setCurrentStep(currentStep + 1)
        return
      }
    }

    if (currentQuestion.id === "gender" && value !== "female") {
      setShowServiceUnavailable(true)
      return
    }

    if (currentQuestion.multiple) {
      const currentArray = quizData[currentQuestion.id] || []
      if (currentArray.includes(value)) {
        setQuizData({ ...quizData, [currentQuestion.id]: currentArray.filter((c) => c !== value) })
      } else if (currentArray.length < (currentQuestion.maxSelections || 3)) {
        setQuizData({ ...quizData, [currentQuestion.id]: [...currentArray, value] })
      }
    } else {
      setQuizData({ ...quizData, [currentQuestion.id]: value })
      setTimeout(() => {
        if (currentStep < activeSteps.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          saveQuizToDatabase()
          storage.saveProfile(quizData)
          storage.saveSelectionStatus(false)
          router.push("/generate")
        }
      }, 300)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQuizData({ ...quizData, uploadedImage: file })
      setCurrentStep(currentStep + 1)
    }
  }

  const handleNext = async () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await saveQuizToDatabase()
      storage.saveProfile(quizData)
      storage.saveSelectionStatus(false)
      router.push("/generate")
    }
  }

  const handleSkip = async () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await saveQuizToDatabase()
      storage.saveProfile(quizData)
      storage.saveSelectionStatus(false)
      router.push("/generate")
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const currentQuestion = activeSteps[currentStep]
      if (currentQuestion.id === "style") {
        setStyleComparisonIndex(0)
        setStyleWinner(null)
      }
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTextChange = (e) => {
    setQuizData({ ...quizData, [currentQuestion.id]: e.target.value })
  }

  const canProceed =
    currentQuestion.id === "start"
      ? true
      : currentQuestion.type === "text"
        ? true
        : currentQuestion.multiple
          ? (quizData[currentQuestion.id] || []).length > 0
          : quizData[currentQuestion.id]

  const isOptional = ["additionalDetails", "colors"].includes(currentQuestion.id)

  const saveQuizToDatabase = async () => {
    if (!user) {
      console.log(" No user logged in, skipping quiz save to DB")
      return
    }

    try {
      let imageUrl = null

      if (quizData.uploadedImage) {
        const reader = new FileReader()
        imageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(quizData.uploadedImage)
        })
      }

      const visionData = styledProfile
        ? {
            ...quizData,
            styledProfile: {
              height_cm: styledProfile.height_cm,
              weight_kg: styledProfile.weight_kg,
              body_type: styledProfile.body_type,
              face_shape: styledProfile.face_shape,
              skin_tone: styledProfile.skin_tone,
            },
          }
        : quizData

      const quizRecord = {
        user_id: user.id,
        vision: JSON.stringify(visionData),
        budget: quizData.budget || styledProfile?.default_budget,
        occasion: quizData.occasion || styledProfile?.default_occasion,
        mood: quizData.style,
        uploaded_image_url: imageUrl,
      }

      const { data, error } = await supabaseAuth.from("style_quizzes").insert([quizRecord]).select().single()

      if (error) {
        console.error(" Error saving quiz to database:", error)
      } else {
        console.log(" Quiz saved to database with ID:", data.id)
        storage.saveQuizId(data.id)

        if (styledProfile) {
          storage.saveStyledProfile(styledProfile)
        }
      }
    } catch (error) {
      console.error(" Error in saveQuizToDatabase:", error)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 animate-fade-in mt-20 min-h-screen">
      <AnimatePresence>
        {showServiceUnavailable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowServiceUnavailable(false)
              setWaitlistSuccess(false)
              setWaitlistError("")
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative mx-4 max-w-md w-full bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowServiceUnavailable(false)
                  setWaitlistSuccess(false)
                  setWaitlistError("")
                }}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-neutral-100 flex items-center justify-center">
                  {waitlistSuccess ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : (
                    <Bell className="w-8 h-8 text-neutral-900" />
                  )}
                </div>

                {waitlistSuccess ? (
                  <>
                    <h3 className="text-2xl font-serif font-medium text-neutral-900 mb-3">You're on the List!</h3>
                    <p className="text-neutral-600 mb-6 leading-relaxed">
                      We'll notify you at <strong>{waitlistEmail}</strong> when men's styling becomes available.
                    </p>
                    <Button
                      onClick={() => {
                        setShowServiceUnavailable(false)
                        setQuizData({ ...quizData, gender: "female" })
                        setTimeout(() => {
                          setCurrentStep(currentStep + 1)
                        }, 300)
                      }}
                      className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      Continue with Women's Fashion
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-serif font-medium text-neutral-900 mb-3">Coming Soon!</h3>
                    <p className="text-neutral-600 mb-6 leading-relaxed">
                      Men's styling is launching soon. We'd be happy to notify you when it becomes available.
                    </p>

                    <form onSubmit={handleWaitlistSubmit} className="mb-6">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={waitlistLoading}
                          className="px-6 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
                        >
                          {waitlistLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Notify Me"}
                        </Button>
                      </div>
                      {waitlistError && <p className="text-red-500 text-sm mt-2 text-left">{waitlistError}</p>}
                    </form>

                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setShowServiceUnavailable(false)
                          setQuizData({ ...quizData, gender: "female" })
                          setTimeout(() => {
                            setCurrentStep(currentStep + 1)
                          }, 300)
                        }}
                        variant="outline"
                        className="w-full border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                      >
                        Continue with Women's Fashion
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowServiceUnavailable(false)
                          setWaitlistError("")
                        }}
                        className="w-full text-neutral-500 hover:text-neutral-700"
                      >
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative mx-4 max-w-md w-full bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-neutral-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-neutral-900" />
                </div>

                <h3 className="text-2xl font-serif font-medium text-neutral-900 mb-3">Coming Soon</h3>

                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Our AI-powered photo analysis feature is currently in development. Soon you'll be able to upload a
                  photo and let our AI analyze your style automatically.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowComingSoon(false)
                      setIsUploadMode(false)
                      setCurrentStep(currentStep + 1)
                    }}
                    className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    Take Style Quiz Instead
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowComingSoon(false)}
                    className="w-full border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      <div className="flex flex-col lg:flex-row gap-8">
        {completedSteps.length > 0 && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:w-80 shrink-0"
          >
            <div className="sticky top-24 bg-gradient-to-br from-background to-muted/50 border border-border/60 shadow-lg backdrop-blur-sm p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Your Selections</h3>
              </div>
              <div className="space-y-3">
                {completedSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className="group relative p-4 rounded-xl bg-card/50 border border-border/40 hover:border-accent/50 hover:bg-card/80 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
                    <div className="relative">
                      <p className="text-[10px] text-muted-foreground/80 mb-1.5 uppercase tracking-wider font-medium">
                        {step.question}
                      </p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{step.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {completedSteps.length} {completedSteps.length === 1 ? "answer" : "answers"}
                  </span>
                  <span className="text-accent font-medium">{Math.round(progress)}% complete</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}

        <div className="flex-1">
          <div className="mb-12" data-tour="progress-bar">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium tracking-wide text-foreground/80">
                Step {currentStep + 1} of {activeSteps.length}
              </span>
              <span className="text-sm font-medium tracking-wide text-accent">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-1 overflow-hidden bg-muted">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8 animate-fade-up" data-tour="question-title">
            <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
              {currentQuestion.question}
            </h2>
            {currentQuestion.multiple && (
              <p className="text-sm text-muted-foreground">
                Selected: {(quizData[currentQuestion.id] || []).length} / {currentQuestion.maxSelections || 3}
              </p>
            )}
          </div>

          {currentQuestion.type === "text" ? (
            <div className="mb-8 animate-fade-up">
              <Textarea
                value={quizData[currentQuestion.id] || ""}
                onChange={handleTextChange}
                placeholder="Share your thoughts..."
                className="min-h-[150px] resize-none border-border/50 focus:border-accent"
              />
            </div>
          ) : (
            <div
              className={`mb-12 grid gap-4 ${
                currentQuestion.id === "style"
                  ? "grid-cols-1 md:grid-cols-2"
                  : currentQuestion.id === "colors"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "md:grid-cols-2"
              }`}
              data-tour="quiz-options"
            >
              {currentQuestion.id === "style"
                ? (() => {
                    const styleOptions = currentQuestion.options
                    let currentPair
                    if (styleWinner && styleComparisonIndex < styleOptions.length) {
                      // Winner vs next challenger
                      currentPair = [styleWinner, styleOptions[styleComparisonIndex]]
                    } else if (!styleWinner && styleComparisonIndex === 0) {
                      // First matchup: option 0 vs option 1
                      currentPair = styleOptions.slice(0, 2)
                    } else {
                      currentPair = []
                    }

                    console.log(" Rendering Style Step:")
                    console.log(" styleOptions:", styleOptions)
                    console.log(" styleWinner:", styleWinner)
                    console.log(" styleComparisonIndex:", styleComparisonIndex)
                    console.log(" currentPair:", currentPair)

                    return currentPair.map((option, pairIndex) => {
                      console.log(" Rendering option:", option)

                      return (
                        <Card
                          key={option.value}
                          className={`group cursor-pointer border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-up`}
                          style={{ animationDelay: `${pairIndex * 100}ms` }}
                          onClick={() => handleSelect(option.value)}
                        >
                          {option.image && (
                            <div className="relative w-full h-72 mb-4 overflow-hidden rounded-lg">
                              <Image
                                src={option.image || "/placeholder.svg"}
                                alt={option.label}
                                fill
                                className="object-cover object-top"
                              />
                            </div>
                          )}
                          <div className="flex items-start gap-4">
                            {option.icon && !option.image && (
                              <span className="text-4xl transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                                {option.icon}
                              </span>
                            )}
                            {option.color && (
                              <div
                                className="relative h-14 w-14 shrink-0 border border-border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg overflow-hidden"
                                style={{ backgroundColor: option.color }}
                              >
                                {styleWinner === option && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 animate-fade-in">
                                    <Check className="h-6 w-6 text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="mb-1 text-lg font-medium text-card-foreground tracking-tight">
                                {option.label}
                              </h3>
                              {option.description && (
                                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            {styleWinner === option && !option.color && !option.image && (
                              <Check className="h-6 w-6 shrink-0 text-accent animate-scale-in" />
                            )}
                          </div>
                        </Card>
                      )
                    })
                  })()
                : currentQuestion.options.map((option, index) => {
                    const isSelected = currentQuestion.multiple
                      ? (quizData[currentQuestion.id] || []).includes(option.value)
                      : quizData[currentQuestion.id] === option.value

                    return (
                      <Card
                        key={option.value}
                        className={`group cursor-pointer border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-up ${
                          isSelected
                            ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                            : "border-border/50 hover:border-accent/50"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => handleSelect(option.value)}
                      >
                        {option.image && (
                          <div className="relative w-full h-72 mb-4 overflow-hidden rounded-lg">
                            <Image
                              src={option.image || "/placeholder.svg"}
                              alt={option.label}
                              fill
                              className="object-cover object-top"
                            />
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          {option.icon && !option.image && (
                            <span className="text-4xl transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                              {option.icon}
                            </span>
                          )}
                          {option.color && (
                            <div
                              className="relative h-14 w-14 shrink-0 border border-border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg overflow-hidden"
                              style={{ backgroundColor: option.color }}
                            >
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 animate-fade-in">
                                  <Check className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-medium text-card-foreground tracking-tight">
                              {option.label}
                            </h3>
                            {option.description && (
                              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                {option.description}
                              </p>
                            )}
                          </div>
                          {isSelected && !option.color && !option.image && (
                            <Check className="h-6 w-6 shrink-0 text-accent animate-scale-in" />
                          )}
                        </div>
                      </Card>
                    )
                  })}
            </div>
          )}

          <div className="flex items-center justify-between gap-4" data-tour="navigation-buttons">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="border-border/50 hover:border-accent/50 disabled:opacity-40 bg-transparent"
            >
              Back
            </Button>

            <div className="flex items-center gap-4">
              {isOptional && (
                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
                  Skip
                </Button>
              )}

              {currentStep === activeSteps.length - 1 && (
                <Button onClick={handleNext} disabled={!canProceed && !isOptional} className="min-w-[120px]">
                  Get The Look
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
