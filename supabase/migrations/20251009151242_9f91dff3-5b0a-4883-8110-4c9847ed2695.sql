-- מחיקת הטבלה הישנה (כמו שזו ריקה)
DROP TABLE IF EXISTS public.user_feedback CASCADE;

-- יצירת טבלה חדשה משופרת לפידבק משתמשים
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  look_id TEXT NOT NULL,
  is_liked BOOLEAN DEFAULT FALSE,
  is_disliked BOOLEAN DEFAULT FALSE,
  comment TEXT,
  feedback_type TEXT DEFAULT 'outfit_rating',
  look_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- אינדקס לחיפוש מהיר
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- RLS policies
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- משתמשים יכולים לראות רק את הפידבק שלהם
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- משתמשים יכולים להוסיף פידבק משלהם
CREATE POLICY "Users can insert their own feedback"
  ON public.user_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- משתמשים יכולים לעדכן פידבק משלהם
CREATE POLICY "Users can update their own feedback"
  ON public.user_feedback
  FOR UPDATE
  USING (auth.uid() = user_id);

-- טריגר לעדכון updated_at
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();