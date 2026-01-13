"use client"

import Link from "next/link"
import Image from "next/image"
import { Lock, ExternalLink, CheckCircle, ShoppingBag } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export function OutfitCard({ outfit, isUnlocked, hasLinksUnlocked, onUnlock, hideActions = false }) {
  const [imageErrors, setImageErrors] = useState({})
  const [isHovered, setIsHovered] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState(0)
  const carouselIntervalRef = useRef(null)

  // Auto-rotate items when hovered
  useEffect(() => {
    if (isHovered && outfit.items?.length > 0) {
      carouselIntervalRef.current = setInterval(() => {
        setActiveItemIndex((prev) => (prev + 1) % Math.min(outfit.items.length, 3))
      }, 2000)
    } else {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current)
      }
      setActiveItemIndex(0)
    }

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current)
      }
    }
  }, [isHovered, outfit.items])

  const isValidImageUrl = (url) => {
    if (!url || typeof url !== "string") return false
    if (url === "/placeholder.svg") return true
    return url.startsWith("http://") || url.startsWith("https://")
  }

  const getItemImages = (item) => {
    if (!item) return ["/placeholder.svg"]

    let images = []

    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      images = item.images.filter((img) => isValidImageUrl(img))
    }

    if (images.length === 0 && typeof item.image === "string" && item.image.startsWith("[")) {
      try {
        const parsed = JSON.parse(item.image)
        if (Array.isArray(parsed) && parsed.length > 0) {
          images = parsed.map((p) => (typeof p === "string" ? p : p.url)).filter((img) => isValidImageUrl(img))
        }
      } catch (e) {
        console.error("Error parsing image JSON:", e)
      }
    }

    if (images.length === 0 && isValidImageUrl(item.image)) {
      images = [item.image]
    }

    return images.length > 0 ? images : ["/placeholder.svg"]
  }

  const getLastImage = (item, index) => {
    const images = getItemImages(item)
    return images[images.length - 1]
  }

  const getImageSrc = (item, index) => {
    if (!item) return "/placeholder.svg"

    const src = getLastImage(item, index)
    if (imageErrors[index] || !src || src === "/placeholder.svg" || !isValidImageUrl(src)) {
      const images = getItemImages(item)
      const firstValid = images.find((img) => isValidImageUrl(img) && img !== src)
      if (firstValid) return firstValid
      return "/placeholder.svg"
    }
    return src
  }

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const calculateTotalPrice = () => {
    if (outfit.total_price) return outfit.total_price
    if (!outfit.items) return 0

    const itemsArray = outfit.items.top ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes] : outfit.items
    return itemsArray.reduce((sum, item) => sum + (item?.price || 0), 0)
  }

  const ensureAbsoluteUrl = (url) => {
    if (!url) return "#"
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `https://${url}`
  }

  const totalPrice = calculateTotalPrice()

  return (
    <div
      className="group relative flex flex-col bg-white w-full hover:shadow-2xl transition-all duration-700 border border-black/10 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasLinksUnlocked && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">
          <CheckCircle className="w-3 h-3" />
          Links Unlocked
        </div>
      )}

      <div className="relative aspect-[3/4] bg-[#FAFAFA] overflow-hidden">
        {/* Full card carousel overlay that appears on hover */}
        <div
          className={cn(
            "absolute inset-0 z-20 bg-white transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="relative w-full h-full">
            <Image
              src={getImageSrc(outfit.items[activeItemIndex], activeItemIndex) || "/placeholder.svg"}
              alt={outfit.items[activeItemIndex]?.name || "Outfit item"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
              <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase mb-1">
                {activeItemIndex === 0 ? "Top" : activeItemIndex === 1 ? "Bottom" : "Footwear"}
              </p>
              <p className="text-lg font-serif text-white mb-1">{outfit.items[activeItemIndex]?.name}</p>
              <p className="text-sm text-white/90 font-medium">${outfit.items[activeItemIndex]?.price?.toFixed(2)}</p>

              {hasLinksUnlocked && outfit.items[activeItemIndex]?.product_url && (
                <a
                  href={ensureAbsoluteUrl(outfit.items[activeItemIndex].product_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-xs font-bold tracking-wider text-white bg-white/20 hover:bg-white/30 px-4 py-2 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Shop Now
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Progress Indicators */}
            <div className="absolute top-4 right-4 flex gap-1.5">
              {[0, 1, 2].slice(0, Math.min(outfit.items.length, 3)).map((idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    idx === activeItemIndex ? "bg-black scale-125" : "bg-black/20",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Default grid view (visible when not hovered) */}
        <div className="grid grid-cols-2 gap-[1px] h-full">
          <div className="relative h-full bg-[#FAFAFA]">
            <Image
              src={getImageSrc(outfit.items[0], 0) || "/placeholder.svg"}
              alt={outfit.items[0]?.name || "Outfit item"}
              fill
              className="object-cover mix-blend-multiply"
              onError={() => handleImageError(0)}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>

          <div className="flex flex-col gap-[1px] h-full">
            <div className="relative flex-1 bg-[#FAFAFA]">
              <Image
                src={getImageSrc(outfit.items[1], 1) || "/placeholder.svg"}
                alt={outfit.items[1]?.name || "Outfit item"}
                fill
                className="object-cover mix-blend-multiply"
                onError={() => handleImageError(1)}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="relative flex-1 bg-[#FAFAFA]">
              <Image
                src={getImageSrc(outfit.items[2], 2) || "/placeholder.svg"}
                alt={outfit.items[2]?.name || "Outfit item"}
                fill
                className="object-cover mix-blend-multiply"
                onError={() => handleImageError(2)}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {outfit.items.length > 3 && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
                  <span className="font-serif text-xl text-black">+{outfit.items.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-8 md:p-10">
        <div>
          <h3 className="text-3xl md:text-4xl font-serif text-black leading-tight mb-3">{outfit.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.25em] text-black/50 uppercase">
              {outfit.items?.length || 3} Pieces
            </p>
            <p className="text-lg font-bold tracking-wider text-black">
              ${outfit.totalPrice?.toFixed(0) || outfit.total_price?.toFixed(0) || 0}
            </p>
          </div>
        </div>

        {hasLinksUnlocked && (
          <div className="border-t border-black/10 pt-5 space-y-3">
            <p className="text-[10px] font-bold tracking-[0.25em] text-green-600 uppercase flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Shopping Links
            </p>
            <div className="space-y-2">
              {outfit.items.slice(0, 3).map(
                (item, idx) =>
                  item?.product_url && (
                    <a
                      key={idx}
                      href={ensureAbsoluteUrl(item.product_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm hover:bg-black/5 p-2 -mx-2 transition-colors group/link"
                    >
                      <span className="text-black/70 group-hover/link:text-black transition-colors truncate pr-2">
                        {item.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-black/40 group-hover/link:text-black flex-shrink-0" />
                    </a>
                  ),
              )}
            </div>
          </div>
        )}
      </div>

      {!hideActions && (
        <div className="mt-auto">
          {isUnlocked ? (
            <Link
              href={`/outfit/${outfit.id}`}
              className="block w-full bg-black text-white text-center py-5 text-xs font-bold tracking-[0.25em] uppercase hover:bg-zinc-900 transition-colors duration-300"
            >
              {hasLinksUnlocked ? "Watch Your Look" : "View Collection"}
            </Link>
          ) : (
            <button
  onClick={() => onUnlock && onUnlock(outfit.id)}
  className="relative overflow-hidden group 
             block cursor-pointer w-full bg-black text-white 
             text-center py-5 text-xs font-bold 
             tracking-[0.25em] uppercase border-t border-white/10"
>
  {/* Sweep layer */}
  <span
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
               translate-x-[-100%] group-hover:translate-x-[100%]
               transition-all duration-700 ease-out"
  />

  {/* Button Content */}
  <span className="relative z-10 flex items-center justify-center gap-2">
    <Lock className="w-3.5 h-3.5" /> View the Look (1 Credit)
  </span>
</button>

          )}
        </div>
      )}
    </div>
  )
}
