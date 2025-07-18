-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table for Silent Circle
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create confessions table
CREATE TABLE public.confessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT, -- for text confessions
  audio_url TEXT, -- for voice confessions
  category TEXT NOT NULL,
  reactions JSONB DEFAULT '{}',
  is_boosted BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  confession_type TEXT CHECK (confession_type IN ('text', 'voice')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create login logs table
CREATE TABLE public.login_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username_attempted TEXT,
  login_success BOOLEAN NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for confessions
CREATE POLICY "Anyone can view confessions" ON public.confessions
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Users can create confessions" ON public.confessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own confessions" ON public.confessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any confession" ON public.confessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- RLS Policies for verification requests
CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests" ON public.verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests" ON public.verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update verification requests" ON public.verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- RLS Policies for login logs
CREATE POLICY "Admins can view all login logs" ON public.login_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Create storage bucket for audio confessions
INSERT INTO storage.buckets (id, name, public) VALUES ('confessions-audio', 'confessions-audio', false);

-- Storage policies for confessions-audio bucket
CREATE POLICY "Users can upload their own audio confessions" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'confessions-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view audio confessions" ON storage.objects
  FOR SELECT USING (bucket_id = 'confessions-audio');

CREATE POLICY "Users can update their own audio confessions" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'confessions-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own audio confessions" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'confessions-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_confessions_updated_at
  BEFORE UPDATE ON public.confessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log login attempts
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_user_id UUID,
  p_username TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_logs (user_id, username_attempted, login_success, ip_address)
  VALUES (p_user_id, p_username, p_success, p_ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;