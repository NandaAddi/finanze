-- Add banner_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url text;

-- Create storage buckets if they don't exist (Note: This might require superuser or handled via dashboard)
-- But we can add RLS policies for them anyway.

-- Enable storage for everyone to read, but only owner to upload
-- Note: These policies assume buckets 'avatars' and 'banners' exist.

-- Profiles table already has RLS.
