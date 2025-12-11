// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lato, Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { Footer } from "@/components/footer"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "BuyTheLook - Your AI Personal Stylist",
  description: "AI-powered fashion styling. Get complete outfits curated for you. Shop instantly with direct links to every piece. Perfect outfits in minutes.",
  keywords: [
    "AI stylist",
    "personal stylist",
    "outfit generator",
    "fashion AI",
    "style quiz",
    "wardrobe assistant",
    "fashion recommendations",
    "AI fashion",
    "outfit ideas",
    "style advice"
  ],
  authors: [{ name: "BuyTheLook" }],
  creator: "BuyTheLook",
  publisher: "BuyTheLook",
  metadataBase: new URL("https://buythelook.app"),
  alternates: {
    canonical: "https://buythelook.app",
  },
  openGraph: {
    title: "BuyTheLook - Your AI Personal Stylist",
    description: "Complete outfits curated for you. Shop instantly with AI-powered styling.",
    url: "https://buythelook.app",
    siteName: "BuyTheLook",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BuyTheLook - AI Personal Stylist",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyTheLook - Your AI Personal Stylist",
    description: "AI-powered fashion styling. Complete outfits curated for you.",
    images: ["/og-image.jpg"],
    creator: "@buy_the_look__",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://buythelook.app" />
      </head>
      <body
        className={`${lato.variable} ${playfair.variable} ${spaceMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CartProvider>
              <Header />
              {children}
              <Footer />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}