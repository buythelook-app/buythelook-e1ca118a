"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import Link from "next/link"
import { Sparkles, FileText, BarChart, Loader2 } from "lucide-react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      console.log("[v0] AdminDashboard: Checking if user is logged in", { user: user?.email, loading })

      if (!loading && !user) {
        console.log("[v0] AdminDashboard: No user, redirecting to login")
        router.push("/login")
        return
      }

      if (user) {
        console.log("[v0] AdminDashboard: User logged in, checking admin status")

        try {
          const { data: profile, error } = await supabaseAuth
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single()

          console.log("[v0] AdminDashboard: Profile query result", { profile, error })

          if (error) {
            console.error("[v0] AdminDashboard: Error fetching profile:", error)
            // If column doesn't exist, assume not admin
            setIsAdmin(false)
            setChecking(false)
            router.push("/login")
            return
          }

          if (profile?.is_admin) {
            console.log("[v0] AdminDashboard: User is admin!")
            setIsAdmin(true)
          } else {
            console.log("[v0] AdminDashboard: User is NOT admin, redirecting")
            router.push("/login")
          }
        } catch (err) {
          console.error("[v0] AdminDashboard: Catch error:", err)
          router.push("/login")
        }

        setChecking(false)
      }
    }

    checkAdmin()
  }, [user, loading, router])

  if (loading || checking) {
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
        <div className="mb-12">
          <h1 className="font-serif text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          <div className="rounded-lg border bg-card p-6 opacity-60">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <BarChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Analytics</h3>
            <p className="text-sm text-muted-foreground">View blog performance and traffic stats (Coming Soon)</p>
          </div>
        </div>

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
