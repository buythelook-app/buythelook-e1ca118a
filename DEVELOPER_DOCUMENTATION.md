# BuyTheLook - Fashion AI Platform
## מסמך דרישות למפתח

---

## 1. תיאור כללי הפרויקט

**BuyTheLook** היא פלטפורמת אופנה מתקדמת המשלבת בינה מלאכותית ליצירת המלצות לוקים מותאמות אישית. המערכת משתמשת ב-8 Agents שונים כדי לנתח את סגנון המשתמש, מבנה הגוף, העדפות צבעים ומצב רוח, וליצור המלצות לתלבושות מלאות.

### ערך ייחודי
- המלצות מותאמות אישית על בסיס AI
- שילוב של מספר agents לניתוח רב-ממדי
- מערכת למידה מתמשכת מפידבק משתמשים
- אינטגרציה עם קטלוגים חיצוניים (Zara, ASOS)

---

## 2. סטק טכנולוגי

### Frontend
- **React 18.3.1** - ספריית UI ראשית
- **TypeScript** - שפת פיתוח
- **Vite** - כלי build ו-dev server
- **Tailwind CSS** - עיצוב ו-styling
- **shadcn/ui** - קומפוננטות UI מוכנות
- **React Router Dom** - ניהול routing
- **TanStack Query** - ניהול state מהשרת
- **Framer Motion** - אנימציות
- **Zustand** - state management (למועדפים)

### Backend & Infrastructure
- **Supabase** - בסיס נתונים, אימות, edge functions
  - Project ID: `aqkeprwxxsryropnhfvm`
  - PostgreSQL Database
  - Authentication & User Management
  - Edge Functions (Deno)
- **Lovable AI Gateway** - גישה למודלי AI
  - Google Gemini 2.5
  - OpenAI GPT-5

### Mobile
- **Capacitor 7** - יצירת אפליקציות native
- תמיכה ב-Android ו-iOS

### External APIs
- **SerpAPI** - חיפוש מוצרים
- **RapidAPI** - אינטגרציה עם קטלוגים
- **Google Calendar API** - סנכרון לוח שנה

---

## 3. מבנה הפרויקט

```
project-root/
├── src/
│   ├── agents/              # AI Agents system
│   │   ├── personalizationAgent.ts
│   │   ├── stylingAgent.ts
│   │   ├── validatorAgent.ts
│   │   ├── recommendationAgent.ts
│   │   ├── supervisorAgent.ts
│   │   ├── trainerAgent.ts
│   │   ├── learningAgent.ts
│   │   ├── feedbackLearningAgent.ts
│   │   ├── crew.ts          # ניהול זרימת ה-agents
│   │   └── README.md        # תיעוד מפורט של המערכת
│   │
│   ├── components/          # React components
│   │   ├── auth/           # קומפוננטות אימות
│   │   ├── cart/           # עגלת קניות
│   │   ├── filters/        # מסננים ובחירות
│   │   ├── look/           # תצוגת לוקים
│   │   ├── payments/       # תשלומים ו-Premium
│   │   ├── quiz/           # שאלון סגנון
│   │   └── ui/             # shadcn components
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useOutfitGeneration.ts
│   │   ├── usePersonalizedLooks.ts
│   │   ├── useCreditsSystem.ts
│   │   ├── usePremiumLookPass.ts
│   │   └── auth/           # hooks לאימות
│   │
│   ├── pages/              # דפי האפליקציה
│   │   ├── Index.tsx       # דף בית
│   │   ├── Auth.tsx        # התחברות/הרשמה
│   │   ├── FashionResultsPage.tsx
│   │   ├── OutfitGenerationPage.tsx
│   │   └── [...]
│   │
│   ├── services/           # Business logic
│   │   ├── outfitGenerationService.ts
│   │   ├── colorCoordinationService.ts
│   │   ├── feedbackProcessingService.ts
│   │   └── [...]
│   │
│   ├── types/              # TypeScript definitions
│   ├── utils/              # פונקציות עזר
│   └── integrations/
│       └── supabase/       # Supabase integration
│
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── generate-outfit/
│   │   ├── personalization-agent/
│   │   ├── styling-agent/
│   │   ├── recommendation-agent/
│   │   ├── validation-agent/
│   │   ├── trainer-agent/
│   │   ├── analyze-feedback/
│   │   ├── catalog-proxy/
│   │   └── [...]
│   │
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase config
│
├── android/                # Android native project
└── public/                 # Static assets
```

