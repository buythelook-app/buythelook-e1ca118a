# Complete Agent System Documentation
## Your AI Fashion Styling Engine - Full Technical Guide

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Before vs After Comparison](#before-vs-after-comparison)
3. [The Four Agents](#the-four-agents)
4. [Fashion Rules System](#fashion-rules-system)
5. [Data Flow](#data-flow)
6. [User Preferences Priority](#user-preferences-priority)
7. [Product Search Integration](#product-search-integration)
8. [Testing & Debugging](#testing--debugging)

---

## System Overview

### What Is This System?

Your app uses **4 AI agents** that work together to create personalized outfit recommendations. Think of them as a team of fashion experts:

1. **Profile Builder** - Analyzes quiz answers and creates a fashion profile
2. **Product Searcher** - Finds relevant clothing items from your database
3. **Outfit Picker** - Combines items into complete outfits
4. **Quality Checker** - Validates and scores each outfit

### The Big Picture Flow

```
User completes quiz
    ↓
Profile Builder creates style profile
    ↓
Product Searcher finds relevant items
    ↓
Outfit Picker creates 3 outfits
    ↓
Quality Checker validates each outfit
    ↓
User sees final recommendations
```

---

## Before vs After Comparison

### BEFORE (The Problem)

**How It Worked:**
- Agents used vague AI prompts like "create flattering outfits"
- No specific fashion rules - just generic instructions
- AI made subjective decisions based on general knowledge
- Inconsistent results for same user profile
- No way to validate if recommendations were actually good

**Example Prompt (Before):**
```
You are a fashion stylist. Create outfits that:
- Flatter the hourglass body type
- Use color theory
- Match the classic style
```

**Problems:**
- What does "flatter" mean exactly?
- Which color theory rules?
- Different AI responses = different interpretations
- No consistency
- No validation

### AFTER (The Solution)

**How It Works Now:**
- Agents use explicit fashion rules defined in constant files
- Specific rules for 6 body types, 3 skin tones, 12 styles
- User-selected colors take priority
- Programmatic validation on top of AI evaluation
- Consistent, expert-level recommendations

**Example Prompt (After):**
```
You are a fashion stylist. Create outfits that:

USER'S PREFERRED COLORS (MANDATORY - USE THESE FIRST):
Selected Colors: Black, Navy, Pink
RULE: At least 2 out of 3 items in each outfit MUST be in these colors.

BODY TYPE RULES (Hourglass):
EMPHASIZE: Defined waist, balanced proportions, curves
AVOID: Boxy, shapeless, oversized, drop-waist
BEST SILHOUETTES: Fitted, wrap, belted, tailored, bodycon
BEST NECKLINES: V-neck, sweetheart, scoop

COLOR THEORY RULES (Warm Skin Tone):
BEST COLORS: Coral, peach, rust, olive, warm browns
AVOID: Icy pastels, pure white, cool grays
NEUTRALS: Cream, camel, chocolate, warm gray

STYLE AESTHETIC RULES (Classic):
KEY PIECES: Blazers, trench coats, shift dresses, pencil skirts
SILHOUETTES: Tailored, structured, timeless
PATTERNS: Stripes, houndstooth, minimal
```

**Benefits:**
- Explicit rules = consistent results
- User preferences are mandatory, not suggestions
- Validation ensures quality
- Explainable recommendations
- Based on proven fashion principles

---

## The Four Agents

### 1. Profile Builder Agent

**Location:** `/app/api/agents/profile-builder/route.ts`

**What It Does:**
Takes quiz answers and creates a structured fashion profile with specific attributes.

**Input:**
```json
{
  "age": "25-34",
  "gender": "female",
  "bodyType": "hourglass",
  "height": "5'4\" - 5'7\"",
  "skinTone": "warm",
  "style": "classic",
  "occasion": "work",
  "budget": "medium",
  "fit": "fitted",
  "selectedColors": ["black", "navy", "pink"]
}
```

**Output:**
```json
{
  "bodyType": "hourglass",
  "styleProfile": {
    "primary": "classic",
    "secondary": ["elegant", "minimalist"]
  },
  "colorStrategy": {
    "primary": ["black", "navy", "pink"],
    "accent": ["white", "gray"],
    "skinTone": "warm"
  },
  "fitPreferences": ["fitted", "tailored"],
  "occasion": "work",
  "budget": "medium"
}
```

**How It Works:**
1. Receives quiz data from the frontend
2. Sends to OpenAI with structured prompt
3. AI analyzes preferences and creates profile
4. Saves profile to Supabase database
5. Returns profile ID

**Key Features:**
- Preserves user's selected colors
- Identifies skin tone for color theory
- Determines primary and secondary styles
- Sets fit preferences

---

### 2. Product Search (Not an Agent - Database Query)

**Location:** `/lib/supabase-products.js`

**What It Does:**
Searches your Supabase products table for relevant items based on style, occasion, and category.

**How It Works:**
```javascript
// Searches for products matching criteria
const products = await supabase
  .from('products')
  .select('*')
  .ilike('style', `%${style}%`)
  .ilike('occasion', `%${occasion}%`)
  .eq('category', category)
  .limit(50)
```

**Search Keywords:**
Based on style profile, it searches for:
- **Classic:** "classic", "tailored", "timeless", "structured"
- **Bohemian:** "boho", "flowy", "relaxed", "ethnic"
- **Minimalist:** "minimal", "simple", "clean", "modern"

**Important:** 
- This is NOT an AI agent - it's a direct database query
- Products must have matching keywords in their database fields
- Returns raw product data (NOT filtered by fashion rules yet)

---

### 3. Outfit Picker Agent (UPDATED)

**Location:** `/app/api/agents/outfit-picker/route.ts`

**What It Does:**
Combines products into complete outfits following explicit fashion rules.

**Input:**
- User's style profile
- 50+ products from database
- Fashion rules for their body type, skin tone, style

**Output:**
```json
{
  "outfits": [
    {
      "top": { "id": "123", "name": "Navy Blazer", "color": "navy" },
      "bottom": { "id": "456", "name": "Black Pants", "color": "black" },
      "shoes": { "id": "789", "name": "Black Pumps", "color": "black" },
      "reasoning": "Navy blazer and black pants create a classic work outfit..."
    }
  ]
}
```

**How It Works (NEW - With Fashion Rules):**

1. **Extract User Attributes:**
```typescript
const bodyType = profile.bodyType || "hourglass"
const skinTone = profile.colorStrategy?.skinTone || "neutral"
const primaryStyle = profile.styleProfile?.primary || "classic"
```

2. **Get Fashion Rules:**
```typescript
const bodyRules = BODY_TYPE_RULES[bodyType]
const colorRules = COLOR_THEORY[skinTone]
const styleRules = STYLE_GUIDELINES[primaryStyle]
```

3. **Get User's Preferred Colors (PRIORITY):**
```typescript
const userColors = profile.colorStrategy?.primary || []
console.log(" User selected colors:", userColors)
```

4. **Build Fashion Rules Section:**
```typescript
const fashionRulesSection = `
USER'S PREFERRED COLORS (MANDATORY):
Selected Colors: ${userColors.join(", ")}
RULE: At least 2 out of 3 items MUST be in these colors.

BODY TYPE RULES (${bodyType}):
EMPHASIZE: ${bodyRules.emphasize.join(", ")}
AVOID: ${bodyRules.avoid.join(", ")}
...
`
```

5. **Send to AI with Explicit Rules:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `You are a fashion stylist...
      
      ${fashionRulesSection}
      
      Create 3 complete outfits that:
      1. Use the user's preferred colors (MANDATORY)
      2. Follow the body type rules
      3. Match the color theory for their skin tone
      4. Fit the style aesthetic
      `
    },
    {
      role: "user",
      content: JSON.stringify(products)
    }
  ]
})
```

**Key Changes from Before:**
- User colors are now MANDATORY (not suggestions)
- Explicit body type rules (not vague "flatter")
- Specific color theory rules (not generic "use color theory")
- Debug logging to track color usage

---

### 4. Quality Checker Agent (UPDATED)

**Location:** `/app/api/agents/quality-checker/route.ts`

**What It Does:**
Validates each outfit against fashion rules and assigns a quality score.

**How It Works (NEW - With Validation):**

1. **Get Fashion Rules:**
```typescript
const bodyRules = BODY_TYPE_RULES[profile.bodyType]
const colorRules = COLOR_THEORY[profile.colorStrategy?.skinTone]
const styleRules = STYLE_GUIDELINES[profile.styleProfile?.primary]
```

2. **Build Validation Criteria:**
```typescript
const fashionRulesSection = `
BODY TYPE VALIDATION (${profile.bodyType}):
✓ MUST include: ${bodyRules.bestSilhouettes.join(", ")}
✗ MUST NOT include: ${bodyRules.avoid.join(", ")}

COLOR VALIDATION (${profile.colorStrategy?.skinTone} skin tone):
✓ MUST use: ${colorRules.bestColors.join(", ")}
✗ MUST AVOID: ${colorRules.avoid.join(", ")}

USER COLOR VALIDATION:
✓ AT LEAST 2 items must be: ${userColors.join(", ")}
`
```

3. **AI Evaluation (70% of score):**
```typescript
const aiResponse = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `Rate this outfit 0-100 based on:
      ${fashionRulesSection}
      `
    }
  ]
})
```

4. **Programmatic Validation (30% of score):**
```typescript
function validateBodyTypeMatch(outfit, bodyRules) {
  let score = 0
  const description = outfit.top.description + outfit.bottom.description
  
  // Check if outfit uses best silhouettes
  bodyRules.bestSilhouettes.forEach(silhouette => {
    if (description.toLowerCase().includes(silhouette)) {
      score += 20 // Award points for following rules
    }
  })
  
  // Check if outfit avoids bad silhouettes
  bodyRules.avoid.forEach(avoid => {
    if (description.toLowerCase().includes(avoid)) {
      score -= 20 // Deduct points for breaking rules
    }
  })
  
  return Math.max(0, Math.min(100, score))
}
```

5. **Combine Scores:**
```typescript
const finalScore = (aiScore * 0.7) + (programmaticScore * 0.3)
```

**Validation Functions:**

```typescript
// Validates body type match
validateBodyTypeMatch(outfit, bodyRules): number

