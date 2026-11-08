import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  gigApi,
  applicationApi,
  bookingApi,
  workerApi,
  toList,
} from '../../api/services';
import { normalizeGig, normalizeApplication, normalizeBooking } from '../../api/normalizers';
import { formatMoney, formatDate, formatDateTime } from '../../lib/format';
import StatusBadge from '../../components/ui/StatusBadge';
import StarRating from '../../components/ui/StarRating';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import {
  Calendar,
  MapPin,
  IndianRupee,
  Layers,
  Send,
  MessageSquare,
  Ban,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function GigDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Worker application state
  const [workerApplication, setWorkerApplication] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [withdrawingQuote, setWithdrawingQuote] = useState(false);

  // Provider applications list state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [workerUserMap, setWorkerUserMap] = useState({}); // workerProfileId -> userId cache

  // Accept bid & Cancel gig dialogs
  const [acceptingAppId, setAcceptingAppId] = useState(null);
  const [acceptingLoading, setAcceptingLoading] = useState(false);
  const [cancelGigOpen, setCancelGigOpen] = useState(false);
  const [cancellingGig, setCancellingGig] = useState(false);

  // Load gig details
  const fetchGig = useCallback(async () => {
    const raw = await gigApi.getById(id);
    return normalizeGig(raw);
  }, [id]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetchGig()
      .then((g) => {
        if (!ignore) {
          setGig(g);
          setQuotedPrice(String(g.budget || ''));
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Failed to load gig details');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fetchGig]);

  // Load worker's specific application for this gig
  useEffect(() => {
    let ignore = false;
    if (user?.role !== 'WORKER' || !profile?.id || !gig) return;

    applicationApi
      .getByWorker(profile.id)
      .then((res) => {
        if (!ignore) {
          const apps = toList(res).map(normalizeApplication);
          const currentApp = apps.find((a) => a.gigId === gig.id);
          setWorkerApplication(currentApp || null);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [user, profile, gig]);

  // Load provider's incoming applications for this gig
  const isOwner = user?.role === 'PROVIDER' && profile?.id && gig?.providerProfileId === profile.id;

  const loadProviderApplications = useCallback(async () => {
    if (!gig?.id || !isOwner) return;
    setLoadingApps(true);
    try {
      const res = await applicationApi.getByGig(gig.id);
      const apps = toList(res).map(normalizeApplication);
      setApplications(apps);

      // Resolve worker user IDs for messaging
      const missingProfiles = apps
        .map((a) => a.workerProfileId)
        .filter((wid) => wid && !workerUserMap[wid]);

      if (missingProfiles.length > 0) {
        const uniqueWids = [...new Set(missingProfiles)];
        const pairs = await Promise.all(
          uniqueWids.map(async (wid) => {
            try {
              const wProf = await workerApi.getById(wid);
              return [wid, wProf.userId];
            } catch {
              return [wid, null];
            }
          })
        );
        setWorkerUserMap((prev) => Object.assign({}, prev, Object.fromEntries(pairs)));
      }
    } catch {
      // ignore
    } finally {
      setLoadingApps(false);
    }
  }, [gig?.id, isOwner, workerUserMap]);

  useEffect(() => {
    if (isOwner) {
      loadProviderApplications();
    }
  }, [isOwner, loadProviderApplications]);

  // Submit Quote Handler
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const priceNum = Number(quotedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toastError('Please enter a valid quoted price greater than 0');
      return;
    }

    setSubmittingQuote(true);
    try {
      const payload = {
        gigId: gig.id,
        workerProfileId: profile.id,
        quotedPrice: priceNum,
        coverNote: coverNote.trim(),
      };
      const newApp = await applicationApi.create(payload);
      const normalizedApp = normalizeApplication(newApp);
      setWorkerApplication(normalizedApp);
      setQuoteModalOpen(false);
      success('Quote submitted successfully!');
    } catch (err) {
      if (err.status === 409) {
        toastError('You have already submitted a quote for this gig.');
      } else {
        toastError(err.message || 'Failed to submit quote');
      }
    } finally {
      setSubmittingQuote(false);
    }
  };

  // Withdraw Quote Handler
  const handleWithdrawQuote = async () => {
    if (!workerApplication?.id) return;
    setWithdrawingQuote(true);
    try {
      await applicationApi.withdraw(workerApplication.id);
      success('Quote withdrawn successfully');
      setWorkerApplication((prev) => (prev ? { ...prev, status: 'WITHDRAWN' } : null));
    } catch (err) {
      toastError(err.message || 'Failed to withdraw quote');
    } finally {
      setWithdrawingQuote(false);
    }
  };

  // Accept Bid Handler
  const handleAcceptBid = async () => {
    if (!acceptingAppId) return;
    setAcceptingLoading(true);
    try {
      const res = await bookingApi.accept(acceptingAppId);
      const booking = normalizeBooking(res);
      success('Bid accepted! Booking has been created.');
      setAcceptingAppId(null);
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      toastError(err.message || 'Failed to accept bid');
      setAcceptingLoading(false);
    }
  };

  // Cancel Gig Handler
  const handleCancelGig = async () => {
    setCancellingGig(true);
    try {
      await gigApi.cancel(gig.id);
      success('Gig listing has been cancelled');
      setCancelGigOpen(false);
      const updated = await fetchGig();
      setGig(updated);
    } catch (err) {
      toastError(err.message || 'Failed to cancel gig');
    } finally {
      setCancellingGig(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" id="gig-detail-spinner" />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <ErrorState
          message={error || 'Gig not found'}
          onRetry={() => {
            setLoading(true);
            fetchGig()
              .then(setGig)
              .catch((err) => setError(err.message))
              .finally(() => setLoading(false));
          }}
          id="gig-detail-error"
        />
      </div>
    );
  }

  const canCancelGig = isOwner && (gig.status === 'OPEN' || gig.status === 'ASSIGNED');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/gigs"
          id="gig-detail-back-link"
          className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
        >
          &larr; Back to all gigs
        </Link>
        {canCancelGig && (
          <button
            type="button"
            id="gig-cancel-btn"
            onClick={() => setCancelGigOpen(true)}
            className="btn btn-secondary border-rose-200 text-rose-600 hover:bg-rose-50 btn-sm"
          >
            <Ban className="w-4 h-4" />
            Cancel Gig
          </button>
        )}
      </div>

      {/* Main Gig Details Card */}
      <div className="card-static p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
                {gig.categoryName}
              </span>
              <StatusBadge status={gig.status} id="gig-detail-status-badge" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-heading">
              {gig.title}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Posted by <span className="text-neutral-700 font-medium">{gig.providerName}</span>
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
              Estimated Budget
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
              {formatMoney(gig.budget)}
            </span>
          </div>
        </div>

        {/* Schedule & Address Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-neutral-700">Scheduled Date & Time</span>
              <span className="text-sm text-neutral-900">{formatDateTime(gig.scheduledAt)}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-neutral-700">Service Location</span>
              <span className="text-sm text-neutral-900">{gig.addressSummary || 'Address provided'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Description & Requirements
          </h3>
          <p className="text-neutral-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {gig.description}
          </p>
        </div>

        {/* Action Panel based on User Role */}
        <div className="pt-6 border-t border-neutral-100">
          {/* Guest User */}
          {!user && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-neutral-100 gap-4">
              <span className="text-sm text-neutral-700 font-medium">
                Are you a skilled professional looking to take this gig?
              </span>
              <Link to="/login" id="gig-guest-login-btn" className="btn btn-primary btn-sm shrink-0">
                Log in to Submit Quote
              </Link>
            </div>
          )}

          {/* Worker View */}
          {user?.role === 'WORKER' && (
            <div className="space-y-4">
              {workerApplication ? (
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Your Submitted Quote
                    </span>
                    <StatusBadge status={workerApplication.status} id="worker-app-status-badge" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-heading text-neutral-950">
                      {formatMoney(workerApplication.quotedPrice)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      submitted on {formatDate(workerApplication.createdAt)}
                    </span>
                  </div>
                  {workerApplication.coverNote && (
                    <p className="text-xs sm:text-sm text-neutral-600 italic">
                      "{workerApplication.coverNote}"
                    </p>
                  )}

                  {workerApplication.status === 'PENDING' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        id="worker-withdraw-quote-btn"
                        onClick={handleWithdrawQuote}
                        disabled={withdrawingQuote}
                        className="btn btn-secondary border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                      >
                        {withdrawingQuote && <Spinner size="sm" />}
                        Withdraw Quote
                      </button>
                    </div>
                  )}
                </div>
              ) : gig.status === 'OPEN' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900 text-white">
                  <div>
                    <h4 className="text-base font-semibold font-heading text-white">
                      Ready to provide this service?
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Submit your customized price quote and a message to the provider.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="worker-submit-quote-trigger-btn"
                    onClick={() => setQuoteModalOpen(true)}
                    className="btn btn-secondary btn-sm shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Submit Quote
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-100 text-neutral-600 text-sm">
                  This gig is no longer accepting new quotes (Status: {gig.status}).
                </div>
              )}
            </div>
          )}

          {/* Provider Who Does Not Own It / Admin */}
          {user && !isOwner && user.role !== 'WORKER' && (
            <div className="text-xs text-neutral-500 italic">
              Viewing gig listing in read-only mode.
            </div>
          )}
        </div>
      </div>

      {/* Provider Applications List (Only for Owner) */}
      {isOwner && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-950 font-heading">
              Quotes from Workers ({applications.length})
            </h2>
            <button
              type="button"
              id="provider-refresh-apps-btn"
              onClick={loadProviderApplications}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline"
            >
              Refresh Quotes
            </button>
          </div>

          {loadingApps ? (
            <div className="py-8 flex justify-center">
              <Spinner size="md" id="provider-quotes-spinner" />
            </div>
          ) : applications.length === 0 ? (
            <div className="card-static p-8 text-center border-dashed border-2">
              <p className="text-sm text-neutral-500">
                No quotes received yet. When skilled workers bid on this gig, their quotes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const workerUserId = workerUserMap[app.workerProfileId];
                const canAccept = gig.status === 'OPEN' && app.status === 'PENDING';

                return (
                  <div
                    key={app.id}
                    id={`quote-row-${app.id}`}
                    className="card-static p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-neutral-950 text-base">
                          {app.workerName || 'Skilled Worker'}
                        </span>
                        {app.workerRating != null && app.workerRating > 0 && (
                          <div className="flex items-center gap-1">
                            <StarRating value={app.workerRating} readOnly id={`worker-star-${app.id}`} />
                            <span className="text-xs text-neutral-500 font-medium">
                              ({app.workerRating.toFixed(1)})
                            </span>
                          </div>
                        )}
                        <StatusBadge status={app.status} size="sm" id={`app-badge-${app.id}`} />
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold font-heading text-neutral-900">
                          {formatMoney(app.quotedPrice)}
                        </span>
                        <span className="text-xs text-neutral-400">
                          quoted on {formatDate(app.createdAt)}
                        </span>
                      </div>

                      {app.coverNote && (
                        <p className="text-xs sm:text-sm text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                          "{app.coverNote}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      {workerUserId && (
                        <Link
                          to={`/messages?gig=${gig.id}&with=${workerUserId}`}
                          id={`quote-message-btn-${app.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </Link>
                      )}

                      {canAccept && (
                        <button
                          type="button"
                          id={`quote-accept-btn-${app.id}`}
                          onClick={() => setAcceptingAppId(app.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Accept Bid
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Worker Submit Quote Modal */}
      <Modal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        title="Submit Quote for Gig"
        id="submit-quote-modal"
      >
        <form onSubmit={handleQuoteSubmit} className="space-y-4" id="submit-quote-form">
          <div>
            <label className="label" htmlFor="quote-price-input">
              <IndianRupee className="w-4 h-4 inline mr-1 text-neutral-400" />
              Your Quoted Price (INR)
            </label>
            <input
              id="quote-price-input"
              type="number"
              min="1"
              required
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="e.g. 1400"
              className="input"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Provider's estimated budget is {formatMoney(gig.budget)}
            </span>
          </div>

          <div>
            <label className="label" htmlFor="quote-cover-note-input">
              <FileText className="w-4 h-4 inline mr-1 text-neutral-400" />
              Cover Note & Experience
            </label>
            <textarea
              id="quote-cover-note-input"
              rows={3}
              required
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Explain why you are qualified, what tools you bring, or your exact availability..."
              className="textarea"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              id="quote-cancel-btn"
              onClick={() => setQuoteModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="quote-submit-btn"
              disabled={submittingQuote}
              className="btn btn-primary"
            >
              {submittingQuote && <Spinner size="sm" id="quote-spinner" />}
              Send Quote
            </button>
          </div>
        </form>
      </Modal>

      {/* Accept Bid Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(acceptingAppId)}
        onCancel={() => setAcceptingAppId(null)}
        onConfirm={handleAcceptBid}
        loading={acceptingLoading}
        title="Accept Worker Bid?"
        message="Accepting this quote will confirm the booking at the agreed price and automatically reject any other bids for this gig."
        confirmText="Confirm & Create Booking"
        id="accept-bid-confirm"
      />

      {/* Cancel Gig Confirm Dialog */}
      <ConfirmDialog
        isOpen={cancelGigOpen}
        onCancel={() => setCancelGigOpen(false)}
        onConfirm={handleCancelGig}
        loading={cancellingGig}
        danger
        title="Cancel Gig Listing?"
        message="Are you sure you want to cancel this gig? It will no longer accept quotes."
        confirmText="Yes, Cancel Gig"
        id="cancel-gig-confirm"
      />
    </div>
  );
}
