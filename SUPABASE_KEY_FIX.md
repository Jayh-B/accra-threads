# ⚠️ CRITICAL: Check Your Supabase Configuration

## The 401 Error Means:

You're likely using the **SECRET KEY** instead of the **ANON KEY** in your `.env.local`

### ✅ CORRECT Configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (starts with eyJ)
```

### ❌ WRONG Configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_SECRET_KEY=sbp_... (SECRET - never in .env.local!)
```

## How to Get the Right Keys:

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **API**
3. Copy **"anon public"** key → Put in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **Project URL** → Put in `NEXT_PUBLIC_SUPABASE_URL`
5. **NEVER** use the "service_role" or "secret" keys in .env.local

## After Fixing:

1. Restart the dev server: `npm run dev`
2. Clear browser cookies
3. Try login again

The SECRET KEY error will immediately go away once you use the correct ANON KEY.
