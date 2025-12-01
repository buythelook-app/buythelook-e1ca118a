"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Menu, X, ChevronDown, User, LogOut, Coins } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"

export function Header() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [credits, setCredits] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Profile"

  const [isScrolled, setIsScrolled] = useState(false)
  const isHomePage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.7)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setCredits(0)
        return
      }

      try {
        const { data, error } = await supabaseAuth.from("profiles").select("credits").eq("id", user.id).single()

        if (data) {
          setCredits(data.credits ?? 0)
        }
      } catch (err) {
        console.error("Failed to fetch credits:", err)
      }
    }

    fetchCredits()

    window.addEventListener("credits-updated", fetchCredits)
    return () => window.removeEventListener("credits-updated", fetchCredits)
  }, [user])

  const isTransparent = isHomePage && !isScrolled

  const headerBg = isTransparent
    ? "bg-transparent border-transparent"
    : "bg-white/95 backdrop-blur-md border-neutral-200 shadow-sm"

  const textColor = isTransparent ? "text-white" : "text-neutral-900"
  const mutedTextColor = isTransparent ? "text-white/70 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
  const logoColor = isTransparent ? "text-white hover:opacity-80" : "text-neutral-900 hover:opacity-70"

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${headerBg}`}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-6 md:px-12">
        {/* Left Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/quiz"
            className={`text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
              pathname === "/quiz" ? textColor : mutedTextColor
            }`}
          >
            Style Quiz
          </Link>
          <Link
            href="/outfits"
            className={`text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
              pathname === "/outfits" ? textColor : mutedTextColor
            }`}
          >
            Collections
          </Link>
        </nav>

        {/* Center Logo */}
        <Link
          href="/"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl font-serif font-bold tracking-tight transition-all duration-300 ${logoColor}`}
        >
          BuyTheLook
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6 ml-auto md:ml-0">
          {user && (
            <Link
              href="/credits"
              className={`hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mutedTextColor}`}
            >
              <span className={textColor}>{credits}</span> Credits
            </Link>
          )}

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mutedTextColor}`}
              >
                {userName}
                <ChevronDown className={`w-4 h-4 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 shadow-lg"
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors text-neutral-700"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/credits"
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors text-neutral-700"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Coins className="w-4 h-4" />
                    Buy Credits
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setProfileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left hover:bg-neutral-50 transition-colors text-neutral-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`text-xs font-semibold uppercase tracking-wider transition-all duration-300 hidden md:block ${mutedTextColor}`}
            >
              Sign In
            </Link>
          )}

          <button
            className={`md:hidden transition-colors duration-300 ${textColor}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-neutral-200"
        >
          <nav className="flex flex-col px-6 py-4 gap-4">
            <Link
              href="/quiz"
              className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Style Quiz
            </Link>
            <Link
              href="/outfits"
              className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>

            {user && (
              <Link
                href="/credits"
                className="text-sm font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Credits: <span className={textColor}>{credits}</span>
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/credits"
                  className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Buy Credits
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-sm font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}

export default Header
