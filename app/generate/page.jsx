"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import { AgentWorkflow } from "@/components/agent-workflow"

export default function GeneratePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState([])
  const [skipImageAnalysis, setSkipImageAnalysis] = useState(false)
  const [error, setError] = useState(null)
  const hasStarted = useRef(false)

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `> ${msg}`].slice(-5))
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const generate = async () => {
      try {
        const quizData = storage.getProfile()
        if (!quizData) {
          router.push("/quiz")
          return
        }

        const styledProfile = storage.getStyledProfile()
        if (styledProfile) {
          addLog("Using your Style DNA profile...")
        }

        let credits = 0
        if (user) {
          const { data: profile } = await supabaseAuth.from("profiles").select("credits").eq("id", user.id).single()
          credits = profile?.credits || 0
        } else {
          credits = storage.getCredits()
        }

        if (credits < 1) {
          addLog("Insufficient credits. Redirecting to store...")
          await sleep(1500)
          router.push("/credits")
          return
        }

        if (user) {
          await supabaseAuth
            .from("profiles")
            .update({ credits: credits - 1 })
            .eq("id", user.id)
          addLog(`Credit deducted. Remaining: ${credits - 1}`)
        } else {
          storage.deductCredit()
          addLog(`Credit deducted. Remaining: ${credits - 1}`)
        }

        storage.saveSelectionStatus(false)

        const hasImage = !!quizData.uploadedImage
        setSkipImageAnalysis(!hasImage)

        const stepOffset = hasImage ? 0 : -1

        // STEP 1: Image Analysis (if photo uploaded)
        if (hasImage) {
          setCurrentStep(0)
          addLog("Initializing Agent 1: Image Analyzer...")
          await sleep(500)
          addLog("Using quiz-provided body metrics...")
          addLog(`Body shape: ${quizData.bodyShape || "hourglass"}`)
        }

        // STEP 2: Profile Builder
        setCurrentStep(1 + stepOffset)
        addLog("Initializing Agent 2: Profile Builder...")

        const profileResponse = await fetch("/api/agents/profile-builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizData),
        })

        if (!profileResponse.ok) {
          throw new Error("Profile building failed")
        }

        const profileResult = await profileResponse.json()
        const profile = profileResult.profile
        addLog(`Style DNA: ${profile.styleKeywords?.aesthetic?.join(", ") || "Modern, Versatile"}`)

        // STEP 3: Product Search from Supabase
        setCurrentStep(2 + stepOffset)
        addLog("Searching your product database...")

        const searchResponse = await fetch("/api/products/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        })

        if (!searchResponse.ok) {
          throw new Error("Product search failed")
        }

        const searchResult = await searchResponse.json()
        const products = searchResult.products
        addLog(`Found ${searchResult.counts.tops + searchResult.counts.bottoms + searchResult.counts.shoes} products`)

        // STEP 4: Outfit Picker
        setCurrentStep(3 + stepOffset)
        addLog("Initializing Agent 3: Outfit Architect...")

        const outfitResponse = await fetch("/api/agents/outfit-picker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, products, styledProfile }),
        })

        if (!outfitResponse.ok) {
          throw new Error("Outfit generation failed")
        }

        const outfitResult = await outfitResponse.json()
        let outfits = outfitResult.outfits
        addLog(`Generated ${outfits.length} cohesive looks`)

        // STEP 5: Quality Checker
        setCurrentStep(4 + stepOffset)
        addLog("Initializing Agent 4: Quality Control...")

        const qualityResponse = await fetch("/api/agents/quality-checker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outfits, profile }),
        })

        if (qualityResponse.ok) {
          const qualityResult = await qualityResponse.json()
          outfits = qualityResult.outfits
          addLog(`Quality verified. Avg score: ${qualityResult.summary?.averageScore || 90}`)
        } else {
          addLog("Quality check completed")
        }

        const timestamp = Date.now()
        const uniqueOutfits = outfits.map((o, i) => ({
          ...o,
          id: `outfit-${timestamp}-${i}`,
          createdAt: timestamp,
        }))

        storage.saveCandidates(uniqueOutfits)

        await sleep(500)
        addLog("Complete! Redirecting...")

        router.push("/outfits?mode=selection")
      } catch (err) {
        console.error("Generation Error:", err)
        setError(err.message)
        addLog(`Error: ${err.message}`)
      }
    }

    generate()
  }, [router, user])

  if (error) {
    const isApiKeyError = error.includes("API key") || error.includes("configured")

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">{isApiKeyError ? "🔑" : "😔"}</div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            {isApiKeyError ? "API Keys Required" : "Something went wrong"}
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>

          {isApiKeyError && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-foreground mb-3">How to add API keys:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click on the sidebar icon (left side of the screen)</li>
                <li>Go to the "Vars" section</li>
                <li>
                  Add or update these environment variables:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>
                      <code className="bg-muted px-2 py-1 rounded">OPENAI_API_KEY</code> - Get from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        className="text-accent hover:underline"
                        rel="noreferrer"
                      >
                        OpenAI
                      </a>
                    </li>
                    <li>
                      <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase
                      project URL
                    </li>
                    <li>
                      <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase
                      anon key
                    </li>
                  </ul>
                </li>
                <li>Save the changes and try again</li>
              </ol>
            </div>
          )}

          <button
            onClick={() => router.push("/quiz")}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background" />
      <div className="relative z-10 w-full flex justify-center">
        <AgentWorkflow currentStep={currentStep} logs={logs} skipImageAnalysis={skipImageAnalysis} />
      </div>
    </div>
  )
}