---

## 4. תכונות עיקריות

### 4.1 שאלון סגנון (Style Quiz)
**מיקום:** `src/components/quiz/`

שאלון רב-שלבי לאיסוף מידע על המשתמש:

1. **GenderStep** - בחירת מגדר
2. **MeasurementsStep** - מידות (גובה, משקל, היקף חזה, מותן)
3. **BodyShapeStep** - מבנה גוף (X, V, H, O, A)
4. **PhotoUploadStep** - העלאת תמונה
5. **ColorPreferencesStep** - העדפות צבעים
6. **StyleComparisonStep** - השוואת סגנונות

**תהליך:**
```typescript
// QuizContext.tsx מנהל את כל הזרימה
const handleSubmit = async () => {
  // 1. ולידציה
  // 2. שמירה ל-localStorage
  // 3. ניתוח AI דרך analyzeStyleWithAI
  // 4. ניווט ל-/fashion-results
}
```

**טבלאות רלוונטיות:**
- `style_quiz_results` - תוצאות שאלון

---

### 4.2 מערכת ה-Agents

**מיקום:** `src/agents/`

המערכת מורכבת מ-8 agents שעובדים ברצף:

#### 4.2.1 Personalization Agent
**תפקיד:** ניתוח פרופיל משתמש, העדפות, היסטוריה

**קלט:**
```typescript
{
  userId: string;
  bodyType?: string;
  stylePreferences?: string[];
  colorPreferences?: string[];
  budget?: number;
  occasion?: string;
}
```

**פלט:**
```typescript
{
  userProfile: {
    bodyType: string;
    styleVector: number[];
    preferences: {...};
  };
  mustInclude: string[];
  shouldAvoid: string[];
}
```

#### 4.2.2 Styling Agent
**תפקיד:** יצירת המלצות סגנון על בסיס כללי אופנה

**מיקום:** `supabase/functions/styling-agent/`

**קלט:**
```typescript
{
  bodyType: string;
  mood?: string;
  occasion?: string;
  stylePreferences?: string[];
}
```

**פלט:**
```typescript
{
  recommendations: {
    tops: Array<{family, subfamily, colors, style}>;
    bottoms: Array<{...}>;
    shoes: Array<{...}>;
  };
  styleRules: string[];
}
```

#### 4.2.3 Validator Agent
**תפקיד:** וולידציה של התאמת פריטים, צבעים, אירוע

**Edge Function:** `supabase/functions/validation-agent/`

**קלט:**
```typescript
{
  outfits: Array<{
    top: Item;
    bottom: Item;
    shoes: Item;
    coat?: Item;
  }>;
  userId: string;
}
```

**פלט:**
```typescript
{
  success: boolean;
  data: Array<{
    outfitIndex: number;
    isValid: boolean;
    score: number;
    issues: string[];
    improvements: string[];
  }>;
}
```

#### 4.2.4 Recommendation Agent
**תפקיד:** בחירת פריטים ממאגר + סינון + דירוג

**Edge Function:** `supabase/functions/recommendation-agent/`

#### 4.2.5 Supervisor Agent
**תפקיד:** תיאום בין agents, ניהול זרימה, החלטות

#### 4.2.6 Trainer Agent
**תפקיד:** אימון המערכת על בסיס תוצאות

**Edge Function:** `supabase/functions/trainer-agent/`

#### 4.2.7 Learning Agent
**תפקיד:** למידה מתמשכת מפידבק משתמשים

#### 4.2.8 Feedback Learning Agent
**תפקיד:** ניתוח פידבק והטמעתו במודל

---

### 4.3 מערכת Premium Look Pass

**מיקום:** 
- `src/hooks/usePremiumLookPass.ts`
- `src/components/payments/PremiumLookModal.tsx`
- `src/components/PremiumLookUpgrade.tsx`

**זרימה:**

1. **Free Tier:**
   - משתמש מסיים שאלון
   - מקבל 1 לוק בסיסי (ללא personalization מתקדמת)
   - רואה CTA: "Upgrade to Premium Look - $5"

2. **תהליך תשלום:**
   - לחיצה על כפתור → פתיחת `PremiumLookModal`
   - סימולציה של תשלום (1.5 שניות)
   - לוגינג ל-`analytics_events`:
     ```typescript
     {
       event: 'look_pass_purchase',
       properties: {
         amount: 5,
         currency: 'USD'
       }
     }
     ```
   - הגדרת `sessionStorage`: `premium_look_{userId} = true`

