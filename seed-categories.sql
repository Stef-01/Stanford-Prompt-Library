-- Seed initial categories for Stanford Prompt Library
-- Run this in Supabase SQL Editor

INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('AI Agents', 'ai-agents', '🤖', '#3b82f6'),
  ('Creative Writing', 'creative-writing', '✍️', '#8b5cf6'),
  ('Data Analysis', 'data-analysis', '📊', '#10b981'),
  ('Image Generation', 'image-generation', '🎨', '#f59e0b'),
  ('Business', 'business', '💼', '#ec4899'),
  ('Research', 'research', '🔬', '#06b6d4'),
  ('Gaming', 'gaming', '🎮', '#eab308'),
  ('Website Coding', 'website-coding', '💻', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- Verify categories were inserted
SELECT * FROM public.categories ORDER BY name;
