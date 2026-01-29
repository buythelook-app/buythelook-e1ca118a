import { createSupabaseServerClient } from "@/lib/supabase-server"

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  location?: string
  attendees?: Array<{ email: string }>
}

export async function getGoogleCalendarEvents(
  maxResults: number = 10
): Promise<{ events: CalendarEvent[]; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.log("[v0] Calendar: No active session", sessionError)
      return { events: [], error: "Not authenticated" }
    }

    console.log("[v0] Calendar: Session found, user:", session.user?.email)
    console.log("[v0] Calendar: Provider:", session.user?.app_metadata?.provider)
    console.log("[v0] Calendar: Has provider_token?", !!session.provider_token)
    console.log("[v0] Calendar: Has provider_refresh_token?", !!session.provider_refresh_token)

    const providerToken = session.provider_token
    const providerRefreshToken = session.provider_refresh_token

    if (!providerToken) {
      console.log("[v0] Calendar: No provider token found")
      return { events: [], error: "No Google OAuth token. Please sign out and sign in again with Google to grant calendar permissions." }
    }

    console.log("[v0] Calendar: Fetching events with token")

    // Call Google Calendar API
    const timeMin = new Date().toISOString()
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&timeMin=${timeMin}&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("[v0] Calendar API Error:", response.status, errorData)

      // If token expired, try to refresh
      if (response.status === 401 && providerRefreshToken) {
        console.log("[v0] Calendar: Token expired, attempting refresh...")
        const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: providerRefreshToken,
            grant_type: "refresh_token",
          }),
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          console.log("[v0] Calendar: Token refreshed successfully")
          return { events: [], error: "Token refreshed. Please try again." }
        }
      }

      return { events: [], error: `Calendar API error: ${response.status}` }
    }

    const data = await response.json()
    console.log(`[v0] Calendar: Successfully fetched ${data.items?.length || 0} events`)

    return {
      events: data.items || [],
    }
  } catch (error) {
    console.log("[v0] Calendar: Unexpected error:", error)
    return { events: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}
