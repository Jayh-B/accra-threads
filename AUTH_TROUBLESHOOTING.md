# 🔧 Complete Auth Troubleshooting Guide

## Issue 1: "Can't use API secret key" + 401 Error

### Problem:
- Form submit does nothing or shows "Can't use API secret key"
- 401 Unauthorized error in network tab

### Solution:
**Step 1: Verify your `.env.local` has the RIGHT keys**

```env
# ✅ CORRECT
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ WRONG - Never use SECRET keys in .env.local!
NEXT_PUBLIC_SUPABASE_SECRET_KEY=sbp_xxx...
```

**Step 2: Get the correct keys from Supabase**

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. You'll see three keys:
   - **Project URL** → Copy to `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → DO NOT USE in .env.local

**Step 3: Restart development server**
```bash
# Stop: Ctrl+C
# Clear cache
rm -rf .next
# Restart
npm run dev
```

**Step 4: Clear browser data**
- Open DevTools → Application → Clear Site Data
- Clear cookies for localhost
- Hard refresh (Ctrl+Shift+R)

---

## Issue 2: "No action when I hit enter" on form submit

### Problem:
- Click submit button - nothing happens
- No errors in console
- Form doesn't submit

### Solutions:

**A) Check Supabase connection:**
Open browser console (F12) and run:
```javascript
// Should show your project URL
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

// Should show anon key
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

**B) Enable debug logging:**
Add this to see what's happening:
```typescript
// At top of login page
useEffect(() => {
  console.log('🔍 Auth state:', { isAuthenticated, isAdmin, loading });
}, [isAuthenticated, isAdmin, loading]);
```

**C) Check Network tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for request to: `jmdqojuxsixtxbavmrwq.supabase.co/auth/v1/token`
5. Check the response:
   - ✅ 200 OK = Keys are correct
   - ❌ 401 = Wrong key (see Issue 1)
   - ❌ 4xx other = Credentials wrong

---

## Issue 3: Profile not created after signup

### Problem:
- Signup works
- User created in auth.users
- But no row in `public.users` table

### Solutions:

**A) Verify users table exists:**
In Supabase SQL Editor, run:
```sql
SELECT * FROM public.users LIMIT 1;
```

If error: "relation 'public.users' does not exist", run:
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'supplier', 'admin')),
  email TEXT,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**B) Check RLS policies:**
The insert policy should allow authenticated users or service role to insert:
```sql
-- Add this if profile creation is failing on signup
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**C) Verify auth.callback is working:**
Check browser console when signing up:
- Should see "📧 Email confirmation required" OR "📧 No confirmation needed"
- Should redirect to /auth/callback
- Should see "📝 Creating new user profile"
- Should see "✅ User profile created successfully"

If not seeing these logs, the callback isn't being called.

---

## Issue 4: Admin login not working

### Problem:
- Admin can login as customer
- But admin login page shows error
- "This account is not an administrator"

### Solutions:

**A) Verify user has admin role:**
In Supabase, run:
```sql
SELECT id, email, role FROM public.users WHERE email = 'admin@example.com';
```

If role is 'customer', update it:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';
```

**B) Check middleware is working:**
Login as admin user and go to `/admin` directly in URL bar:
- ✅ Should show admin dashboard
- ❌ Should be redirected to /home if not admin
- ❌ Should be redirected to /admin-login if not logged in

**C) Test role query:**
In auth.callback route, after user creation, it should query role:
```typescript
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single();
```

Check Supabase logs if this fails.

---

## Issue 5: Auth state not persisting on refresh

### Problem:
- Login works
- Page refreshes
- Auto-redirected to login
- Session lost

### Solutions:

**A) Check session storage:**
In browser console, run:
```javascript
const { data } = await supabase.auth.getSession();
console.log(data.session);
```

Should show session object. If null, session not stored in cookies.

**B) Verify cookie settings:**
Supabase should set cookies automatically. Check:
1. DevTools → Application → Cookies
2. Look for `sb-*` cookies
3. Should have several cookies with `sb-*` prefix

If no cookies, the session can't persist.

**C) Check middleware.ts:**
Ensure it's calling:
```typescript
await supabase.auth.getUser();
```

This refreshes the session.

---

## Issue 6: "Can't find module or other import errors"

### Problem:
- Console shows import errors
- Pages won't load

### Solutions:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm run dev
```

---

## Complete Testing Checklist

### Customer Flow
- [ ] Go to /login
- [ ] Click "Create account" tab
- [ ] Fill form and submit
- [ ] Check console for "📧 Email confirmation required"
- [ ] Should see verification email message
- [ ] Or if no confirmation: redirects to /home
- [ ] Check Supabase → Authentication → Users (should see new user)
- [ ] Check Supabase → SQL Editor → `SELECT * FROM public.users` (should see profile)

### Login Flow
- [ ] Go to /login
- [ ] Already logged in? Should redirect to /home
- [ ] Fill login form with valid credentials
- [ ] Check console for "✅ Sign-in successful"
- [ ] Should redirect to /home
- [ ] Visit /account - should see real user data
- [ ] Hard refresh - auth should persist
- [ ] Click Sign Out - should go back to /login

### Admin Flow
- [ ] Create admin user in Supabase SQL: `UPDATE public.users SET role = 'admin' WHERE email = '...'`
- [ ] Go to /admin-login
- [ ] Try to login with non-admin user
- [ ] Should see error: "This account is not an administrator"
- [ ] Login with admin user
- [ ] Should redirect to /admin
- [ ] Go to /admin directly
- [ ] Should show admin dashboard
- [ ] Try to access /admin as customer
- [ ] Should redirect to /home with error

### Debug Console Logs
Enable these to see what's happening:

Open browser console (F12) and look for:
- 🔐 Middleware logs (starting with 🔐)
- 📝 Auth logs (starting with 📝)
- ❌ Error logs (starting with ❌)
- ✅ Success logs (starting with ✅)

If you see ❌ errors, note them for debugging.

---

## If All Else Fails

1. **Check Supabase Status**: https://status.supabase.com
2. **Check browser console (F12)** for actual error messages
3. **Check Supabase logs** (Project → Logs)
4. **Verify table exists**: `SELECT * FROM public.users`
5. **Test directly in Supabase**: Try signup/login in Supabase dashboard
6. **Check RLS policies** on users table
7. **Restart dev server**: `npm run dev`
8. **Hard refresh browser**: `Ctrl+Shift+R`
9. **Clear cookies**: DevTools → Application → Cookies → Delete all

---

## Key URLs to Check

- Supabase Dashboard: https://app.supabase.com
- Project API Settings: Dashboard → Settings → API
- SQL Editor: Dashboard → SQL Editor
- User Auth: Dashboard → Authentication
- Logs: Dashboard → Logs
