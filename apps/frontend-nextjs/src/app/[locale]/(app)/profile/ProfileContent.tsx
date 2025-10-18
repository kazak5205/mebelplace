/**
 * ProfileContent - User profile with tabs and settings
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Video,
  Heart,
  FileText,
  LogOut,
  Edit2,
  Camera,
  Moon,
  Sun,
  Globe,
  Bell,
  Package,
  Gift,
} from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/lib/api/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useTheme } from '@/lib/theme-provider';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ProductsTab } from '@/components/profile/ProductsTab';
import { ReferralTab } from '@/components/profile/ReferralTab';
import { VideosTab } from '@/components/profile/VideosTab';
import { FavoritesTab } from '@/components/profile/FavoritesTab';
import { OrdersTab } from '@/components/profile/OrdersTab';
import { PremiumProfileHeader } from '@/components/profile/PremiumProfileHeader';
import { PremiumTabs } from '@/components/ui/PremiumTabs';

type Tab = 'overview' | 'videos' | 'favorites' | 'requests' | 'products' | 'referrals' | 'settings';

export function ProfileContent() {
  const t = useTranslations('profile');
  const router = useRouter();
  const { toggleTheme, resolvedTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Fetch user profile
  const { data: profileData, isLoading, isError } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Redirect to login if not authenticated
  if (isError || (!isLoading && !profileData)) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !profileData) {
    // Redirect to login - no guest profile
    router.push('/login');
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  const user = profileData;

  const tabs = [
    { id: 'overview', label: t('tabs.overview'), icon: User },
    { id: 'videos', label: t('tabs.videos'), icon: Video },
    { id: 'products', label: 'Услуги', icon: Package },
    { id: 'favorites', label: t('tabs.favorites'), icon: Heart },
    { id: 'requests', label: t('tabs.requests'), icon: FileText },
    { id: 'referrals', label: 'Рефералы', icon: Gift },
    { id: 'settings', label: t('tabs.settings'), icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Premium Profile Header */}
      <PremiumProfileHeader
        userId={user.id.toString()}
        username={user.username}
        name={user.username}
        bio={user.bio || undefined}
        avatar={user.avatar || undefined}
        coverImage={undefined}
        location={user.region || undefined}
        role={user.role as 'buyer' | 'master' | 'admin'}
        stats={{
          followers: user.followers_count || 0,
          following: user.following_count || 0,
          videos: user.videos_count || 0,
          likes: (user as any).total_likes || 0,
          rating: user.rating || 0,
          orders: (user as any).orders_count || 0,
        }}
        isVerified={user.is_verified || false}
        isOwnProfile={true}
        onEdit={() => setShowEditModal(true)}
      />

      {/* Premium Tabs */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <PremiumTabs
          tabs={tabs.map(({ id, label, icon: Icon }) => ({
            id,
            label,
            icon: <Icon className="w-5 h-5" />,
          }))}
          defaultTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as Tab)}
          variant="glass"
        />
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'videos' && <VideosTab userId={user.id} isOwnProfile={true} />}
          {activeTab === 'products' && <ProductsTab userId={user.id} isOwnProfile={true} />}
          {activeTab === 'favorites' && <FavoritesTab />}
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'referrals' && <ReferralTab userId={user.id} />}
          {activeTab === 'settings' && (
            <SettingsTab theme={resolvedTheme} onToggleTheme={toggleTheme} />
          )}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={(data) => {
          updateProfile(data, {
            onSuccess: () => setShowEditModal(false),
          });
        }}
        isSaving={isUpdating}
      />
    </div>
  );
}

// Tab Components
function OverviewTab({ user }: { user: any }) {
  const t = useTranslations('profile');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            {t('overview.accountInfo')}
          </h3>
          <div className="space-y-3">
            <InfoRow label={t('overview.email')} value={user.email} />
            <InfoRow label={t('overview.phone')} value={user.phone} />
            <InfoRow label={t('overview.region')} value={user.region} />
            <InfoRow label={t('overview.role')} value={user.role} />
            <InfoRow
              label={t('overview.joined')}
              value={new Date(user.created_at).toLocaleDateString('ru-RU')}
            />
          </div>
        </div>

        {/* Activity */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            {t('overview.activity')}
          </h3>
          <div className="space-y-3">
            <InfoRow label={t('overview.totalViews')} value={user.total_views || 0} />
            <InfoRow label={t('overview.totalLikes')} value={user.total_likes || 0} />
            <InfoRow label={t('overview.completedRequests')} value={user.completed_requests || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestsTab() {
  return <OrdersTab />;
}

function SettingsTab({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const t = useTranslations('profile');
  const router = useRouter();

  return (
    <div className="max-w-2xl space-y-6 pb-24">
      {/* Appearance */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {t('settings.appearance')}
        </h3>
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-[var(--color-text-primary)]">
              {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
            </span>
          </div>
        </button>
      </div>

      {/* Language */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {t('settings.language')}
        </h3>
        <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5" />
            <span className="text-[var(--color-text-primary)]">Русский</span>
          </div>
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--color-surface)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {t('settings.notifications')}
        </h3>
        <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span className="text-[var(--color-text-primary)]">
              {t('settings.pushNotifications')}
            </span>
          </div>
        </button>
      </div>

      {/* Logout */}
      <Button
        variant="danger"
        fullWidth
        leftIcon={<LogOut className="w-5 h-5" />}
        onClick={() => {
          // Clear auth tokens
          localStorage.removeItem('token');
          sessionStorage.clear();
          // Redirect to login
          router.push('/auth/login');
        }}
      >
        {t('settings.logout')}
      </Button>
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-[var(--color-text-primary)] font-medium">{value}</span>
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  user,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: any) => void;
  isSaving: boolean;
}) {
  const t = useTranslations('profile');
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSave = () => {
    onSave({ username, bio, avatar });
  };

  return (
    <Modal open={open} onClose={onClose} title={t('editModal.title')} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {t('editModal.avatar') || 'Аватар'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
          />
        </div>

        <Input
          label={t('editModal.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Textarea
          label={t('editModal.bio')}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder={t('editModal.bioPlaceholder')}
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('editModal.cancel')}
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            {t('editModal.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
