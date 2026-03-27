import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppSessionProvider from '@/components/AppSessionProvider';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import RouteScrollReset from '@/components/Provider/RouteScrollReset';

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
      <head />
      <body className="bg-background text-foreground transition-colors duration-300">
        <RouteScrollReset>
          <AppSessionProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ScrollToTop />
          </AppSessionProvider>
          <Analytics />
          <SpeedInsights />
          <Script
            id="anti-flash"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html:
                "try { if (localStorage.theme === 'light') { document.documentElement.classList.remove('dark'); } else { document.documentElement.classList.add('dark'); } } catch (_) {}",
            }}
          />
          {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
            <Script
              src="/stats/script.js"
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              data-host-url="/stats"
              strategy="afterInteractive"
            />
          )}
          <Script
            id="scroll-reset"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html:
                "if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } if (window.location.hash) { history.replaceState('', document.title, window.location.pathname + window.location.search); } setTimeout(function() { window.scrollTo(0, 0); }, 50);",
            }}
          />
        </RouteScrollReset>
      </body>
    </html>
  );
}
