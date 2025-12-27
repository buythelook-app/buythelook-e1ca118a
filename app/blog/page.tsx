import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase-server"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Fashion Blog - Style Tips & Trends | Buy The Look",
  description:
    "Discover the latest fashion tips, style guides, and trends. Expert advice on AI-powered styling and personalized fashion recommendations.",
  openGraph: {
    title: "Fashion Blog - Style Tips & Trends",
    description: "Discover the latest fashion tips, style guides, and trends.",
    type: "website",
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

  // Fetch blogs
  const { data: blogs, count } = await supabase
    .from("blog_posts_with_relationships")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl text-balance mb-4">
            Fashion <span className="italic">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Discover style tips, fashion trends, and expert advice on AI-powered personal styling.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {blogs && blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.featured_image_url ? (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={blog.featured_image_url || "/placeholder.svg"}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Categories */}
                        {blog.categories && blog.categories.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {blog.categories.slice(0, 2).map((cat: any) => (
                              <span key={cat.id} className="text-xs uppercase tracking-wider text-muted-foreground">
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <h2 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors text-balance">
                          {blog.title}
                        </h2>

                        <p className="text-muted-foreground mb-4 line-clamp-2 text-pretty">{blog.excerpt}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.published_at).toLocaleDateString()}
                          </span>
                          {blog.reading_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {blog.reading_time} min
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/blog?page=${page - 1}`}
                      className="px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
                    >
                      Previous
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}`}
                      className={`px-4 py-2 border border-border rounded transition-colors ${
                        pageNum === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}

                  {page < totalPages && (
                    <Link
                      href={`/blog?page=${page + 1}`}
                      className="px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
