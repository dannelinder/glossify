# Authentication Setup Instructions

## Step 1: Run the SQL Script in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/nezbogwtgrfgmyxpogrd/sql
2. Click on "SQL Editor" in the left sidebar
3. Open the file `supabase-auth-setup.sql` from your project
4. Copy and paste the entire SQL script into the editor
5. Click "Run" to execute the script

This will:
- Add a `user_id` column to the `word_lists` table
- Set up Row Level Security (RLS) policies so users can only see their own data
- Create an index for better performance

## Step 2: Enable Email Authentication (if not already enabled)

1. Go to Authentication → Providers in your Supabase dashboard
2. Make sure "Email" is enabled
3. Configure email settings if needed

## Step 3: Test the Application

1. Stop the dev server (Ctrl+C)
2. Start it again: `npm start`
3. You should now see a login/signup screen
4. Create an account with an email and password
5. Your word lists will be stored separately for each user

## What Changed?

- ✅ Users must sign in to use the app
- ✅ Each user has their own isolated word lists
- ✅ Users can only see and edit their own data
- ✅ Sign out button in the top right corner
- ✅ Beautiful gradient login screen

## Important Notes

- **Email confirmation**: By default, Supabase sends a confirmation email. You can disable this in Authentication → Settings if you want instant access for testing.
- **Password reset**: Supabase automatically handles password reset flows.
- **Free tier**: You can have up to 50,000 monthly active users on the free plan.
