-- Add missing RLS policies for tables without them

-- Agent runs policies (some already exist due to service role)
CREATE POLICY "Users can view their own agent runs" 
ON public.agent_runs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent runs" 
ON public.agent_runs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Click events policy for anonymous users
CREATE POLICY "Anyone can insert click events for tracking" 
ON public.click_events 
FOR INSERT 
WITH CHECK (true);

-- User feedback policies (currently none)
CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Public read access for shoes table (currently none)
CREATE POLICY "Allow public read access to shoes" 
ON public.shoes 
FOR SELECT 
USING (true);

-- Public read access for recommendation test cases
CREATE POLICY "Allow public read access to test cases" 
ON public.recommendation_test_cases 
FOR SELECT 
USING (true);