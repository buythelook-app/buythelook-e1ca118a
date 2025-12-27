import { supabaseAuth } from "@/lib/supabase-auth-client"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/blogs/:slug - Get single blog by slug (public)
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    // Get blog by slug
    const { data: blog, error } = await supabaseAuth
      .from("blog_posts_with_relationships")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()

    if (error) throw error

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Increment view count
    await supabaseAuth
      .from("blog_posts")
      .update({ view_count: (blog.view_count || 0) + 1 })
      .eq("id", blog.id)

    return NextResponse.json({ blog })
  } catch (error: any) {
    console.error(" Error fetching blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
