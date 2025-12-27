import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/check-admin"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminBlogsPage() {
  const { isAdmin } = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/sign-in")
  }

  // Fetch all blogs (including drafts)
  const supabase = await createSupabaseServerClient()
  const { data: blogs, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      author:users(full_name, email),
      categories:blog_posts_categories(category:blog_categories(name))
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
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

        {/* Blog List */}
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Error loading blogs: {error.message}
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
                    <span>By {blog.author?.full_name || blog.author?.email || "Unknown"}</span>
                    <span>•</span>
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
                  <Link href={`/admin/blogs/${blog.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <form action={`/api/admin/blogs/${blog.id}`} method="DELETE">
                    <Button variant="ghost" size="icon" type="submit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
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

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
