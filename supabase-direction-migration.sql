-- Migration: Add direction column to user_settings
-- Run this if you already have the user_settings table

-- Add direction column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' AND column_name = 'direction'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN direction text DEFAULT 'sv-target' NOT NULL;
  END IF;
END $$;
