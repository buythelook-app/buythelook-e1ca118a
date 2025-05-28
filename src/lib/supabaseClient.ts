
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Use the correct project URL and key from the instructions
const supabaseUrl = 'https://aqkeprwxxsryropnhfvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