// Validates color theory
validateColorTheory(outfit, colorRules): number

// Validates style aesthetic
validateStyleAesthetic(outfit, styleRules): number

// Validates user color preferences
validateUserColors(outfit, userColors): number
```

**Key Changes from Before:**
- AI evaluation now uses explicit rules (not subjective)
- Added programmatic validation (mathematical scoring)
- User colors are validated separately
- Each outfit gets detailed breakdown of scores

---

## Fashion Rules System

### Three Core Libraries

#### 1. Body Type Rules

**Location:** `/lib/fashion-rules/body-types.ts`

**6 Body Types Defined:**

```typescript
export const BODY_TYPE_RULES = {
  hourglass: {
    emphasize: ["Defined waist", "Balanced proportions", "Curves"],
    avoid: ["Boxy", "Shapeless", "Oversized", "Drop-waist"],
    bestSilhouettes: ["Fitted", "Wrap", "Belted", "Tailored", "Bodycon"],
    bestNecklines: ["V-neck", "Sweetheart", "Scoop", "Wrap"],
    bestFabrics: ["Stretchy", "Fitted knits", "Structured", "Medium weight"],
    searchKeywords: ["fitted", "wrap", "belted", "tailored", "bodycon"]
  },
  
  pear: {
    emphasize: ["Shoulders", "Upper body", "Neckline", "Waist"],
    avoid: ["Tight bottoms", "Bold bottom patterns", "Low-rise", "Tapered pants"],
    bestSilhouettes: ["A-line", "Fit and flare", "Bootcut", "Wide-leg"],
    bestNecklines: ["Boat neck", "Off-shoulder", "Wide collar"],
    bestFabrics: ["Structured tops", "Flowing bottoms", "Darker bottom colors"],
    searchKeywords: ["a-line", "bootcut", "wide-leg", "structured top"]
  },
  
  apple: {
    emphasize: ["Legs", "Arms", "Décolletage", "Shoulders"],
    avoid: ["Clingy midsection", "High necklines", "Belts at waist"],
    bestSilhouettes: ["Empire waist", "Tunic", "Shift", "Straight"],
    bestNecklines: ["V-neck", "Scoop", "U-neck"],
    bestFabrics: ["Flowing", "Draping", "Structured shoulders"],
    searchKeywords: ["empire", "tunic", "shift", "v-neck", "flowing"]
  },
  
  rectangle: {
    emphasize: ["Curves", "Waist definition", "Proportions"],
    avoid: ["Shapeless", "Boxy", "Straight cuts"],
    bestSilhouettes: ["Belted", "Peplum", "Ruffled", "Layered"],
    bestNecklines: ["Sweetheart", "Scoop", "Round"],
    bestFabrics: ["Textured", "Ruffled", "Layered", "Volume"],
    searchKeywords: ["belted", "peplum", "ruffled", "layered", "textured"]
  },
  
  "inverted-triangle": {
    emphasize: ["Lower body", "Hips", "Legs", "Waist"],
    avoid: ["Shoulder emphasis", "Bold top patterns", "Cap sleeves"],
    bestSilhouettes: ["A-line", "Bootcut", "Wide-leg", "Flared"],
    bestNecklines: ["V-neck", "Scoop", "U-neck"],
    bestFabrics: ["Simple tops", "Detailed bottoms", "Flowing skirts"],
    searchKeywords: ["a-line", "bootcut", "v-neck", "simple top"]
  },
  
  athletic: {
    emphasize: ["Waist", "Feminine details", "Curves"],
    avoid: ["Boxy", "Athletic wear style", "Straight cuts"],
    bestSilhouettes: ["Fitted", "Curved", "Peplum", "Belted"],
    bestNecklines: ["Sweetheart", "Scoop", "Round"],
    bestFabrics: ["Soft", "Flowing", "Ruffled", "Feminine"],
    searchKeywords: ["fitted", "curved", "peplum", "feminine", "soft"]
  }
}
```

#### 2. Color Theory Rules

**Location:** `/lib/fashion-rules/color-theory.ts`

**3 Skin Tones Defined:**

```typescript
export const COLOR_THEORY = {
  warm: {
    bestColors: [
      "Coral", "Peach", "Rust", "Terracotta",
      "Olive", "Warm browns", "Golden yellow",
      "Orange-red", "Warm pink"
    ],
    avoid: [
      "Icy pastels", "Pure white", "Cool grays",
      "Neon blue", "Purple undertones"
    ],
    neutrals: ["Cream", "Camel", "Chocolate", "Warm gray", "Ivory"],
    metallics: ["Gold", "Copper", "Bronze"],
    searchKeywords: ["coral", "peach", "rust", "olive", "camel", "gold"]
  },
  
  cool: {
    bestColors: [
      "Navy", "Royal blue", "Emerald",
      "Burgundy", "Cool pink", "Lavender",
      "Icy pastels", "Pure white", "Gray"
    ],
    avoid: [
      "Orange", "Rust", "Golden yellow",
      "Warm browns", "Peach"
    ],
    neutrals: ["Black", "Charcoal", "Cool gray", "Pure white", "Navy"],
    metallics: ["Silver", "Platinum", "White gold"],
    searchKeywords: ["navy", "emerald", "burgundy", "lavender", "silver"]
  },
  
  neutral: {
    bestColors: [
      "Most colors work", "Focus on depth and saturation",
      "Can wear both warm and cool", "Experiment freely"
    ],
    avoid: [
      "Extremely washed out pastels",
      "Colors that clash with undertone"
    ],
    neutrals: ["Black", "White", "Gray", "Beige", "Navy"],
    metallics: ["Gold", "Silver", "Rose gold", "All work"],
    searchKeywords: ["versatile", "classic", "neutral", "timeless"]
  }
}
```

#### 3. Style Guidelines

**Location:** `/lib/fashion-rules/style-guidelines.ts`

**12 Styles Defined:**

```typescript
export const STYLE_GUIDELINES = {
  classic: {
    keyPieces: ["Blazers", "Trench coats", "White shirts", "Pencil skirts"],
    silhouettes: ["Tailored", "Structured", "Timeless", "Clean lines"],
    fabrics: ["Wool", "Cotton", "Silk", "High-quality basics"],
    patterns: ["Stripes", "Houndstooth", "Minimal patterns"],
    colors: ["Navy", "Black", "White", "Camel", "Gray"],
    searchKeywords: ["classic", "tailored", "timeless", "structured"]
  },
  
  bohemian: {
    keyPieces: ["Maxi dresses", "Peasant tops", "Wide-leg pants", "Kimonos"],
    silhouettes: ["Flowy", "Relaxed", "Layered", "Loose"],
    fabrics: ["Cotton", "Linen", "Crochet", "Natural fibers"],
    patterns: ["Paisley", "Floral", "Ethnic prints", "Tie-dye"],
    colors: ["Earth tones", "Warm colors", "Rich jewel tones"],
    searchKeywords: ["boho", "flowy", "relaxed", "ethnic", "natural"]
  },
  
  minimalist: {
    keyPieces: ["Simple tops", "Straight pants", "Clean dresses"],
    silhouettes: ["Simple", "Clean", "Modern", "Understated"],
    fabrics: ["High-quality basics", "Smooth textures"],
    patterns: ["Solid colors", "Minimal patterns"],
    colors: ["Black", "White", "Gray", "Beige", "Muted tones"],
    searchKeywords: ["minimal", "simple", "clean", "modern", "basic"]
  }
  
  // ... 9 more styles defined
}
```

---

## Data Flow

### Complete Journey from Quiz to Outfit

```
1. USER COMPLETES QUIZ
   ↓
   Data: {
     bodyType: "hourglass",
     skinTone: "warm",
     style: "classic",
     selectedColors: ["black", "navy", "pink"]
   }

