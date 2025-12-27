import { supabaseAuth } from "@/lib/supabase-auth-client"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/admin/blogs - List all blogs (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Admin Blogs API: GET request received")

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    console.log("[v0] Admin Blogs API: User check", { hasUserId: !!userId, userId })

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - user_id required" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAuth
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()

    console.log("[v0] Admin Blogs API: Profile check", {
      hasProfile: !!profile,
      isAdmin: profile?.is_admin,
      error: profileError,
    })

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get query params for pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get total count
    const { count } = await supabaseAuth.from("blog_posts").select("*", { count: "exact", head: true })

    // Get blogs with relationships
    const { data: blogs, error } = await supabaseAuth
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
    console.log("[v0] Admin Blogs API: POST request received")

    const body = await request.json()

    console.log("[v0] ========== API BODY DEBUG ==========")
    console.log("[v0] Full body:", JSON.stringify(body, null, 2))
    console.log("[v0] Body keys:", Object.keys(body))
    console.log("[v0] body.user_id:", body.user_id)
    console.log("[v0] typeof body.user_id:", typeof body.user_id)
    console.log("[v0] =====================================")

    const { user_id, ...blogData } = body

    console.log("[v0] Admin Blogs API: User check for POST", { hasUserId: !!user_id, userId: user_id })

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized - user_id required" }, { status: 401 })
    }

    console.log("[v0] ========== PROFILE DEBUG START ==========")
    console.log("[v0] Looking for user_id:", user_id)

    // First, get ALL profiles to see what exists
    const { data: allProfiles, error: allProfilesError } = await supabaseAuth.from("profiles").select("*").limit(10)

    console.log("[v0] All profiles (first 10):", JSON.stringify(allProfiles, null, 2))
    console.log("[v0] All profiles error:", allProfilesError)

    // Check if our specific profile exists
    const { data: profile, error: profileError } = await supabaseAuth
      .from("profiles")
      .select("*") // Select ALL columns to see what's there
      .eq("id", user_id)
      .maybeSingle() // Use maybeSingle instead of single to handle 0 rows gracefully

    console.log("[v0] Profile query for user:", {
      hasProfile: !!profile,
      profile: profile,
      allColumns: profile ? Object.keys(profile) : [],
      hasIsAdminColumn: profile ? "is_admin" in profile : false,
      isAdmin: profile?.is_admin,
      error: profileError?.message,
      errorDetails: profileError,
    })
    console.log("[v0] ========== PROFILE DEBUG END ==========")

    if (!profile) {
      return NextResponse.json(
        {
          error: "Profile not found",
          details: `No profile found for user_id: ${user_id}. You may need to run the SQL script to create your profile.`,
        },
        { status: 403 },
      )
    }

    if (!("is_admin" in profile)) {
      return NextResponse.json(
        {
          error: "is_admin column missing",
          details: "The profiles table doesn't have the is_admin column. Run scripts/add-admin-to-profiles.sql",
        },
        { status: 403 },
      )
    }

    if (!profile.is_admin) {
      return NextResponse.json(
        {
          error: "Admin access required",
          details: "User exists but is_admin is false",
        },
        { status: 403 },
      )
    }

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
    } = blogData

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: "Missing required fields: title, slug, excerpt, content" }, { status: 400 })
    }

    // Create blog post
    const { data: blog, error: blogError } = await supabaseAuth
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
        author_id: user_id, // Use user_id from request body
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

      await supabaseAuth.from("blog_posts_categories").insert(categoryRelations)
    }

    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const tagRelations = tag_ids.map((tag_id: string) => ({
        blog_post_id: blog.id,
        tag_id: tag_id,
      }))

      await supabaseAuth.from("blog_posts_tags").insert(tagRelations)
    }

    return NextResponse.json({ blog }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
