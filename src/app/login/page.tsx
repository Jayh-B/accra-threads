'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import styles from './page.module.css';

type Mode = 'login' | 'register';
type Screen = 'form' | 'verify-email';

function LoginContent() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/home';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [screen, setScreen] = useState<Screen>('form');
  const [verifyEmail, setVerifyEmail] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'auth_callback_failed' ? 'Authentication failed. Please try again.' : null
  );

  // If user is already authenticated, redirect appropriately
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (isAuthenticated) {
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, router, redirectTo]);

  // ── Email / Password submit ─────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (mode === 'login') {
        console.log('📝 Attempting customer login:', email);
        
        // Validate inputs
        if (!email || !password) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error('❌ Sign-in error:', signInError);
          const errorMsg = signInError.message || 'Login failed';
          
          // Check for common errors
          if (errorMsg.includes('401') || errorMsg.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          } else if (errorMsg.includes('secret')) {
            throw new Error('⚠️ Configuration error: Check your Supabase keys in .env.local. See SUPABASE_KEY_FIX.md');
          }
          throw signInError;
        }

        console.log('✅ Sign-in successful');

        // Check if the user is an admin and redirect accordingly
        if (signInData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', signInData.user.id)
            .single();

          if (profileError) {
            console.warn('Could not verify user role:', profileError.message);
            // Still continue to home even if profile fetch fails
            router.push(redirectTo);
            return;
          }

          if (profile?.role === 'admin') {
            console.log('👤 User is admin, redirecting to /admin');
            router.push('/admin');
            return;
          }
        }
        
        console.log('👥 User is customer, redirecting to:', redirectTo);
        router.push(redirectTo);
      } else {
        // Register
        console.log('📝 Attempting registration:', email);
        
        if (!email || !password || !fullName) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${location.origin}/auth/callback?next=${redirectTo}`,
          },
        });
        
        if (signUpError) {
          console.error('❌ Sign-up error:', signUpError);
          const errorMsg = signUpError.message || 'Registration failed';
          
          if (errorMsg.includes('secret')) {
            throw new Error('⚠️ Configuration error: Check your Supabase keys in .env.local. See SUPABASE_KEY_FIX.md');
          } else if (errorMsg.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw signUpError;
        }

        console.log('✅ Registration successful');

        // Best-effort: ensure a profile row exists immediately (helps when email
        // confirmation is disabled and no /auth/callback runs).
        if (data.user) {
          try {
            const meta = data.user.user_metadata as unknown;
            const metaFullName =
              meta && typeof meta === 'object' && 'full_name' in meta
                ? (meta as { full_name?: unknown }).full_name
                : undefined;
            await supabase.from('users').upsert(
              {
                id: data.user.id,
                email: data.user.email,
                full_name:
                  (typeof metaFullName === 'string' ? metaFullName : undefined) ||
                  fullName ||
                  data.user.email?.split('@')[0] ||
                  'User',
                role: 'customer',
                loyalty_points: 0,
              },
              { onConflict: 'id' }
            );
          } catch {
            // Ignore: profile creation is also handled in /auth/callback and/or by DB triggers.
          }
        }

        // If email confirmation is required, show verify screen
        if (data.session === null) {
          console.log('📧 Email confirmation required');
          setVerifyEmail(email);
          setScreen('verify-email');
        } else {
          // Email confirmation disabled in Supabase — just log in
          console.log('📧 No confirmation needed, redirecting to home');
          router.push('/home');
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('❌ Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Google OAuth ────────────────────────────────────────────────────────────
  async function handleGoogle() {
    setError(null);
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      console.log('🔐 Starting Google OAuth');
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback?next=${redirectTo}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      console.error('❌ OAuth error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.bgImageContainer}>
          <img src="/accra_fashion_week.png" alt="Accra Fashion Week" className={styles.bgImage} />
          <div className={styles.overlay} />
        </div>
        <div className={styles.formCard}>
          <div style={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // ── Email Verification Screen ───────────────────────────────────────────────
  if (screen === 'verify-email') {
    return (
      <div className={styles.container}>
        <div className={styles.bgImageContainer}>
          <img src="/accra_fashion_week.png" alt="Accra Fashion Week" className={styles.bgImage} />
          <div className={styles.overlay} />
        </div>

        <div className={styles.formCard}>
          <div className={styles.verifyIcon}>✉️</div>
          <h1 className={styles.title}>Check your inbox</h1>
          <p className={styles.subtitle}>
            We&apos;ve sent a verification link to <strong>{verifyEmail}</strong>.
            Click the link to activate your account and start shopping.
          </p>
          <p className={styles.verifyNote}>
            Didn&apos;t receive anything? Check your spam folder, or{' '}
            <button
              className={styles.textBtn}
              onClick={() => {
                setScreen('form');
                setMode('register');
              }}
            >
              try again
            </button>
            .
          </p>
          <Link href="/" className={styles.backToLanding}>
            ← Back to Accra Threads
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* Animated background */}
      <div className={styles.bgImageContainer}>
        <img src="/accra_fashion_week.png" alt="Accra Fashion Week" className={styles.bgImage} />
        <div className={styles.overlay} />
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div className={styles.logo}>
          <User size={20} /> Accra<span>Threads</span>
        </div>
        <Link href="/support" className={styles.supportLink}>
          Contact support
        </Link>
      </div>

      {/* Card */}
      <div className={styles.formCard}>
        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'login' ? styles.modeBtnActive : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'register' ? styles.modeBtnActive : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Create account
          </button>
        </div>

        <h1 className={styles.title}>
          {mode === 'login' ? 'Welcome back' : 'Join Accra Threads'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in to your account to continue.'
            : 'Create your free account. Get 20% off your first order.'}
        </p>

        {/* Google OAuth */}
        <div className={styles.socialAuth}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={handleGoogle}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className={styles.socialIcon} aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className={styles.divider}>or</div>

        {/* Error message */}
        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label htmlFor="fullName" className={styles.formLabel}>Full name</label>
              <div className={styles.inputWrap}>
                <User size={15} className={styles.inputIcon} />
                <input
                  type="text"
                  id="fullName"
                  className={styles.formInput}
                  placeholder="Ama Owusu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email address</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                className={styles.formInput}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              {mode === 'login' && (
                <button type="button" className={styles.forgotLink} onClick={() => {
                  if (!email) { setError('Enter your email above first.'); return; }
                  if (!isSupabaseConfigured) {
                    setError('Supabase is not configured. Add your .env.local variables and restart.');
                    return;
                  }
                  getSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
                    redirectTo: `${location.origin}/auth/callback`,
                  }).then(() => setError('Password reset email sent. Check your inbox.')).catch(() => setError('Error sending reset email.'));
                }}>
                  Forgot password?
                </button>
              )}
            </div>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                id="password"
                className={`${styles.formInput} ${styles.formInputPadRight}`}
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign in →'
              : 'Create account →'}
          </button>
        </form>

        <div className={styles.registerWrap}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button type="button" className={styles.textBtn} onClick={() => { setMode('register'); setError(null); }}>
                Sign up free
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" className={styles.textBtn} onClick={() => { setMode('login'); setError(null); }}>
                Sign in
              </button>
            </>
          )}
        </div>

        <div className={styles.registerWrap}>
          Need admin access?{' '}
          <a href="/admin-login" className={styles.textBtn}>
            Use the admin login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
