-- Create word_lists table to store all word lists
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nezbogwtgrfgmyxpogrd/sql

CREATE TABLE word_lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  content text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE word_lists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (read and write) for everyone
-- This is simple for now - you can add authentication later if needed
CREATE POLICY "Allow all access to word_lists"
  ON word_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);

