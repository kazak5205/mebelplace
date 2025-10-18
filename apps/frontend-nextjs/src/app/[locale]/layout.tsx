/**
 * Locale Layout - Handles i18n and provides translations
 * This layout wraps all localized content
 */

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/styles/glass-tokens.css';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// Disabled to avoid stale chunks
// export function generateStaticParams() {
//   return routing.locales.map((locale) => ({ locale }));
// }

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
