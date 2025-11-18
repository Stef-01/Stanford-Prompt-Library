-- Fix: Add INSERT policy for users table
-- This allows new users to create their profile when signing in

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