3. **Premium Mode:**
   - קריאה מחדש ל-agent system עם:
     ```typescript
     {
       mode: "premium",
       includeMood: true,
       includeBodyType: true,
       refineLevel: "high"
     }
     ```
   - הצגת לוק משופר תחת "Your Premium Look"

**קוד מרכזי:**
```typescript
// usePremiumLookPass.ts
const purchasePremiumLook = async () => {
  // תשלום
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // לוגינג
  await supabase.from('analytics_events').insert({...});
  
  // עדכון state
  sessionStorage.setItem(`premium_look_${user.id}`, 'true');
  setPassData(prev => ({ ...prev, hasPremiumLook: true }));
  
  return true;
}
```

---

### 4.4 מערכת Credits

**מיקום:** `src/hooks/useCreditsSystem.ts`

**לוגיקה:**
- משתמש מתחיל עם credits (מוגדר ב-profile)
- כל יצירת לוק גורעת credit
- אם Credits = 0 → הצגת modal תשלום

**טבלאות:**
- `profiles.user_credits` - מאזן נוכחי
- `user_payments` - היסטוריית רכישות
- `analytics_events` - מעקב אחר שימוש

```typescript
const deductCredit = async () => {
  // 1. בדיקה אם יש credits
  if (creditsData.credits <= 0) return false;
  
  // 2. עדכון ב-DB
  const { error } = await supabase
    .from('profiles')
    .update({ user_credits: creditsData.credits - 1 })
    .eq('id', userId);
  
  // 3. לוגינג
  await supabase.from('analytics_events').insert({
    event: 'credit_deducted',
    user_id: userId
  });
  
  return true;
}
```

---

### 4.5 יצירת Looks

**מיקום:** `src/hooks/usePersonalizedLooks.ts`

**תהליך:**
```typescript
const generateLooks = async () => {
  // 1. קריאה ל-AgentCrew
  const result = await agentCrew.run({
    userId,
    refresh: true,
    filters: {
      mood,
      style,
      budget,
      occasion
    }
  });
  
  // 2. פענוח תוצאות
  const outfits = result.outfits || [];
  
  // 3. עדכון state
  setLooks(outfits);
}
```

**AgentCrew Workflow:**
```typescript
// src/agents/crew.ts
async run(context) {
  // 1. Personalization
  const userContext = await personalizationAgent.execute(context);
  
  // 2. Styling
  const styleRules = await stylingAgent.execute(userContext);
  
  // 3. Recommendation
  const candidates = await recommendationAgent.execute(styleRules);
  
  // 4. Validation
  const validated = await validatorAgent.execute(candidates);
  
  // 5. Supervision
  const final = await supervisorAgent.execute(validated);
  
  return final;
}
```

---

### 4.6 חיפוש מוצרים חיצוניים

**Edge Functions:**
- `catalog-proxy` - פרוקסי לקטלוגים
- `serp-search` - חיפוש דרך SerpAPI
- `asos-proxy` - אינטגרציה ספציפית ל-ASOS

**שימוש:**
```typescript
// src/hooks/useExternalCatalog.ts
const searchProducts = async (query: string, category: string) => {
  const { data } = await supabase.functions.invoke('catalog-proxy', {
    body: { query, category }
  });
  
  return data.products;
}
```

---

### 4.7 Feedback & Learning

**טבלאות:**
- `user_feedback` - לייקים/דיסלייקים על לוקים
- `manual_outfit_ratings` - דירוגים מפורטים
- `validation_dataset` - datasets לאימון

**זרימה:**
```typescript
// 1. משתמש נותן feedback על לוק
const submitFeedback = async (lookId, isLiked, comment) => {
  await supabase.from('user_feedback').insert({
    user_id: userId,
    look_id: lookId,
    is_liked: isLiked,
    comment,
    look_data: {...}
  });
  
  // 2. Trigger ל-Feedback Learning Agent
  await supabase.functions.invoke('analyze-feedback', {
    body: { userId }
  });
}

// 3. Learning Agent מעדכן את המודל
```

---

## 5. בסיס נתונים

### טבלאות עיקריות

