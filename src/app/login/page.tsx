'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/'; // Simple redirect for now
    }, 1500);
  };

  return (
    <div className={styles.container}>
      {/* Animated 3D background */}
      <div className={styles.bgImageContainer}>
        <img 
          src="/accra_fashion_week.png" 
          alt="Accra Fashion Week 3D" 
          className={styles.bgImage} 
        />
        <div className={styles.overlay} />
      </div>

      {/* Top Bar matching reference */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back
        </Link>
        
        <div className={styles.logo}>
          <User size={24} /> Accra Threads
        </div>
        
        <Link href="/support" className={styles.supportLink}>
          Contact support
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className={styles.formCard}>
        <h1 className={styles.title}>Log in to Accra Threads</h1>
        <p className={styles.subtitle}>Wear the city. Own your story.</p>

        {/* Social Buttons */}
        <div className={styles.socialAuth}>
          {/* Google */}
          <button type="button" className={styles.socialBtn}>
            <svg viewBox="0 0 24 24" className={styles.socialIcon}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        </div>

        <div className={styles.divider}>or</div>

        {/* Email Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email address</label>
            <input 
              type="email" 
              id="email" 
              className={styles.formInput} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <input 
              type="password" 
              id="password" 
              className={styles.formInput} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Continue with Email'}
          </button>
        </form>

        <div className={styles.registerWrap}>
          Don't have an account? <Link href="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
