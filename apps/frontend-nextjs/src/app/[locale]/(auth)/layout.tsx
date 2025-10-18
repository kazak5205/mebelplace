/**
 * Auth Layout - Public routes (login, register, etc.)
 * Minimal layout for authentication pages
 */

// Force dynamic rendering for all auth routes
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