#### 5.1 `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  user_credits INTEGER DEFAULT 3,
  pricing_variant TEXT, -- 'A' / 'B' (A/B testing)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 5.2 `style_quiz_results`
```sql
CREATE TABLE style_quiz_results (
  id UUID PRIMARY KEY,
  user_id UUID,
  gender TEXT,
  height TEXT,
  weight TEXT,
  waist TEXT,
  chest TEXT,
  body_shape TEXT, -- 'X', 'V', 'H', 'O', 'A'
  photo_url TEXT,
  color_preferences TEXT[],
  style_preferences TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 5.3 `zara_cloth`
קטלוג מוצרים מ-Zara:
```sql
CREATE TABLE zara_cloth (
  id UUID PRIMARY KEY,
  product_name TEXT,
  price NUMERIC,
  colour TEXT,
  description TEXT,
  size TEXT[],
  materials JSONB[],
  images JSONB,
  product_url TEXT,
  brand TEXT,
  category TEXT,
  product_family TEXT,
  product_subfamily TEXT,
  stock_status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 5.4 `user_feedback`
```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  look_id TEXT,
  is_liked BOOLEAN,
  is_disliked BOOLEAN,
  comment TEXT,
  feedback_type TEXT,
  look_data JSONB, -- snapshot של הלוק
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 5.5 `analytics_events`
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  event TEXT, -- 'look_generated', 'credit_deducted', 'look_pass_purchase'
  properties JSONB,
  session_id TEXT,
  created_at TIMESTAMP
);
```

#### 5.6 `user_payments`
```sql
CREATE TABLE user_payments (
  id UUID PRIMARY KEY,
  user_id UUID,
  amount NUMERIC,
  currency TEXT,
  credits_purchased INTEGER,
  variant TEXT,
  payment_status TEXT,
  created_at TIMESTAMP
);
```

#### 5.7 `agent_runs`
```sql
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY,
  agent_name TEXT,
  user_id UUID,
  body_type TEXT,
  variant TEXT,
  result JSONB,
  score NUMERIC,
  status TEXT,
  remaining_credits INTEGER,
  timestamp TIMESTAMP
);
```

#### 5.8 `validation_dataset`
```sql
CREATE TABLE validation_dataset (
  id UUID PRIMARY KEY,
  test_case_name TEXT,
  input_data JSONB,
  expected_criteria JSONB,
  actual_output JSONB,
  metrics JSONB,
  agent_version TEXT,
  run_timestamp TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 6. Edge Functions

### 6.1 `generate-outfit`
**תפקיד:** יצירת לוקים על בסיס צבעים

**קלט:**
```typescript
{
  bodyStructure: 'X' | 'V' | 'H' | 'O' | 'A';
  mood: string;
  style: 'classic' | 'romantic' | 'minimalist' | ...;
}
```

**פלט:**
```typescript
{
  success: boolean;
  data: Array<{
    top: string;      // hex color
    bottom: string;   // hex color
    shoes: string;    // hex color
    coat?: string;    // hex color
    description: string;
    recommendations: string[];
    occasion?: string;
  }>;
}
```

**שימוש ב-Lovable AI:**
```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]
  })
});
```

---

### 6.2 `personalization-agent`
**תפקיד:** ניתוח פרופיל משתמש והמלצות personalized

---

### 6.3 `styling-agent`
**תפקיד:** המלצות סגנון מבוססות כללי אופנה

---

### 6.4 `recommendation-agent`
**תפקיד:** בחירת פריטים מהקטלוג

---

### 6.5 `validation-agent`
**תפקיד:** וולידציה של לוקים

---

### 6.6 `trainer-agent`
**תפקיד:** אימון המערכת

**תכונות:**
- `agentResultsGenerator.ts` - יצירת תוצאות לאימון
- `imageValidator.ts` - ולידציה של תמונות
- `databaseService.ts` - שמירה ל-DB

---

### 6.7 `analyze-feedback`
**תפקיד:** ניתוח פידבק משתמשים

---

### 6.8 `catalog-proxy`
**תפקיד:** גישה לקטלוגים חיצוניים

---

### 6.9 `image-analyzer`
**תפקיד:** ניתוח תמונות משתמש

---

### 6.10 `calendar-sync`
**תפקיד:** סנכרון עם Google Calendar

**טבלה:** `calendar_events`

---

## 7. אימות (Authentication)

### 7.1 ספקי אימות

**מיקום:** `src/hooks/auth/providers/`

1. **AI Auth** (`useAIAuth.ts`) - אימות מבוסס AI
2. **Google Auth** (`useGoogleAuth.ts`)
3. **Apple Auth** (`useAppleAuth.ts`)
4. **Magic Link** (`useMagicLinkAuth.ts`)

### 7.2 זרימת הרשמה

```typescript
// SignUpForm.tsx
const handleSubmit = async (e) => {
  // 1. יצירת משתמש ב-Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  
  // 2. יצירת profile
  await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    name,
    pricing_variant: Math.random() < 0.5 ? 'A' : 'B', // A/B test
    user_credits: 3 // התחלתי
  });
  
  // 3. לוגינג
  await supabase.from('analytics_events').insert({
    user_id: data.user.id,
    event: 'user_signup'
  });
}
```

### 7.3 Callback Handling

**מיקום:** `src/pages/AuthCallback.tsx`

מטפל ב-OAuth callbacks (Google, Apple).

---

## 8. Routing

**מיקום:** `src/App.tsx`

```typescript
<Routes>
  {/* Public */}
  <Route path="/" element={<Index />} />
  <Route path="/entrance" element={<Entrance />} />
  <Route path="/auth" element={<Auth />} />
  
  {/* Protected */}
  <Route path="/fashion-results" element={<FashionResultsPage />} />
  <Route path="/outfit-generation" element={<OutfitGenerationPage />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/wishlist" element={<WishList />} />
  
  {/* Developer */}
  <Route path="/agent-debug" element={<AgentDebugPage />} />
  <Route path="/agent-training" element={<AgentTrainingPage />} />
  <Route path="/validation-dashboard" element={<ValidationDashboard />} />
</Routes>
```

---

## 9. State Management

### 9.1 React Query
**שימוש:** שליפת נתונים מהשרת

```typescript
const { data: looks, isLoading } = useQuery({
  queryKey: ['personalized-looks', userId],
  queryFn: async () => {
    const result = await agentCrew.run({ userId });
    return result.outfits;
  }
});
```

### 9.2 Zustand
**שימוש:** מועדפים (favorites)

```typescript
// src/stores/useFavoritesStore.ts
export const useFavoritesStore = create<FavoritesStore>((set) => ({
  favorites: [],
  addFavorite: (itemId) => set((state) => ({
    favorites: [...state.favorites, itemId]
  })),
  removeFavorite: (itemId) => set((state) => ({
    favorites: state.favorites.filter(id => id !== itemId)
  }))
}));
```

### 9.3 localStorage
**שימוש:** שמירת תוצאות שאלון

```typescript
// src/components/quiz/utils/storageUtils.ts
export const saveQuizData = (data: QuizFormData) => {
  localStorage.setItem('styleQuizData', JSON.stringify(data));
};

export const loadQuizData = (): QuizFormData | null => {
  const saved = localStorage.getItem('styleQuizData');
  return saved ? JSON.parse(saved) : null;
};
```

### 9.4 sessionStorage
**שימוש:** Premium Look Pass status

```typescript
sessionStorage.setItem(`premium_look_${userId}`, 'true');
```

---

## 10. עיצוב (Design System)

### 10.1 Tailwind Configuration

**מיקום:** `tailwind.config.ts`

```typescript
export default {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ...
      }
    }
  }
}
```

### 10.2 CSS Variables

**מיקום:** `src/index.css`

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## 11. דפי Developer Tools

### 11.1 Agent Debug Page
**מיקום:** `src/pages/AgentDebugPage.tsx`

- בדיקת agents בנפרד
- הצגת תוצאות ביניים
- debugging של זרימת ה-crew

### 11.2 Agent Training Page
**מיקום:** `src/pages/AgentTrainingPage.tsx`

- ריצת מערך אימון
- הצגת metrics
- ניהול datasets

### 11.3 Validation Dashboard
**מיקום:** `src/pages/ValidationDashboard.tsx`

- תוצאות validation runs
- השוואת גרסאות
- ניתוח שגיאות

### 11.4 Agent Health
**מיקום:** `src/pages/AgentHealth.tsx`

- בדיקת תקינות agents
- זמני תגובה
- success rate

---

## 12. Mobile (Capacitor)

### 12.1 Configuration

**מיקום:** `capacitor.config.ts`

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.bc0cf4d79a354a65b4249d5ecd554d30',
  appName: 'BuyTheLook',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};
```

