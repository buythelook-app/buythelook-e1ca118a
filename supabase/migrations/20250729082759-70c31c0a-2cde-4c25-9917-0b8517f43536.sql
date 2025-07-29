-- Create RLS policies for existing tables without policies

-- Agent runs policies
CREATE POLICY "Users can view their own agent runs" 
ON public.agent_runs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent runs" 
ON public.agent_runs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Cart items policies  
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart items" 
ON public.cart_items 
FOR ALL 
USING (auth.uid() = user_id);

-- Click events policies
CREATE POLICY "Users can view their own click events" 
ON public.click_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert click events" 
ON public.click_events 
FOR INSERT 
WITH CHECK (true);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" 
ON public.favorites 
FOR ALL 
USING (auth.uid() = user_id);

-- Style quiz results policies
CREATE POLICY "Users can view their own quiz results" 
ON public.style_quiz_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quiz results" 
ON public.style_quiz_results 
FOR ALL 
USING (auth.uid() = user_id);

-- User feedback policies
CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);