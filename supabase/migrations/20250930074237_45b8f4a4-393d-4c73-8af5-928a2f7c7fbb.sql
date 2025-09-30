-- יצירת טבלת Validation Dataset
CREATE TABLE validation_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_name VARCHAR(255) NOT NULL UNIQUE,
  input_data JSONB NOT NULL,  -- body_shape, style_preference, occasion, mood, budget
  expected_criteria JSONB NOT NULL,  -- קריטריונים מצופים (מה צריך להיות בלוק)
  actual_output JSONB,  -- תוצאות בפועל מהסוכנים
  metrics JSONB,  -- ציונים מחושבים
  agent_version VARCHAR(50),  -- גרסת המודל/סוכנים
  run_timestamp TIMESTAMP,  -- מתי הורץ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- יצירת אינדקסים לביצועים טובים יותר
CREATE INDEX idx_validation_version ON validation_dataset(agent_version);
CREATE INDEX idx_validation_timestamp ON validation_dataset(run_timestamp);
CREATE INDEX idx_validation_test_name ON validation_dataset(test_case_name);

-- הוספת RLS policies
ALTER TABLE validation_dataset ENABLE ROW LEVEL SECURITY;

-- Policy לשירות (service role) לגישה מלאה
CREATE POLICY "Service role can manage validation dataset" 
ON validation_dataset 
FOR ALL 
USING (true);

-- Policy למשתמשים לצפייה בנתונים
CREATE POLICY "Users can view validation results" 
ON validation_dataset 
FOR SELECT 
USING (true);

-- טריגר לעדכון updated_at
CREATE TRIGGER update_validation_dataset_updated_at
BEFORE UPDATE ON validation_dataset
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();