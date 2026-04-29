import type { Metadata } from 'next';
import './globals.css';
import MainWrapper from '@/components/layout/MainWrapper';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export const metadata: Metadata = {
  title: { default: 'Accra Threads — Wear the City. Own Your Story.', template: '%s | Accra Threads' },
  description: 'Proudly Ghanaian fashion e-commerce. Contemporary streetwear rooted in Kente culture. Shop men, women, accessories and exclusive Kente Drops. Free delivery in Accra.',
  keywords: ['Ghanaian fashion', 'kente streetwear', 'Accra fashion', 'African streetwear', 'kente clothing Ghana'],
  openGraph: { title: 'Accra Threads', description: 'Wear the City. Own Your Story.', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <MainWrapper>
                {children}
              </MainWrapper>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
