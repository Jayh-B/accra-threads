# Google OAuth Fix Guide

## Common Issues & Solutions

### 1. Supabase Auth Provider Not Enabled

**Check:** Go to Supabase Dashboard → Authentication → Providers → Google

**Fix:**
1. Enable Google provider toggle
2. Add your Google Client ID and Client Secret
3. Get these from: https://console.cloud.google.com/apis/credentials

### 2. Redirect URL Mismatch (Most Common)

**Check:** Supabase Dashboard → Authentication → URL Configuration

**Required URLs (add ALL of these):**
```
https://your-deployed-domain.com/auth/callback
https://your-deployed-domain.com/login
https://your-deployed-domain.com
```

**Site URL:** Set to your production domain  
**Redirect URLs:** Must include the exact callback URL

### 3. Google Cloud Console Configuration

**Check:** https://console.cloud.google.com/apis/credentials

**Required settings:**
- **Authorized JavaScript origins:**
  - `https://your-deployed-domain.com`
  - `https://your-supabase-project.supabase.co`

- **Authorized redirect URIs:**
  - `https://your-supabase-project.supabase.co/auth/v1/callback`

### 4. Environment Variables Missing

**Check your deployment platform (Vercel/Netlify/etc.):**

Required env vars:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important:** If you deployed to Vercel, add these in Vercel Dashboard → Project Settings → Environment Variables

### 5. Quick Diagnostic Checklist

```bash
# 1. Verify Supabase URL is accessible
curl https://your-project.supabase.co/auth/v1/settings

# 2. Check if Google provider is enabled
# (Look for "external": {"google": {"enabled": true}}
```

## Step-by-Step Fix

### Step 1: Verify Supabase Configuration

1. Go to https://app.supabase.com
2. Select your project
3. Go to Authentication → Providers
4. Find Google and click the toggle to ENABLE
5. Enter your Google Client ID and Secret

### Step 2: Add Redirect URLs

1. In Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `https://your-production-domain.com`
3. Add to **Redirect URLs**:
   - `https://your-production-domain.com/auth/callback`
   - `https://your-production-domain.com/login`

### Step 3: Google Cloud Console Setup

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click EDIT
4. Add to **Authorized redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`

### Step 4: Redeploy (if env vars changed)

If you added new environment variables, trigger a redeploy:
- Vercel: Push a new commit or use "Redeploy" button
- Netlify: Trigger deploy from dashboard

## Testing the Fix

1. Open your deployed app
2. Go to /login
3. Click "Continue with Google"
4. Should redirect to Google sign-in page
5. After sign-in, should redirect back to your app

## Error Messages Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "Provider is not enabled" | Google not enabled in Supabase | Enable in Auth Providers |
| "redirect_to mismatch" | URL not in allowed list | Add URL to Redirect URLs |
| "Invalid client" | Wrong Google Client ID | Check credentials match |
| "Error 400: redirect_uri_mismatch" | Google Console config wrong | Add Supabase callback to Google |
| "No response from OAuth provider" | Network/Supabase issue | Check Supabase status |

## Need More Help?

Check browser console (F12) for exact error messages when clicking Google sign-in.
