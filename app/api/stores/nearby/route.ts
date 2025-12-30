import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Google Places API endpoint
const TEXT_SEARCH_API_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
const NEARBY_SEARCH_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

// Create Supabase client for caching
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!, process.env.SUPABASE_AUTH_SERVICE_ROLE_KEY!)

// Generate location hash (rounds to ~1km precision for caching)
function generateLocationHash(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 100) / 100 // ~1km precision
  const roundedLng = Math.round(lng * 100) / 100
  return `${roundedLat},${roundedLng}`
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, brand, userId } = await request.json()

    // Validate inputs
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const searchBrand = brand && brand !== "N/A" ? brand : "fashion clothing store"
    const locationHash = generateLocationHash(latitude, longitude)

    console.log(` Store search - Brand: "${searchBrand}", Location: ${locationHash}`)

    const { data: cachedResult } = await supabase
      .from("store_cache")
      .select("stores, created_at")
      .eq("brand", searchBrand.toLowerCase())
      .eq("location_hash", locationHash)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (cachedResult) {
      console.log(` Cache HIT - Returning ${cachedResult.stores.length} cached stores`)
      return NextResponse.json({
        stores: cachedResult.stores,
        cached: true,
        cachedAt: cachedResult.created_at,
      })
    }

    console.log(` Cache MISS - Calling Google Places API`)

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.error(" GOOGLE_PLACES_API_KEY is not set")
      return NextResponse.json({ error: "Store locator is not configured" }, { status: 500 })
    }

    let results: any[] = []

    const textSearchParams = new URLSearchParams({
      query: `${searchBrand} store`,
      location: `${latitude},${longitude}`,
      radius: "15000", // 15km
      key: apiKey,
    })

    const textResponse = await fetch(`${TEXT_SEARCH_API_URL}?${textSearchParams}`)
    const textData = await textResponse.json()

    console.log(` Text Search API status: ${textData.status}, found ${textData.results?.length || 0} results`)

    if (textData.status === "REQUEST_DENIED") {
      console.error(" Google Places API error:", textData.error_message)
      return NextResponse.json({ error: "API configuration error. Check API key restrictions." }, { status: 500 })
    }

    if (textData.results?.length > 0) {
      const brandLower = searchBrand.toLowerCase()
      results = textData.results.filter(
        (place: any) =>
          place.name.toLowerCase().includes(brandLower) || place.formatted_address?.toLowerCase().includes(brandLower),
      )
      console.log(` Filtered to ${results.length} stores containing "${searchBrand}"`)
    }

    if (results.length === 0) {
      console.log(` No exact matches, trying nearby search...`)
      const nearbyParams = new URLSearchParams({
        location: `${latitude},${longitude}`,
        radius: "20000", // 20km for fallback
        keyword: searchBrand,
        type: "store",
        key: apiKey,
      })

      const nearbyResponse = await fetch(`${NEARBY_SEARCH_API_URL}?${nearbyParams}`)
      const nearbyData = await nearbyResponse.json()

      if (nearbyData.results?.length > 0) {
        const brandLower = searchBrand.toLowerCase()
        results = nearbyData.results.filter((place: any) => place.name.toLowerCase().includes(brandLower))
        console.log(` Nearby search found ${results.length} matching stores`)
      }
    }

    // Transform stores
    const stores = results.slice(0, 5).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      isOpen: place.opening_hours?.open_now ?? null,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
      photo: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
    }))

    // Sort by distance
    stores.sort((a: any, b: any) => a.distance - b.distance)

    console.log(` Returning ${stores.length} stores for "${searchBrand}"`)

    // Cache save code
    if (stores.length > 0) {
      await supabase.from("store_cache").insert({
        user_id: userId || null,
        brand: searchBrand.toLowerCase(),
        latitude,
        longitude,
        location_hash: locationHash,
        stores,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      console.log(` Cached ${stores.length} stores for "${searchBrand}" at ${locationHash}`)
    }

    return NextResponse.json({ stores, cached: false })
  } catch (error) {
    console.error(" Error fetching nearby stores:", error)
    return NextResponse.json({ error: "Failed to fetch nearby stores" }, { status: 500 })
  }
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
