import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gigApi, bookingApi, toList } from '../../api/services';
import { normalizeGig, normalizeBooking } from '../../api/normalizers';
import { formatMoney, formatDate, formatDateTime } from '../../lib/format';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export default function ProviderDashboard() {
  const { profile, profileError, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('gigs'); // 'gigs' | 'bookings'
  const [gigs, setGigs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError(null);

    try {
      const [gigsRes, bookingsRes] = await Promise.all([
        gigApi.getByProvider(profile.id),
        bookingApi.getByProvider(profile.id),
      ]);

      setGigs(toList(gigsRes).map(normalizeGig));
      setBookings(toList(bookingsRes).map(normalizeBooking));
    } catch (err) {
      setError(err.message || 'Failed to load provider dashboard data');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived metrics
  const activeGigsCount = gigs.filter((g) => g.status === 'OPEN').length;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS'
  ).length;
  const completedJobsValue = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.agreedPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950 font-heading">Provider Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your posted gig listings, review incoming quotes, and monitor active bookings
          </p>
        </div>
        <Link to="/gigs/create" id="provider-dash-post-gig-btn" className="btn btn-primary gap-1.5 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          Post a New Gig
        </Link>
      </div>

      {/* Profile Error Banner */}
      {profileError && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Profile load issue: {profileError}</span>
          </div>
          <button
            type="button"
            onClick={refreshProfile}
            className="btn btn-secondary btn-sm border-rose-300 hover:bg-rose-100"
          >
            Retry Profile
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-static p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Active Open Gigs</span>
            <Briefcase className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : activeGigsCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Accepting worker quotes</p>
        </div>

        <div className="card-static p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Active Bookings</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : activeBookingsCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Scheduled or in progress</p>
        </div>

        <div className="card-static p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Completed Jobs Value</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : formatMoney(completedJobsValue)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Sum of agreed prices of completed jobs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 flex gap-6">
        <button
          type="button"
          id="provider-tab-gigs"
          onClick={() => setActiveTab('gigs')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'gigs'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          My Posted Gigs ({gigs.length})
        </button>
        <button
          type="button"
          id="provider-tab-bookings"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'bookings'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Bookings & Contracts ({bookings.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" id="provider-dash-spinner" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} id="provider-dash-error" />
      ) : activeTab === 'gigs' ? (
        gigs.length === 0 ? (
          <EmptyState
            title="You haven't posted any gigs yet"
            description="Create your first gig listing to receive competitive quotes from skilled local workers."
            actionText="Post Your First Gig"
            actionLink="/gigs/create"
            id="provider-no-gigs"
          />
        ) : (
          <div className="space-y-4">
            {gigs.map((g) => (
              <div
                key={g.id}
                id={`provider-gig-row-${g.id}`}
                className="card-static p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                      {g.categoryName}
                    </span>
                    <StatusBadge status={g.status} size="sm" id={`dash-gig-status-${g.id}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-heading">
                    {g.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>Budget: <strong>{formatMoney(g.budget)}</strong></span>
                    <span>Scheduled: {formatDate(g.scheduledAt)}</span>
                    {g.applicationCount > 0 && (
                      <span className="text-neutral-900 font-semibold">
                        {g.applicationCount} quotes received
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    to={`/gigs/${g.id}`}
                    id={`provider-view-gig-btn-${g.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Gig & Quotes &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings recorded yet"
          description="Once you accept a worker's bid on one of your gigs, a confirmed booking will appear here."
          actionText="Explore Gigs"
          actionLink="/gigs"
          id="provider-no-bookings"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              id={`provider-booking-row-${b.id}`}
              className="card-static p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} size="sm" id={`dash-booking-status-${b.id}`} />
                  <span className="text-xs text-neutral-400">
                    Booking #{b.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-heading">
                  {b.gigTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span>Assigned Worker: <strong>{b.workerName}</strong></span>
                  <span>Agreed Price: <strong>{formatMoney(b.agreedPrice)}</strong></span>
                  {b.completedAt && <span>Completed: {formatDateTime(b.completedAt)}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  to={`/bookings/${b.id}`}
                  id={`provider-view-booking-btn-${b.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Manage Booking &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

