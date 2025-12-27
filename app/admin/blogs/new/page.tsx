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
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

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
    category: "",
    published: false,
  })

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }

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

    const userId = user?.id

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

      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
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
    <div className="min-h-screen bg-background mt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/admin/blogs"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl mb-2">Create New Blog Post</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Fill in the details below to create your blog post
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Info */}
          <div className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold">Basic Information</h2>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog title..."
                required
                className="text-lg"
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
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a category...</option>
                <option value="fashion-tips">Fashion Tips</option>
                <option value="style-guide">Style Guide</option>
                <option value="trends">Trends</option>
                <option value="ai-fashion">AI Fashion</option>
                <option value="outfit-ideas">Outfit Ideas</option>
                <option value="seasonal">Seasonal</option>
                <option value="how-to">How To</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Help readers find your content by selecting a category
              </p>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <div className="mt-2 bg-white rounded-lg overflow-hidden border">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  modules={quillModules}
                  placeholder="Write your blog content here..."
                  className="min-h-[300px] sm:min-h-[400px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="featured_image_url">Featured Image URL *</Label>
              <Input
                id="featured_image_url"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Recommended: 1200x630px for optimal social media sharing
              </p>
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
              <p className="mt-1 text-xs text-muted-foreground">{formData.meta_description.length}/160 characters</p>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto">
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Blog Post"}
            </Button>
            <Link href="/admin/blogs" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}