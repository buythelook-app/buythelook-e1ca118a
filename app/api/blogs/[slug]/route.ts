import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/blogs/:slug - Get single blog by slug (public)
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerClient()

    // Get blog by slug
    const { data: blog, error } = await supabase
      .from("blog_posts_with_relationships")
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .single()

    if (error) throw error

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from("blog_posts")
      .update({ view_count: (blog.view_count || 0) + 1 })
      .eq("id", blog.id)

    return NextResponse.json({ blog })
  } catch (error: any) {
    console.error("[v0] Error fetching blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
