import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  console.log(" Generating robots.txt...")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  console.log(" Robots.txt base URL:", baseUrl)

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*", "/quiz", "/generate"],
        disallow: ["/admin", "/admin/*", "/api/*", "/profile", "/outfits"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}