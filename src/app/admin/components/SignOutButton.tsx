'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      
      // Also use the context signOut if available
      await signOut?.();
      
      // Redirect to admin login
      router.push('/admin-login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <button 
      onClick={handleSignOut}
      className="btn btn-ghost btn-sm"
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
