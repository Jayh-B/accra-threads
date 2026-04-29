'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    if (!isAuthenticated) {
      // Not logged in, redirect to login
      router.replace('/login?redirectTo=' + window.location.pathname);
      return;
    }

    if (requiredRole === 'admin' && !isAdmin) {
      // Not an admin, redirect to home
      router.replace('/home?error=unauthorized');
      return;
    }

    if (requiredRole === 'customer' && isAdmin) {
      // Is admin but trying to access customer route - this is ok, allow it
      return;
    }
  }, [isAuthenticated, isAdmin, loading, requiredRole, router]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 20px' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
