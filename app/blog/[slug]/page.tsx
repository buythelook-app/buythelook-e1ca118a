import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, Eye } from "lucide-react"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: blog } = await supabase
    .from("blog_posts")
    .select("title, excerpt, meta_description, meta_keywords, featured_image_url, slug, published_at, updated_at")
    .eq("slug", slug)
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
    keywords: blog.meta_keywords || "",
    openGraph: {
      title: blog.title,
      description: blog.meta_description || blog.excerpt,
      type: "article",
      url: `${baseUrl}/blog/${blog.slug}`,
      publishedTime: blog.published_at,
      modifiedTime: blog.updated_at,
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
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: blog } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).single()

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: blog.featured_image_url,
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at,
    author: {
      "@type": "Organization",
      name: "Buy The Look",
    },
    publisher: {
      "@type": "Organization",
      name: "Buy The Look",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <main className="min-h-screen bg-background">
        <link rel="canonical" href={canonicalUrl} />

        <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Featured Image */}
        {blog.featured_image_url && (
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[400px] sm:max-h-[500px] bg-muted">
            <Image
              src={blog.featured_image_url}
              alt={blog.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized={blog.featured_image_url.includes('http') && !blog.featured_image_url.includes(baseUrl)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Article */}
        <article className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            {/* Category Badge */}
            {blog.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {blog.category.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 text-balance leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
              {blog.reading_time && (
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {blog.reading_time} min
                </span>
              )}
              <span className="flex items-center gap-1.5 sm:gap-2">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                {blog.view_count || 0} views
              </span>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="mb-8 sm:mb-10 p-4 sm:p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-base sm:text-lg text-muted-foreground italic leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-sm sm:prose-base lg:prose-lg prose-slate max-w-none 
                prose-headings:font-serif prose-headings:font-bold prose-headings:scroll-mt-20
                prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl prose-h1:mb-4
                prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-foreground/90
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:my-4 prose-ol:my-4 prose-li:my-2
                prose-img:rounded-lg sm:prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 
                prose-blockquote:py-2 sm:prose-blockquote:py-4 prose-blockquote:px-4 sm:prose-blockquote:px-6
                prose-blockquote:my-6 prose-blockquote:not-italic prose-blockquote:font-normal
                prose-code:bg-muted prose-code:px-1.5 sm:prose-code:px-2 prose-code:py-0.5 sm:prose-code:py-1 
                prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-code:font-mono
                prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>
      </main>
    </>
  )
}