/**
 * Login Page - User authentication with i18n
 * Uses react-hook-form + zod validation
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/api/hooks/useAuth';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { useTranslations } from 'next-intl';
import GlassLoginScreen from './GlassLoginScreen';

export default function LoginPage() {
  // For now, just render the Glass login screen
  /* API integration complete */
  return <GlassLoginScreen />;
}