2. PROFILE BUILDER AGENT
   ↓
   Creates: {
     bodyType: "hourglass",
     colorStrategy: {
       primary: ["black", "navy", "pink"],
       skinTone: "warm"
     },
     styleProfile: { primary: "classic" }
   }
   ↓
   Saves to database: profiles table

3. PRODUCT SEARCH (Database Query)
   ↓
   Searches for: style="classic" + occasion="work"
   ↓
   Returns: 50+ products (tops, bottoms, shoes)

4. OUTFIT PICKER AGENT (WITH RULES)
   ↓
   Gets fashion rules:
   - Body: Hourglass rules (fitted, wrap, avoid boxy)
   - Color: Warm tone rules (coral, peach, avoid icy)
   - Style: Classic rules (tailored, structured)
   - User Colors: black, navy, pink (MANDATORY)
   ↓
   Prompt to AI: "Create outfits using BLACK, NAVY, PINK (mandatory)
                  Follow hourglass rules, warm tone colors, classic style"
   ↓
   Creates: 3 complete outfits

5. QUALITY CHECKER AGENT (WITH VALIDATION)
   ↓
   For each outfit:
   - AI evaluates against rules (70%)
   - Programmatic validation (30%)
     - Body type match score
     - Color theory score
     - User color usage score
     - Style aesthetic score
   ↓
   Returns: {
     outfit: {...},
     score: 87,
     reasoning: "Uses user's navy and black, fitted silhouette..."
   }