### 12.2 Android

**מיקום:** `android/`

- Gradle configuration
- MainActivity
- Assets (icons, splash screens)

### 12.3 Deep Links

**מיקום:** `src/hooks/auth/useAuthDeepLinks.ts`

טיפול ב-deep links לאימות OAuth במובייל.

---

## 13. Secrets & Environment Variables

### Supabase Secrets (Edge Functions)

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LOVABLE_API_KEY
SERP_API_KEY
RAPIDAPI_KEY
RAPIDAPI_ASOS_SCRAPER_KEY
RAPIDAPI_HOST
RAPIDAPI_BASE_URL
GOOGLE_CALENDAR_CLIENT_ID
GOOGLE_CALENDAR_CLIENT_SECRET
```

### Frontend Environment

```typescript
// Accessible via import.meta.env
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

---

## 14. טיפים למפתח חדש

### 14.1 הרצת הפרויקט

```bash
# התקנה
npm install

# הרצה מקומית
npm run dev

# Build
npm run build

# Android
npx cap sync android
npx cap open android
```

### 14.2 דברים חשובים לדעת

1. **אל תשנה את `src/integrations/supabase/types.ts`** - זה נוצר אוטומטית
2. **השתמש ב-semantic tokens** - לא להשתמש בצבעים ישירים
3. **כל שינוי ב-Edge Functions** - נפרס אוטומטית
4. **Migrations** - השתמש ב-database migration tool
5. **Secrets** - אל תשים בקוד, רק ב-Supabase dashboard

