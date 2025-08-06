-- Fix RLS policies for Ysusu table
DROP TABLE IF EXISTS public.Ysusu;

-- Also fix function search_path issues
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.log_login_attempt(uuid, text, boolean, text) SET search_path = public;
ALTER FUNCTION public.has_active_subscription(uuid) SET search_path = public;
ALTER FUNCTION public.update_user_last_seen() SET search_path = public;
ALTER FUNCTION public.cleanup_inactive_chat_rooms() SET search_path = public;
ALTER FUNCTION public.cleanup_old_chat_messages() SET search_path = public;