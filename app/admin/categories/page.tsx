"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabaseAuth } from "@/lib/supabase-auth-client"

export default function AdminCategoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        router.push("/sign-in")
        return
      }

      // Check if user is admin
      const { data: profile } = await supabaseAuth.from("profiles").select("is_admin").eq("id", user.id).single()

      if (profile?.is_admin) {
        setIsAdmin(true)
      } else {
        router.push("/sign-in")
      }
      setLoading(false)
    }

    checkAdmin()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-serif text-4xl mb-2">Categories & Tags</h1>
        <p className="text-muted-foreground mb-8">Manage blog categories and tags (Coming Soon)</p>

        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Category and tag management will be available in the next update</p>
        </div>

        <div className="mt-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
