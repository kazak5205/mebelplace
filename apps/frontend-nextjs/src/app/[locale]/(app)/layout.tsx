/**
 * App Layout - Protected routes wrapper
 * Uses AppLayout component for responsive navigation
 */

import { AppLayout } from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

