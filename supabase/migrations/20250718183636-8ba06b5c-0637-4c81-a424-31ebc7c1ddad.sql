-- Create table for tracking user clicks on items for purchase
CREATE TABLE public.click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  item_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'shoes')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own click events" 
ON public.click_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own click events" 
ON public.click_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_click_events_user_id ON public.click_events(user_id);
CREATE INDEX idx_click_events_timestamp ON public.click_events(timestamp);
CREATE INDEX idx_click_events_category ON public.click_events(category);