### 14.3 Debugging

```typescript
// Console logs
console.log('[Component]', data);

// Supabase logs
console.error('[Supabase Error]', error);

// Agent debugging
console.log('[Agent Result]', agentResult);
```

### 14.4 טיפול בשגיאות

```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  
  return data;
} catch (error) {
  console.error('Error:', error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
  return null;
}
```

---

## 15. תהליכי עבודה

### 15.1 הוספת תכונה חדשה

1. **תכנון** - הגדר דרישות ו-API
2. **Database** - צור migration אם צריך
3. **Edge Function** - אם צריך לוגיקת backend
4. **Hook** - צור custom hook לניהול state
5. **Component** - בנה את ה-UI
6. **Integration** - חבר הכל
7. **Testing** - בדוק בדפי developer tools

### 15.2 שינוי ב-Agent

1. ערוך את הקובץ הרלוונטי ב-`src/agents/`
2. עדכן את ה-prompt או הלוגיקה
3. הרץ ב-Agent Debug Page
4. בדוק תוצאות
5. עדכן README אם צריך

### 15.3 הוספת Edge Function

1. צור תיקייה ב-`supabase/functions/`
2. צור `index.ts`
3. הוסף CORS headers
4. הגדר ב-`config.toml`
5. הוסף secrets אם צריך
6. Deploy (אוטומטי)

---

## 16. קישורים חשובים

- **Supabase Dashboard:** https://supabase.com/dashboard/project/aqkeprwxxsryropnhfvm
- **Lovable AI Docs:** https://docs.lovable.dev/features/ai
- **Agent System README:** `src/agents/README.md`
- **Tailwind Docs:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## 17. נקודות שיפור עתידיות

1. **אינטגרציית Stripe** - תשלומים אמיתיים במקום סימולציה
2. **PWA** - הפיכה ל-Progressive Web App
3. **Real-time notifications** - Supabase Realtime
4. **Image optimization** - CDN ו-lazy loading
5. **A/B Testing framework** - מערכת מתקדמת יותר
6. **Analytics Dashboard** - ניתוח נתונים מתקדם
7. **Multi-language** - תמיכה בשפות נוספות
8. **Social sharing** - שיתוף לוקים ברשתות
9. **Virtual try-on** - AR/VR
10. **Personal stylist chat** - צ'אט עם AI stylist

---

## 18. רישיונות ותלויות

ראה `package.json` לרשימה מלאה של dependencies.

**תלויות מרכזיות:**
- React 18.3.1
- TypeScript
- Supabase JS 2.48.1
- TanStack Query 5.56.2
- Tailwind CSS
- shadcn/ui components
- Framer Motion 11.2.12
- Capacitor 7

---

**מסמך זה עודכן לאחרונה:** 2025

**גרסה:** 1.0

**מחבר:** Generated by AI for developer onboarding
