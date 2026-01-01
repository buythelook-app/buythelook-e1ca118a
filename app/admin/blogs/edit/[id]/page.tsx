"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"
import Image from "next/image"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetchingBlog, setFetchingBlog] = useState(true)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

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

  useEffect(() => {
    async function fetchBlog() {
      if (!params.id) return

      try {
        const response = await fetch(`/api/admin/blogs/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch blog")

        const { blog } = await response.json()
        setFormData({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          meta_description: blog.meta_description || "",
          meta_keywords: blog.meta_keywords || "",
          featured_image_url: blog.featured_image_url || "",
          category: blog.category || "",
          published: blog.published || false,
        })
      } catch (err: any) {
        console.error(" Error fetching blog:", err)
        setError(err.message)
      } finally {
        setFetchingBlog(false)
      }
    }

    fetchBlog()
  }, [params.id])

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    console.log(" Cloudinary Upload - Cloud Name:", cloudName ? "✓ Set" : "✗ Missing")
    console.log(" Cloudinary Upload - Upload Preset:", uploadPreset ? "✓ Set" : "✗ Missing")

    if (!cloudName || !uploadPreset) {
      setError(
        "Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.",
      )
      return
    }

    setUploadingImage(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)

      console.log(" Uploading to Cloudinary:", {
        cloudName,
        uploadPreset,
        fileSize: file.size,
        fileType: file.type,
      })

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      console.log(" Upload URL:", uploadUrl)

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })

      console.log(" Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error(" Cloudinary error response:", errorData)
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log(" Upload successful:", data.secure_url)
      setFormData((prev) => ({ ...prev, featured_image_url: data.secure_url }))
    } catch (err: any) {
      console.error(" Error uploading image:", err)
      setError(`Failed to upload image: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/blogs/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update blog")
      }

      router.push("/admin/blogs")
    } catch (err: any) {
      console.error(" Error updating blog:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user || fetchingBlog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
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
          <h1 className="font-serif text-3xl sm:text-4xl mb-2">Edit Blog Post</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Update your blog post details below</p>
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
              <Label htmlFor="featured_image">Featured Image *</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Upload an image file or paste an image URL. Recommended: 1200x630px for optimal social media sharing.
              </p>

              {/* Image Preview */}
              {formData.featured_image_url && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border mb-4">
                  <Image
                    src={formData.featured_image_url || "/placeholder.svg"}
                    alt="Featured image preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured_image_url: "" })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Upload Image File"}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />

                <span className="self-center text-sm text-muted-foreground">or</span>

                {/* URL Input */}
                <Input
                  id="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
              </div>
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
              {loading ? "Updating..." : "Update Blog Post"}
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
