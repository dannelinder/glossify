-- Add case_sensitive column to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS case_sensitive BOOLEAN DEFAULT true;

-- Update ALL existing rows to have the default value
UPDATE user_settings
SET case_sensitive = true;
