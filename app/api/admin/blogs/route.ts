import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/admin/blogs - List all blogs (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get total count
    const { count } = await supabase.from("blog_posts").select("*", { count: "exact", head: true })

    // Get blogs with relationships
    const { data: blogs, error } = await supabase
      .from("blog_posts_with_relationships")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      blogs,
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

// POST /api/admin/blogs - Create new blog (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      meta_description,
      meta_keywords,
      published,
      reading_time,
      category_ids,
      tag_ids,
    } = body

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: "Missing required fields: title, slug, excerpt, content" }, { status: 400 })
    }

    // Create blog post
    const { data: blog, error: blogError } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        meta_description: meta_description || excerpt,
        meta_keywords,
        published: published || false,
        reading_time,
        author_id: user.id,
        published_at: published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (blogError) throw blogError

    // Add categories if provided
    if (category_ids && category_ids.length > 0) {
      const categoryRelations = category_ids.map((cat_id: string) => ({
        blog_post_id: blog.id,
        category_id: cat_id,
      }))

      await supabase.from("blog_posts_categories").insert(categoryRelations)
    }

    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const tagRelations = tag_ids.map((tag_id: string) => ({
        blog_post_id: blog.id,
        tag_id: tag_id,
      }))

      await supabase.from("blog_posts_tags").insert(tagRelations)
    }

    return NextResponse.json({ blog }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
