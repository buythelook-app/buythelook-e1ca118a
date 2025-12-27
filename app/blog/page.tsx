import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase-server"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Eye, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Fashion Blog - AI Styling Tips & Trends | Buy The Look",
  description:
    "Discover the latest fashion tips, AI-powered style guides, and trends. Expert advice on personalized fashion recommendations and outfit inspiration.",
  keywords: "fashion blog, style tips, AI fashion, styling guide, fashion trends, outfit ideas",
  openGraph: {
    title: "Fashion Blog - AI Styling Tips & Trends",
    description: "Discover the latest fashion tips, AI-powered style guides, and trends.",
    type: "website",
    url: "https://buythelook.app/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashion Blog - AI Styling Tips & Trends",
    description: "Discover the latest fashion tips, AI-powered style guides, and trends.",
  },
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number.parseInt(params.page || "1")
  const limit = 12

  const supabase = await createServerClient()

  const { data: blogs, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://buythelook.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://buythelook.app/blog",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />

      <main className="min-h-screen bg-background">
        <section className="border-b border-border py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Blog</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-balance mb-4 sm:mb-6">
              Fashion <span className="italic text-primary">Insights</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto text-pretty leading-relaxed px-4">
              Discover AI-powered style tips, fashion trends, and expert advice to elevate your wardrobe.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-10 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            {blogs && blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {blogs.map((blog) => (
                    <article
                      key={blog.id}
                      className="group border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 bg-card"
                    >
                      <Link href={`/blog/${blog.slug}`}>
                        {blog.featured_image_url ? (
                          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                            <Image
                              src={blog.featured_image_url || "/placeholder.svg"}
                              alt={blog.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {blog.view_count > 50 && (
                              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Popular
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No image</span>
                          </div>
                        )}

                        <div className="p-4 sm:p-6">
                          <h2 className="font-serif text-xl sm:text-2xl mb-2 sm:mb-3 group-hover:text-primary transition-colors text-balance leading-tight">
                            {blog.title}
                          </h2>

                          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-3 text-pretty leading-relaxed">
                            {blog.excerpt}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t border-border">
                            <span className="flex items-center gap-1 sm:gap-1.5">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {new Date(blog.published_at || blog.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {blog.reading_time && (
                              <span className="flex items-center gap-1 sm:gap-1.5">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                {blog.reading_time} min
                              </span>
                            )}
                            <span className="flex items-center gap-1 sm:gap-1.5">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              {blog.view_count || 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}`}
                        className="px-5 py-2.5 border border-border rounded-lg hover:bg-muted hover:border-primary/20 transition-all font-medium"
                      >
                        Previous
                      </Link>
                    )}

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <Link
                            key={pageNum}
                            href={`/blog?page=${pageNum}`}
                            className={`px-4 py-2.5 border rounded-lg transition-all font-medium ${
                              pageNum === page
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "border-border hover:bg-muted hover:border-primary/20"
                            }`}
                          >
                            {pageNum}
                          </Link>
                        )
                      })}
                    </div>

                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}`}
                        className="px-5 py-2.5 border border-border rounded-lg hover:bg-muted hover:border-primary/20 transition-all font-medium"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-2xl mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground text-lg">Check back soon for fashion insights and style tips!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
