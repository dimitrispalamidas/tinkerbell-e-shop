-- ============================================
-- ADD ONESIGNAL PLAYER ID TO ADMIN_USERS
-- ============================================
-- This migration adds support for OneSignal push notifications
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add onesignal_player_id column to admin_users table
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS onesignal_player_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_onesignal_player_id
ON admin_users(onesignal_player_id)
WHERE onesignal_player_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN admin_users.onesignal_player_id IS 'OneSignal player ID for push notifications';

