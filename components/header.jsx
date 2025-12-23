"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect, useRef } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { ChevronDown, User, LogOut, Coins } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/logo"

export function Header() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [credits, setCredits] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const { user, signOut } = useAuth()
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Profile"
  const profileRef = useRef(null)
  const lastScrollY = useRef(0)
  const heroEndY = useRef(typeof window !== "undefined" ? window.innerHeight : 800)

  const isHomePage = pathname === "/" || pathname === "/test"

useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Header is transparent when at top of homepage, solid everywhere else
      if (isHomePage) {
        // Stay transparent for the entire viewport height (hero section)
        setIsAtTop(currentScrollY < window.innerHeight - 80)
      } else {
        setIsAtTop(false)
      }

      // Hide/show header on scroll
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false)
        setProfileMenuOpen(false)
      }

      lastScrollY.current = currentScrollY
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isHomePage])

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setCredits(0)
        return
      }
      try {
        const { data } = await supabaseAuth.from("profiles").select("credits").eq("id", user.id).single()
        if (data) setCredits(data.credits ?? 0)
      } catch (err) {
        console.error("Failed to fetch credits:", err)
      }
    }

    fetchCredits()
    window.addEventListener("credits-updated", fetchCredits)
    return () => window.removeEventListener("credits-updated", fetchCredits)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isTransparent = isHomePage && isAtTop && !isMenuOpen

  const menuVariants = {
    closed: { clipPath: "circle(0% at calc(100% - 40px) 40px)" },
    open: { clipPath: "circle(150% at calc(100% - 40px) 40px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  }

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.1, duration: 0.5 } })
  }

  return (
    <>
      {/* Desktop Header */}
     <motion.header
  initial={{ y: -100 }}
  animate={{ y: isVisible ? 0 : -100 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  className={[
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
    isTransparent
      ? "bg-transparent"
      : "bg-background/95 backdrop-blur-md border-b border-border/10 shadow-sm",
  ].join(" ")}
>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/quiz"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isTransparent ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Style Quiz
              </Link>
              <Link
                href="/collections"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isTransparent ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Collections
              </Link>
            </nav>

            {/* Center Logo */}
              {/* Center Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Logo 
                variant={isTransparent ? "light" : "dark"}
                className="h-12 transition-all duration-500" 
              />
            </Link>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-6">
              {user && (
                <div className={`flex items-center gap-2 text-xs font-semibold ${
                  isTransparent ? "text-white/80" : "text-neutral-600"
                }`}>
                  <Coins className="w-4 h-4" />
                  {credits} Credits
                </div>
              )}

              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isTransparent ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {userName}
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/credits"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors"
                        >
                          <Coins className="w-4 h-4" />
                          Buy Credits
                        </Link>
                        <button
                          onClick={() => { signOut(); setProfileMenuOpen(false) }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left hover:bg-neutral-50 transition-colors text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isTransparent ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center"
            >
              <div className="flex flex-col gap-1.5">
                <motion.span
                  animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
                  className={`block w-6 h-0.5 ${isMenuOpen ? "bg-neutral-900" : isTransparent ? "bg-white" : "bg-neutral-900"}`}
                />
                <motion.span
                  animate={{ opacity: isMenuOpen ? 0 : 1 }}
                  className={`block w-6 h-0.5 ${isTransparent ? "bg-white" : "bg-neutral-900"}`}
                />
                <motion.span
                  animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
                  className={`block w-6 h-0.5 ${isMenuOpen ? "bg-neutral-900" : isTransparent ? "bg-white" : "bg-neutral-900"}`}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-white flex items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-8">
              {[
                { href: "/quiz", label: "Style Quiz" },
                { href: "/collections", label: "Collections" },
                ...(user ? [
                  { href: "/profile", label: "Profile" },
                  { href: "/credits", label: `Credits: ${credits}` }
                ] : []),
                user ? { href: "#", label: "Sign Out", onClick: signOut } : { href: "/auth", label: "Sign In" }
              ].map((item, i) => (
                <motion.div key={item.label} variants={linkVariants} custom={i}>
                  {item.onClick ? (
                    <button
                      onClick={() => { item.onClick(); setIsMenuOpen(false) }}
                      className="text-4xl md:text-5xl font-serif tracking-tight text-neutral-900 hover:text-neutral-500 transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-4xl md:text-5xl font-serif tracking-tight text-neutral-900 hover:text-neutral-500 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>

            <div className="absolute bottom-12 left-0 right-0 text-center">
              <p className="text-sm text-neutral-400 tracking-widest uppercase">
                AI Styling • Instant Shopping
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
