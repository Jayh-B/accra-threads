# ✅ Complete Auth Setup - Step by Step

## Step 1: Get Your Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project (accra-threads)
3. Go to **Settings** → **API**
4. You'll see:
   - **Project URL**: `https://jmdqojuxsixtxbavmrwq.supabase.co` (or similar)
   - **anon public**: `eyJhbGc...` (long string starting with eyJ)
   - **service_role secret**: `sbp_...` (DO NOT USE)

## Step 2: Update Your Environment File

Create or update `.env.local` in the project root:

```env
# ✅ CORRECT - Copy these exact values from Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jmdqojuxsixtxbavmrwq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:**
- Do NOT include `SUPABASE_SECRET_KEY` or `NEXT_PUBLIC_SUPABASE_SECRET_KEY`
- The ANON key MUST start with `eyJ`
- The ANON key is PUBLIC - it's safe in .env.local

## Step 3: Create Users Table in Supabase

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy-paste the entire contents of `scripts/create-schema.sql`
4. Click **Run**
5. Wait for success message

## Step 4: Restart Development Server

```bash
# Stop the server (Ctrl+C if running)
# Then:
npm run dev
```

## Step 5: Test the Setup

1. Open http://localhost:3000/auth-debug
2. Check all the green ✅ status indicators
3. If any ❌ errors, follow the "Next Steps" section

## Step 6: Try Signup

1. Go to http://localhost:3000/login
2. Click "Create account" tab
3. Fill in:
   - Full name: Test User
   - Email: test@example.com
   - Password: TestPassword123 (min 8 chars)
4. Click "Create account →"
5. **Expected**: See "Check your inbox" message
6. **If error**: Check /auth-debug page again for issues

## Step 7: Verify Profile Created

1. Go to Supabase Dashboard → **SQL Editor**
2. Run:
   ```sql
   SELECT * FROM public.users WHERE email = 'test@example.com';
   ```
3. **Should see** a row with your test user

## Step 8: Create an Admin User

```sql
-- Update the test user to admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'test@example.com';

-- Or create a new admin directly in auth first
INSERT INTO public.users (id, email, full_name, role, loyalty_points)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'Admin User',
  'admin',
  0
);
```

## Step 9: Test Admin Login

1. Go to http://localhost:3000/admin-login
2. Use admin user credentials from above
3. Should redirect to /admin dashboard

## Step 10: Test Customer Login

1. Go to http://localhost:3000/login
2. Switch to "Sign in" tab
3. Use test@example.com and password
4. Should redirect to /home
5. Click "My Account" - should see your profile info

---

## Troubleshooting Checklist

### ✅ All green on /auth-debug but still having issues?

**Check these:**

1. **Did you restart the dev server?**
   ```bash
   # Stop (Ctrl+C) and start fresh
   npm run dev
   ```

2. **Clear browser cookies:**
   - F12 → Application → Cookies
   - Delete all `localhost` cookies
   - Hard refresh (Ctrl+Shift+R)

3. **Check browser console (F12)** for error messages starting with:
   - `❌` (errors)
   - `⚠️` (warnings)
   - `🔐` (middleware logs)

4. **Verify users table exists:**
   In Supabase SQL Editor:
   ```sql
   SELECT * FROM public.users LIMIT 1;
   ```
   - ✅ Shows rows = table exists
   - ❌ Error = table missing, run create-schema.sql again

5. **Check RLS policies:**
   In Supabase → Settings → Auth → Policies
   - Should see at least 3 policies on users table
   - If missing, run create-schema.sql again

### ❌ Still not working?

1. Check [AUTH_TROUBLESHOOTING.md](AUTH_TROUBLESHOOTING.md)
2. Check [SUPABASE_KEY_FIX.md](SUPABASE_KEY_FIX.md)
3. Share console errors (F12) with error message

---

## One-Command Setup (Quick Reference)

```bash
# 1. Update .env.local with your Supabase credentials
# 2. Run schema
# 3. Restart dev server
npm run dev

# 4. Verify at
# http://localhost:3000/auth-debug

# 5. Test signup at
# http://localhost:3000/login
```

---

## File Reference

| File | Purpose |
|------|---------|
| `.env.local` | Contains your Supabase credentials |
| `scripts/create-schema.sql` | Creates users table and RLS policies |
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/context/AuthContext.tsx` | Global auth state management |
| `src/app/login/page.tsx` | Customer login/signup |
| `src/app/admin-login/page.tsx` | Admin login |
| `src/middleware.ts` | Route protection |
| `src/app/auth-debug/page.tsx` | Diagnostics page |
| `AUTH_TROUBLESHOOTING.md` | Detailed troubleshooting |
| `SUPABASE_KEY_FIX.md` | Key configuration help |

---

## Expected Behavior After Setup

### ✅ Signup Works
- Fill signup form → Click submit
- See "Check your inbox" message
- User appears in Supabase auth.users table
- User profile appears in public.users table

### ✅ Login Works
- Fill login form → Click submit
- Redirected to /home
- Can access /account and see profile
- Auth persists on page refresh

### ✅ Admin Works
- Admin user can login at /admin-login
- Redirected to /admin dashboard
- Customer can't access /admin
- Redirected to /home with error

### ✅ Auth State Global
- Any page can access `useAuth()` hook
- Returns `user`, `profile`, `isAdmin`, `isAuthenticated`
- Sign out clears all auth data
- Redirects to /login

---

## Need More Help?

1. **Check the docs:** Read relevant .md files above
2. **Enable console logs:** Look for 🔐 and ❌ messages in console
3. **Test at /auth-debug:** Run diagnostics to find issues
4. **Review error logs:** Supabase Dashboard → Logs
5. **Verify database:** Check Supabase SQL for tables/policies

All the pieces are now in place. The setup should work! 🚀
