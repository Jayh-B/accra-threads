'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatFloatBtn from '@/components/support/ChatFloatBtn';

// Routes that render their own nav/footer (no global chrome)
const STANDALONE_ROUTES = ['/', '/login'];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isStandalone = STANDALONE_ROUTES.includes(pathname ?? '');
  const isAdmin = pathname?.startsWith('/admin');
  const noPadding = isStandalone || isAdmin;

  if (isStandalone) {
    // Landing & login render their own complete page — no global nav/footer
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: noPadding ? '0' : '72px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
      <ChatFloatBtn />
    </>
  );
}
