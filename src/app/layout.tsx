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
import FramerProvider from '@/components/Provider/FramerProvider';

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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Hëdi OKBA | Ingénieur et Développeur Full-Stack',
    template: '%s | Hëdi OKBA',
  },
  description:
    "Développeur passionné par la création d'expériences web modernes, performantes et élégantes. Découvrez mon portfolio, mes projets et mes compétences.",
  keywords: ['développeur', 'full-stack', 'portfolio', 'Next.js', 'React', 'Hëdi OKBA'],
  authors: [{ name: 'Hëdi OKBA', url: APP_URL }],
  creator: 'Hëdi OKBA',
  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Hëdi OKBA | Ingénieur et Développeur Full-Stack',
    description:
      "Développeur passionné par la création d'expériences web modernes, performantes et élégantes.",
    url: APP_URL,
    siteName: 'Portfolio Hëdi OKBA',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hëdi OKBA — Développeur Full-Stack',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hëdi OKBA | Ingénieur et Développeur Full-Stack',
    description: 'Découvrez mon portfolio, mes projets et mon parcours web.',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Hëdi OKBA',
  jobTitle: 'Développeur Full-Stack',
  url: APP_URL,
  sameAs: ['https://github.com/Hedi1312', 'https://www.linkedin.com/in/hedi-okba'],
  knowsAbout: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  image: `${APP_URL}/og-image.png`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash: must run before first paint to avoid white flash in dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.theme==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(_){}",
          }}
        />
      </head>
      <body className="bg-background text-foreground transition-colors duration-300">
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RouteScrollReset>
          <FramerProvider>
            <AppSessionProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <ScrollToTop />
            </AppSessionProvider>
          </FramerProvider>
          <Analytics />
          <SpeedInsights />
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
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html:
                "if('scrollRestoration' in history){history.scrollRestoration='manual'}if(window.location.hash){history.replaceState('',document.title,window.location.pathname+window.location.search)}window.scrollTo(0,0);",
            }}
          />
        </RouteScrollReset>
      </body>
    </html>
  );
}
