"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewBlogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    meta_description: "",
    meta_keywords: "",
    featured_image_url: "",
    published: false,
  })

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("[v0] ========== EXTREME USER DEBUG ==========")
    console.log("[v0] Full user object:", user)
    console.log("[v0] user?.id:", user?.id)
    console.log("[v0] User object keys:", user ? Object.keys(user) : "NO USER")
    console.log("[v0] User object type:", typeof user)

    // Try multiple ways to get the ID
    const userId = user?.id || user?.user_id || (user as any)?.uid
    console.log("[v0] Extracted userId:", userId)
    console.log("[v0] ==========================================")

    if (!userId) {
      setError("Unable to identify user. Please refresh and try again.")
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        user_id: userId,
      }

      console.log("[v0] Sending payload:", payload)

      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const data = await response.json()
        console.log("[v0] Error response:", data)
        throw new Error(data.error || "Failed to create blog")
      }

      const { data } = await response.json()
      router.push("/admin/blogs")
    } catch (err: any) {
      console.error("[v0] Error creating blog:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blogs"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>
          <h1 className="font-serif text-4xl mb-2">Create New Blog Post</h1>
          <p className="text-muted-foreground">Fill in the details below to create your blog post</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-friendly-slug"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Will be used in URL: /blog/{formData.slug || "your-slug"}
              </p>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary (150-160 characters recommended)"
                rows={3}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">{formData.excerpt.length} characters</p>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content here (HTML supported)..."
                rows={15}
                required
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="featured_image_url">Featured Image URL</Label>
              <Input
                id="featured_image_url"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">SEO Settings</h2>

            <div>
              <Label htmlFor="meta_description">Meta Description *</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="Description for search engines (155-160 characters recommended)"
                rows={3}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">{formData.meta_description.length} characters</p>
            </div>

            <div>
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                value={formData.meta_keywords}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="fashion, AI, styling, trends (comma-separated)"
              />
            </div>
          </div>

          {/* Publish Settings */}
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Publish Settings</h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">If unchecked, blog will be saved as draft</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Blog Post"}
            </Button>
            <Link href="/admin/blogs">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
