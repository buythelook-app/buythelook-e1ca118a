// Simulation of a database using localStorage
const STORAGE_KEYS = {
  USER_PROFILE: "btl_user_profile",
  OUTFITS: "btl_outfits",
  CANDIDATES: "btl_candidates", // Added candidates key
  CREDITS: "btl_credits",
  USER: "btl_user",
}

export const storage = {
  saveProfile: (profile) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
  },

  getProfile: () => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
    return data ? JSON.parse(data) : null
  },

  saveOutfits: (outfits) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits))
  },

  getOutfits: () => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.OUTFITS)
    return data ? JSON.parse(data) : []
  },

  saveCandidates: (outfits) => {
    // Added saveCandidates
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(outfits))
  },

  getCandidates: () => {
    // Added getCandidates
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES)
    return data ? JSON.parse(data) : []
  },

  clearCandidates: () => {
    // Added clearCandidates
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES)
  },

  saveUnlockedOutfits: (ids) => {
    if (typeof window === "undefined") return
    localStorage.setItem("btl_unlocked_outfits", JSON.stringify(ids))
  },

  getUnlockedOutfits: () => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("btl_unlocked_outfits")
    return data ? JSON.parse(data) : []
  },

  savePaidOutfits: (ids) => {
    if (typeof window === "undefined") return
    localStorage.setItem("btl_paid_outfits", JSON.stringify(ids))
  },

  clearPaidOutfits: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("btl_paid_outfits")
  },

  getPaidOutfits: () => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("btl_paid_outfits")
    return data ? JSON.parse(data) : []
  },

  saveSelectionStatus: (status) => {
    if (typeof window === "undefined") return
    localStorage.setItem("btl_selection_complete", JSON.stringify(status))
  },

  getSelectionStatus: () => {
    if (typeof window === "undefined") return false
    const data = localStorage.getItem("btl_selection_complete")
    return data ? JSON.parse(data) : false
  },

  getCredits: () => {
    if (typeof window === "undefined") return 0
    const data = localStorage.getItem(STORAGE_KEYS.CREDITS)
    // Default to 3 credits if not set
    return data !== null ? Number.parseInt(data) : 3
  },

  deductCredit: () => {
    const current = storage.getCredits()
    if (current > 0) {
      localStorage.setItem(STORAGE_KEYS.CREDITS, (current - 1).toString())
      window.dispatchEvent(new Event("credits-updated"))
      return true
    }
    return false
  },

  addCredits: (amount) => {
    const current = storage.getCredits()
    localStorage.setItem(STORAGE_KEYS.CREDITS, (current + amount).toString())
    window.dispatchEvent(new Event("credits-updated"))
  },

  purchaseService: () => {
    // In a real app, this would process payment first
    // For now, just add 1 credit after $5 payment
    storage.addCredits(1)
    return true
  },

  saveQuizId: (quizId) => {
    if (typeof window === "undefined") return
    localStorage.setItem("btl_last_quiz_id", quizId)
  },

  getQuizId: () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("btl_last_quiz_id")
  },

  saveStyledProfile: (profile) => {
    if (typeof window === "undefined") return
    localStorage.setItem("btl_styled_profile", JSON.stringify(profile))
  },

  getStyledProfile: () => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem("btl_styled_profile")
    return data ? JSON.parse(data) : null
  },

  clearStyledProfile: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("btl_styled_profile")
  },
}
