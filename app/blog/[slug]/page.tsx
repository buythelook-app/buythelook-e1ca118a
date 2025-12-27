import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft } from "lucide-react"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()

  const { data: blog } = await supabase
    .from("blog_posts")
    .select("title, excerpt, meta_description, featured_image_url, slug")
    .eq("slug", params.slug)
    .eq("published", true)
    .single()

  if (!blog) {
    return {
      title: "Blog Not Found",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buythelook.app"

  return {
    title: `${blog.title} | Buy The Look`,
    description: blog.meta_description || blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.meta_description || blog.excerpt,
      type: "article",
      url: `${baseUrl}/blog/${blog.slug}`,
      images: blog.featured_image_url
        ? [
            {
              url: blog.featured_image_url,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.meta_description || blog.excerpt,
      images: blog.featured_image_url ? [blog.featured_image_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const supabase = createServerClient()

  const { data: blog } = await supabase
    .from("blog_posts_with_relationships")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single()

  if (!blog) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("blog_posts")
    .update({ view_count: (blog.view_count || 0) + 1 })
    .eq("id", blog.id)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buythelook.app"
  const canonicalUrl = `${baseUrl}/blog/${blog.slug}`

  return (
    <main className="min-h-screen bg-background">
      {/* Add canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Back Button */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featured_image_url && (
        <div className="relative aspect-[21/9] max-h-[500px] overflow-hidden">
          <Image
            src={blog.featured_image_url || "/placeholder.svg"}
            alt={blog.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Article */}
      <article className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex gap-3 mb-6">
              {blog.categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif text-5xl mb-6 text-balance">{blog.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(blog.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {blog.reading_time && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {blog.reading_time} min read
              </span>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/70 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
