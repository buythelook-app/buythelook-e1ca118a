-- Allow anyone to insert feedback for agent training purposes (admin/development tool)
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.user_feedback;

CREATE POLICY "Anyone can insert feedback for agent training"
ON public.user_feedback
FOR INSERT
WITH CHECK (true);

-- Update the existing SELECT policy to also allow viewing feedback without user_id
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;

CREATE POLICY "Users can view feedback"
ON public.user_feedback
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);