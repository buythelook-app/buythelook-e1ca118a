import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/check-admin"
import Link from "next/link"
import { Sparkles, FileText, BarChart } from "lucide-react"

export default async function AdminDashboard() {
  console.log("[v0] AdminDashboard: Checking admin status")
  const { isAdmin, user, error } = await checkIsAdmin()

  console.log("[v0] AdminDashboard: Check result", { isAdmin, user: user?.email, error })

  if (!isAdmin) {
    console.log("[v0] AdminDashboard: Not admin, redirecting to sign-in")
    redirect("/login")
  }

  console.log("[v0] AdminDashboard: Admin verified, rendering dashboard")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
        </div>

        {/* Admin Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Blog Management */}
          <Link
            href="/admin/blogs"
            className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Blog Posts</h3>
            <p className="text-sm text-muted-foreground">Create, edit, and manage blog posts with full SEO control</p>
          </Link>

          {/* Categories */}
          <Link
            href="/admin/categories"
            className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Categories & Tags</h3>
            <p className="text-sm text-muted-foreground">Organize your content with categories and tags</p>
          </Link>

          {/* Analytics Placeholder */}
          <div className="rounded-lg border bg-card p-6 opacity-60">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <BarChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Analytics</h3>
            <p className="text-sm text-muted-foreground">View blog performance and traffic stats (Coming Soon)</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-serif">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/admin/blogs/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              Create New Blog Post
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 transition-colors hover:bg-accent"
            >
              View Live Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
