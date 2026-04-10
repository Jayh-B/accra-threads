'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noPadding = pathname === '/login' || pathname?.startsWith('/admin');

  return (
    <main style={{ paddingTop: noPadding ? '0' : '72px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </main>
  );
}
