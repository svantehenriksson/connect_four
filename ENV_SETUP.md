# Environment Setup Quick Guide

## Step 1: Create `.env.local` file

In the root directory of your project, create a file named `.env.local` (note: this file should NOT be committed to git).

## Step 2: Add your Supabase credentials

Copy and paste the following into your `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 3: Get your Supabase credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one)
4. Go to **Settings** (gear icon in the sidebar)
5. Click on **API** in the settings menu
6. You'll see:
   - **Project URL** - Copy this to replace `your_supabase_url_here`
   - **Project API keys** > **anon public** - Copy this to replace `your_supabase_anon_key_here`

## Example

Your `.env.local` file should look like this (with your actual values):

```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

## Important Notes

- ⚠️ Never commit the `.env.local` file to version control
- ⚠️ Never share your Supabase keys publicly
- ✅ The `.env.local` file is already in `.gitignore` by default with Vite projects
- ✅ After creating the file, restart your dev server for changes to take effect

## Next Steps

After setting up your environment variables:

1. Set up the database tables (see `SUPABASE_SETUP.md` or `README.md`)
2. Enable real-time replication in Supabase
3. Run `npm run dev` to start the development server

