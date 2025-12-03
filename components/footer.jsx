"use client"

import Link from "next/link"
import { Instagram, Twitter, Facebook } from "lucide-react"
import Logo from './logo'
export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white text-black">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo className="h-16 w-auto" variant="dark" />
            </Link>
            <p className="text-sm leading-relaxed text-black/60 max-w-md mb-8">
             AI styling. Instant shopping. Zero effort.


            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/buy_the_look__"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/40 hover:text-black transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/40 hover:text-black transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/40 hover:text-black transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black/40">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/outfits" className="hover:text-black/60 transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-black/60 transition-colors">
                  Style Quiz
                </Link>
              </li>
              <li>
                <Link href="/credits" className="hover:text-black/60 transition-colors">
                  Purchase Credits
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black/40">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:support@buythelook.com" className="hover:text-black/60 transition-colors">
                  Contact Us
                </a>
              </li>
              {/* <li>
                <Link href="/faq" className="hover:text-black/60 transition-colors">
                  FAQs
                </Link>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-black/40">
          <p>© 2025 BuyTheLook. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
