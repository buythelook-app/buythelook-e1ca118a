"use client"

import { useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FindNearMeButton({ itemName, brand, className = "", onStoresFound }) {
  const [isLoading, setIsLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)

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

          if (onStoresFound && data.stores) {
            onStoresFound(data.stores)
          }
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

  return (
    <div className={`${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleFindNearMe}
        disabled={isLoading}
        className="gap-1.5 bg-transparent text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-4 w-full sm:w-auto"
        aria-label={`Find ${brand || "stores"} near your location`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" aria-hidden="true" />
        ) : (
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Find Near Me</span>
        <span className="sm:hidden">Nearby</span>
      </Button>

      {locationError && (
        <p className="text-xs text-red-500 mt-1.5 max-w-[200px]" role="alert">
          {locationError}
        </p>
      )}
    </div>
  )
}
