"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Sparkles, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth-modal"
import Header from "@/components/header"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const pulseAnimation = `
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
    }
    50% {
      box-shadow: 0 0 20px 4px rgba(255, 255, 255, 0.2);
    }
  }
`

const buttonShimmerAnimation = `
  @keyframes button-shimmer {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 200px 0;
    }
  }
`

function HeroVideoBackground({ isPlaying, isMuted }) {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = async () => {
      try {
        video.muted = true
        await video.play()
        setIsLoaded(true)
      } catch (err) {
        console.log("[v0] Video autoplay failed, trying again...")
        setTimeout(async () => {
          try {
            await video.play()
            setIsLoaded(true)
          } catch (e) {
            console.log("[v0] Video play retry failed")
          }
        }, 500)
      }
    }

    video.addEventListener("loadeddata", () => {
      setIsLoaded(true)
      playVideo()
    })

    if (video.readyState >= 3) {
      setIsLoaded(true)
      playVideo()
    }

    return () => {
      video.removeEventListener("loadeddata", () => {})
    }
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-900">
      {!isLoaded && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
            style={{
              animation: "shimmer 1.5s infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/ved.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[25%] bg-gradient-to-r from-black/40 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[25%] bg-gradient-to-l from-black/40 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  )
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-[8px] sm:text-[9px] md:text-[11px] font-medium tracking-[0.3em] uppercase text-white/60">
          Scroll
        </span>
        <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </motion.div>
  )
}

function AnimatedHeroText({ children, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 1,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  )
}

function FadeInView({ children, delay = 0, className = "" }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function TypewriterInput({ value, onChange, placeholder, className }) {
  const [displayPlaceholder, setDisplayPlaceholder] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isFocused || value) {
      setDisplayPlaceholder("")
      return
    }

    let index = 0
    setDisplayPlaceholder("")

    const typeInterval = setInterval(() => {
      if (index < placeholder.length) {
        setDisplayPlaceholder(placeholder.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          if (!isFocused && !value) {
            index = 0
          }
        }, 3000)
      }
    }, 60)

    return () => clearInterval(typeInterval)
  }, [placeholder, isFocused, value])

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 text-neutral-900 text-base sm:text-lg md:text-xl py-3 sm:py-4 outline-none transition-colors duration-300 placeholder:text-transparent"
        placeholder=""
      />
      {!value && !isFocused && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 text-base sm:text-lg md:text-xl pointer-events-none flex items-center">
          <span>{displayPlaceholder}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
            className="ml-0.5 w-[2px] h-5 sm:h-6 bg-neutral-400 inline-block"
          />
        </div>
      )}
    </div>
  )
}

