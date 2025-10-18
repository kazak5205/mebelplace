import React from 'react';

interface PremiumProfileHeaderProps {
  userId?: string;
  username?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  role?: string;
  stats?: any;
  isVerified?: boolean;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function PremiumProfileHeader({ userId, username, name, bio, avatar, coverImage, location, role, stats, isVerified, isOwnProfile, onEdit }: PremiumProfileHeaderProps) {
  return (
    <div className="glass-bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mb-6">
      <h2 className="text-white font-bold text-xl mb-2">Premium профиль</h2>
      <p className="text-orange-100">Расширенные возможности профиля</p>
    </div>
  );
}
