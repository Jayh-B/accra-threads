'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from '../login/page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('🔑 Attempting admin login for:', email);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('❌ Sign-in error:', signInError);
        throw signInError;
      }

      console.log('✅ Sign-in successful, user ID:', signInData.user?.id);

      if (signInData.user) {
        // Verify session was created
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('📋 Session check:', { hasSession: !!session, error: sessionError });
        
        if (sessionError || !session) {
          console.error('❌ Session error:', sessionError);
          setError('Session creation failed. Please try again.');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Fetching user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        console.log('📊 Profile fetch result:', { profile, error: profileError });

        if (profileError) {
          console.error('❌ Profile error:', profileError);
          setError('Could not verify admin status. Please try again.');
          setIsLoading(false);
          return;
        }

        if (profile?.role === 'admin') {
          console.log('✅ Admin role confirmed, navigating to /admin');
          // Simple redirect - let middleware handle the auth check
          setTimeout(() => {
            router.push('/admin');
          }, 100);
          return;
        }

        console.log('❌ User role is not admin:', profile?.role);
        setError('This account is not an administrator. Please use the customer login.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message ?? 'Admin sign-in failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgImageContainer}>
        <img src="/accra_fashion_week.png" alt="Accra Fashion Week" className={styles.bgImage} />
        <div className={styles.overlay} />
      </div>

      <div className={styles.topBar}>
        <Link href="/login" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to customer login
        </Link>
        <div className={styles.logo}>
          <User size={20} /> Admin<span>Accra</span>
        </div>
        <Link href="/support" className={styles.supportLink}>
          Contact support
        </Link>
      </div>

      <div className={styles.formCard}>
        <h1 className={styles.title}>Admin sign in</h1>
        <p className={styles.subtitle}>
          Sign in with your administrator account to manage the store.
        </p>

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email address</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                className={styles.formInput}
                placeholder="admin@example.com"
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
            </div>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                id="password"
                className={`${styles.formInput} ${styles.formInputPadRight}`}
                placeholder="••••••••"
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

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Admin sign in →'}
          </button>
        </form>

        <div className={styles.registerWrap}>
          Not an admin?{' '}
          <Link href="/login" className={styles.textBtn}>
            Go to customer login
          </Link>
        </div>
      </div>
    </div>
  );
}
