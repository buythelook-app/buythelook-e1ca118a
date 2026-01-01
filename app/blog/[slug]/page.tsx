import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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

      <main className="min-h-screen bg-white dark:bg-neutral-950">
        <link rel="canonical" href={canonicalUrl} />

        {/* Back Navigation */}
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-[680px] mx-auto px-5 sm:px-8 py-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Articles
            </Link>
          </div>
        </div>

        <article className="py-12 sm:py-16">
          {/* Optimal reading width: 680px like Medium */}
          <div className="max-w-[680px] mx-auto px-5 sm:px-8">
            {/* Title - Large, serif, bold */}
            <h1 className="font-serif text-[32px] sm:text-[42px] leading-[1.15] font-bold text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight">
              {blog.title}
            </h1>

            {/* Subtitle/Excerpt - Slightly larger than body, lighter weight */}
            {blog.excerpt && (
              <p className="text-[20px] sm:text-[24px] leading-[1.4] text-neutral-600 dark:text-neutral-400 mb-8 font-normal">
                {blog.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-[14px] text-neutral-500 dark:text-neutral-500 mb-10 pb-10 border-b border-neutral-200 dark:border-neutral-800">
              <time dateTime={blog.published_at || blog.created_at}>
                {new Date(blog.published_at || blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              {blog.reading_time && <span>·</span>}
              {blog.reading_time && <span>{blog.reading_time} min read</span>}
              <span>·</span>
              <span>{blog.view_count || 0} views</span>
            </div>

            {/* Featured Image - Full width within column */}
            {blog.featured_image_url && (
              <figure className="mb-12 -mx-5 sm:-mx-8">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={blog.featured_image_url || "/placeholder.svg"}
                    alt={blog.title}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </figure>
            )}

            {/* Blog Content - Medium typography style */}
            <div className="medium-article-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Back to Blog */}
            <div className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Read More Articles
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
