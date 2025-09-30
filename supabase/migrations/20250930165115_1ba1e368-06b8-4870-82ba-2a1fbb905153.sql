-- Create table for manual ratings and feedback
CREATE TABLE public.manual_outfit_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  test_case_name varchar NOT NULL,
  run_timestamp timestamp without time zone NOT NULL,
  outfit_index integer NOT NULL, -- Which outfit in the test case (0, 1, 2...)
  user_id uuid REFERENCES auth.users(id),
  
  -- Overall rating
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  like_dislike boolean, -- true = like, false = dislike
  
  -- Detailed criteria ratings (1-5 scale)
  body_shape_fit integer CHECK (body_shape_fit >= 1 AND body_shape_fit <= 5),
  style_alignment integer CHECK (style_alignment >= 1 AND style_alignment <= 5),
  occasion_match integer CHECK (occasion_match >= 1 AND occasion_match <= 5),
  color_coordination integer CHECK (color_coordination >= 1 AND color_coordination <= 5),
  value_for_money integer CHECK (value_for_money >= 1 AND value_for_money <= 5),
  creativity integer CHECK (creativity >= 1 AND creativity <= 5),
  
  -- Manual criteria checking
  must_include_met text[], -- Array of criteria that were met
  should_avoid_violated text[], -- Array of criteria that were violated
  
  -- Free text feedback
  feedback_notes text,
  what_works text, -- What's good about this outfit
  what_missing text, -- What's missing
  improvements text, -- What to improve
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_outfit_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own ratings" 
ON public.manual_outfit_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ratings" 
ON public.manual_outfit_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.manual_outfit_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all ratings" 
ON public.manual_outfit_ratings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_manual_outfit_ratings_updated_at
  BEFORE UPDATE ON public.manual_outfit_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Index for performance
CREATE INDEX idx_manual_ratings_test_case ON public.manual_outfit_ratings(test_case_name, run_timestamp);
CREATE INDEX idx_manual_ratings_user ON public.manual_outfit_ratings(user_id);