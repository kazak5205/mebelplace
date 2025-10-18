'use client';

import { DashboardStats } from '@/components/admin/DashboardStats';
import { ModerationQueue } from '@/components/admin/ModerationQueue';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';

export default function AdminDashboard() {

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Админ Панель
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление платформой MebelPlace
          </p>
        </div>

        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalyticsChart type="users" period="week" />
          <AnalyticsChart type="videos" period="week" />
        </div>

        <ModerationQueue />
      </div>
    </div>
  );
}
