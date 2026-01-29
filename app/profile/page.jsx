"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Loader2, Edit } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CalendarEvents } from "@/components/calendar-events"
import Link from "next/link"

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [lastQuiz, setLastQuiz] = useState(null)
  const [styledProfile, setStyledProfile] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchProfile()
      fetchLastQuiz()
      fetchStyledProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    const { data, error } = await supabaseAuth.from("profiles").select("*").eq("id", user.id).single()

    if (data) setProfile(data)
  }

  const fetchLastQuiz = async () => {
    const { data, error } = await supabaseAuth
      .from("style_quizzes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (data) setLastQuiz(data)
  }

  const fetchStyledProfile = async () => {
    const { data, error } = await supabaseAuth.from("styled_profiles").select("*").eq("user_id", user.id).single()

    if (data) setStyledProfile(data)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-32">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">Your Atelier</h1>
            <p className="text-muted-foreground uppercase tracking-wider text-xs">
              Member since {new Date(user.created_at).getFullYear()}
            </p>
          </div>

          <div className="grid gap-8">
            <div className="p-8 border border-border bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full">
                  <span className="font-serif text-xl">{user.email[0].toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl">{user.user_metadata.full_name || "Style Icon"}</h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Credits Available</p>
                  <p className="text-3xl font-serif">{profile?.credits ?? 10}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
                  <p className="text-sm font-bold uppercase">Active Member</p>
                </div>
              </div>
            </div>

            {styledProfile && (
              <div className="p-8 border border-border bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl">Your Style DNA</h3>
                  <Link
                    href="/profile/styled-profile"
                    className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {styledProfile.height_cm && (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Height</span>
                      <p className="font-medium">{styledProfile.height_cm} cm</p>
                    </div>
                  )}
                  {styledProfile.weight_kg && (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Weight</span>
                      <p className="font-medium">{styledProfile.weight_kg} kg</p>
                    </div>
                  )}
                  {styledProfile.body_type && (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Body Type</span>
                      <p className="font-medium capitalize">{styledProfile.body_type}</p>
                    </div>
                  )}
                  {styledProfile.face_shape && (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Face Shape</span>
                      <p className="font-medium capitalize">{styledProfile.face_shape}</p>
                    </div>
                  )}
                  {styledProfile.skin_tone && (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Skin Tone</span>
                      <p className="font-medium capitalize">{styledProfile.skin_tone}</p>
                    </div>
                  )}
                  {styledProfile.default_budget && (
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Default Budget</span>
                      <p className="font-medium">{styledProfile.default_budget}</p>
                    </div>
                  )}
                </div>
                {!styledProfile.height_cm && !styledProfile.body_type && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your style profile for better recommendations
                    </p>
                    <Link
                      href="/profile/styled-profile"
                      className="text-xs uppercase tracking-wider underline hover:no-underline"
                    >
                      Set Up Now
                    </Link>
                  </div>
                )}
              </div>
            )}

            {lastQuiz && (
              <div className="p-8 border border-border bg-white/50 backdrop-blur-sm">
                <h3 className="font-serif text-xl mb-4">Last Style Profile</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Occasion:</span>
                    <span className="font-medium capitalize">{lastQuiz.occasion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Budget:</span>
                    <span className="font-medium capitalize">{lastQuiz.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Mood:</span>
                    <span className="font-medium capitalize">{lastQuiz.mood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Created:</span>
                    <span className="font-medium">{new Date(lastQuiz.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 border border-border bg-white/50 backdrop-blur-sm">
              <CalendarEvents />
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push("/credits")}
                className="w-full py-4 border border-black bg-black text-white hover:bg-gray-800 transition-all duration-300 uppercase text-xs tracking-[0.2em] font-medium"
              >
                Buy More Credits
              </button>
              <button
                onClick={() => router.push("/outfits")}
                className="w-full py-4 border border-black bg-white hover:bg-black hover:text-white transition-all duration-300 uppercase text-xs tracking-[0.2em] font-medium"
              >
                View Your Collections
              </button>
              <Link
                href="/profile/styled-profile"
                className="w-full py-4 border border-black/20 bg-white hover:border-black transition-all duration-300 uppercase text-xs tracking-[0.2em] font-medium text-center"
              >
                Edit Style Profile
              </Link>
              <button
                onClick={signOut}
                className="w-full py-4 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-300 uppercase text-xs tracking-[0.2em] font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
