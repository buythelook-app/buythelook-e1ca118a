"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Sparkles, Play, Pause, Volume2, VolumeX, ShoppingBag, ExternalLink } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth-modal"
import Header from "@/components/header"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Image from "next/image"
import StyleGapSection from '@/components/StyleGapSection'

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

const stepPulseAnimation = `
  @keyframes stepPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`

const stepGlowAnimation = `
  @keyframes stepGlow {
    0%, 100% {
      opacity: 0;
    }
    50% {
      opacity: 0.3;
    }
  }
`

const ctaPulseAnimation = `
  @keyframes ctaPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
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
        console.log(" Video autoplay failed, trying again...")
        setTimeout(async () => {
          try {
            await video.play()
            setIsLoaded(true)
          } catch (e) {
            console.log(" Video play retry failed")
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
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-white/80">
          Scroll
        </span>
        <motion.div
          className="w-[2px] h-10 sm:h-14 bg-gradient-to-b from-white/60 to-transparent"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
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

function InfiniteProductCarousel({ products }) {
  return (
    <div className="relative overflow-hidden">
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex animate-scroll">
        {/* Duplicate the products array twice for seamless loop */}
        {[...products, ...products].map((product, index) => (
          <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px] sm:w-[320px] mx-3 group">
            <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Shop now overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white px-6 py-3 text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Shop Now
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">{product.brand}</p>
                <h3 className="text-base font-medium text-neutral-900 line-clamp-2 group-hover:text-neutral-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-neutral-900">${product.price.toFixed(2)}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">{product.category}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
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
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [hasUserOutfits, setHasUserOutfits] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)

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

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setProductsLoading(true)
      setProductsError(null)
      
      console.log("🎨 [RECENTLY STYLED] Starting fetch")
      console.log("👤 User logged in:", !!user)
      console.log("🆔 User ID:", user?.id)

      try {
        if (user) {
          // Fetch items from user's unlocked outfits
          console.log("🔍 Fetching user's unlocked outfit items")
          
          const { data: outfits, error } = await supabaseAuth
            .from("generated_outfits")
            .select("id, items, created_at, links_unlocked")
            .eq("user_id", user.id)
            .eq("links_unlocked", true)
            .order("created_at", { ascending: false })
            .limit(10)

          if (error) {
            console.error("❌ Error fetching user outfits:", error)
            throw error
          }

          console.log("📦 Raw outfits data:", outfits)
          console.log("📊 Found", outfits?.length || 0, "unlocked outfits")

          // Log each outfit details
          outfits?.forEach((outfit, idx) => {
            console.log(`🎯 Outfit ${idx + 1}:`, {
              id: outfit.id,
              created_at: outfit.created_at,
              links_unlocked: outfit.links_unlocked,
              items_count: outfit.items?.length || 0,
              has_items: !!outfit.items
            })
          })

          // Extract all items from all outfits into a flat array
          const allItems = []
          outfits?.forEach((outfit, outfitIdx) => {
            console.log(`\n🔎 Processing outfit ${outfitIdx + 1}:`)
            
            if (outfit.items && Array.isArray(outfit.items)) {
              console.log(`  ✅ Has ${outfit.items.length} items`)
              
              outfit.items.forEach((item, itemIdx) => {
                console.log(`  📦 Item ${itemIdx + 1}:`, {
                  name: item.name,
                  has_product_url: !!item.product_url,
                  has_image: !!item.image,
                  has_image_url: !!item.image_url,
                  has_images_array: !!item.images,
                  images_length: item.images?.length
                })

                if (item.product_url && (item.image || item.image_url || item.images)) {
                  let productImage = item.image || item.image_url
                  
                  // FIXED: Handle images array safely
                  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                    // Use last image if available, otherwise second to last, otherwise first
                    if (item.images.length >= 2) {
                      productImage = item.images[item.images.length - 2]
                    } else {
                      productImage = item.images[0]
                    }
                    console.log(`  🖼️  Using image from array: ${productImage}`)
                  }

                  const productItem = {
                    id: item.id || `${item.name}-${Math.random()}`,
                    name: item.name,
                    brand: item.brand || "Designer",
                    price: item.price || 0,
                    image: productImage,
                    product_url: item.product_url,
                    category: item.category || "Fashion",
                    outfitDate: outfit.created_at,
                  }

                  allItems.push(productItem)
                  console.log(`  ✅ Added to featured products`)
                } else {
                  console.log(`  ⚠️  Skipped - missing required data`)
                }
              })
            } else {
              console.log(`  ❌ No items array or not an array`)
            }
          })

          console.log("\n✨ Final results:")
          console.log("📊 Total shoppable items extracted:", allItems.length)
          console.log("🎯 Sample items:", allItems.slice(0, 3))

          if (allItems.length > 0) {
            setFeaturedProducts(allItems)
            setHasUserOutfits(true)
            setProductsLoading(false)
            console.log("✅ Successfully set featured products from user outfits")
            return
          }

          console.log("⚠️  No shoppable items found, falling back to sample products")
          setHasUserOutfits(false)
        }

        // Fallback: Fetch sample products from database
        console.log("🔄 Fetching sample products from database")
        const { searchProductsFromDB } = await import("@/lib/home")

        const products = await searchProductsFromDB(
          ["blazer", "dress", "sneaker", "jacket", "heel", "shirt", "jean", "boot"],
          { limit: 20, categoryType: "general" },
        )

        console.log("📦 Fetched", products.length, "sample products")
        setFeaturedProducts(products)
        setProductsLoading(false)
      } catch (error) {
        console.error("❌ Failed to fetch featured products:", error)
        setProductsError(error.message)
        setFeaturedProducts([])
        setProductsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [user])

  const handleStartQuiz = () => {
    router.push("/quiz")
  }

const handleCurateMyLook = () => {
  const params = new URLSearchParams()
  
  // Add the parameter to skip profile prompt
  params.set("noshowform", "true")
  
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
        ${stepPulseAnimation}
        ${stepGlowAnimation}
        ${ctaPulseAnimation}
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

          {/* Hero Content - improved responsive padding and spacing */}
          <div className="relative z-99 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto py-20 sm:py-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 sm:mb-8 md:mb-12"
            />

            <h1 className="text-[9vh] text-white font-serif tracking-[-0.02em]"><AnimatedHeroText delay={0.5}>Stop Scrolling.</AnimatedHeroText></h1>
            <h1 className="text-[9vh] text-white italic font-light text-white/95"><AnimatedHeroText delay={0.5}>Start Wearing.</AnimatedHeroText></h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 font-light max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2"
            >
              <span className="bg-black/10 backdrop-blur-sm px-1 py-0.5 rounded">
                Your perfect look is 10 questions away. Get a complete head-to-toe outfit curated by AI for your unique
                body, budget, and occasion.
              </span>
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
                  Start Your Style Quiz
                  <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.7 }}
              className="flex justify-center items-center gap-8 sm:gap-10 text-white/80 text-xs sm:text-sm font-light mt-12 sm:mt-14 md:mt-16 pt-8 sm:pt-10 border-t border-white/10"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)' }}
            >
              <div className="flex flex-col items-center ">
                <div className="font-semibold text-white mb-1 bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded">500+</div>
                <div className="bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded">Global Brands</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center ">
                <div className="font-semibold text-white mb-1 bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded">100K+</div>
                <div className="bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded">Outfits Curated</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center ">
                <div className="font-semibold text-white mb-1 bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded">1-Click</div>
                <div className="bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded">Secure Checkout</div>
              </div>
            </motion.div>
          </div>
        </section>
        <StyleGapSection/>
        <section className="py-6 sm:py-8 md:py-12 bg-neutral-50" id="howits">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
            <FadeInView className="text-center mb-10 sm:mb-12">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4 sm:mb-5">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 mb-4">
                Three Simple Steps to Your Perfect Outfit.
              </h2>
            </FadeInView>

            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 md:gap-10 mb-10">
              {[
                {
                  step: "1",
                  title: "Define Your Profile",
                  description: "Take a 60-second quiz. Tell us about the event, your body type, and your budget.",
                },
                {
                  step: "2",
                  title: "AI Personal Curation",
                  description:
                    "Our engine scans thousands of brands to build a cohesive look where every piece – from shoes to accessories – complements the next.",
                },
                {
                  step: "3",
                  title: "One-Click Transformation",
                  description:
                    "View your personalized style board and purchase the entire look directly on our platform: one cart, one checkout, zero stress.",
                },
              ].map((item, i) => (
                <FadeInView key={item.step} delay={i * 0.1}>
                  <div className="text-center">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-neutral-900 flex items-center justify-center text-white font-serif text-2xl sm:text-3xl relative overflow-hidden"
                      style={{
                        animation: `stepPulse 6s ease-in-out ${i * 2}s infinite`,
                      }}
                    >
                      <span className="relative z-10">{item.step}</span>
                      <div
                        className="absolute inset-0 bg-white opacity-0"
                        style={{
                          animation: `stepGlow 6s ease-in-out ${i * 2}s infinite`,
                        }}
                      />
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
                className="group relative w-full sm:w-auto min-h-[56px] px-8 sm:px-10 bg-neutral-900 text-white text-base font-medium tracking-wide touch-manipulation overflow-hidden
                  hover:shadow-2xl hover:shadow-neutral-900/30
                  transition-all duration-500 ease-out
                  before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-500
                  hover:before:opacity-10
                  active:scale-95"
                style={{
                  animation: "ctaPulse 3s ease-in-out infinite",
                }}
              >
                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  Find My Perfect Outfit
                  <ArrowRight className="w-5 h-5 ml-2 sm:ml-3 transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:scale-110" />
                </span>
              </Button>
            </FadeInView>
          </div>
        </section>

        <section className="relative py-2 sm:py-4 md:py-8 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Section Header */}
            <FadeInView className="text-center mb-10 sm:mb-12">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">
                AI Meets Elegance
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">
                Personal Styling, <span className="italic font-light">Democratized</span>.
              </h2>
            </FadeInView>

            {/* Two-Column Layout */}
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6 sm:space-y-8">
                <FadeInView delay={0.1}>
                  <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                    Our platform is directly connected to the inventory of the world's leading brands. This means your
                    recommendations are always in stock, perfectly sized for your silhouette, and aligned with your
                    spending goals.
                  </p>
                </FadeInView>

                <FadeInView delay={0.2}>
                  <div className="space-y-4 sm:space-5">
                    {[
                      {
                        title: "Unified Checkout",
                        description: "Buy multiple brands in one single transaction on our platform.",
                      },
                      {
                        title: "Real-Time Inventory",
                        description: "If you see it, you can wear it.",
                      },
                      {
                        title: "Precision Fit",
                        description: "Our AI analyzes fit data to ensure your 'perfect match' actually fits.",
                      },
                    ].map((feature, i) => (
                      <div key={feature.title} className="flex items-start gap-3 sm:gap-4">
                        <div className="w-1.5 h-1.5 bg-neutral-900 mt-2.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-serif text-base sm:text-lg text-neutral-900 mb-1">{feature.title}:</h3>
                          <p className="text-sm sm:text-base text-neutral-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeInView>

                {/* Stats Row */}
                <FadeInView delay={0.3}>
                  <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-neutral-200">
                    {[
                      { number: "500+", label: "Global Brands" },
                      { number: "100k+", label: "Outfits Curated" },
                      { number: "1-Click", label: "Checkout" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 mb-1">
                          {stat.number}
                        </div>
                        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeInView>
              </div>

              {/* Right Column - Image Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Large Image - Top Full Width */}
                <FadeInView delay={0.4} className="col-span-2">
                  <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden group">
                    <Image
                      src="/formal.jpg"
                      alt="Luxury fashion editorial"
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </FadeInView>

                {/* Two Smaller Images - Bottom Row */}
                <FadeInView delay={0.5}>
                  <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden group">
                    <Image
                      src="/Bohemian.jpg"
                      alt="Bohemian style fashion"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </FadeInView>

                <FadeInView delay={0.6}>
                  <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden group">
                    <Image
                      src="/imagess.png"
                      alt="Minimalist fashion details"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </FadeInView>
              </div>
            </div>
          </div>
        </section>

        {/* RECENTLY STYLED SECTION - Shows for all logged-in users */}
        {user && (
          <section className="py-12 sm:py-16 md:py-20 bg-neutral-50">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
              <FadeInView className="text-center mb-8 sm:mb-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
                  Recently <span className="italic font-light">Styled</span>
                </h2>
                <p className="text-base sm:text-lg text-neutral-600">
                  {productsLoading 
                    ? "Loading your personalized collection..."
                    : featuredProducts.length > 0 && hasUserOutfits
                      ? "Shop individual pieces from your curated outfits – every item is shoppable now."
                      : featuredProducts.length > 0 
                        ? "Discover trending pieces from our curated collection."
                        : "Get started by generating your first outfit to see personalized recommendations here."}
                </p>
              </FadeInView>

              <FadeInView delay={0.1}>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
                  </div>
                ) : productsError ? (
                  <div className="text-center py-20">
                    <p className="text-red-600 mb-4">Error loading products: {productsError}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                ) : featuredProducts.length > 0 ? (
                  <InfiniteProductCarousel products={featuredProducts} />
                ) : (
                  <div className="text-center py-20">
                    <p className="text-neutral-600 mb-6">No items available yet. Generate your first outfit!</p>
                    <Button onClick={handleStartQuiz}>Start Style Quiz</Button>
                  </div>
                )}
              </FadeInView>
            </div>
          </section>
        )}

        <section className="py-12 sm:py-16 md:py-20 bg-[#faf9f7] border-y border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Section Header */}
            <FadeInView className="text-center mb-10 sm:mb-12">
              <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-4 sm:mb-5">
                Personal Styling
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">
                Curate Your <span className="italic font-light">Look</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-500 mt-4 max-w-xl mx-auto">
                Share your style vision, or jump straight into the full quiz.
              </p>
            </FadeInView>

            {/* 3 Sections Layout */}
            <div className="space-y-10 sm:space-y-12">
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

              <FadeInView delay={0.3} className="text-center">
                <Button
                  onClick={handleCurateMyLook}
                  className="group relative w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-12 bg-neutral-900 text-white text-sm font-medium tracking-[0.1em] uppercase overflow-hidden
                    hover:shadow-2xl hover:shadow-neutral-900/30
                    transition-all duration-500 ease-out
                    before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-500
                    hover:before:opacity-10
                    active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 transition-transform duration-300 group-hover:scale-105">
                    <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    Get a look
                    <ArrowRight className="w-4 h-4 transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:scale-110" />
                  </span>
                </Button>

                <p className="mt-4 sm:mt-5 text-neutral-400 text-xs sm:text-sm">
                  {user ? "Uses 1 credit per outfit generation" : "Sign in to save your generated outfits"}
                </p>
              </FadeInView>
            </div>
          </div>
        </section>

        {user ? (
          <section className="py-12 sm:py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <FadeInView className="text-center mb-10 sm:mb-12">
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
                  <div className="group bg-white border border-neutral-200 p-6 sm:p-8 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col h-full">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-6 flex-shrink-0">
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
                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed flex-grow">
                      Manage your style DNA, measurements, and preferences.
                    </p>
                    <button
                      onClick={() => router.push("/profile")}
                      className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 group-hover:gap-3 transition-all duration-300 mt-auto"
                    >
                      Edit Profile
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </FadeInView>

                {/* Credits Card */}
                <FadeInView delay={0.2}>
                  <div className="group bg-white border border-neutral-200 p-6 sm:p-8 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col h-full">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-6 flex-shrink-0">
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
                    <h3 className="text-lg font-serif text-neutral-900 mb-3">Credits</h3>
                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed flex-grow">
                      You have <span className="font-semibold text-neutral-900">{userCredits}</span> credits available
                      for outfit generation.
                    </p>
                    <button
                      onClick={() => router.push("/credits")}
                      className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 group-hover:gap-3 transition-all duration-300 mt-auto"
                    >
                      Buy Credits
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </FadeInView>

                {/* Style Quiz Card */}
                <FadeInView delay={0.3}>
                  <div className="group bg-white border border-neutral-200 p-6 sm:p-8 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col h-full">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-6 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-serif text-neutral-900 mb-3">Style Quiz</h3>
                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed flex-grow">
                      Update your style preferences and get better outfit recommendations.
                    </p>
                    <button
                      onClick={() => router.push("/quiz")}
                      className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 group-hover:gap-3 transition-all duration-300 mt-auto"
                    >
                      Take Quiz
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </FadeInView>
              </div>
            </div>
          </section>
        ) : (
          <></>
        )}

        <section className="py-12 sm:py-16 md:py-20 bg-neutral-50">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <FadeInView className="text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-neutral-900 mb-8 leading-tight">
                Style Should Be <span className="italic font-light">Effortless</span>.
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 font-light leading-relaxed max-w-4xl mx-auto">
                We believe everyone deserves to look their best without the guesswork. Great style isn't about how much
                you spend; it's about the harmony of the right pieces. We are here to remove the barriers to fashion,
                making "Best Dressed" an everyday reality for everybody.
              </p>
            </FadeInView>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <FadeInView className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
                What Our Users <span className="italic font-light">Say</span>
              </h2>
            </FadeInView>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  quote:
                    "The navy power suit it found for me is a total game-changer. I had a week of outfits ready in minutes.",
                  author: "Sarah J.",
                },
                {
                  quote:
                    "I found a dress for a summer wedding that actually fits my curves. Having everything linked in one place saved me hours.",
                  author: "Elena R.",
                },
                {
                  quote: "I hate shopping, but I love looking good. The results are scarily accurate.",
                  author: "Jordan M.",
                },
              ].map((testimonial, i) => (
                <FadeInView key={i} delay={0.1 * i}>
                  <div className="bg-white p-6 sm:p-8 border border-neutral-200 h-full flex flex-col">
                    <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-6 flex-grow italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="text-sm text-neutral-900 font-medium">— {testimonial.author}</div>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 bg-neutral-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 ">
            <FadeInView className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 mb-4">
                Frequently Asked <span className="italic font-light">Questions</span>
              </h2>
            </FadeInView>

            <div className="space-y-8">
              {[
                {
                  question: "Do I have to pay a styling fee?",
                  answer:
                    "There's no subscription required. You can choose the option that fits you best and make a one-time purchase. Pricing is flexible, and you only pay when you decide to use the service and buy items.",
                },
                {
                  question: "Can I buy just part of the outfit?",
                  answer: "Absolutely. Your cart is fully customizable. Buy the full look or just the pieces you love.",
                },
                {
                  question: "How do returns work?",
                  answer:
                    "Returns are handled directly with the brand you purchased from, exactly like a regular online purchase. Each order follows the standard return policy of the specific brand.",
                },
                {
                  question: "How personalized is this?",
                  answer:
                    "We cross-reference your body shape, skin tone, budget, and occasion against 500+ global brands for a truly unique curation.",
                },
              ].map((faq, i) => (
                <FadeInView key={i} delay={0.05 * i}>
                  <div className="border-b border-neutral-200 pb-6">
                    <h3 className="text-lg font-serif text-neutral-900 mb-3 ">{faq.question}</h3>
                    <p className="text-base text-neutral-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <FadeInView>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-6 sm:mb-8 leading-tight text-neutral-900">
                Ready to meet your new <span className="italic font-light">favorite outfit</span>?
              </h2>
            </FadeInView>

            <FadeInView delay={0.1}>
              <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 font-light mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of users who have skipped the scroll.
              </p>
            </FadeInView>

            <FadeInView delay={0.2}>
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="group relative w-full sm:w-auto min-h-[60px] sm:min-h-[68px] px-10 sm:px-14 bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-105 active:scale-100 text-base sm:text-lg font-medium tracking-wide touch-manipulation overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  Get My Curated Look
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3 transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:scale-110" />
                </span>
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