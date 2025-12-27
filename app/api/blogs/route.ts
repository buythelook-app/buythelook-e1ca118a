import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/blogs - List published blogs with pagination (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const offset = (page - 1) * limit

    let query = supabase.from("blog_posts_with_relationships").select("*", { count: "exact" }).eq("published", true)

    // Filter by category if provided
    if (category) {
      const { data: categoryData } = await supabase.from("blog_categories").select("id").eq("slug", category).single()

      if (categoryData) {
        const { data: postIds } = await supabase
          .from("blog_posts_categories")
          .select("blog_post_id")
          .eq("category_id", categoryData.id)

        const ids = postIds?.map((p) => p.blog_post_id) || []
        query = query.in("id", ids)
      }
    }

    // Filter by tag if provided
    if (tag) {
      const { data: tagData } = await supabase.from("blog_tags").select("id").eq("slug", tag).single()

      if (tagData) {
        const { data: postIds } = await supabase.from("blog_posts_tags").select("blog_post_id").eq("tag_id", tagData.id)

        const ids = postIds?.map((p) => p.blog_post_id) || []
        query = query.in("id", ids)
      }
    }

    // Execute query with pagination
    const {
      data: blogs,
      error,
      count,
    } = await query.order("published_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      blogs: blogs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching blogs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
