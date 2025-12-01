// Simulation of the 4 AI Agents
export const agents = {
  // Agent 1: Image Analyzer (Simulated)
  analyzeImage: async (file) => {
    console.log("[Agent 1] Analyzing image features and body metrics...")
    await new Promise((resolve) => setTimeout(resolve, 3000)) // 3s delay
    console.log("[Agent 1] Analysis complete: Hourglass shape detected (85% confidence)")
    return {
      bodyShape: "Hourglass",
      confidence: 0.85,
      features: ["Defined waist", "Balanced shoulders/hips"],
    }
  },

  // Agent 2: Profile Builder
  buildProfile: async (quizData) => {
    console.log("[Agent 2] Building style profile from quiz data...", quizData)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 2s delay
    console.log("[Agent 2] Profile built. Style DNA: Fitted, Tailored, Minimal")
    return {
      searchQueries: {
        tops: ["fitted blouse", "structured blazer"],
        bottoms: ["high-waisted trousers", "pencil skirt"],
        shoes: ["pointed pumps", "ankle boots"],
      },
      styleRules: ["Emphasize waist", "Monochromatic looks"],
      colorPalette: ["Navy", "Cream", "Gold"],
    }
  },

  // Agent 3: Outfit Picker (The Core)
  generateOutfits: async (profile) => {
    console.log("[Agent 3] Searching market for matching items...")
    await new Promise((resolve) => setTimeout(resolve, 5000)) // 5s delay

    // Mock data that looks like real AI output
    const outfits = [
      {
        id: "outfit-1",
        name: "The Power Meeting",
        totalPrice: 185,
        qualityScore: 94,
        items: [
          {
            id: "p1",
            name: "Satin Lapel Blazer",
            brand: "ASOS DESIGN",
            price: 85,
            image: "/black-blazer.jpg",
            category: "top",
          },
          {
            id: "p2",
            name: "Wide Leg Trousers",
            brand: "Topshop",
            price: 55,
            image: "/beige-trousers.jpg",
            category: "bottom",
          },
          {
            id: "p3",
            name: "Pointed Toe Heels",
            brand: "Aldo",
            price: 45,
            image: "/black-heels.png",
            category: "shoes",
          },
        ],
        whyItWorks: "Sharp tailoring commands authority while the neutral palette maintains professional elegance.",
        stylistNotes: ["Keep the blazer unbuttoned for a relaxed yet powerful look", "Add gold statement earrings"],
      },
      {
        id: "outfit-2",
        name: "Creative Director",
        totalPrice: 160,
        qualityScore: 88,
        items: [
          {
            id: "p4",
            name: "Oversized Silk Shirt",
            brand: "Collusion",
            price: 45,
            image: "/elegant-silk-shirt.jpg",
            category: "top",
          },
          {
            id: "p5",
            name: "Leather Midi Skirt",
            brand: "River Island",
            price: 65,
            image: "/leather-skirt.png",
            category: "bottom",
          },
          {
            id: "p6",
            name: "Chunky Loafers",
            brand: "Dr Martens",
            price: 50,
            image: "/classic-leather-loafers.jpg",
            category: "shoes",
          },
        ],
        whyItWorks: "Mixing textures like silk and leather creates visual interest suitable for creative environments.",
        stylistNotes: ["French tuck the shirt", "Wear with sheer tights"],
      },
      {
        id: "outfit-3",
        name: "Effortless Chic",
        totalPrice: 145,
        qualityScore: 91,
        items: [
          {
            id: "p7",
            name: "Cashmere Blend Sweater",
            brand: "& Other Stories",
            price: 75,
            image: "/grey-sweater.jpg",
            category: "top",
          },
          {
            id: "p8",
            name: "Straight Leg Jeans",
            brand: "Levi's",
            price: 40,
            image: "/classic-blue-jeans.png",
            category: "bottom",
          },
          {
            id: "p9",
            name: "Suede Ankle Boots",
            brand: "Steve Madden",
            price: 30,
            image: "/stylish-ankle-boots.jpg",
            category: "shoes",
          },
        ],
        whyItWorks:
          "Premium fabrics elevate this casual silhouette for a look that works from brunch to casual Friday.",
        stylistNotes: ["Add a silk scarf", "Cuff the jeans slightly"],
      },
    ]

    console.log(`[Agent 3] Generated ${outfits.length} outfits based on profile.`)
    return outfits
  },

  // Agent 4: Quality Checker
  checkQuality: async (outfits) => {
    console.log("[Agent 4] Verifying color harmony and fit compatibility...")
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 2s delay
    // In a real app, this would filter out bad outfits
    // For simulation, we just return true
    console.log("[Agent 4] Quality check passed. All outfits approved.")
    return true
  },
}
