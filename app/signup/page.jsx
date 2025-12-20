"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Eye, EyeOff, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { getWebViewAppName } from "@/lib/webview-detect"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()

  const getPasswordStrength = (value) => {
    let strength = 0
    if (value.length >= 8) strength++
    if (/[a-z]/.test(value)) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^a-zA-Z0-9]/.test(value)) strength++
    return strength
  }

  const validateFullName = (value) => {
    if (!value) return "Full name is required"
    if (value.trim().length < 2) return "Name must be at least 2 characters"
    return ""
  }

  const validateEmail = (value) => {
    if (!value) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return "Please enter a valid email address"
    return ""
  }

  const validatePassword = (value) => {
    if (!value) return "Password is required"
    if (value.length < 8) return "Password must be at least 8 characters"
    if (!/[a-z]/.test(value)) return "Must contain lowercase letters"
    if (!/[A-Z]/.test(value)) return "Must contain uppercase letters"
    if (!/[0-9]/.test(value)) return "Must contain numbers"
    return ""
  }

  const handleFullNameBlur = () => {
    const error = validateFullName(fullName)
    setErrors((prev) => ({ ...prev, fullName: error }))
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

    const fullNameError = validateFullName(fullName)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (fullNameError || emailError || passwordError) {
      setErrors({
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
      })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const result = await signUp(email, password, fullName)
      if (result?.requiresEmailConfirmation) {
        setSuccess(true)
      }
    } catch (e) {
      setErrors({
        submit: e.message || "Failed to create account. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card p-8 rounded-lg border border-border shadow-lg"
        >
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif mb-2 text-foreground">Check Your Email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent a verification link to <strong>{email}</strong>
            </p>
          </div>

          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900 text-sm">
              Click the link in the email to verify your account. Check your spam folder if you don't see it!
            </AlertDescription>
          </Alert>

          <Link
            href="/login"
            className="block w-full py-3 text-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
          >
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColor =
    passwordStrength <= 2 ? "text-destructive" : passwordStrength <= 3 ? "text-yellow-500" : "text-green-500"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg border border-border shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2 text-foreground">Join BuyTheLook</h1>
          <p className="text-muted-foreground text-sm">Create your account and start styling</p>
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

        {/* Google Sign Up Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
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
            <span className="bg-card px-3 text-muted-foreground">Or create with email</span>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleFullNameBlur}
              className={`h-11 rounded-lg ${
                errors.fullName ? "border-destructive focus-visible:ring-destructive/30" : "border-border"
              }`}
            />
            {errors.fullName && (
              <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
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
                placeholder="••••••••••••"
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

            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1 h-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${
                        i < passwordStrength ? strengthColor.replace("text-", "bg-") : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1 text-xs">
                  <div
                    className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {password.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${/[a-z]/.test(password) ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {/[a-z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Lowercase letters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Uppercase letters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {/[0-9]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Numbers
                  </div>
                </div>
              </div>
            )}

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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