6. USER SEES RESULTS
   ↓
   3 outfits, each with:
   - Product images
   - Quality score
   - Reasoning
   - Shop links
```

---

## User Preferences Priority

### The Hierarchy (What Takes Priority)

```
1. USER'S SELECTED COLORS (HIGHEST PRIORITY)
   - Mandatory: 2 out of 3 items must use these colors
   - Example: If user selected black, navy, pink
   - Outfit must have at least 2 items in these colors

2. BODY TYPE RULES
   - Explicit silhouettes to use/avoid
   - Example: Hourglass must wear fitted, avoid boxy

3. COLOR THEORY (Skin Tone)
   - Recommended colors based on undertone
   - Example: Warm skin = coral, peach (but user colors override)

4. STYLE AESTHETIC
   - Overall vibe and key pieces
   - Example: Classic = tailored, structured

5. OCCASION
   - Formality level
   - Example: Work = professional, polished
```

### How It's Enforced in Code

**In Outfit Picker:**
```typescript
const fashionRulesSection = `
USER'S PREFERRED COLORS (MANDATORY - HIGHEST PRIORITY):
Selected Colors: ${userColors.join(", ")}
CRITICAL RULE: At least 2 out of 3 items in each outfit MUST be in these exact colors.
This is a HARD REQUIREMENT. Do not override with color theory.

COLOR THEORY RULES (${skinTone} skin tone) - SECONDARY:
BEST COLORS: ${colorRules.bestColors.join(", ")}
NOTE: Use these colors ONLY for the third item if user's colors don't provide enough options.
User-selected colors ALWAYS take priority.

BODY TYPE RULES (${bodyType}):
EMPHASIZE: ${bodyRules.emphasize.join(", ")}
AVOID: ${bodyRules.avoid.join(", ")}
...
`
```

**In Quality Checker:**
```typescript
// User color validation (separate score)
function validateUserColors(outfit, userColors) {
  let matchCount = 0
  
  if (userColors.includes(outfit.top.color)) matchCount++
  if (userColors.includes(outfit.bottom.color)) matchCount++
  if (userColors.includes(outfit.shoes.color)) matchCount++
  
  if (matchCount >= 2) return 100 // PASS
  if (matchCount === 1) return 50  // PARTIAL
  return 0 // FAIL
}
```

---

## Product Search Integration

### How Products Are Found

**Step 1: Database Schema**
```sql
products table:
- id
- name
- category (top, bottom, shoes, accessory)
- style (classic, bohemian, minimalist, etc.)
- color
- occasion (casual, work, formal, etc.)
- image
- product_url
- description
```

**Step 2: Search Query**
```javascript
// In /lib/supabase-products.js
export async function searchProducts(style, occasion, category) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .ilike('style', `%${style}%`)
    .ilike('occasion', `%${occasion}%`)
    .eq('category', category)
    .limit(50)
  
  return data
}
```

**Step 3: Agent Filters**
```typescript
// In outfit-picker agent
// Filter products with images
const validProducts = allProducts.filter(p => p.image && p.image !== '')

