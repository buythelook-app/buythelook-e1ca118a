import { createServerClient } from "@/lib/supabase-server"
import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log(" Generating sitemap...")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  console.log(" Base URL:", baseUrl)

  try {
    const supabase = await createServerClient()

    const { data: blogs, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })

    if (blogError) {
      console.error(" Error fetching blogs for sitemap:", blogError)
    } else {
      console.log(` Found ${blogs?.length || 0} published blogs for sitemap`)
    }

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .order("name")

    if (categoryError) {
      console.error(" Error fetching categories for sitemap:", categoryError)
    } else {
      console.log(` Found ${categories?.length || 0} categories for sitemap`)
    }

    const blogUrls =
      blogs?.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) || []

    const categoryUrls =
      categories?.map((category) => ({
        url: `${baseUrl}/blog/category/${category.slug}`,
        lastModified: new Date(category.updated_at || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) || []

    const sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/quiz`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/generate`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...blogUrls,
      ...categoryUrls,
    ]

    console.log(` Sitemap generated successfully with ${sitemap.length} URLs`)
    return sitemap
  } catch (error) {
    console.error(" Critical error generating sitemap:", error)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
    ]
  }
}