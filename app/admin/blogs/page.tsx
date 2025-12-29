"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminBlogsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [blogs, setBlogs] = useState([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function checkAdmin() {
      console.log(" AdminBlogsPage: Checking admin status")

      if (!loading && !user) {
        console.log(" AdminBlogsPage: No user, redirecting")
        router.push("/login")
        return
      }

      if (user) {
        try {
          const { data: profile, error } = await supabaseAuth
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single()

          console.log(" AdminBlogsPage: Profile check", { profile, error })

          if (error || !profile?.is_admin) {
            console.log(" AdminBlogsPage: Not admin, redirecting")
            router.push("/login")
            return
          }

          setIsAdmin(true)
          fetchBlogs()
        } catch (err) {
          console.error(" AdminBlogsPage: Error:", err)
          router.push("/login")
        }

        setChecking(false)
      }
    }

    checkAdmin()
  }, [user, loading, router])

  async function fetchBlogs() {
    setBlogsLoading(true)
    try {
      const { data, error } = await supabaseAuth
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })

      console.log(" AdminBlogsPage: Fetched blogs", { data, error })

      if (error) {
        setError(error.message)
      } else {
        setBlogs(data || [])
      }
    } catch (err) {
      console.error(" AdminBlogsPage: Error fetching blogs:", err)
      setError("Failed to load blogs")
    } finally {
      setBlogsLoading(false)
    }
  }

  async function deleteBlog(id) {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete blog")
      }

      // Refresh blogs list
      fetchBlogs()
    } catch (err) {
      console.error(" AdminBlogsPage: Error deleting blog:", err)
      alert("Failed to delete blog post")
    }
  }

  async function togglePublish(id, currentStatus) {
    const action = currentStatus ? "unpublish" : "publish"
    if (!confirm(`Are you sure you want to ${action} this blog post?`)) return

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} blog`)
      }

      // Refresh blogs list
      fetchBlogs()
    } catch (err) {
      console.error(` AdminBlogsPage: Error ${action}ing blog:`, err)
      alert(`Failed to ${action} blog post`)
    }
  }

  if (loading || checking || blogsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl mb-2">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog content and SEO</p>
          </div>
          <Link href="/admin/blogs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Error loading blogs: {error}
          </div>
        ) : blogs && blogs.length > 0 ? (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog.id} className="flex items-center justify-between rounded-lg border bg-card p-6">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{blog.title}</h3>
                    {blog.published ? (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{blog.view_count || 0} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {blog.published && (
                    <Link href={`/blog/${blog.slug}`} target="_blank">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish(blog.id, blog.published)}
                    title={blog.published ? "Unpublish" : "Publish"}
                  >
                    {blog.published ? (
                      <FileText className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Link href={`/admin/blogs/edit/${blog.id}`}>
                    <Button variant="ghost" size="icon" title="Edit blog">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => deleteBlog(blog.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No blog posts yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Get started by creating your first blog post</p>
            <Link href="/admin/blogs/new">
              <Button>Create Blog Post</Button>
            </Link>
          </div>
        )}

        <div className="mt-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
