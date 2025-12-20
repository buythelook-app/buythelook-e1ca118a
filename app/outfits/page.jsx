"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OutfitCard } from "@/components/outfit-card"
import { storage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, ImageOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OnboardingTour from "@/components/onboarding-tour"
import { Footer } from "../../components/footer"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

function getCategory(name) {
  if (!name) return "Piece"
  const lower = name.toLowerCase()
  if (
    lower.includes("jacket") ||
    lower.includes("blazer") ||
    lower.includes("coat") ||
    lower.includes("cardigan") ||
    lower.includes("outerwear")
  )
    return "Outerwear"
  if (
    lower.includes("shirt") ||
    lower.includes("blouse") ||
    lower.includes("top") ||
    lower.includes("tee") ||
    lower.includes("camisole") ||
    lower.includes("bodysuit") ||
    lower.includes("sweater") ||
    lower.includes("knit")
  )
    return "Top"
  if (
    lower.includes("pant") ||
    lower.includes("skirt") ||
    lower.includes("jean") ||
    lower.includes("trouser") ||
    lower.includes("short") ||
    lower.includes("legging")
  )
    return "Bottom"
  if (lower.includes("dress") || lower.includes("gown") || lower.includes("jumpsuit") || lower.includes("romper"))
    return "One-Piece"
  if (
    lower.includes("shoe") ||
    lower.includes("boot") ||
    lower.includes("sneaker") ||
    lower.includes("heel") ||
    lower.includes("sandal") ||
    lower.includes("mule") ||
    lower.includes("loafer") ||
    lower.includes("pump")
  )
    return "Footwear"
  if (
    lower.includes("bag") ||
    lower.includes("purse") ||
    lower.includes("clutch") ||
    lower.includes("tote") ||
    lower.includes("handbag")
  )
    return "Bag"
  if (
    lower.includes("earring") ||
    lower.includes("necklace") ||
    lower.includes("bracelet") ||
    lower.includes("ring") ||
    lower.includes("watch") ||
    lower.includes("sunglass") ||
    lower.includes("hat") ||
    lower.includes("scarf") ||
    lower.includes("belt")
  )
    return "Accessory"
  return "Essential"
}

function AdaptiveImage({ src, alt, className, priority = false, onError }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setError(false)
    setLoaded(false)
  }, [src])

  const handleImgError = () => {
    setError(true)
    if (onError) onError()
  }

  if (error || !src || src === "/placeholder.svg") {
    return (
      <div
        className={cn("w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-700", className)}
      >
        <ImageOff className="w-8 h-8 mb-2 opacity-20" />
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-zinc-900", className)}>
      {/* Background Blur Layer */}
      <Image
        src={src || "/placeholder.svg"}
        alt="background"
        fill
        className="object-cover opacity-40 blur-xl scale-110 grayscale"
        aria-hidden="true"
        onError={() => {}} // Ignore background error
      />

      {/* Main Image Layer */}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        className={cn(
          "object-contain z-10 transition-all duration-500",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
        priority={priority}
        onLoad={() => setLoaded(true)}
        onError={handleImgError} // Use enhanced error handler
      />
    </div>
  )
}

function CarouselGridItem({ item, isMain = false }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [validImages, setValidImages] = useState([])

  // Helper to get all available images for an item
  const getImages = (item) => {
    if (!item) return []

    let images = []

    // Check for images array
    if (item.images && Array.isArray(item.images)) {
      images = item.images
    }
    // Fallback to single image
    else if (typeof item.image === "string") {
      // Handle JSON stringified arrays
      if (item.image.startsWith("[")) {
        try {
          const parsed = JSON.parse(item.image)
          if (Array.isArray(parsed)) {
            images = parsed.map((p) => (typeof p === "string" ? p : p.url))
          }
        } catch (e) {}
      } else {
        images = [item.image]
      }
    }

    // Filter out empty/null and ensure they are strings
    return images.filter((img) => typeof img === "string" && img.trim().length > 0).reverse()
  }

  useEffect(() => {
    const imgs = getImages(item)
    // If user specifically wants the "last" image logic, we can order them here or just cycle
    // For the carousel, we usually want all of them.
    // If the user preferred the "last" image (from previous prompt context), we can prioritize it.
    // But for a carousel, we'll just load all.
    setValidImages(imgs)
  }, [item])

  const handleImageError = (errorSrc) => {
    setValidImages((prev) => prev.filter((img) => img !== errorSrc))
  }

  const images = validImages
  const currentImage = images.length > 0 ? images[currentImageIndex % images.length] : "/placeholder.svg"

  // Auto-cycle images if there are multiple
  useEffect(() => {
    if (images.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [images.length, isHovered])

  if (!item) {
    return (
      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
        <span className="text-white/20 text-xs">Empty</span>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${item.id}-${currentImageIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full"
        >
          <AdaptiveImage
            src={currentImage}
            alt={item.name}
            priority={isMain}
            onError={() => handleImageError(currentImage)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Category Label */}
          <div className="absolute top-2 right-2 z-20">
            <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase text-white/90 border border-white/10 shadow-sm">
              {getCategory(item.name)}
            </span>
          </div>

          {/* Item Info (Only for Main or on Hover for others) */}
          {(isMain || isHovered) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 w-full p-3 md:p-4 z-20"
            >
              <p className="text-white font-serif text-sm md:text-lg leading-tight line-clamp-2 text-balance shadow-black drop-shadow-md">
                {item.name}
              </p>
            </motion.div>
          )}

          {/* Progress Dots for Multiple Images */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1 z-20">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-300",
                    idx === currentImageIndex ? "bg-white w-3" : "bg-white/30",
                  )}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ComparisonCard({ outfit, onClick, isSelected, isDimmed }) {
  const items = outfit?.items || []

  // Fixed slots assignment
  const mainItem = items[0]
  const slot1Item = items[1]
  const slot2Item = items[2]

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isDimmed ? 0.4 : 1,
        scale: isSelected ? 1.02 : isDimmed ? 0.95 : 1,
        filter: isDimmed ? "grayscale(100%) contrast(0.8)" : "grayscale(0%) contrast(1)",
      }}
      whileHover={!isDimmed ? { scale: 1.005 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={cn(
        "relative w-full h-full cursor-pointer isolate overflow-hidden bg-zinc-950 flex flex-col border border-white/10 shadow-2xl",
        isSelected ? "ring-2 ring-white z-20" : "z-10",
      )}
    >
      <div className="relative w-full h-full grid grid-cols-12 grid-rows-2 gap-0.5 bg-zinc-900">
        {/* Main Featured Item - Takes up left 7 columns */}
        <div className="relative row-span-2 col-span-7 overflow-hidden">
          <CarouselGridItem item={mainItem} isMain={true} />
        </div>

        {/* Secondary Items Column - Takes up right 5 columns */}
        <div className="col-span-5 row-span-2 flex flex-col gap-0.5">
          {/* Slot 1 (Top Right) */}
          <div className="relative flex-1 overflow-hidden bg-zinc-900">
            <CarouselGridItem item={slot1Item} />
          </div>

          {/* Slot 2 (Bottom Right) */}
          <div className="relative flex-1 overflow-hidden bg-zinc-900">
            <CarouselGridItem item={slot2Item} />
          </div>
        </div>

        <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
          <p className="text-white font-serif text-sm">${outfit.totalPrice?.toFixed(0)}</p>
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <Check className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ComparisonView({ candidates, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState([])
  const [direction, setDirection] = useState(0)

  const candidateA = candidates[currentIndex]
  const candidateB = candidates[currentIndex + 1]

  const remainingSelections = 3 - selected.length
  const progress = (selected.length / 3) * 100

  const handleSelect = (winner) => {
    if (!winner) return
    setDirection(1)

    const newSelected = [...selected, winner]
    setSelected(newSelected)

    setTimeout(() => {
      if (newSelected.length === 3) {
        onComplete(newSelected)
        return
      }

      if (currentIndex + 2 < candidates.length - 1) {
        setCurrentIndex((prev) => prev + 2)
      } else {
        const remaining = candidates.slice(currentIndex + 2).filter((c) => c.id !== winner.id)
        const finalSelection = [...newSelected, ...remaining.slice(0, 3 - newSelected.length)]
        onComplete(finalSelection)
      }
      setDirection(0)
    }, 800)
  }

  if (!candidateA) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      <header className="absolute top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-white font-serif text-xl md:text-3xl lg:text-6xl tracking-wide drop-shadow-lg">
            Curate <span className="italic text-white/80">Collection</span>
          </h2>
        </div>

        <div className="pointer-events-auto flex items-center gap-6">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full px-4"
            onClick={() => onComplete([])}
          >
            Exit
          </Button>

          <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">Progress</span>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-10 h-1 rounded-full transition-all duration-500",
                    i < selected.length ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "bg-white/20",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full h-full max-w-6xl max-h-[80vh] flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black ring-1 ring-white/5">
        <div className="relative flex-1 h-1/2 md:h-full bg-zinc-950 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <AnimatePresence mode="wait">
            {candidateA && (
              <motion.div
                key={`a-${candidateA.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full p-2"
              >
                <ComparisonCard
                  outfit={candidateA}
                  onClick={() => handleSelect(candidateA)}
                  isSelected={selected.some((s) => s.id === candidateA.id)}
                  isDimmed={direction === 1 && !selected.includes(candidateA)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center justify-center">
          <div className="bg-black border border-white/20 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-xl z-50">
            <span className="font-serif italic text-lg">vs</span>
          </div>
        </div>

        <div className="relative flex-1 h-1/2 md:h-full bg-zinc-950 overflow-hidden">
          <AnimatePresence mode="wait">
            {candidateB ? (
              <motion.div
                key={`b-${candidateB.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full p-2"
              >
                <ComparisonCard
                  outfit={candidateB}
                  onClick={() => handleSelect(candidateB)}
                  isSelected={selected.some((s) => s.id === candidateB.id)}
                  isDimmed={direction === 1 && !selected.includes(candidateB)}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 z-40 text-center pointer-events-none">
        <p className="inline-block bg-black/40 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-white/70 border border-white/10 shadow-lg">
          Select Your Preference
        </p>
      </div>
    </div>
  )
}

function OutfitsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")

  const { user, loading: authLoading } = useAuth()

  const [outfits, setOutfits] = useState([])
  const [candidates, setCandidates] = useState([])
  const [unlockedOutfits, setUnlockedOutfits] = useState([])
  const [linksUnlockedOutfits, setLinksUnlockedOutfits] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return

      console.log(" Loading outfits data...")
      console.log(" User:", user)
      console.log(" User ID:", user?.id)

      let userOutfits = []
      const storedCandidates = storage.getCandidates()

      if (user) {
        console.log(" Fetching outfits from Supabase for user:", user.id)

        const { data, error } = await supabaseAuth
          .from("generated_outfits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        console.log(" Supabase response - data:", data)
        console.log(" Supabase response - error:", error)
        console.log(" Number of outfits fetched:", data?.length || 0)

        if (error) {
          console.error(" Error fetching outfits:", error)
          toast({
            title: "Error Loading Outfits",
            description: error.message || "Could not load your collection",
            variant: "destructive",
          })
        }

        if (!error && data) {
          userOutfits = data
          console.log(
            " Raw outfit data with links_unlocked:",
            data.map((o) => ({ id: o.id, links_unlocked: o.links_unlocked })),
          )

          const unlockedIds = data.filter((o) => o.is_unlocked).map((o) => o.id)
          const linksUnlockedIds = data.filter((o) => o.links_unlocked === true).map((o) => o.id)

          console.log(" Unlocked outfit IDs:", unlockedIds)
          console.log(" Links unlocked outfit IDs:", linksUnlockedIds)
          console.log(" Total outfits with links unlocked:", linksUnlockedIds.length)

          setUnlockedOutfits(unlockedIds)
          setLinksUnlockedOutfits(linksUnlockedIds)
        }
      } else {
        console.log(" No user session - guests cannot see outfits")
      }

      console.log(" Setting outfits state with:", userOutfits)
      setOutfits(userOutfits || [])

      if (mode === "selection" && storedCandidates && storedCandidates.length > 0) {
        setCandidates(storedCandidates)
        setShowComparison(true)
      } else {
        setShowComparison(false)
      }

      setLoading(false)
    }

    loadData()
  }, [mode, user, authLoading])

  const handleSelectionComplete = async (selectedOutfits) => {
    if (user) {
      const newOutfits = selectedOutfits.map((o) => ({
        user_id: user.id,
        quiz_id: storage.getQuizId() || null,
        name: o.name || "Untitled Outfit",
        description: `A curated look featuring ${o.items?.length || 3} pieces`,
        items: o.items,
        why_it_works: o.whyItWorks || "A perfectly balanced outfit for your style profile.",
        stylist_notes: o.stylistNotes || [],
        total_price: o.totalPrice || o.items.reduce((sum, item) => sum + (item?.price || 0), 0),
        is_unlocked: false,
        links_unlocked: false,
      }))

      const { error } = await supabaseAuth.from("generated_outfits").insert(newOutfits)
      if (error) console.error(" Error saving outfits to DB:", error)

      // Refresh list
      const { data } = await supabaseAuth
        .from("generated_outfits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setOutfits(data || [])
    } else {
      const currentCollection = storage.getOutfits() || []
      const newCollection = [...selectedOutfits, ...currentCollection]
      setOutfits(newCollection)
      storage.saveOutfits(newCollection)
    }

    storage.clearCandidates()

    setShowComparison(false)
    router.replace("/outfits")

    toast({
      title: "Collection Updated",
      description: `${selectedOutfits.length} new looks added to your wardrobe.`,
    })
  }

  const handleUnlock = async (outfitId) => {
    console.log(" Unlock: Starting unlock flow for outfit:", outfitId)

    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please sign in to unlock outfits.",
      })
      router.push("/login")
      return
    }

    const { data: profile } = await supabaseAuth.from("profiles").select("credits").eq("id", user.id).single()

    console.log(" Unlock: User credits:", profile?.credits)

    if (!profile || profile.credits <= 0) {
      toast({
        variant: "destructive",
        title: "No Credits Remaining",
        description: "Purchase credits to unlock shopping links.",
      })
      setTimeout(() => router.push("/credits"), 1500)
      return
    }

    const { error: deductError } = await supabaseAuth
      .from("profiles")
      .update({ credits: profile.credits - 1 })
      .eq("id", user.id)

    if (deductError) {
      console.error(" Error deducting credit:", deductError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unlock outfit. Please try again.",
      })
      return
    }

    console.log(" Unlock: Credit deducted successfully")

    const { error: unlockError } = await supabaseAuth
      .from("generated_outfits")
      .update({ is_unlocked: true })
      .eq("id", outfitId)
      .eq("user_id", user.id)

    if (unlockError) {
      console.error(" Error unlocking outfit:", unlockError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unlock outfit. Please try again.",
      })
      return
    }

    console.log(" Unlock: Outfit unlocked in database")

    const { data } = await supabaseAuth
      .from("generated_outfits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setOutfits(data)
      const unlockedIds = data.filter((o) => o.is_unlocked).map((o) => o.id)
      const linksUnlockedIds = data.filter((o) => o.links_unlocked).map((o) => o.id)
      setUnlockedOutfits(unlockedIds)
      setLinksUnlockedOutfits(linksUnlockedIds)
    }

    toast({
      title: "Outfit Unlocked!",
      description: "1 credit has been deducted. View shopping links now.",
    })
  }

  const handleLikeOutfit = async (outfitId) => {
    if (!user) return

    const outfit = outfits.find((o) => o.id === outfitId)
    if (!outfit) return

    const itemsArray = outfit.items.top ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes] : outfit.items

    const interactions = itemsArray.map((item) => ({
      user_id: user.id,
      product_id: item.product_id || item.url,
      product_url: item.url || item.product_url,
      interaction_type: "liked",
    }))

    const { error } = await supabaseAuth.from("product_interactions").insert(interactions)

    if (!error) {
      toast({
        title: "Outfit Liked",
        description: "We'll show you more looks like this!",
      })
    }
  }

  const handleDislikeOutfit = async (outfitId) => {
    if (!user) return

    const outfit = outfits.find((o) => o.id === outfitId)
    if (!outfit) return

    const itemsArray = outfit.items.top ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes] : outfit.items

    const interactions = itemsArray.map((item) => ({
      user_id: user.id,
      product_id: item.product_id || item.url,
      product_url: item.url || item.product_url,
      interaction_type: "disliked",
    }))

    const { error } = await supabaseAuth.from("product_interactions").insert(interactions)

    if (!error) {
      toast({
        title: "Outfit Disliked",
        description: "We won't recommend these items again.",
      })

      setOutfits(outfits.filter((o) => o.id !== outfitId))
    }
  }

  const handleStartOver = () => {
    storage.saveSelectionStatus(false)
    router.push("/quiz")
  }

  const filteredOutfits = useMemo(() => {
    console.log("[v0] Computing filtered outfits - filter:", filter, "total outfits:", outfits.length)
    console.log("[v0] Unlocked IDs:", unlockedOutfits)
    console.log("[v0] Links unlocked IDs:", linksUnlockedOutfits)

    const result = outfits.filter((outfit) => {
      if (filter === "all") return true
      if (filter === "unlocked") return unlockedOutfits.includes(outfit.id)
      if (filter === "shoppable") return linksUnlockedOutfits.includes(outfit.id)
      return true
    })

    console.log("[v0] Filtered result count:", result.length)
    return result
  }, [outfits, filter, unlockedOutfits, linksUnlockedOutfits])

  console.log(" Filtered outfits count:", filteredOutfits.length, "Filter mode:", filter)

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    )
  }

  if (showComparison && candidates.length > 0) {
    return <ComparisonView candidates={candidates} onComplete={handleSelectionComplete} />
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <OnboardingTour pageType="outfits" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-center mb-4">Your Collection</h1>
          <p className="text-center text-muted-foreground max-w-2xl text-sm md:text-base">
            Explore your personalized outfits. Unlock to see full details and shopping links.
          </p>
        </motion.div>

        <div className="flex justify-center mb-12" data-tour="outfits-filters">
          <Tabs
            value={filter}
            onValueChange={(value) => {
              console.log("[v0] Filter changed to:", value)
              setFilter(value)
            }}
            className="w-full max-w-md"
          >
            <TabsList
              className="grid w-full grid-cols-3"
              key={`tabs-${outfits.length}-${unlockedOutfits.length}-${linksUnlockedOutfits.length}`}
            >
              <TabsTrigger value="all">All ({outfits.length})</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked ({unlockedOutfits.length})</TabsTrigger>
              <TabsTrigger value="shoppable">Shoppable ({linksUnlockedOutfits.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <motion.div
          key={`grid-${filter}`}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          data-tour="outfits-grid"
        >
          {filteredOutfits.length > 0 ? (
            filteredOutfits.map((outfit, index) => (
              <motion.div key={outfit.id} variants={itemVariants}>
                <OutfitCard
                  outfit={outfit}
                  isUnlocked={unlockedOutfits.includes(outfit.id) || linksUnlockedOutfits.includes(outfit.id)}
                  hasLinksUnlocked={linksUnlockedOutfits.includes(outfit.id)}
                  onUnlock={handleUnlock}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "No outfits yet. Start your style quiz to generate personalized outfits!"
                  : filter === "unlocked"
                    ? "No unlocked outfits yet. Unlock outfits to see full details."
                    : "No shoppable outfits yet. Purchase shopping links to view product URLs."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}

export default function OutfitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your collection...</p>
          </div>
        </div>
      }
    >
      <OutfitsContent />
    </Suspense>
  )
}
