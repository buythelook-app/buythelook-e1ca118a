"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, RefreshCw, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export function CalendarEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    if (!user) {
      setError("Please sign in to view calendar events")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the current session with provider token
      const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error("No active session. Please sign in again.")
      }

      const providerToken = session.provider_token

      if (!providerToken) {
        throw new Error("No Google OAuth token found. Please sign out and sign in again with Google to grant calendar permissions.")
      }

      console.log("[v0] Calendar: Sending token to API")

      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: providerToken,
          maxResults: 10,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch calendar events")
      }

      setEvents(data.events || [])
      console.log("[v0] Fetched", data.events?.length || 0, "calendar events")
    } catch (err) {
      console.error("[v0] Calendar fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const formatDate = (dateObj) => {
    if (!dateObj) return ""
    
    const dateStr = dateObj.dateTime || dateObj.date
    if (!dateStr) return ""

    const date = new Date(dateStr)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    }

    // Check if tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    }

    // Otherwise full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="p-8 text-center bg-card rounded-lg border border-border">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Sign in with Google to view your calendar events</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-card rounded-lg border border-border">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium mb-2">{error}</p>
            {error.includes("re-authenticate") && (
              <p className="text-xs text-muted-foreground mb-4">
                You need to sign out and sign in again with Google to grant calendar access.
              </p>
            )}
          </div>
        </div>
        <Button onClick={fetchEvents} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Events
        </h3>
        <Button
          onClick={fetchEvents}
          variant="ghost"
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {loading && events.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-lg border border-border">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading your calendar events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-lg border border-border">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No upcoming events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <h4 className="font-medium mb-2">{event.summary}</h4>
              
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(event.start)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
