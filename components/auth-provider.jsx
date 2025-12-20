"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useRouter } from "next/navigation"
import { isWebView, redirectToExternalBrowser } from "@/lib/webview-detect"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInWebView, setIsInWebView] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsInWebView(isWebView())

    // Check active session
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    router.push("/")
  }

  const signInWithGoogle = async () => {
    if (isWebView()) {
      redirectToExternalBrowser()
      return { isWebView: true, redirecting: true }
    }

    const { error } = await supabaseAuth.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:    `https://www.buythelook.app/auth/callback`,
      },
    })
    if (error) throw error
    return { isWebView: false }
  }

  const signUp = async (email, password, fullName) => {
    const { data: existingUser } = await supabaseAuth.from("profiles").select("id").eq("id", email).single()

    if (existingUser) {
      throw new Error("An account with this email already exists. Please sign in instead.")
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `https://buythelook.app/auth/callback`,
      },
    })

    if (error) throw error

    if (data?.user && !data.user.confirmed_at) {
      return { requiresEmailConfirmation: true }
    }

    router.push("/")
  }

  const signOut = async () => {
    await supabaseAuth.auth.signOut()
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, signInWithGoogle, loading, isInWebView }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
