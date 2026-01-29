import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { accessToken, maxResults = 10 } = await request.json()

    if (!accessToken) {
      console.log("[v0] Calendar API: No access token provided")
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    console.log("[v0] Calendar API: Fetching events with client token")

    const timeMin = new Date().toISOString()
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&timeMin=${timeMin}&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log("[v0] Calendar API Error:", response.status, errorData)
      return NextResponse.json({ error: `Calendar API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[v0] Calendar API: Successfully fetched ${data.items?.length || 0} events`)

    return NextResponse.json({ events: data.items || [] })
  } catch (error) {
    console.log("[v0] Calendar API: Unexpected error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
