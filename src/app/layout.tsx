import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppSessionProvider from '@/components/AppSessionProvider';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Mon Portfolio',
  description: 'Portfolio personnel créé avec Next.js et Tailwind CSS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Anti-flash script : check localStorage avant le 1er rendu React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light') {
                  document.documentElement.classList.remove('dark')
                } else {
                  document.documentElement.classList.add('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground transition-colors duration-300">
        <AppSessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
        </AppSessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
