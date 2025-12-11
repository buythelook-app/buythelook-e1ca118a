"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  ShoppingBag,
  Info,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FindNearMeButton } from "@/components/find-near-me-button"

function ProductDetailModal({ item, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const images = item?.images || [item?.image]

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full aspect-[3/4] bg-muted">
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${item.name} - ${currentIndex + 1}`}
              fill
              className="object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-2xl font-serif text-foreground">{item.name}</h3>
          <div className="space-y-2 text-muted-foreground">
            {/* <p>
              <span className="font-medium text-foreground">Brand:</span> {item.brand}
            </p> */}
            <p>
              <span className="font-medium text-foreground">Price:</span> ${item.price.toFixed(2)}
            </p>
            {item.color && item.color !== "N/A" && (
              <p>
                <span className="font-medium text-foreground">Color:</span> {item.color}
              </p>
            )}
            {item.description && (
              <p className="pt-2">
                <span className="font-medium text-foreground">Description:</span> {item.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative aspect-square border-2 ${idx === currentIndex ? "border-primary" : "border-border"} rounded overflow-hidden`}
              >
                <Image src={img || "/placeholder.svg"} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function OutfitDetails({ id }) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const { user } = useAuth()
  const [outfit, setOutfit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [linksUnlocked, setLinksUnlocked] = useState(false)
  const [currentImageIndexes, setCurrentImageIndexes] = useState({})
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState(null) // 'like' or 'dislike'
  const [feedbackReason, setFeedbackReason] = useState("")
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [userFeedback, setUserFeedback] = useState(null) // existing feedback

  const [activeStoreSearch, setActiveStoreSearch] = useState(null) // { itemName, brand, stores }

  const ensureAbsoluteUrl = (url) => {
    if (!url) return "#"
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `https://${url}`
  }

  const handlePurchaseLinks = async () => {
    if (isPurchasing) return

    console.log(" Links Unlock: Starting $5 payment flow for outfit:", id)

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to unlock shopping links.",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)

    try {
      const response = await fetch("/api/lemonsqueezy/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500,
          outfitId: id,
          description: "Shopping Links Access",
          type: "links_unlock",
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(" Links Unlock: Server responded with:", errorText)
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()
      console.log(" Links Unlock: Payment response:", data)

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error(" Links Unlock: Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      })
      setIsPurchasing(false)
    }
  }

  const handleItemClick = (itemIndex) => {
    setSelectedItem(
      outfit.items.top
        ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes][itemIndex]
        : outfit.items[itemIndex],
    )
  }

  const prevImage = (itemIndex) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [itemIndex]:
        (prev[itemIndex] || 0) === 0
          ? outfit.items.top
            ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes][itemIndex].images.length - 1
            : outfit.items[itemIndex].images.length - 1
          : prev[itemIndex] - 1,
    }))
  }

  const nextImage = (itemIndex) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [itemIndex]:
        (prev[itemIndex] || 0) ===
        (outfit.items.top
          ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes][itemIndex].images.length - 1
          : outfit.items[itemIndex].images.length - 1)
          ? 0
          : prev[itemIndex] + 1,
    }))
  }

  useEffect(() => {
    const loadOutfit = async () => {
      console.log(" Outfit Details: Loading outfit with ID:", id)

      if (user) {
        const { data, error } = await supabaseAuth
          .from("generated_outfits")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error(" Error fetching outfit from database:", error)
          setOutfit(null)
        } else {
          console.log(" Outfit Details: Found outfit in database:", data)
          console.log(
            " Outfit Details: links_unlocked value:",
            data.links_unlocked,
            "Type:",
            typeof data.links_unlocked,
          )

          const mappedOutfit = {
            ...data,
            whyItWorks: data.why_it_works,
            stylistNotes: data.stylist_notes,
            totalPrice: data.total_price,
          }
          setOutfit(mappedOutfit)
          setLinksUnlocked(data.links_unlocked || false)

          if (data.is_liked !== null) {
            setUserFeedback({
              isLiked: data.is_liked,
              reason: data.feedback_reason,
              text: data.feedback_text,
            })
          }

          if (data.items) {
            const indexes = {}
            Object.keys(data.items).forEach((key, i) => {
              indexes[i] = 0
            })
            setCurrentImageIndexes(indexes)
          }
        }
      } else {
        console.log(" No user logged in, outfit details require authentication")
        setOutfit(null)
      }

      setLoading(false)
    }

    loadOutfit()
  }, [id, user])

  const handleFeedbackClick = (type) => {
    setFeedbackType(type)
    setFeedbackOpen(true)
    // Reset form
    setFeedbackReason("")
    setFeedbackText("")
  }

  const submitFeedback = async () => {
    if (!user) return
    setIsSubmittingFeedback(true)

    const isLiked = feedbackType === "like"

    try {
      const { error } = await supabaseAuth
        .from("generated_outfits")
        .update({
          is_liked: isLiked,
          feedback_reason: feedbackReason,
          feedback_text: feedbackText,
        })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      setUserFeedback({
        isLiked,
        reason: feedbackReason,
        text: feedbackText,
      })

      toast({
        title: "Feedback Saved",
        description: "Your preferences will be used to improve future recommendations.",
      })
      setFeedbackOpen(false)
    } catch (error) {
      console.error("Error saving feedback:", error)
      toast({
        title: "Error",
        description: "Could not save feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading outfit details...</p>
        </div>
      </div>
    )
  }

  if (!outfit) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif text-foreground">Outfit Not Found</h2>
          <p className="text-muted-foreground">We couldn't find the outfit you're looking for.</p>
        </div>
      </div>
    )
  }

  const itemsArray = outfit.items.top ? [outfit.items.top, outfit.items.bottom, outfit.items.shoes] : outfit.items

  return (
    <>
      <ProductDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{feedbackType === "like" ? "What did you love?" : "What didn't work?"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <RadioGroup value={feedbackReason} onValueChange={setFeedbackReason}>
                <div className="flex flex-col space-y-2">
                  {feedbackType === "like" ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="style" id="r1" />
                        <Label htmlFor="r1">Style & Aesthetic</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="r2" />
                        <Label htmlFor="r2">Color Combination</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="occasion" id="r3" />
                        <Label htmlFor="r3">Perfect for Occasion</Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="style" id="r1" />
                        <Label htmlFor="r1">Not my Style</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="r2" />
                        <Label htmlFor="r2">Dislike Colors</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="budget" id="r3" />
                        <Label htmlFor="r3">Too Expensive</Label>
                      </div>
                    </>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="r4" />
                    <Label htmlFor="r4">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Additional Comments (Optional)</Label>
              <Textarea
                placeholder={
                  feedbackType === "like" ? "Tell us what you liked..." : "Tell us what needs improvement..."
                }
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitFeedback} disabled={!feedbackReason || isSubmittingFeedback}>
              {isSubmittingFeedback ? "Saving..." : "Save Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto px-4 lg:px-0">
        <div className="space-y-6">
          <div className="relative aspect-[3/4] bg-card overflow-hidden rounded-none border border-border group">
            {itemsArray.map((item, itemIndex) => {
              const images = item.images || [item.image]
              const currentIndex = currentImageIndexes[itemIndex] || 0
              const displayIndex = itemIndex * 10 + currentIndex

              return images.map((img, imgIndex) => {
                const thisIndex = itemIndex * 10 + imgIndex
                return (
                  <div
                    key={`${itemIndex}-${imgIndex}`}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      thisIndex === mainImageIndex
                        ? "translate-x-0 translate-y-0 opacity-100 scale-100"
                        : thisIndex > mainImageIndex
                          ? "translate-x-full translate-y-full opacity-0 scale-95"
                          : "-translate-x-full -translate-y-full opacity-0 scale-95"
                    }`}
                    style={{
                      transformOrigin: "bottom right",
                    }}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${item.name} - ${imgIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )
              })
            })}

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                variant="secondary"
                size="icon"
                className={`rounded-full shadow-lg backdrop-blur-md transition-all ${
                  userFeedback?.isLiked === true
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white/80 hover:bg-white text-black"
                }`}
                onClick={() => handleFeedbackClick("like")}
              >
                <ThumbsUp className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className={`rounded-full shadow-lg backdrop-blur-md transition-all ${
                  userFeedback?.isLiked === false
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/80 hover:bg-white text-black"
                }`}
                onClick={() => handleFeedbackClick("dislike")}
              >
                <ThumbsDown className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {activeStoreSearch && activeStoreSearch.stores && activeStoreSearch.stores.length > 0 && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Nearby {activeStoreSearch.brand} Stores</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeStoreSearch.stores.length} store{activeStoreSearch.stores.length !== 1 ? "s" : ""} found
                      near you
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStoreSearch(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {activeStoreSearch.stores.map((store, idx) => (
                  <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-4">
                      {/* Store image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {store.photo ? (
                          <img
                            src={store.photo || "/placeholder.svg"}
                            alt={store.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none"
                              e.target.nextSibling.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center bg-muted ${store.photo ? "hidden" : "flex"}`}
                        >
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Store info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{store.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{store.address}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          {store.rating && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <span>★</span> {store.rating}
                            </span>
                          )}
                          {store.isOpen !== undefined && (
                            <span className={store.isOpen ? "text-green-600" : "text-red-500"}>
                              {store.isOpen ? "Open" : "Closed"}
                            </span>
                          )}
                          {store.distance && <span className="text-muted-foreground">{store.distance}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800" asChild>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}&destination_place_id=${store.placeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get Directions
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://www.google.com/maps/place/?q=place_id:${store.placeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-6 lg:space-y-8">
          <div>
            <h1 className="text-4xl font-serif font-medium mb-2 text-foreground">{outfit.name}</h1>
            <p className="text-2xl font-medium mb-6 text-muted-foreground">${outfit.totalPrice?.toFixed(2)}</p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {outfit.description || "A curated look tailored for you."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card/50 p-6 border border-border">
              <div className="flex items-center gap-2 mb-3 text-foreground">
                <Info className="w-4 h-4" />
                <h3 className="font-medium uppercase tracking-wider text-xs">Style Notes</h3>
              </div>
              <ul className="space-y-2">
                {(outfit.stylistNotes || []).map((note, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-zinc-600">•</span> {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card/50 p-6 border border-border">
              <div className="flex items-center gap-2 mb-3 text-yellow-500">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-medium uppercase tracking-wider text-xs">Why It Works</h3>
              </div>
              <p className="text-sm text-muted-foreground">{outfit.whyItWorks}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6 lg:pt-8">
            <h3 className="font-medium text-lg lg:text-xl text-foreground">Included Items</h3>
            <div className="grid grid-cols-1 gap-4">
              {itemsArray.map((item, i) => {
                const currentIndex = currentImageIndexes[i] || 0
                const images = item.images || [item.image]
                const hasMultipleImages = images.length > 1
                const productUrl = ensureAbsoluteUrl(item.product_url || item.url)
                console.log(" Outfit Details: Item URL for", item.name, ":", productUrl)

                return (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-4 p-4 lg:p-6 bg-card/30 border border-border/50 rounded-lg"
                  >
                    <div
                      className="relative w-full sm:w-32 lg:w-40 h-48 sm:h-32 lg:h-40 bg-muted overflow-hidden border border-border rounded-lg flex-shrink-0 group/item cursor-pointer"
                      onClick={() => handleItemClick(i)}
                    >
                      {images.map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`absolute inset-0 transition-all duration-500 ${
                            imgIndex === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-95"
                          }`}
                        >
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`${item.name} - Image ${imgIndex + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ))}

                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              prevImage(i)
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              nextImage(i)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {currentIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <h4 className="text-foreground font-medium text-base lg:text-lg">{item.name}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Price:</span> ${item.price.toFixed(2)}
                        </p>
                        {item.color && item.color !== "N/A" && (
                          <p>
                            <span className="font-medium">Color:</span> {item.color}
                          </p>
                        )}
                        {item.description && <p className="text-xs mt-2 line-clamp-2">{item.description}</p>}
                        <p className="text-xs">
                          <span className="font-medium">Images:</span> {images.length} available
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <Info className="w-3 h-3 mr-1" /> View Details
                        </Button>

                        {linksUnlocked ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9"
                              asChild
                            >
                              <a href={productUrl} target="_blank" rel="noopener noreferrer">
                                Shop Now <ExternalLink className="w-3 h-3 ml-1 sm:ml-2" />
                              </a>
                            </Button>
                            <FindNearMeButton
                              itemName={item.name}
                              brand={item.brand}
                              onStoresFound={(stores) =>
                                setActiveStoreSearch({
                                  itemName: item.name,
                                  brand: item.brand,
                                  stores,
                                })
                              }
                            />
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Unlock below ($5)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {!linksUnlocked ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 border border-border text-center rounded-lg">
                <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Unlock all shopping links for this outfit</p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className={`w-full border-2 border-black text-black hover:bg-black hover:text-white h-14 uppercase tracking-widest transition-all duration-300 font-medium bg-transparent ${
                  !linksUnlocked ? "pulse-cta" : ""
                }`}
                onClick={handlePurchaseLinks}
                disabled={isPurchasing}
              >
                <ShoppingBag className="mr-2 w-5 h-5" />
                {isPurchasing ? "Processing..." : "Unlock Shopping Links - $5.00"}
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-green-500/10 border border-green-500/20 text-green-500 text-center rounded-lg space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <p className="font-medium">Shopping Links Unlocked!</p>
              <p className="text-sm text-green-600">Click "Shop Now" on any item above to purchase</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
