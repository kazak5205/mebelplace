/**
 * Loading UI for all (app) routes
 */

import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <Spinner size="lg" />
    </div>
  );
}

