import React from 'react';

interface PremiumTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs: { id: string; label: string }[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: string;
}

export function PremiumTabs({ activeTab, onTabChange, tabs, defaultTab, onChange, variant }: PremiumTabsProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-4 mb-6">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'glass-bg-accent-orange-500 text-white'
                : 'glass-text-secondary hover:glass-bg-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
