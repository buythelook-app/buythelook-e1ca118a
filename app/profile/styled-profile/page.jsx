"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button" // Import Button component

export default function StyledProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [styledProfile, setStyledProfile] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    body_type: "",
    face_shape: "",
    skin_tone: "",
    default_budget: "",
    default_occasion: "",
    preferred_colors: [],
    avoided_colors: [],
  })

  const colorOptions = [
    { name: "black", hex: "#000000" },
    { name: "white", hex: "#FFFFFF" },
    { name: "navy", hex: "#001F3F" },
    { name: "gray", hex: "#808080" },
    { name: "beige", hex: "#F5F5DC" },
    { name: "brown", hex: "#8B4513" },
    { name: "red", hex: "#DC143C" },
    { name: "burgundy", hex: "#800020" },
    { name: "pink", hex: "#FFC0CB" },
    { name: "orange", hex: "#FF8C00" },
    { name: "yellow", hex: "#FFD700" },
    { name: "green", hex: "#228B22" },
    { name: "olive", hex: "#808000" },
    { name: "teal", hex: "#008080" },
    { name: "blue", hex: "#0000FF" },
    { name: "purple", hex: "#800080" },
    { name: "lavender", hex: "#E6E6FA" },
    { name: "cream", hex: "#FFFDD0" },
  ]

  const toggleColor = (colorName, type) => {
    const field = type === "preferred" ? "preferred_colors" : "avoided_colors"
    const currentColors = styledProfile[field] || []

    if (currentColors.includes(colorName)) {
      setStyledProfile({
        ...styledProfile,
        [field]: currentColors.filter((c) => c !== colorName),
      })
    } else {
      setStyledProfile({
        ...styledProfile,
        [field]: [...currentColors, colorName],
      })
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchStyledProfile()
    }
  }, [user, loading, router])

  const fetchStyledProfile = async () => {
    console.log(" Styled Profile: Fetching profile for user:", user.id)
    const { data, error } = await supabaseAuth.from("styled_profiles").select("*").eq("user_id", user.id).single()

    if (data) {
      console.log(" Styled Profile: Profile fetched:", data)

      const parseColors = (colorData) => {
        if (!colorData) return []
        if (Array.isArray(colorData)) return colorData
        if (typeof colorData === "string") return colorData.split(",").filter(Boolean)
        return []
      }

      setStyledProfile({
        age: data.age || "",
        gender: data.gender || "",
        height_cm: data.height_cm || "",
        weight_kg: data.weight_kg || "",
        body_type: data.body_type || "",
        face_shape: data.face_shape || "",
        skin_tone: data.skin_tone || "",
        default_budget: data.default_budget || "",
        default_occasion: data.default_occasion || "",
        preferred_colors: parseColors(data.preferred_colors),
        avoided_colors: parseColors(data.avoided_colors),
      })
      setIsEditing(false)
    } else if (error && error.code !== "PGRST116") {
      console.error(" Styled Profile: Fetch error:", error)
    } else {
      console.log(" Styled Profile: No profile found, starting in edit mode")
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const profileToSave = {
      user_id: user.id,
      age: styledProfile.age || null,
      gender: styledProfile.gender || null,
      height_cm: styledProfile.height_cm || null,
      weight_kg: styledProfile.weight_kg || null,
      body_type: styledProfile.body_type || null,
      face_shape: styledProfile.face_shape || null,
      skin_tone: styledProfile.skin_tone || null,
      default_budget: styledProfile.default_budget || null,
      default_occasion: styledProfile.default_occasion || null,
      preferred_colors: Array.isArray(styledProfile.preferred_colors)
        ? styledProfile.preferred_colors.join(",")
        : styledProfile.preferred_colors || "",
      avoided_colors: Array.isArray(styledProfile.avoided_colors)
        ? styledProfile.avoided_colors.join(",")
        : styledProfile.avoided_colors || "",
      updated_at: new Date().toISOString(),
    }

    console.log(" Styled Profile: Saving profile:", profileToSave)

    const { error } = await supabaseAuth.from("styled_profiles").upsert(profileToSave, { onConflict: "user_id" })

    setSaving(false)

    if (error) {
      console.error(" Styled Profile: Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save your styled profile: " + error.message,
        variant: "destructive",
      })
    } else {
      console.log(" Styled Profile: Successfully saved!")
      toast({
        title: "Saved!",
        description: "Your styled profile has been updated.",
      })
      setIsEditing(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isEditing && styledProfile.body_type) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-32">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-serif">Your Style DNA</h1>
              <p className="text-muted-foreground text-sm">
                This information helps us recommend the perfect fit every time.
              </p>
            </div>

            <div className="p-8 border border-border bg-white/50 backdrop-blur-sm space-y-8">
              <div>
                <h3 className="font-serif text-xl mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Age</p>
                    <p className="text-lg">{styledProfile.age || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Gender</p>
                    <p className="text-lg capitalize">{styledProfile.gender || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="font-serif text-xl mb-4">Physical Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Height</p>
                    <p className="text-lg">{styledProfile.height_cm ? `${styledProfile.height_cm} cm` : "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Weight</p>
                    <p className="text-lg">{styledProfile.weight_kg ? `${styledProfile.weight_kg} kg` : "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Body Type</p>
                    <p className="text-lg capitalize">{styledProfile.body_type || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Face Shape</p>
                    <p className="text-lg capitalize">{styledProfile.face_shape || "Not set"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Skin Tone</p>
                    <p className="text-lg capitalize">{styledProfile.skin_tone || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="font-serif text-xl mb-4">Color Preferences</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Preferred Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {styledProfile.preferred_colors?.length > 0 ? (
                        styledProfile.preferred_colors.map((color) => (
                          <span key={color} className="px-3 py-1 bg-accent/10 text-sm capitalize rounded">
                            {color}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No preferences set</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Colors to Avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {styledProfile.avoided_colors?.length > 0 ? (
                        styledProfile.avoided_colors.map((color) => (
                          <span key={color} className="px-3 py-1 bg-destructive/10 text-sm capitalize rounded">
                            {color}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">None set</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="font-serif text-xl mb-4">Default Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Default Budget</p>
                    <p className="text-lg">{styledProfile.default_budget || "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Default Occasion</p>
                    <p className="text-lg">{styledProfile.default_occasion || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-border">
                <Button
                  onClick={() => setIsEditing(true)}
                  size="lg"
                  className="px-8 bg-black text-white hover:bg-zinc-800"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-32">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">Your Style DNA</h1>
            <p className="text-muted-foreground text-sm">
              These measurements help us recommend the perfect fit every time. This information is private and only used
              to improve your recommendations.
            </p>
          </div>

          <div className="p-8 border border-border bg-white/50 backdrop-blur-sm space-y-8">
            <div>
              <h3 className="font-serif text-xl mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Age</label>
                  <input
                    type="number"
                    value={styledProfile.age}
                    onChange={(e) => setStyledProfile({ ...styledProfile, age: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Gender</label>
                  <select
                    value={styledProfile.gender}
                    onChange={(e) => setStyledProfile({ ...styledProfile, gender: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="font-serif text-xl mb-4">Physical Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Height (cm)</label>
                  <input
                    type="number"
                    value={styledProfile.height_cm}
                    onChange={(e) => setStyledProfile({ ...styledProfile, height_cm: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                    placeholder="170"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Weight (kg)</label>
                  <input
                    type="number"
                    value={styledProfile.weight_kg}
                    onChange={(e) => setStyledProfile({ ...styledProfile, weight_kg: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                    placeholder="65"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Body Type</label>
                  <select
                    value={styledProfile.body_type}
                    onChange={(e) => setStyledProfile({ ...styledProfile, body_type: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="athletic">Athletic</option>
                    <option value="slim">Slim</option>
                    <option value="curvy">Curvy</option>
                    <option value="plus-size">Plus-Size</option>
                    <option value="hourglass">Hourglass</option>
                    <option value="pear">Pear</option>
                    <option value="apple">Apple</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Face Shape</label>
                  <select
                    value={styledProfile.face_shape}
                    onChange={(e) => setStyledProfile({ ...styledProfile, face_shape: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="oval">Oval</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="heart">Heart</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Skin Tone</label>
                  <select
                    value={styledProfile.skin_tone}
                    onChange={(e) => setStyledProfile({ ...styledProfile, skin_tone: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="fair">Fair</option>
                    <option value="medium">Medium</option>
                    <option value="olive">Olive</option>
                    <option value="tan">Tan</option>
                    <option value="dark">Dark</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="font-serif text-xl mb-4">Color Preferences</h3>
              <p className="text-xs text-muted-foreground mb-6">Click colors you love and colors you prefer to avoid</p>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Preferred Colors</label>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={`pref-${color.name}`}
                        type="button"
                        onClick={() => toggleColor(color.name, "preferred")}
                        className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                          styledProfile.preferred_colors?.includes(color.name)
                            ? "border-green-500 shadow-lg scale-105"
                            : "border-border hover:border-black/30"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {styledProfile.preferred_colors?.includes(color.name) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {styledProfile.preferred_colors?.map((color) => (
                      <span key={color} className="px-2 py-1 bg-green-500/10 text-xs capitalize rounded">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Colors to Avoid</label>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={`avoid-${color.name}`}
                        type="button"
                        onClick={() => toggleColor(color.name, "avoided")}
                        className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                          styledProfile.avoided_colors?.includes(color.name)
                            ? "border-red-500 shadow-lg scale-105"
                            : "border-border hover:border-black/30"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {styledProfile.avoided_colors?.includes(color.name) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {styledProfile.avoided_colors?.map((color) => (
                      <span key={color} className="px-2 py-1 bg-red-500/10 text-xs capitalize rounded">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="font-serif text-xl mb-4">Default Preferences</h3>
              <p className="text-xs text-muted-foreground mb-6">
                These are your go-to choices. You can override them in each quiz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Default Budget</label>
                  <select
                    value={styledProfile.default_budget}
                    onChange={(e) => setStyledProfile({ ...styledProfile, default_budget: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="Under $100">Under $100</option>
                    <option value="$100-$300">$100-$300</option>
                    <option value="$300-$500">$300-$500</option>
                    <option value="$500+">$500+</option>
                    <option value="Luxury">Luxury (No Limit)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Default Occasion</label>
                  <select
                    value={styledProfile.default_occasion}
                    onChange={(e) => setStyledProfile({ ...styledProfile, default_occasion: e.target.value })}
                    className="w-full px-4 py-3 border-b border-black/20 bg-transparent focus:border-black outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="Casual">Casual</option>
                    <option value="Work">Work / Business</option>
                    <option value="Evening">Evening Out</option>
                    <option value="Formal">Formal Event</option>
                    <option value="Date Night">Date Night</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-border">
              {styledProfile.body_type && (
                <Button onClick={() => setIsEditing(false)} variant="outline" size="lg">
                  Cancel
                </Button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 ml-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