// AI then selects from these valid products
```

### Important Notes

**What's NOT Changed:**
- Product search logic is the same
- Database queries are the same
- No new search keywords added

**What IS Changed:**
- AI now has explicit rules when selecting products
- Better filtering of results
- Validation of selections

**If Products Don't Match:**
The issue is likely:
1. Products in database don't have matching keywords
2. Products don't have the right color values
3. Products don't have occasion/style tags

**Solution:**
Make sure your products table has:
- Accurate color values (match user's selected colors)
- Style keywords (classic, bohemian, etc.)
- Occasion tags (work, casual, formal)

---

## Testing & Debugging

### Console Logs to Check

**1. Profile Builder:**
```
 Profile Builder received request
 Quiz data: { bodyType: "hourglass", ... }
 Profile created successfully
```

**2. Outfit Picker:**
```
 Outfit Picker received request
 User selected colors: ["black", "navy", "pink"]
 Body type: hourglass
 Skin tone: warm
 Primary style: classic
 Fashion Rules Section: ...
 Valid products after filter: 45
 Generated 3 outfits
```

**3. Quality Checker:**
```
 Quality Checker validating outfit
 AI Score: 85
 Programmatic Scores:
  - Body Type: 80
  - Color Theory: 90
  - User Colors: 100
  - Style: 85
 Final Score: 87
