"use client"

import { useState } from "react"
import { MapPin, Loader2, X, Star, Navigation, ExternalLink, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function FindNearMeButton({ itemName, brand, className = "" }) {
  const [isLoading, setIsLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showInline, setShowInline] = useState(false)
  const [stores, setStores] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [isCached, setIsCached] = useState(false)

  const handleFindNearMe = () => {
    setIsLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })

        try {
          const response = await fetch("/api/stores/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude, brand }),
          })

          const data = await response.json()

          if (data.error) {
            setLocationError(data.error)
            setIsLoading(false)
            return
          }

          setStores(data.stores || [])
          setIsCached(data.cached || false)
          setShowModal(true)
          setShowInline(true)
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching stores:", error)
          setLocationError("Failed to find nearby stores")
          setIsLoading(false)
        }
      },
      (error) => {
        setIsLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Please allow location access to find stores near you")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable")
            break
          case error.TIMEOUT:
            setLocationError("Location request timed out")
            break
          default:
            setLocationError("An error occurred getting your location")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  const openDirections = (store) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.location.lat},${store.location.lng}&destination_place_id=${store.id}`
    window.open(directionsUrl, "_blank", "noopener,noreferrer")
  }

  const openInMaps = (store) => {
    const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${store.id}`
    window.open(mapsUrl, "_blank", "noopener,noreferrer")
  }

  const StoreCard = ({ store, index, compact = false }) => {
    const [imageError, setImageError] = useState(false)

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`${compact ? "p-2 sm:p-3" : "p-3 sm:p-4"} hover:bg-neutral-50 transition-colors rounded-lg border border-neutral-200 bg-white`}
      >
        {/* Responsive flex - stacks on mobile */}
        <div className={`flex ${compact ? "flex-row" : "flex-col sm:flex-row"} gap-3`}>
          {/* Store Photo with error fallback */}
          {store.photo && !imageError ? (
            <img
              src={store.photo || "/placeholder.svg"}
              alt={store.name}
              onError={() => setImageError(true)}
              className={`${compact ? "w-14 h-14 sm:w-16 sm:h-16" : "w-full sm:w-20 h-24 sm:h-20"} rounded-lg object-cover flex-shrink-0`}
            />
          ) : (
            <div
              className={`${compact ? "w-14 h-14 sm:w-16 sm:h-16" : "w-full sm:w-20 h-24 sm:h-20"} rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0`}
            >
              <Store className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-neutral-400`} />
            </div>
          )}

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-neutral-900 ${compact ? "text-sm truncate" : "text-base line-clamp-1"}`}>
              {store.name}
            </h4>
            <p className={`text-neutral-500 ${compact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"} mt-0.5`}>
              {store.address}
            </p>

            {/* Rating & Status Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              {store.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-neutral-700">{store.rating}</span>
                </div>
              )}
              {store.isOpen !== null && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${store.isOpen ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}
                >
                  {store.isOpen ? "Open Now" : "Closed"}
                </span>
              )}
              <span className="text-xs text-neutral-400">{store.distance} km away</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - always full width on mobile */}
        <div className={`flex gap-2 ${compact ? "mt-2" : "mt-3"}`}>
          <Button
            size="sm"
            onClick={() => openDirections(store)}
            className="flex-1 gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-9"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => openInMaps(store)} className="gap-1.5 text-xs h-9 px-3">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className={compact ? "hidden sm:inline" : ""}>View</span>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFindNearMe}
        disabled={isLoading}
        className="gap-1.5 bg-transparent text-xs sm:text-sm h-9 px-3 sm:px-4"
        aria-label={`Find ${brand || "stores"} near your location`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <MapPin className="w-4 h-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Find Near Me</span>
        <span className="sm:hidden">Nearby</span>
      </Button>

      {locationError && (
        <p className="text-xs text-red-500 mt-2 max-w-[200px]" role="alert">
          {locationError}
        </p>
      )}

      <AnimatePresence>
        {showInline && stores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 w-full"
          >
            <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
              {/* Inline Header */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full p-3 flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 transition-colors border-b border-neutral-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-neutral-900 block">
                      {stores.length} Store{stores.length !== 1 ? "s" : ""} Found
                    </span>
                    {isCached && <span className="text-xs text-neutral-400">Cached results</span>}
                  </div>
                </div>
                <span className="text-xs font-medium text-neutral-500 hover:text-neutral-900">View all →</span>
              </button>

              {/* Show first 2 stores inline */}
              <div className="p-2 space-y-2">
                {stores.slice(0, 2).map((store, index) => (
                  <StoreCard key={store.id} store={store} index={index} compact={true} />
                ))}
                {stores.length > 2 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors rounded-lg"
                  >
                    + {stores.length - 2} more store{stores.length - 2 !== 1 ? "s" : ""}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden sm:m-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-100 bg-white sticky top-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {brand && brand !== "N/A" ? `${brand} Stores` : "Nearby Stores"}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {stores.length} store{stores.length !== 1 ? "s" : ""} found near you
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors -mr-2"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* Store List */}
              <div className="overflow-y-auto max-h-[70vh] sm:max-h-[65vh] p-3 sm:p-4">
                {stores.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-900 font-semibold">No stores found nearby</p>
                    <p className="text-sm text-neutral-500 mt-1">Try searching in a different area</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stores.map((store, index) => (
                      <StoreCard key={store.id} store={store} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
