"use client"

import Link from "next/link"
import { useState, useEffect, useRef, Suspense } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Sparkles, Play, Pause, Volume2, VolumeX, User, CreditCard, Wand2, ChevronRight } from 'lucide-react'
import { useAuth } from "@/components/auth-provider"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AuthModal from "@/components/auth-modal"
import Header from "@/components/header"

// Simplified video component
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
        console.log("[v0] Video autoplay failed")
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
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/ved.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    </div>
  )
}

// Scroll progress indicator
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-neutral-900 z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

// Simple parallax container
function ParallaxContainer({ children, speed = 0.5 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100])

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}

// Sticky section with reveal effect
function StickySection({ children, className = "" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1])

  return (
    <motion.section
      ref={ref}
      style={{ opacity, scale }}
      className={`sticky top-0 min-h-screen flex items-center justify-center ${className}`}
    >
      {children}
    </motion.section>
  )
}

// Fade in component
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
      <ScrollProgress />
      <Header openAuth={openAuth} />

      <main className="relative">
        {/* ========== HERO SECTION ========== */}
        <section className="w-full relative h-screen flex items-center justify-center overflow-hidden">
          <HeroVideoBackground isPlaying={isVideoPlaying} isMuted={isVideoMuted} />

          {/* Video Controls */}
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
            >
              {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
              aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
            >
              {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative z-10 text-center px-6 md:px-8 max-w-5xl mx-auto">
            <h1 className="text-[12vw] sm:text-[10vw] md:text-[7vw] lg:text-[6rem] xl:text-[7rem] leading-[0.9] font-serif tracking-[-0.02em] text-white mb-6 md:mb-8">
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                Discover Your
              </motion.span>
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="block italic font-light text-white/95"
              >
                Signature Style
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-base md:text-lg text-white/60 font-light max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed"
            >
              Experience bespoke fashion curation powered by artificial intelligence.
              <span className="hidden md:inline"> Your personal stylist, reimagined.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="group h-13 px-8 bg-white text-neutral-900 hover:bg-white/95 text-sm font-medium tracking-wide transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Begin Your Journey
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>

              <Link href="/outfits">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-8 bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-sm font-medium tracking-wide transition-all duration-300"
                >
                  View Collections
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-white/40">Scroll</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
            </motion.div>
          </motion.div>
        </section>

        {/* ========== PARALLAX SCROLL SECTIONS ========== */}
        <div className="relative">
          {/* Sticky Personal Atelier Background */}
          <StickySection className="bg-[#faf9f7]">
            <div className="max-w-4xl mx-auto px-6 md:px-8 w-full">
              <FadeInView className="text-center mb-16">
                <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-5">
                  Personal Atelier
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-neutral-900">
                  Curate Your <span className="italic font-light">Look</span>
                </h2>
              </FadeInView>

              <div className="space-y-16">
                <FadeInView delay={0.1}>
                  <div className="text-center mb-6">
                    <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-300 font-light">01</span>
                    <h3 className="text-base md:text-lg font-serif mt-2 text-neutral-600">Describe Your Vision</h3>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <input
                      type="text"
                      value={visionText}
                      onChange={(e) => setVisionText(e.target.value)}
                      placeholder="An elegant evening look with modern minimalist vibes..."
                      className="w-full bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 text-neutral-900 text-lg md:text-xl py-4 outline-none transition-colors duration-300 placeholder:text-neutral-400"
                    />
                  </div>
                </FadeInView>

                <FadeInView delay={0.2}>
                  <div className="text-center mb-10">
                    <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-300 font-light">02</span>
                    <h3 className="text-base md:text-lg font-serif mt-2 text-neutral-600">Select Preferences</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="space-y-3">
                      <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                        Occasion
                      </label>
                      <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                        <SelectTrigger className="w-full h-12 bg-transparent border-0 border-b border-neutral-300 hover:border-neutral-500 focus:border-neutral-900 text-neutral-700 text-center justify-center focus:ring-0 transition-colors duration-300">
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

                    <div className="space-y-3">
                      <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                        Investment
                      </label>
                      <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                        <SelectTrigger className="w-full h-12 bg-transparent border-0 border-b border-neutral-300 hover:border-neutral-500 focus:border-neutral-900 text-neutral-700 text-center justify-center focus:ring-0 transition-colors duration-300">
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

                    <div className="space-y-3">
                      <label className="block text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                        Aesthetic
                      </label>
                      <Select value={selectedAesthetic} onValueChange={setSelectedAesthetic}>
                        <SelectTrigger className="w-full h-12 bg-transparent border-0 border-b border-neutral-300 hover:border-neutral-500 focus:border-neutral-900 text-neutral-700 text-center justify-center focus:ring-0 transition-colors duration-300">
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

                <FadeInView delay={0.3} className="text-center">
                  <div className="mb-8">
                    <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-300 font-light">03</span>
                    <h3 className="text-base md:text-lg font-serif mt-2 text-neutral-600">Begin Your Journey</h3>
                  </div>

                  <Button
                    onClick={handleCurateMyLook}
                    className="group relative h-14 px-12 bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium tracking-[0.1em] uppercase overflow-hidden transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Sparkles className="w-4 h-4" />
                      Curate My Look
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>

                  <p className="mt-5 text-neutral-400 text-sm">
                    {user ? "Uses 1 credit per outfit generation" : "Sign in to save your generated outfits"}
                  </p>
                </FadeInView>
              </div>
            </div>
          </StickySection>

          {/* Sliding Experience Section */}
          <ParallaxContainer speed={0.3}>
            <section className="min-h-screen bg-white flex items-center justify-center py-20">
              <div className="max-w-6xl mx-auto px-6 md:px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                  <div>
                    <FadeInView>
                      <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-5">
                        The Experience
                      </span>
                    </FadeInView>

                    <FadeInView delay={0.1}>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-[1.15] text-neutral-900 mb-6">
                        Where artificial intelligence meets
                        <span className="italic font-light"> timeless elegance</span>
                      </h2>
                    </FadeInView>

                    <FadeInView delay={0.2}>
                      <p className="text-lg text-neutral-500 font-light leading-relaxed mb-8">
                        Our AI stylist analyzes your unique preferences, body type, and lifestyle to create perfectly
                        curated outfits that express your authentic self.
                      </p>
                    </FadeInView>

                    <FadeInView delay={0.3}>
                      <div className="flex flex-wrap gap-8">
                        {[
                          { number: "50K+", label: "Outfits Curated" },
                          { number: "12", label: "Style Categories" },
                          { number: "100%", label: "Personalized" },
                        ].map((stat, i) => (
                          <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-serif text-neutral-900">{stat.number}</div>
                            <div className="text-[10px] uppercase tracking-wider text-neutral-400 mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </FadeInView>
                  </div>

                  <FadeInView delay={0.2}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden rounded-lg">
                          <img
                            src="/formal.jpg"
                            alt="Luxury fashion editorial"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </div>
                      <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden rounded-lg">
                        <img
                          src="/Bohemian.jpg"
                          alt="Minimalist fashion details"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden rounded-lg">
                        <img
                          src="/street.jpg"
                          alt="Modern streetwear"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </FadeInView>
                </div>
              </div>
            </section>
          </ParallaxContainer>
        </div>

        {/* ========== YOUR ACCOUNT SECTION ========== */}
        {user && (
          <section className="py-24 md:py-32 bg-white">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
              <FadeInView>
                <div className="text-center mb-14">
                  <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">
                    Your Account
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">
                    Welcome Back,{" "}
                    <span className="italic font-light">
                      {user.user_metadata?.full_name?.split(" ")[0] || "Style Icon"}
                    </span>
                  </h2>
                </div>
              </FadeInView>

              <div className="grid md:grid-cols-3 gap-6">
                <FadeInView delay={0.1}>
                  <Link href="/profile" className="block group">
                    <div className="p-8 border border-neutral-200 bg-white hover:border-neutral-900 transition-all duration-300 h-full">
                      <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center mb-6">
                        <User className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-xl text-neutral-900 mb-2">View Profile</h3>
                      <p className="text-sm text-neutral-500 mb-6">
                        Manage your style DNA, measurements, and preferences.
                      </p>
                      <span className="inline-flex items-center text-xs uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                        Edit Profile{" "}
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </FadeInView>

                <FadeInView delay={0.2}>
                  <Link href="/credits" className="block group">
                    <div className="p-8 border border-neutral-200 bg-white hover:border-neutral-900 transition-all duration-300 h-full">
                      <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center mb-6">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-serif text-neutral-900">{profile?.credits ?? 10}</span>
                        <span className="text-sm text-neutral-400">Credits</span>
                      </div>
                      <p className="text-sm text-neutral-500 mb-6">
                        Purchase more credits to unlock outfits and shopping links.
                      </p>
                      <span className="inline-flex items-center text-xs uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                        Buy Credits{" "}
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </FadeInView>

                <FadeInView delay={0.3}>
                  <Link href="/quiz" className="block group">
                    <div className="p-8 border border-neutral-200 bg-white hover:border-neutral-900 transition-all duration-300 h-full">
                      <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center mb-6">
                        <Wand2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-xl text-neutral-900 mb-2">Style Quiz</h3>
                      <p className="text-sm text-neutral-500 mb-6">
                        Update your style preferences and get better outfit recommendations.
                      </p>
                      <span className="inline-flex items-center text-xs uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                        Take Quiz{" "}
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </FadeInView>
              </div>
            </div>
          </section>
        )}

        {/* ========== HOW IT WORKS ========== */}
        <section className="py-28 md:py-36 bg-[#faf9f7]">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <FadeInView className="text-center mb-16">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-5">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-neutral-900">
                Three simple <span className="italic font-light">steps</span>
              </h2>
            </FadeInView>

            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
              {[
                {
                  step: "01",
                  title: "Share Your Style",
                  description: "Take our style quiz to help our AI understand your preferences.",
                },
                {
                  step: "02",
                  title: "AI Curation",
                  description: "Our algorithm analyzes pieces to find your perfect matches.",
                },
                {
                  step: "03",
                  title: "Discover & Shop",
                  description: "Explore your collection and shop curated recommendations.",
                },
              ].map((item, i) => (
                <FadeInView key={item.step} delay={i * 0.1}>
                  <div className="group">
                    <div className="text-5xl md:text-6xl font-serif text-neutral-200 mb-5 group-hover:text-neutral-300 transition-colors duration-300">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-serif text-neutral-900 mb-3">{item.title}</h3>
                    <p className="text-neutral-500 font-light leading-relaxed">{item.description}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-28 md:py-36 bg-white">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
            <FadeInView>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-neutral-900 mb-6">
                Ready to discover your <span className="italic font-light">perfect style</span>?
              </h2>
            </FadeInView>

            <FadeInView delay={0.1}>
              <p className="text-lg text-neutral-500 font-light mb-10 max-w-2xl mx-auto">
                Join thousands who have transformed their wardrobe with AI-powered personal styling.
              </p>
            </FadeInView>

            <FadeInView delay={0.2}>
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="h-14 px-10 bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium tracking-wide transition-all duration-300"
              >
                Start Style Quiz
                <ArrowRight className="w-4 h-4 ml-3" />
              </Button>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />

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
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 animate-spin rounded-full" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}