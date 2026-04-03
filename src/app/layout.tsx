import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import ChatFloatBtn from '@/components/support/ChatFloatBtn';

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
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main style={{ paddingTop: '72px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
            <Footer />
            <ChatFloatBtn />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
