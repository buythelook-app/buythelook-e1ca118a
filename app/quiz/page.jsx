"use client"

import { QuizFlow } from "@/components/quiz-flow"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { storage } from "@/lib/storage"
import OnboardingTour from "@/components/onboarding-tour"

export default function QuizPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [styledProfile, setStyledProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [useProfile, setUseProfile] = useState(null)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [quickFormData, setQuickFormData] = useState({
    budget: "",
    occasion: "",
    additionalNotes: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/quiz")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabaseAuth.from("styled_profiles").select("*").eq("user_id", user.id).single()

        setStyledProfile(data)
        setLoadingProfile(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  const handleUseProfileClick = () => {
    setShowQuickForm(true)
  }

  const handleQuickFormSubmit = async () => {
    const finalProfile = {
      ...styledProfile,
      override_budget: quickFormData.budget || styledProfile.default_budget,
      override_occasion: quickFormData.occasion || styledProfile.default_occasion,
      additional_notes: quickFormData.additionalNotes,
    }

    // Save directly to storage and navigate to generate
    storage.saveProfile({
      ...finalProfile,
      budget: finalProfile.override_budget,
      occasion: finalProfile.override_occasion,
    })

    // Save to database
    if (user) {
      try {
        const quizRecord = {
          user_id: user.id,
          vision: JSON.stringify(finalProfile),
          budget: finalProfile.override_budget,
          occasion: finalProfile.override_occasion,
          mood: finalProfile.default_occasion,
        }

        const { data } = await supabaseAuth.from("style_quizzes").insert([quizRecord]).select().single()
        storage.saveQuizId(data.id)
        storage.saveStyledProfile(styledProfile)
      } catch (error) {
        console.error(" Error saving quick quiz:", error)
      }
    }

    router.push("/generate")
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (styledProfile && useProfile === null && !showQuickForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif">Use Your Style Profile?</h2>
            <p className="text-muted-foreground">
              We found your saved style profile with body measurements and preferences. Would you like us to use this
              information to create more personalized outfit recommendations?
            </p>
          </div>

          <div className="bg-card border border-border p-6 space-y-2 text-left">
            <p className="text-sm">
              <span className="font-medium">Body Type:</span> {styledProfile.body_type || "Not set"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Default Budget:</span> {styledProfile.default_budget || "Not set"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Default Occasion:</span> {styledProfile.default_occasion || "Not set"}
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setUseProfile(false)} variant="outline" size="lg" className="flex-1 border-2">
              No, Start Fresh
            </Button>
            <Button onClick={handleUseProfileClick} size="lg" className="flex-1 bg-black text-white hover:bg-zinc-800">
              Yes, Use Profile
            </Button>
          </div>

          <Link href="/profile/styled-profile" className="text-sm text-muted-foreground hover:underline block">
            Edit Style Profile
          </Link>
        </div>
      </div>
    )
  }

  if (showQuickForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-serif">Quick Customization</h2>
            <p className="text-muted-foreground">
              Your profile is ready to use! Optionally override budget or occasion for this look.
            </p>
          </div>

          <div className="bg-card border border-border p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget (Optional)</label>
              <select
                value={quickFormData.budget}
                onChange={(e) => setQuickFormData({ ...quickFormData, budget: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background rounded"
              >
                <option value="">Use Default ({styledProfile.default_budget})</option>
                <option value="Under $100">Under $100</option>
                <option value="$100-$300">$100-$300</option>
                <option value="$300-$500">$300-$500</option>
                <option value="$500+">$500+</option>
                <option value="Luxury">Luxury (No Limit)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Occasion (Optional)</label>
              <select
                value={quickFormData.occasion}
                onChange={(e) => setQuickFormData({ ...quickFormData, occasion: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background rounded"
              >
                <option value="">Use Default ({styledProfile.default_occasion})</option>
                <option value="Casual">Casual</option>
                <option value="Work">Work / Business</option>
                <option value="Evening">Evening Out</option>
                <option value="Formal">Formal Event</option>
                <option value="Date Night">Date Night</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes (Optional)</label>
              <textarea
                value={quickFormData.additionalNotes}
                onChange={(e) => setQuickFormData({ ...quickFormData, additionalNotes: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background rounded min-h-[100px]"
                placeholder="E.g., I want something more colorful today, or prefer neutral tones..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setShowQuickForm(false)} variant="outline" size="lg" className="flex-1">
              Back
            </Button>
            <Button onClick={handleQuickFormSubmit} size="lg" className="flex-1 bg-black text-white hover:bg-zinc-800">
              Generate Outfits
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <OnboardingTour />
      <QuizFlow styledProfile={useProfile ? styledProfile : null} />
    </main>
  )
}
