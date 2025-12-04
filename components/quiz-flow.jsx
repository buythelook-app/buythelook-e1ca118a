"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Type, Check, X, Sparkles, Bell } from "lucide-react"
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
  const fileInputRef = useRef(null)

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

  const handleSelect = (value) => {
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
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in mt-20">
      <AnimatePresence>
        {showServiceUnavailable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowServiceUnavailable(false)}
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
                onClick={() => setShowServiceUnavailable(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-neutral-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-neutral-900" />
                </div>

                <h3 className="text-2xl font-serif font-medium text-neutral-900 mb-3">Service Currently Unavailable</h3>

                <p className="text-neutral-600 mb-6 leading-relaxed">
                  We're currently offering styling services exclusively for women's fashion. We'd be happy to notify you
                  when we expand our services to include more options.
                </p>

                <div className="space-y-3">
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

                  <Button
                    variant="outline"
                    onClick={() => setShowServiceUnavailable(false)}
                    className="w-full border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    Close
                  </Button>
                </div>
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

      <div className="mb-12" data-tour="progress-bar">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium tracking-wide text-foreground/80">
            Step {currentStep + 1} of {activeSteps.length}
          </span>
          <span className="text-sm font-medium tracking-wide text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-1 overflow-hidden bg-muted">
          <div
            className="h-full bg-gradient-to-r from-accent via-accent/80 to-accent transition-all duration-700 ease-out-quart animate-shimmer"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-12 animate-fade-up" data-tour="quiz-start">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance font-serif">
          {currentQuestion.question}
        </h1>
        {currentQuestion.multiple && (
          <p className="text-base text-muted-foreground font-light tracking-wide">
            Selected: {(quizData[currentQuestion.id] || []).length} / {currentQuestion.maxSelections}
          </p>
        )}
      </div>

      {currentQuestion.type === "text" ? (
        <div className="mb-12 animate-fade-up">
          <Textarea
            placeholder={currentQuestion.placeholder}
            value={quizData[currentQuestion.id] || ""}
            onChange={handleTextChange}
            className="min-h-[150px] text-lg p-6 border-2 focus-visible:ring-accent"
          />
        </div>
      ) : (
        <div className="mb-12 grid gap-4 md:grid-cols-2" data-tour="quiz-options">
          {currentQuestion.options.map((option, index) => {
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
                    <h3 className="mb-1 text-lg font-medium text-card-foreground tracking-tight">{option.label}</h3>
                    {option.description && (
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">{option.description}</p>
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

      <div className="flex items-center justify-between" data-tour="quiz-navigation">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-30 bg-transparent border-border"
        >
          Back
        </Button>

        <div className="flex gap-3">
          {isOptional && (
            <Button variant="ghost" onClick={handleSkip} className="px-6 text-muted-foreground hover:text-foreground">
              Skip
            </Button>
          )}

          {(currentStep === activeSteps.length - 1 || currentQuestion.multiple) && (
            <Button
              onClick={handleNext}
              disabled={!canProceed && !isOptional}
              size="lg"
              className="px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-30 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {currentStep === activeSteps.length - 1 ? "Generate Outfits" : "Continue"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
