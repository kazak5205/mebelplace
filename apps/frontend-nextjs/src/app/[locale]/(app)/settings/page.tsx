/**
 * Settings Page - User settings and preferences with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings Page</h1>
      <p>This is a simple settings page.</p>
    </div>
  );
}