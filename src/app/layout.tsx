import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppSessionProvider from '@/components/AppSessionProvider';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hëdi OKBA | Portfolio',
  description:
    "Développeur passionné par la création d'expériences web modernes, performantes et élégantes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
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
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="/stats/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            data-host-url="/stats"
          />
        )}
        
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
