# ⚡ Auth Quick Reference Card

## 🔴 If You See This Error...

| Error | Fix |
|-------|-----|
| "Can't use API secret key" | Wrong key - See SUPABASE_KEY_FIX.md |
| 401 Unauthorized | Wrong key - Restart server - Clear cookies |
| "No action when I hit enter" | Check console (F12) for errors |
| "Invalid login credentials" | User doesn't exist or wrong password |
| "This account is not an admin" | User role isn't 'admin' - Update in DB |
| Auth state lost on refresh | Check if cookies exist - Check middleware |

## ✅ What Should Happen

### Signup Flow
```
User fills form → Clicks submit → 
See "Check your inbox" or auto-redirect →
Profile created in Supabase users table
```

### Login Flow  
```
User fills form → Clicks submit →
Session created → Redirected to /home →
Auth persists on page refresh
```

### Admin Login
```
User fills form → Clicks submit →
Role checked → "Redirected to /admin" OR "Error: not admin"
```

## 🔧 Most Common Issues

**1. 401 Error or "Can't use API secret key"**
- Update `.env.local` with correct ANON key (starts with `eyJ`)
- Restart: `npm run dev`
- Clear cookies: F12 → Application → Cookies → Delete all

**2. Form doesn't submit**
- Open console: F12 → Check for errors
- Most likely: Key issue (see #1)

**3. Profile not created**
- Check users table exists: Supabase → SQL Editor → Run: `SELECT * FROM public.users;`
- If error: Run `scripts/create-schema.sql`

**4. Auth lost on refresh**
- Check cookies exist: F12 → Application → Cookies
- Should see `sb-` prefixed cookies
- Check middleware.ts is running

## 🧠 Files to Know

| File | Purpose |
|------|---------|
| `.env.local` | Your Supabase credentials (KEEP SECRET) |
| `src/context/AuthContext.tsx` | Global auth state |
| `src/middleware.ts` | Route protection |
| `src/app/login/page.tsx` | Customer login/signup |
| `src/app/admin-login/page.tsx` | Admin login |
| `src/app/auth-debug/page.tsx` | Diagnostics page |

## 🔗 Key URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000/login` | Customer login/signup |
| `http://localhost:3000/admin-login` | Admin login |
| `http://localhost:3000/account` | User account (protected) |
| `http://localhost:3000/auth-debug` | System diagnostics |
| `https://app.supabase.com` | Supabase dashboard |

## 📝 Correct .env.local Format

```env
# ✅ CORRECT
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# ❌ WRONG
NEXT_PUBLIC_SUPABASE_SECRET_KEY=sbp_...
SUPABASE_SECRET_KEY=sbp_...
```

## 🚀 Quick Setup

```bash
# 1. Update .env.local with credentials from Supabase Dashboard → Settings → API
# 2. Restart server
npm run dev

# 3. Verify setup
# Visit: http://localhost:3000/auth-debug
# Should all be ✅

# 4. Test
# Go to: http://localhost:3000/login
# Try signup
```

## 🔐 Authorization Levels

| Route | Who | How |
|-------|-----|-----|
| `/login` | Anyone | No auth needed |
| `/shop` | Anyone | No auth needed |
| `/account` | Authenticated | Needs login |
| `/cart` | Authenticated | Needs login |
| `/checkout` | Authenticated | Needs login |
| `/admin` | Admins only | Needs admin role |
| `/admin-login` | Anyone | No auth needed |

## 🔍 Debug Console Logs

Look for these patterns in console (F12):

```javascript
// From middleware
🔐 [Middleware] Admin route access attempt...

// From auth pages
📝 Attempting customer login: user@example.com
✅ Sign-in successful
❌ Sign-in error: Invalid login credentials

// From auth callback
📝 Creating new user profile
✅ User profile created successfully
⚠️ Could not load user profile: [error]
```

## 💡 Pro Tips

- **Check diagnostics first:** Always go to `/auth-debug` when things break
- **Watch console:** Most info appears there (F12 → Console)
- **Clear cookies:** Often fixes weird session issues
- **Restart server:** Next.js caches can be stale
- **Hard refresh:** Ctrl+Shift+R clears browser cache

## 🆘 Emergency? Check This Order

1. Open console (F12)
2. Visit /auth-debug (all green?)
3. Check .env.local (correct keys?)
4. Read START_HERE.md
5. Read SUPABASE_KEY_FIX.md
6. Read AUTH_TROUBLESHOOTING.md

## ✨ Once It's Working

- Signup creates user in auth.users AND users table
- Login redirects based on role (admin → /admin, customer → /home)
- Auth persists on page refresh
- Can access /account and see real user data
- /admin protected for admins only
- Proper error messages instead of silent failures

---

**Print this page or bookmark it - you'll reference it often!** 📌
