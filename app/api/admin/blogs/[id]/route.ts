import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/admin/blogs/:id - Get single blog (admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data: blog, error } = await supabase
      .from("blog_posts_with_relationships")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ blog })
  } catch (error: any) {
    console.error("[v0] Error fetching blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/blogs/:id - Update blog (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Update blog post
    const { data: blog, error: blogError } = await supabase
      .from("blog_posts")
      .update({
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        meta_description,
        meta_keywords,
        published,
        reading_time,
        published_at: published ? new Date().toISOString() : null,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (blogError) throw blogError

    // Update categories
    if (category_ids !== undefined) {
      // Delete existing categories
      await supabase.from("blog_posts_categories").delete().eq("blog_post_id", params.id)

      // Add new categories
      if (category_ids.length > 0) {
        const categoryRelations = category_ids.map((cat_id: string) => ({
          blog_post_id: params.id,
          category_id: cat_id,
        }))

        await supabase.from("blog_posts_categories").insert(categoryRelations)
      }
    }

    // Update tags
    if (tag_ids !== undefined) {
      // Delete existing tags
      await supabase.from("blog_posts_tags").delete().eq("blog_post_id", params.id)

      // Add new tags
      if (tag_ids.length > 0) {
        const tagRelations = tag_ids.map((tag_id: string) => ({
          blog_post_id: params.id,
          tag_id: tag_id,
        }))

        await supabase.from("blog_posts_tags").insert(tagRelations)
      }
    }

    return NextResponse.json({ blog })
  } catch (error: any) {
    console.error("[v0] Error updating blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/blogs/:id - Delete blog (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabase.from("blog_posts").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ message: "Blog deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
