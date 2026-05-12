-- Add status_emoji and status_message to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_emoji text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_message text;
