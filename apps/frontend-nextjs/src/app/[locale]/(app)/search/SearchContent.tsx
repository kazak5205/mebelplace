/**
 * SearchContent - Client component for search functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Map } from 'lucide-react';
import api from '@/lib/api/api-wrapper';
import { Button } from '@/components/ui';
import { VideoCard } from '@/components/VideoCard';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { MastersMap } from '@/features/maps/MastersMap';
import { AdvancedFilters, SearchFilters } from '@/components/search/AdvancedFilters';
import { PremiumSearchBar } from '@/components/search/PremiumSearchBar';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import { FilterChips } from '@/components/ui/FilterChips';

interface SearchResult {
  videos: any[];
  users: any[];
  requests: any[];
  total: number;
}

type SearchCategory = 'all' | 'videos' | 'masters' | 'requests';

export function SearchContent() {
  const t = useTranslations('search');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [region, setRegion] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: SearchFilters }>>(
    []
  );

  const debouncedQuery = useDebounce(query, 500);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_search_filters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  // Save filter preset
  const handleSaveFilters = (name: string, filters: SearchFilters) => {
    const newSaved = [...savedFilters, { name, filters }];
    setSavedFilters(newSaved);
    localStorage.setItem('saved_search_filters', JSON.stringify(newSaved));
  };

  // Search query
  const { data, isLoading, isError } = useQuery<SearchResult>({
    queryKey: ['search', debouncedQuery, category, region, filters],
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return { videos: [], users: [], requests: [], total: 0 };
      }

      const params = new URLSearchParams({
        query: debouncedQuery,
        category,
        region,
      });

      // Add filters to params
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.rating) params.set('minRating', filters.rating.toString());
      if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
      if (filters.verified) params.set('verified', 'true');
      if (filters.hasPortfolio) params.set('hasPortfolio', 'true');
      if (filters.radius) params.set('radius', filters.radius.toString());

      return api.get<SearchResult>(`/search?${params.toString()}`);
    },
    enabled: debouncedQuery.length > 0,
  });

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery) {
      const params = new URLSearchParams();
      params.set('q', debouncedQuery);
      if (category !== 'all') params.set('category', category);
      if (region !== 'ALL') params.set('region', region);
      router.push(`/search?${params.toString()}`, { scroll: false });
    }
  }, [debouncedQuery, category, region, router]);

  const results = data || { videos: [], users: [], requests: [], total: 0 };
  const hasResults = results.total > 0;

  // Convert masters to map format
  const mastersForMap = results.users
    .filter((user: any) => user.latitude && user.longitude)
    .map((user: any) => ({
      id: user.id,
      name: user.username || user.name,
      avatar: user.avatar_url || '',
      lat: user.latitude,
      lng: user.longitude,
      category: user.category || 'Мастер',
      rating: user.rating || 0,
      username: user.username,
      videos_count: user.videos_count,
      region: user.region,
    }));

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-4">
            <PremiumSearchBar
              value={query}
              onChange={setQuery}
              onSearch={(q) => setQuery(q)}
              placeholder={t('placeholder')}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-5 h-5" />}
            >
              {t('filters')}
            </Button>

            {category === 'masters' && (
              <Button
                variant="ghost"
                onClick={() => setShowMap(!showMap)}
                leftIcon={<Map className="w-5 h-5" />}
              >
                Карта
              </Button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['all', 'videos', 'masters', 'requests'] as SearchCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                {t(`categories.${cat}`)}
                {cat === 'all' && hasResults && ` (${results.total})`}
                {cat === 'videos' && ` (${results.videos.length})`}
                {cat === 'masters' && ` (${results.users.length})`}
                {cat === 'requests' && ` (${results.requests.length})`}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-4"
              >
                <AdvancedFilters
                  filters={filters}
                  onChange={setFilters}
                  onSave={handleSaveFilters}
                  savedFilters={savedFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" label={t('searching')} />
          </div>
        ) : !query ? (
          <EmptyState title={t('emptyState.title')} description={t('emptyState.description')} />
        ) : !hasResults ? (
          <EmptyState
            title={t('noResults.title')}
            description={t('noResults.description')}
            icon="🔍"
          />
        ) : (
          <div className="space-y-8">
            {/* Masters Map */}
            {category === 'masters' && showMap && mastersForMap.length > 0 && (
              <section>
                <MastersMap
                  masters={mastersForMap}
                  onMasterClick={(master) => {
                    window.location.href = `/profile/${master.id}`;
                  }}
                />
              </section>
            )}
            {/* Videos */}
            {(category === 'all' || category === 'videos') && results.videos.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                  {t('sections.videos')} ({results.videos.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </section>
            )}

            {/* Masters */}
            {(category === 'all' || category === 'masters') && results.users.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                  {t('sections.masters')} ({results.users.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user) => (
                    <MasterCard key={user.id} master={user} />
                  ))}
                </div>
              </section>
            )}

            {/* Requests */}
            {(category === 'all' || category === 'requests') && results.requests.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                  {t('sections.requests')} ({results.requests.length})
                </h2>
                <div className="space-y-3">
                  {results.requests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function EmptyState({
  title,
  description,
  icon = '🔍',
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}

function MasterCard({ master }: { master: any }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-2xl">
          {master.username?.[0]?.toUpperCase() || 'M'}
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">{master.username}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{master.region}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <span>⭐ {master.rating || 0}</span>
        <span>📹 {master.videos_count || 0}</span>
      </div>
    </div>
  );
}

function RequestCard({ request }: { request: any }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 hover:shadow-lg transition-all">
      <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{request.title}</h3>
      {request.description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
          {request.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[var(--color-accent)] font-semibold">
          {request.budget ? `${request.budget} ₸` : 'Договорная'}
        </span>
        <span className="text-[var(--color-text-tertiary)]">📍 {request.region}</span>
      </div>
    </div>
  );
}

