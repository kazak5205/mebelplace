/**
 * Locale Root Page - Redirects to Feed
 */

import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/feed`);
}

