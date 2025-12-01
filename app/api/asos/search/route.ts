import { searchAllCategories } from "@/lib/asos-api"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("[v0] ASOS Search Route: Starting product search")

  try {
    const { profile } = await request.json()

    console.log("[v0] ASOS Search Route: Profile received")

    if (!profile || !profile.searchQueries) {
      console.error("[v0] ASOS Search Route: Invalid profile data")
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 })
    }

    console.log("[v0] ASOS Search Route: Calling searchAllCategories...")
    const products = await searchAllCategories(profile)

    console.log("[v0] ASOS Search Route: Products retrieved")
    console.log(
      "[v0] ASOS Search Route: Counts - Tops:",
      products.tops.length,
      "Bottoms:",
      products.bottoms.length,
      "Shoes:",
      products.shoes.length,
    )

    return NextResponse.json({
      success: true,
      products,
      counts: {
        tops: products.tops.length,
        bottoms: products.bottoms.length,
        shoes: products.shoes.length,
      },
    })
  } catch (error: any) {
    console.error("[v0] ASOS Search Route: Error occurred:", error)
    console.error("[v0] ASOS Search Route: Error stack:", error.stack)
    return NextResponse.json({ error: "Product search failed", details: error.message }, { status: 500 })
  }
}
