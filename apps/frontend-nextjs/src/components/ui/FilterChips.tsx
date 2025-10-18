import React from 'react';

interface FilterChipsProps {
  filters?: string[];
  onRemove?: (filter: string) => void;
}

export function FilterChips({ filters = [], onRemove }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <span
          key={filter}
          className="glass-bg-accent-orange-500 text-white px-3 py-1 rounded-full text-sm"
        >
          {filter}
        </span>
      ))}
    </div>
  );
}
