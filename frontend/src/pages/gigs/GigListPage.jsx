import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gigApi, categoryApi, toList } from '../../api/services';
import { normalizeGig } from '../../api/normalizers';
import GigCard from '../../components/gig/GigCard';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function GigListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL / state params
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const [categories, setCategories] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestCounterRef = useRef(0);

  // Load categories once
  useEffect(() => {
    let ignore = false;
    categoryApi
      .list(true)
      .then((cats) => {
        if (!ignore) setCategories(toList(cats));
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Debounce keyword input
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Fetch gigs with request counter to ignore stale responses
  useEffect(() => {
    const currentRequestId = ++requestCounterRef.current;
    setLoading(true);
    setError(null);

    const queryParams = {};
    if (debouncedKeyword.trim()) queryParams.keyword = debouncedKeyword.trim();
    if (selectedCategory) queryParams.categoryId = selectedCategory;
    if (selectedStatus && selectedStatus !== 'ALL') queryParams.status = selectedStatus;

    gigApi
      .list(queryParams)
      .then((res) => {
        if (currentRequestId === requestCounterRef.current) {
          const normalized = toList(res).map(normalizeGig);
          setGigs(normalized);
        }
      })
      .catch((err) => {
        if (currentRequestId === requestCounterRef.current) {
          setError(err.message || 'Failed to load gigs');
        }
      })
      .finally(() => {
        if (currentRequestId === requestCounterRef.current) {
          setLoading(false);
        }
      });
  }, [debouncedKeyword, selectedCategory, selectedStatus]);

  // Update URL params
  useEffect(() => {
    const params = {};
    if (debouncedKeyword) params.q = debouncedKeyword;
    if (selectedCategory) params.cat = selectedCategory;
    if (selectedStatus && selectedStatus !== 'ALL') params.status = selectedStatus;
    setSearchParams(params, { replace: true });
  }, [debouncedKeyword, selectedCategory, selectedStatus, setSearchParams]);

  // Client-side budget filtering
  const filteredGigs = gigs.filter((gig) => {
    const b = Number(gig.budget);
    if (minBudget !== '' && !isNaN(Number(minBudget)) && b < Number(minBudget)) {
      return false;
    }
    if (maxBudget !== '' && !isNaN(Number(maxBudget)) && b > Number(maxBudget)) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setSelectedStatus('ALL');
    setMinBudget('');
    setMaxBudget('');
  };

  const hasActiveFilters =
    Boolean(keyword) ||
    Boolean(selectedCategory) ||
    selectedStatus !== 'ALL' ||
    Boolean(minBudget) ||
    Boolean(maxBudget);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-950 font-heading">Explore Available Gigs</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Browse on-demand local requirements or search by keyword and category
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card-static p-4 sm:p-6 space-y-4 shadow-xs">
        {/* Search bar + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              id="gigs-search-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, description or skills..."
              className="input pl-10"
            />
            {keyword && (
              <button
                type="button"
                id="gigs-clear-keyword-btn"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700"
                aria-label="Clear keyword"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4">
            <select
              id="gigs-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN (Accepting quotes)</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
            Categories
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              id="category-chip-all"
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                !selectedCategory
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`category-chip-${cat.id}`}
                  type="button"
                  onClick={() => setSelectedCategory(active ? '' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget filters & Clear */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-600">Budget Range (₹):</span>
            <input
              id="gigs-filter-min-budget"
              type="number"
              min="0"
              placeholder="Min"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-24 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <span className="text-neutral-400 text-xs">—</span>
            <input
              id="gigs-filter-max-budget"
              type="number"
              min="0"
              placeholder="Max"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-24 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              id="gigs-clear-all-filters-btn"
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" id="gigs-list-spinner" />
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            const currentReq = ++requestCounterRef.current;
            setLoading(true);
            setError(null);
            gigApi
              .list({})
              .then((res) => {
                if (currentReq === requestCounterRef.current) {
                  setGigs(toList(res).map(normalizeGig));
                }
              })
              .catch((err) => {
                if (currentReq === requestCounterRef.current) {
                  setError(err.message);
                }
              })
              .finally(() => {
                if (currentReq === requestCounterRef.current) {
                  setLoading(false);
                }
              });
          }}
          id="gigs-list-error"
        />
      ) : filteredGigs.length === 0 ? (
        <EmptyState
          title="No gigs match your criteria"
          description={
            hasActiveFilters
              ? 'Try widening your search terms or clearing current filters.'
              : 'There are no active gig listings right now.'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : 'Post a Gig'}
          onAction={hasActiveFilters ? clearFilters : undefined}
          actionLink={hasActiveFilters ? undefined : '/gigs/create'}
          id="gigs-empty-state"
        />
      ) : (
        <div>
          <div className="text-xs font-medium text-neutral-500 mb-4">
            Showing {filteredGigs.length} {filteredGigs.length === 1 ? 'gig' : 'gigs'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

