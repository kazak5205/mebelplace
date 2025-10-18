/**
 * Root Layout - Application shell
 * Provides theme, React Query, and global styles
 */

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme-provider';
import { ReactQueryProvider } from '@/lib/react-query/index';
import { ReduxProvider } from '@/lib/store/ReduxProvider';
import { ErrorHandler } from '@/components/providers/ErrorHandler';
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s - MebelPlace',
    default: 'MebelPlace - Платформа для заказа мебели на заказ',
  },
  description:
    'MebelPlace - современная платформа для заказа мебели на заказ. Находите мастеров, смотрите видео работ, заказывайте мебель напрямую у производителей в Казахстане.',
  keywords: [
    'мебель на заказ',
    'мастера мебели',
    'кухни на заказ',
    'шкафы купе',
    'мебель Алматы',
    'мебель Астана',
    'производители мебели Казахстан',
  ],
  authors: [{ name: 'MebelPlace Team' }],
  creator: 'MebelPlace',
  publisher: 'MebelPlace',
  metadataBase: new URL('https://mebelplace.kz'),
  alternates: {
    canonical: '/',
    languages: {
      'ru-KZ': '/ru',
      'kk-KZ': '/kz',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_KZ',
    url: 'https://mebelplace.kz',
    siteName: 'MebelPlace',
    title: 'MebelPlace - Платформа для заказа мебели',
    description: 'Находите лучших мастеров мебели Казахстана, смотрите видео работ и заказывайте мебель на заказ',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MebelPlace - Платформа для заказа мебели',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MebelPlace - Платформа для заказа мебели',
    description: 'Находите лучших мастеров мебели Казахстана',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E0E' },
  ],
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://mebelplace.com.kz" />
        <link rel="dns-prefetch" href="https://mebelplace.com.kz" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'MebelPlace',
              description: 'Платформа для заказа мебели на заказ в Казахстане',
              url: 'https://mebelplace.kz',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://mebelplace.kz/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'MebelPlace',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://mebelplace.kz/logo.png',
                },
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <ReduxProvider>
          <ThemeProvider defaultTheme="system">
            <ReactQueryProvider>
              <ErrorHandler>{children}</ErrorHandler>
            </ReactQueryProvider>
          </ThemeProvider>
        </ReduxProvider>
        
        {/* Global Screen Reader Announcer */}
        <div
          id="global-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}
