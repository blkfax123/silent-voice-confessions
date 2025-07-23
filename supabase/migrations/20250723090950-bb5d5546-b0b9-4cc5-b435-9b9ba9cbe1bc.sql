-- Add reactions column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN reactions JSONB DEFAULT '{}'::jsonb;

-- Add recording duration and audio quality settings to users table
ALTER TABLE public.users 
ADD COLUMN recording_duration INTEGER DEFAULT 60,
ADD COLUMN audio_quality TEXT DEFAULT 'medium',
ADD COLUMN playback_speed NUMERIC DEFAULT 1.0;

-- Add recording duration and audio quality to confessions table
ALTER TABLE public.confessions 
ADD COLUMN recording_duration INTEGER DEFAULT 60,
ADD COLUMN audio_quality TEXT DEFAULT 'medium';

-- Create privacy policies table
CREATE TABLE public.privacy_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user privacy acceptance table
CREATE TABLE public.user_privacy_acceptance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Create content moderation table
CREATE TABLE public.content_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'confession' or 'message'
  reported_by UUID,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  moderator_id UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.privacy_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Privacy policies can be viewed by everyone
CREATE POLICY "Privacy policies are viewable by everyone" 
ON public.privacy_policies 
FOR SELECT 
USING (true);

-- Users can view their own privacy acceptances
CREATE POLICY "Users can view their own privacy acceptances" 
ON public.user_privacy_acceptance 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own privacy acceptances
CREATE POLICY "Users can insert their own privacy acceptances" 
ON public.user_privacy_acceptance 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can report content
CREATE POLICY "Users can report content" 
ON public.content_moderation 
FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

-- Users can view reports they made
CREATE POLICY "Users can view their own reports" 
ON public.content_moderation 
FOR SELECT 
USING (auth.uid() = reported_by);

-- Admins can view all moderation reports
CREATE POLICY "Admins can view all moderation reports" 
ON public.content_moderation 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Admins can update moderation reports
CREATE POLICY "Admins can update moderation reports" 
ON public.content_moderation 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));