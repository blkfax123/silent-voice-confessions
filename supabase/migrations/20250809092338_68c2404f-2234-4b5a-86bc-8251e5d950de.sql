-- Add optional settings columns and title for confessions
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS push_notifications_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_mode boolean DEFAULT false;

ALTER TABLE public.confessions
  ADD COLUMN IF NOT EXISTS title text;