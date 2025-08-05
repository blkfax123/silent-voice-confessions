-- Fix RLS policy for chat_rooms to allow users to see waiting rooms
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;

-- New policy that allows users to see:
-- 1. Their own chat rooms (where they are user1_id or user2_id)
-- 2. Available waiting rooms (where user2_id is null, regardless of who created them)
CREATE POLICY "Users can view chat rooms and waiting rooms" ON chat_rooms
FOR SELECT USING (
  (user1_id = auth.uid()) OR 
  (user2_id = auth.uid()) OR 
  (user2_id IS NULL AND is_active = false)
);