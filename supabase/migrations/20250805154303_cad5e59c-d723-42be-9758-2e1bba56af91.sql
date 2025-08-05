-- Create chat-images storage bucket for image sharing in chat
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

-- Create storage policies for chat images
CREATE POLICY "Anyone can view chat images" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload chat images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own chat images" ON storage.objects
FOR UPDATE USING (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id_sent_at ON chat_messages(room_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active_created ON chat_rooms(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_users_online_last_seen ON users(is_online, last_seen);

-- Create function to automatically clean up old inactive chat rooms
CREATE OR REPLACE FUNCTION cleanup_inactive_chat_rooms()
RETURNS void AS $$
BEGIN
  -- Delete inactive rooms older than 1 hour with no messages
  DELETE FROM chat_rooms 
  WHERE is_active = false 
    AND created_at < now() - interval '1 hour'
    AND NOT EXISTS (
      SELECT 1 FROM chat_messages 
      WHERE chat_messages.room_id = chat_rooms.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old messages (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS void AS $$
BEGIN
  UPDATE chat_messages 
  SET message_text = '[Message deleted]', 
      audio_url = null,
      is_deleted = true
  WHERE sent_at < now() - interval '7 days'
    AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;