```

### How to Debug Color Issues

**Check 1: Are colors saved in profile?**
```javascript
// In browser console
console.log(profile.colorStrategy.primary)
// Should show: ["black", "navy", "pink"]
```

**Check 2: Are colors in prompt?**
```javascript
// Look for in console:
 User selected colors: ["black", "navy", "pink"]
```

**Check 3: Do products have matching colors?**
```sql
-- In Supabase
SELECT name, color FROM products WHERE color IN ('black', 'navy', 'pink')
```

**Check 4: Are outfits using the colors?**
```javascript
// In outfit response
outfit.items.forEach(item => {
  console.log(item.name, item.color)
})
```

### Testing Checklist

- [ ] Complete quiz with specific colors
- [ ] Check console for " User selected colors"
- [ ] Verify prompt includes "USER'S PREFERRED COLORS"
- [ ] Check quality validation for user color score
- [ ] Verify at least 2/3 items match user colors
- [ ] Test with different body types
- [ ] Test with different skin tones
- [ ] Test with different styles

---

## Summary

### What You Have Now

**3 Fashion Rule Libraries:**
1. Body types (6 types with explicit rules)
2. Color theory (3 skin tones with color palettes)
3. Style guidelines (12 styles with key pieces)

**4 AI Agents:**
1. Profile Builder - Creates user profile
2. Product Search - Finds relevant items
3. Outfit Picker - Combines items with rules
4. Quality Checker - Validates with scoring

**Key Improvements:**
- User colors are mandatory (not suggestions)
- Explicit fashion rules (not vague prompts)
- Programmatic validation (not just AI opinion)
- Consistent recommendations (same rules every time)
- Explainable results (can see why outfits were chosen)

### Files Changed

**New Files Created:**
- `/lib/fashion-rules/body-types.ts`
- `/lib/fashion-rules/color-theory.ts`
- `/lib/fashion-rules/style-guidelines.ts`

**Files Updated:**
- `/app/api/agents/outfit-picker/route.ts`
- `/app/api/agents/quality-checker/route.ts`

**Files Unchanged:**
- `/lib/supabase-products.js` (product search)
- `/app/api/agents/profile-builder/route.ts` (profile creation)
- All other files

---

## Quick Reference

### Body Types
- Hourglass: Fitted, wrap, belted
- Pear: A-line, wide-leg, structured tops
- Apple: Empire waist, tunic, flowing
- Rectangle: Belted, peplum, layered
- Inverted Triangle: A-line bottoms, simple tops
- Athletic: Feminine details, soft fabrics

### Skin Tones
- Warm: Coral, peach, rust, gold
- Cool: Navy, emerald, burgundy, silver
- Neutral: Versatile, most colors work

### Styles
- Classic: Tailored, timeless, structured
- Bohemian: Flowy, ethnic, relaxed
- Minimalist: Simple, clean, modern
- Romantic: Feminine, soft, delicate
- Dramatic: Bold, striking, edgy
- And 7 more...

---

**End of Documentation**

Your agent system now operates like a team of fashion experts with explicit rules and validation, ensuring consistent, high-quality outfit recommendations every time.
