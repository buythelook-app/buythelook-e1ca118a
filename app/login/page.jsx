"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { getWebViewAppName } from "@/lib/webview-detect"
import { ExternalLink, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()

  const validateEmail = (value) => {
    if (!value) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return "Please enter a valid email address"
    return ""
  }

  const validatePassword = (value) => {
    if (!value) return "Password is required"
    if (value.length < 6) return "Password must be at least 6 characters"
    return ""
  }

  const handleEmailBlur = () => {
    const error = validateEmail(email)
    setErrors((prev) => ({ ...prev, email: error }))
  }

  const handlePasswordBlur = () => {
    const error = validatePassword(password)
    setErrors((prev) => ({ ...prev, password: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (e) {
      setErrors({
        submit: e.message || "Failed to sign in. Please check your credentials.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrors({})
    setGoogleLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result?.isWebView) {
        setIsRedirecting(true)
        setTimeout(() => {
          setIsRedirecting(false)
          setGoogleLoading(false)
        }, 5000)
        return
      }
    } catch (e) {
      setErrors({ submit: e.message })
      setGoogleLoading(false)
    }
  }

  if (isRedirecting) {
    const appName = getWebViewAppName()
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card p-8 rounded-lg border border-border shadow-lg text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-6"
          />
          <h1 className="text-2xl font-serif mb-3">Opening Browser</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Google Sign-In doesn't work in {appName}. We're opening your browser now...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-4 h-4" />
            <span>Redirecting to external browser</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg border border-border shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2 text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your BuyTheLook account</p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg mb-6 flex gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errors.submit}</span>
          </motion.div>
        )}

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full mb-6 h-12 rounded-lg border-border hover:bg-accent bg-transparent"
        >
          {googleLoading ? (
            "Connecting..."
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground">Or sign in with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                className={`h-11 rounded-lg ${
                  errors.email ? "border-destructive focus-visible:ring-destructive/30" : "border-border"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                className={`h-11 rounded-lg pr-10 ${
                  errors.password ? "border-destructive focus-visible:ring-destructive/30" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
