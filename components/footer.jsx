"use client"

import Link from "next/link"
import { Instagram, Twitter, Facebook } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  const shopLinks = [
    { label: "Collections", href: "/collections" },
    { label: "Style Quiz", href: "/quiz" },
    { label: "Purchase Credits", href: "/buy-credits" },
  ]

  const supportLinks = [
    { label: "Contact Us", href: "mailto:support@buythelook.com" },
  ]

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo className="h-10 sm:h-12 w-auto" variant="light" />
            </Link>
            <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed max-w-sm mb-8">
              AI styling. Instant shopping. Zero effort.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a 
                  key={label}
                  href={href}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:scale-110 transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-medium">
              Shop
            </h4>
            <ul className="space-y-4">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 font-medium">
              Support
            </h4>
            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs sm:text-sm">
            © 2025 BuyTheLook. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-white/40 hover:text-white text-xs sm:text-sm transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/40 hover:text-white text-xs sm:text-sm transition-colors duration-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
