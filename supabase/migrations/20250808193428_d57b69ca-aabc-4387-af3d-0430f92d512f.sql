-- Add language preference column to users table
ALTER TABLE public.users 
ADD COLUMN language_preference text DEFAULT 'english';