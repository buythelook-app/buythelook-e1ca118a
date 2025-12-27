import { supabaseAuth } from "@/lib/supabase-auth-client"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/admin/blogs/:id - Get single blog (admin only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data: blog, error } = await supabaseAuth.from("blog_posts").select("*").eq("id", id).single()

    if (error) throw error

    return NextResponse.json({ blog })
  } catch (error: any) {
    console.error("[v0] Error fetching blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/blogs/:id - Update blog (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const { data: blog, error: blogError } = await supabaseAuth
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
      .eq("id", id)
      .select()
      .single()

    if (blogError) throw blogError

    // Update categories
    if (category_ids !== undefined) {
      await supabaseAuth.from("blog_posts_categories").delete().eq("blog_post_id", id)

      if (category_ids.length > 0) {
        const categoryRelations = category_ids.map((cat_id: string) => ({
          blog_post_id: id,
          category_id: cat_id,
        }))

        await supabaseAuth.from("blog_posts_categories").insert(categoryRelations)
      }
    }

    // Update tags
    if (tag_ids !== undefined) {
      await supabaseAuth.from("blog_posts_tags").delete().eq("blog_post_id", id)

      if (tag_ids.length > 0) {
        const tagRelations = tag_ids.map((tag_id: string) => ({
          blog_post_id: id,
          tag_id: tag_id,
        }))

        await supabaseAuth.from("blog_posts_tags").insert(tagRelations)
      }
    }

    return NextResponse.json({ blog })
  } catch (error: any) {
    console.error("[v0] Error updating blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/blogs/:id - Delete blog (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    console.log("[v0] Deleting blog:", id)

    const { error } = await supabaseAuth.from("blog_posts").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting blog:", error)
      throw error
    }

    console.log("[v0] Blog deleted successfully")
    return NextResponse.json({ message: "Blog deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting blog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
