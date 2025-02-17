
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lyovbkiqvlqrvxjbzplo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5b3Zia2lxdmxxcnZ4amJ6cGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0ODkzNTksImV4cCI6MjAyMzA2NTM1OX0.YM0aSl2-nhY4INUJykH2VuxRLqTTSlVQw0Z1hVJ1Itg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
