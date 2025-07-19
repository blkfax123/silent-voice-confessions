-- Add gender and subscription fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username_color TEXT DEFAULT 'default';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'global';

-- Create chat_rooms table for anonymous chats
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL DEFAULT 'random', -- 'random', 'specific_gender'
  target_gender TEXT, -- for specific gender chats
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message_text TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'voice'
  audio_url TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- Create subscriptions table for payment tracking
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'weekly', 'monthly', 'yearly'
  payment_method TEXT NOT NULL, -- 'razorpay', 'paypal', 'stripe'
  payment_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms"
ON public.chat_rooms
FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create chat rooms"
ON public.chat_rooms
FOR INSERT
WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can update their own chat rooms"
ON public.chat_rooms
FOR UPDATE
USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their rooms"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (user_id = auth.uid());

-- Add trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_users ON public.chat_rooms(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, status);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active' 
    AND expires_at > now()
  );
$$;