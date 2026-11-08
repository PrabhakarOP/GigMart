import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationApi, bookingApi, toList } from '../../api/services';
import { normalizeApplication, normalizeBooking } from '../../api/normalizers';
import { formatMoney, formatDate, formatDateTime } from '../../lib/format';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import {
  FileText,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';

export default function WorkerDashboard() {
  const { profile, profileError, refreshProfile } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'bookings'
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isNewWorker = Boolean(location.state?.isNewWorker);

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError(null);

    try {
      const [appsRes, bookingsRes] = await Promise.all([
        applicationApi.getByWorker(profile.id),
        bookingApi.getByWorker(profile.id),
      ]);

      setApplications(toList(appsRes).map(normalizeApplication));
      setBookings(toList(bookingsRes).map(normalizeBooking));
    } catch (err) {
      setError(err.message || 'Failed to load worker dashboard data');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Metrics
  const quotesSubmittedCount = applications.length;
  const pendingQuotesCount = applications.filter((a) => a.status === 'PENDING').length;
  const acceptedJobsCount = bookings.length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950 font-heading">Worker Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track your submitted quotes, active work assignments, and completed bookings
          </p>
        </div>
        <Link to="/gigs" id="worker-dash-find-gigs-btn" className="btn btn-primary gap-1.5 self-start sm:self-auto">
          <Search className="w-4 h-4" />
          Find Gigs to Bid
        </Link>
      </div>

      {/* New Worker Onboarding Banner */}
      {isNewWorker && (
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-900 bg-neutral-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold font-heading text-white">Complete your worker profile</h4>
              <p className="text-xs text-neutral-300">
                Add your bio, offered service categories with hourly rates, and weekly availability slots.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            id="worker-complete-profile-btn"
            className="btn btn-secondary btn-sm shrink-0"
          >
            Edit Profile Now &rarr;
          </Link>
        </div>
      )}

      {/* Profile Error Banner */}
      {profileError && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Profile error: {profileError}</span>
          <button
            type="button"
            onClick={refreshProfile}
            className="btn btn-secondary btn-sm border-rose-300"
          >
            Retry Profile
          </button>
        </div>
      )}

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-static p-5 sm:p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider">Submitted Quotes</span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : quotesSubmittedCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Total quotes placed</p>
        </div>

        <div className="card-static p-5 sm:p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider">Pending Quotes</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : pendingQuotesCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Awaiting client decision</p>
        </div>

        <div className="card-static p-5 sm:p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider">Accepted Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : acceptedJobsCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Confirmed client bookings</p>
        </div>

        <div className="card-static p-5 sm:p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider">Completed</span>
            <Trophy className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
            {loading ? '—' : completedBookingsCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Finished service contracts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 flex gap-6">
        <button
          type="button"
          id="worker-tab-applications"
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'applications'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          My Quotes & Applications ({applications.length})
        </button>
        <button
          type="button"
          id="worker-tab-bookings"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'bookings'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Confirmed Bookings ({bookings.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" id="worker-dash-spinner" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} id="worker-dash-error" />
      ) : activeTab === 'applications' ? (
        applications.length === 0 ? (
          <EmptyState
            title="You haven't submitted any quotes yet"
            description="Explore open local gigs and apply with your custom quote to win jobs."
            actionText="Browse Available Gigs"
            actionLink="/gigs"
            id="worker-no-apps"
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                id={`worker-app-row-${app.id}`}
                className="card-static p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} size="sm" id={`worker-app-status-${app.id}`} />
                    <span className="text-xs text-neutral-400">
                      Applied {formatDate(app.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-heading">
                    {app.gigTitle || 'Gig Assignment'}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-neutral-700">
                      Your Quoted Bid: <strong>{formatMoney(app.quotedPrice)}</strong>
                    </span>
                  </div>
                  {app.coverNote && (
                    <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 italic">
                      "{app.coverNote}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    to={`/gigs/${app.gigId}`}
                    id={`worker-view-gig-btn-${app.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Gig & Status &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings assigned to you yet"
          description="When a provider accepts your quote, the job will appear here with scheduling details."
          actionText="Find Gigs"
          actionLink="/gigs"
          id="worker-no-bookings"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              id={`worker-booking-row-${b.id}`}
              className="card-static p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} size="sm" id={`worker-booking-status-${b.id}`} />
                  <span className="text-xs text-neutral-400">Booking #{b.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-heading">
                  {b.gigTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span>Client / Provider: <strong>{b.providerName}</strong></span>
                  <span>Agreed Price: <strong>{formatMoney(b.agreedPrice)}</strong></span>
                  {b.startedAt && <span>Started: {formatDateTime(b.startedAt)}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  to={`/bookings/${b.id}`}
                  id={`worker-view-booking-btn-${b.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Manage Job &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

