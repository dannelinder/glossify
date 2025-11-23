-- Authentication setup for Glossify
-- Run this in Supabase SQL Editor after the initial setup

-- 1. Add user_id column to word_lists table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'word_lists' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE word_lists ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- 2. Drop the old unique constraint on name (since multiple users can have same list names)
ALTER TABLE word_lists DROP CONSTRAINT IF EXISTS word_lists_name_key;

-- 3. Create a composite unique constraint (name + user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'word_lists_name_user_id_key'
  ) THEN
    ALTER TABLE word_lists ADD CONSTRAINT word_lists_name_user_id_key UNIQUE (name, user_id);
  END IF;
END $$;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Allow all access to word_lists" ON word_lists;
DROP POLICY IF EXISTS "Users can view own word lists" ON word_lists;
DROP POLICY IF EXISTS "Users can insert own word lists" ON word_lists;
DROP POLICY IF EXISTS "Users can update own word lists" ON word_lists;
DROP POLICY IF EXISTS "Users can delete own word lists" ON word_lists;

-- 5. Enable RLS
ALTER TABLE word_lists ENABLE ROW LEVEL SECURITY;

-- 6. Create new policies for authenticated users only
-- Users can only see their own word lists
CREATE POLICY "Users can view own word lists"
  ON word_lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own word lists
CREATE POLICY "Users can insert own word lists"
  ON word_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own word lists
CREATE POLICY "Users can update own word lists"
  ON word_lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own word lists
CREATE POLICY "Users can delete own word lists"
  ON word_lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Create index for better performance
CREATE INDEX IF NOT EXISTS word_lists_user_id_idx ON word_lists(user_id);
