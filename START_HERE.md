# 🎯 IMMEDIATE ACTION PLAN - Start Here!

## Your Issues:
- ❌ "Can't use API secret key" error
- ❌ "No action when I hit enter"
- ❌ 401 Unauthorized errors
- ❌ Multiple auth flows broken

## Root Cause:
**You're using the WRONG Supabase key in .env.local**

The error "Can't use API secret key" is a dead giveaway!

---

## ⏱️ 5-Minute Fix

### Step 1: Get Correct Keys (1 min)
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** (looks like: `https://jmdqojuxsixtxbavmrwq.supabase.co`)
   - **anon public** (long string starting with `eyJ`)

### Step 2: Update .env.local (1 min)
In your project root, create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jmdqojuxsixtxbavmrwq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**CRITICAL: DO NOT include SUPABASE_SECRET_KEY or service_role keys!**

### Step 3: Restart Server (1 min)
```bash
# Stop the server (Ctrl+C if running)
# Clear cache
rm -rf .next
# Restart
npm run dev
```

### Step 4: Clear Browser (1 min)
1. Open DevTools (F12)
2. Application → Cookies
3. Delete all `localhost` cookies
4. Hard refresh (Ctrl+Shift+R)

### Step 5: Verify (1 min)
1. Go to http://localhost:3000/auth-debug
2. **All green ✅?** → Continue to "Test It"
3. **Still red ❌?** → See troubleshooting below

---

## 🧪 Test It

Go to http://localhost:3000/login

**Try signup:**
1. Click "Create account"
2. Fill form with test data
3. Click "Create account →"
4. **Should see:** "Check your inbox" message

✅ **Success!** Profile is created. Check in Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM public.users WHERE email = 'yourtestemail@example.com';
```

Should show a row with your test user!

**Try login:**
1. Click "Sign in"
2. Enter credentials
3. Click "Sign in →"
4. **Should redirect to:** /home
5. **Should see:** Your actual user data in "My Account"

---

## ❌ Still Having Issues?

### Issue: Still seeing "Can't use API secret key"

**Solution:**
1. Double-check your `.env.local`
2. The key should START with `eyJ` (not `sbp_`)
3. If you copied `service_role` instead of `anon public`, that's wrong!
4. Go back to Supabase → Settings → API
5. Copy the CORRECT "anon public" key
6. Update `.env.local`
7. Delete `.next` folder
8. Restart dev server: `npm run dev`

### Issue: /auth-debug shows ❌ on environment vars

**Solution:**
1. Your `.env.local` isn't being read
2. Make sure file is named `.env.local` (not `.env.local.example`)
3. Make sure it's in the PROJECT ROOT (same folder as `package.json`)
4. Check the file has no trailing spaces or weird characters
5. Restart dev server
6. Hard refresh browser

### Issue: /auth-debug shows ❌ on users table

**Solution:**
1. Run schema in Supabase:
   - Go to Supabase Dashboard → SQL Editor
   - Open `scripts/create-schema.sql` from your project
   - Copy all the SQL
   - Paste into Supabase SQL Editor
   - Click "Run"
2. Wait for success (should take <1 second)
3. Refresh /auth-debug page

### Issue: Form won't submit (no action on Enter)

**Solution:**
1. Open DevTools (F12)
2. Try to login/signup
3. Look for RED error messages in console
4. Share the error with the error messages documented above
5. Most likely: Key issue (follow first solution)

---

## 📋 Verification Checklist

Before you try to login, verify:

- [ ] `.env.local` exists in project root
- [ ] Contains `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Contains `NEXT_PUBLIC_SUPABASE_ANON_KEY` (starts with `eyJ`)
- [ ] NO `SUPABASE_SECRET_KEY` in file
- [ ] Dev server running: `npm run dev`
- [ ] Can access `http://localhost:3000/auth-debug`
- [ ] All indicators on `/auth-debug` are ✅
- [ ] Browser cookies cleared

✅ **All checked?** → Try signup/login!

---

## 🎯 Next Phase - After Basic Auth Works

Once signup/login works:

### 1. Create admin user:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'youremail@example.com';
```

### 2. Test admin login:
1. Go to http://localhost:3000/admin-login
2. Login with admin account
3. Should redirect to /admin dashboard

### 3. Test protected routes:
- Go to /account → Should see your profile
- Go to /cart → Should show cart
- Try accessing /admin as customer → Should redirect to /home

---

## 📞 Still Stuck?

1. **Check `/auth-debug`** - Shows exactly what's wrong
2. **Check console (F12)** - Look for red error messages
3. **Read SUPABASE_KEY_FIX.md** - Most common issue
4. **Read AUTH_TROUBLESHOOTING.md** - Deep dive help
5. **Read SETUP_GUIDE.md** - Full setup walkthrough

The fixes are all in place. The most likely issue is the Supabase key. Fix that first, and everything should work!

---

## ✅ Success Looks Like:

**Signup:**
```
1. Go to /login
2. Click "Create account"
3. Fill in details
4. Click submit
5. See: "Check your inbox"
6. Check Supabase: New user in users table ✅
```

**Login:**
```
1. Go to /login
2. Enter credentials
3. Click submit
4. Redirected to /home ✅
5. Visit /account
6. See YOUR actual user data (name, email) ✅
```

**Admin:**
```
1. Go to /admin-login
2. Enter admin credentials
3. Click submit
4. Redirected to /admin dashboard ✅
```

If you see all these ✅, you're DONE! The auth system is working!

---

## 🚀 Final Checklist

- [ ] Updated .env.local with correct Supabase keys
- [ ] Restarted dev server
- [ ] Cleared browser cookies
- [ ] Checked /auth-debug (all green)
- [ ] Created schema in Supabase (if needed)
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Verified user data appears in /account
- [ ] Created admin user (if needed)
- [ ] Tested admin login (if needed)
- [ ] Everything working? ✅ You're done!

**Good luck! The system is solid now!** 🎉
