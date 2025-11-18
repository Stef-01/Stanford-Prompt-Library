# Setup Instructions

Follow these steps to get the Stanford Prompt Library running locally.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (or use existing)
4. Create a new project:
   - Name: "Stanford Prompt Library"
   - Database Password: Generate a strong password (save it!)
   - Region: US West (closest to Stanford)
   - Click "Create new project"
5. Wait ~2 minutes for project to provision

## Step 2: Configure Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need Google OAuth credentials. To get them:

   ### Google Cloud Console:
   - Go to [https://console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project (or use existing)
   - Enable **Google+ API**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: "Stanford Prompt Library"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://your-project.supabase.co` (replace with your Supabase URL)
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback` (replace with your Supabase URL)
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**

4. Back in Supabase, paste the Client ID and Client Secret
5. Click **Save**

## Step 3: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., https://abcdefgh.supabase.co)
   - **anon/public key** (starts with eyJ...)

## Step 4: Configure Environment Variables

1. In the `app/` directory, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
   VITE_APP_URL=http://localhost:5173
   ```

## Step 5: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `database/schema.sql` and paste it
4. Click **Run** (bottom right)
5. You should see success messages

## Step 6: Create Admin User

1. Sign in to your app with your Stanford email
2. In Supabase dashboard, go to **Table Editor** → **users**
3. Find your user row
4. Edit the `is_admin` column to `true`
5. Save

## Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created `.env` file (not `.env.example`)
- Check that the values are correct
- Restart the dev server after changing `.env`

### Google OAuth not working
- Check redirect URIs match exactly
- Make sure Google+ API is enabled
- Verify Client ID and Secret are correct in Supabase

### Database errors
- Make sure you ran the schema.sql migration
- Check the SQL Editor for error messages
- Try running migrations one section at a time

## Next Steps

Once everything is running:
1. Sign in with your Stanford email
2. You'll be prompted to submit your first prompt
3. As admin, approve it in Supabase Table Editor
4. You now have full access!

For deployment instructions, see `DEPLOY.md`