function HomeContent() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [visionText, setVisionText] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("signin")
  const [selectedOccasion, setSelectedOccasion] = useState("")
  const [selectedBudget, setSelectedBudget] = useState("")
  const [selectedAesthetic, setSelectedAesthetic] = useState("")
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [userCredits, setUserCredits] = useState(0)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setUserCredits(0)
        return
      }

      try {
        const { data, error } = await supabaseAuth.from("profiles").select("credits").eq("id", user.id).single()

        if (data) {
          setUserCredits(data.credits ?? 0)
        }
      } catch (err) {
        console.error("Failed to fetch credits:", err)
      }
    }

    fetchCredits()

    // Listen for credit updates from other parts of the app
    window.addEventListener("credits-updated", fetchCredits)
    return () => window.removeEventListener("credits-updated", fetchCredits)
  }, [user])
  const handleStartQuiz = () => {
    router.push("/quiz")
  }

  const handleCurateMyLook = () => {
    const params = new URLSearchParams()
    if (selectedOccasion) params.set("occasion", selectedOccasion)
    if (selectedBudget) params.set("budget", selectedBudget)
    if (selectedAesthetic) params.set("mood", selectedAesthetic)

    if (visionText.trim()) {
      localStorage.setItem("btl_quick_vision", visionText)
      params.set("quick", "true")
    }

    router.push(`/quiz?${params.toString()}`)
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <div className="relative">
      <style jsx global>{`
        ${pulseAnimation}
        ${buttonShimmerAnimation}
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-button-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
          background-size: 200px 100%;
          animation: button-shimmer 2s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <Header openAuth={openAuth} />

      <main className="relative">
        {/* ========== HERO SECTION ========== */}
        <section className="w-full relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          <HeroVideoBackground isPlaying={isVideoPlaying} isMuted={isVideoMuted} />

          {/* Video Controls - responsive positioning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="absolute bottom-20 sm:bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2"
          >
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
            >
              {isVideoPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
            >
              {isVideoMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </motion.div>

          <ScrollIndicator />

          {/* Hero Content - improved responsive padding and spacing */}
          <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto py-20 sm:py-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 sm:mb-8 md:mb-12"
            />

            <h1 className="text-[11vw] xs:text-[10vw] sm:text-[9vw] md:text-[7vw] lg:text-[5.5rem] xl:text-[6.5rem] leading-[0.95] font-serif tracking-[-0.02em] text-white mb-4 sm:mb-6 md:mb-8">
              <AnimatedHeroText delay={0.5}>Stop scrolling.</AnimatedHeroText>
              <AnimatedHeroText delay={0.7}>
                <span className="italic font-light text-white/95">Get styled.</span>
              </AnimatedHeroText>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/75 font-light max-w-xs sm:max-w-md md:max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2"
            >
              Answer 10 questions and get a complete, ready-to-shop outfit in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="group relative w-full sm:w-auto min-h-[56px] sm:min-h-[60px] px-8 sm:px-10 bg-white text-neutral-900 hover:bg-white/95 hover:scale-105 active:scale-100 text-base sm:text-lg font-medium tracking-wide transition-all duration-300 animate-pulse-glow touch-manipulation overflow-hidden"
              >
                <span className="absolute inset-0 animate-button-shimmer" />
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  Start Style Quiz
                  <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-10 sm:mt-14 md:mt-16"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                {[
                  { label: "AI-powered personalization" },
                  { label: "Instant shopping links" },
                  { label: "Perfect outfits in minutes" },
                ].map((stat, i) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xs sm:text-sm md:text-base tracking-wide text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== HOW IT WORKS SECTION ========== */}
        <section className="py-20 sm:py-24 md:py-28 lg:py-32 bg-white" id="howits">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
            <FadeInView className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4 sm:mb-5">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 mb-4">
                Three simple steps to your perfect outfit
              </h2>
            </FadeInView>

            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 md:gap-10 mb-12">
              {[
                {
                  step: "1",
                  title: "Answer a few questions",
                  description: "Tell us your style, preferences, and the occasion",
                },
                {
                  step: "2",
                  title: "AI curates a complete outfit",
                  description: "Our AI analyzes thousands of pieces to find your perfect match",
                },
                {
                  step: "3",
                  title: "Get a ready-to-shop look",
                  description: "Receive your personalized outfit with direct shopping links",
                },
              ].map((item, i) => (
                <FadeInView key={item.step} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 sm:mb-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-serif text-base">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-serif text-neutral-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
                  </div>
                </FadeInView>
              ))}
            </div>

            <FadeInView delay={0.3} className="text-center">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="group w-full sm:w-auto min-h-[56px] px-8 sm:px-10 bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-105 active:scale-100 text-base font-medium tracking-wide transition-all duration-300 touch-manipulation"
              >
                Start Style Quiz
                <ArrowRight className="w-5 h-5 ml-2 sm:ml-3 transition-transform duration-500 ease-in-out group-hover:translate-x-1" />
              </Button>
            </FadeInView>
          </div>
        </section>

        {/* ========== THE EXPERIENCE SECTION ========== */}
        <section className="relative py-32 sm:py-40 md:py-48 lg:py-56 bg-neutral-900 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
              <source src="/video/fashion-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-900/60 to-neutral-900/80" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <FadeInView>
              <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-6 sm:mb-8">
                The Experience
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 sm:mb-8 leading-tight">
                Where Fashion <span className="italic font-light">Meets</span> You
              </h2>
              <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                Every outfit is a reflection of your unique style DNA—curated by AI, crafted for you, ready to wear.
              </p>
            </FadeInView>
          </div>
        </section>

        {/* ========== PERSONAL ATELIER SECTION ========== */}
        <section className="py-20 sm:py-24 md:py-28 lg:py-32 bg-[#faf9f7] border-y border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Section Header */}
            <FadeInView className="text-center mb-12 sm:mb-14">
              <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-4 sm:mb-5">
                Start Your Quiz
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">
                Curate Your <span className="italic font-light">Look</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-500 mt-4 max-w-xl mx-auto">
                Get started by sharing your style vision, or jump straight into the full quiz.
              </p>
            </FadeInView>

            {/* 3 Sections Layout */}
            <div className="space-y-12 sm:space-y-16">
              {/* SECTION 01: Vision Input */}
              <FadeInView delay={0.1}>
                <div className="text-center mb-4 sm:mb-6">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-300 font-light">01</span>
                  <h3 className="text-sm sm:text-base md:text-lg font-serif mt-2 text-neutral-600">
                    Describe Your Vision
                  </h3>
                </div>
                <div className="max-w-2xl mx-auto">
                  <TypewriterInput
                    value={visionText}
                    onChange={(e) => setVisionText(e.target.value)}
                    placeholder="An elegant evening look with modern minimalist vibes..."
                    className="w-full"
                  />
                </div>
              </FadeInView>

              {/* SECTION 02: Filters - Responsive Grid */}
              <FadeInView delay={0.2}>
                <div className="text-center mb-8 sm:mb-10">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-300 font-light">02</span>
                  <h3 className="text-sm sm:text-base md:text-lg font-serif mt-2 text-neutral-600">
                    Select Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8">
                  {/* Occasion Filter */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                      Occasion
                    </label>
                    <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                      <SelectTrigger className="w-full h-11 sm:h-12 bg-transparent border-0 border-b border-neutral-300 hover:border-neutral-500 focus:border-neutral-900 text-neutral-700 text-center justify-center focus:ring-0 transition-colors duration-300 text-sm sm:text-base">
                        <SelectValue placeholder="Select Occasion" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-neutral-200">
                        <SelectItem value="everyday">Everyday</SelectItem>
                        <SelectItem value="work">Work / Office</SelectItem>
                        <SelectItem value="date">Date Night</SelectItem>
                        <SelectItem value="party">Party / Event</SelectItem>
                        <SelectItem value="formal">Formal / Black Tie</SelectItem>
                        <SelectItem value="casual">Casual Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Investment Filter */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                      Investment
                    </label>
                    <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                      <SelectTrigger className="w-full h-11 sm:h-12 bg-transparent border-0 border-b border-neutral-300 hover:border-neutral-500 focus:border-neutral-900 text-neutral-700 text-center justify-center focus:ring-0 transition-colors duration-300 text-sm sm:text-base">
                        <SelectValue placeholder="Set Budget" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-neutral-200">
                        <SelectItem value="budget">Budget ($50-$150)</SelectItem>
                        <SelectItem value="moderate">Moderate ($150-$400)</SelectItem>
                        <SelectItem value="premium">Premium ($400-$800)</SelectItem>
                        <SelectItem value="luxury">Luxury ($800+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Aesthetic Filter */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                      Aesthetic
                    </label>
                    <Select value={selectedAesthetic} onValueChange={setSelectedAesthetic}>
                      <SelectTrigger className="w-full h-11 sm:h-12 bg-transparent border-0 border-b border-neutral-300 hover:border-neutral-500 focus:border-neutral-900 text-neutral-700 text-center justify-center focus:ring-0 transition-colors duration-300 text-sm sm:text-base">
                        <SelectValue placeholder="Any Mood" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-neutral-200">
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="classic">Classic / Timeless</SelectItem>
                        <SelectItem value="modern">Modern / Contemporary</SelectItem>
                        <SelectItem value="bohemian">Bohemian</SelectItem>
                        <SelectItem value="streetwear">Streetwear</SelectItem>
                        <SelectItem value="romantic">Romantic / Feminine</SelectItem>
                        <SelectItem value="edgy">Edgy / Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FadeInView>

              {/* SECTION 03: CTA Button */}
              <FadeInView delay={0.3} className="text-center">
                <Button
                  onClick={handleCurateMyLook}
                  className="group relative w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-12 bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium tracking-[0.1em] uppercase overflow-hidden transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                    <Sparkles className="w-4 h-4" />
                    Start Style Quiz
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>

                <p className="mt-4 sm:mt-5 text-neutral-400 text-xs sm:text-sm">
                  {user ? "Uses 1 credit per outfit generation" : "Sign in to save your generated outfits"}
                </p>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* ========== YOUR ACCOUNT SECTION ========== */}
        {user && (
          <section className="py-20 sm:py-24 md:py-28 lg:py-32 bg-white border-t border-neutral-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
              <FadeInView className="text-center mb-12 sm:mb-16">
                <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-4 sm:mb-5">
                  Your Account
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
                  Welcome Back, <span className="italic font-light">{profile?.name || user?.email?.split("@")[0]}</span>
                </h2>
                <p className="text-sm sm:text-base text-neutral-500 font-light mt-4 sm:mt-5 max-w-2xl mx-auto leading-relaxed">
                  View and edit your style profile, preferences, and account settings.
                </p>
              </FadeInView>

              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                {/* View Profile Card */}
                <FadeInView delay={0.1}>
                  <div className="group bg-white border border-neutral-200 p-6 sm:p-8 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-serif text-neutral-900 mb-3">View Profile</h3>
                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                      Manage your style DNA, measurements, and preferences.
                    </p>
                    <button
                      onClick={() => router.push("/profile")}
                      className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
                    >
                      Edit Profile
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </FadeInView>

                {/* Credits Card */}
                <FadeInView delay={0.2}>
                  <div className="group bg-white border border-neutral-200 p-6 sm:p-8 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <h3 className="text-4xl font-serif text-neutral-900 mb-1">{userCredits}</h3>
                    <p className="text-sm text-neutral-400 mb-1">Credits</p>
                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                      Purchase more credits to unlock outfits and shopping links.
                    </p>
                    <button
                      onClick={() => router.push("/credits")}
                      className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
                    >
                      Buy Credits
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </FadeInView>

                {/* Style Quiz Card */}
                <FadeInView delay={0.3}>
                  <div className="group bg-white border border-neutral-200 p-6 sm:p-8 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-6">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-serif text-neutral-900 mb-3">Style Quiz</h3>
                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                      Update your style preferences and get better outfit recommendations.
                    </p>
                    <button
                      onClick={() => router.push("/quiz")}
                      className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
                    >
                      Take Quiz
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </FadeInView>
              </div>
            </div>
          </section>
        )}

        {/* ========== OUR PHILOSOPHY SECTION ========== */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <FadeInView>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 mb-4 sm:mb-6">
                Our Philosophy
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto">
                Style should be effortless. We believe everyone deserves to look their best without the guesswork.
              </p>
            </FadeInView>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-20 sm:py-24 md:py-28 lg:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <FadeInView>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-neutral-900 mb-4 sm:mb-6">
                Ready for Your Perfect <span className="italic font-light">Wardrobe</span>?
              </h2>
            </FadeInView>

            <FadeInView delay={0.1}>
              <p className="text-base sm:text-lg text-neutral-500 font-light mb-8 sm:mb-10 max-w-2xl mx-auto">
                Join thousands getting AI-styled daily.
              </p>
            </FadeInView>

            <FadeInView delay={0.2}>
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="group w-full sm:w-auto min-h-[56px] sm:min-h-[60px] px-8 sm:px-10 bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-105 active:scale-100 text-base font-medium tracking-wide transition-all duration-300 touch-manipulation"
              >
                Start Style Quiz
                <ArrowRight className="w-5 h-5 ml-2 sm:ml-3 transition-transform duration-500 ease-in-out group-hover:translate-x-1" />
              </Button>
            </FadeInView>
          </div>
        </section>
      </main>


      <AnimatePresence>
        {showAuthModal && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
          <div
            className="w-8 h-8 border-2 border-neutral-300 animate-spin"
            style={{ borderTopColor: "rgb(23 23 23)" }}
          />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
