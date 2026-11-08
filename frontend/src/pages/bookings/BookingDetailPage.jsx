import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  bookingApi,
  paymentApi,
  reviewApi,
  providerApi,
  workerApi,
  toList,
} from '../../api/services';
import {
  normalizeBooking,
  normalizePayment,
  normalizeReview,
} from '../../api/normalizers';
import { formatMoney, formatDateTime, formatDate } from '../../lib/format';
import StatusBadge from '../../components/ui/StatusBadge';
import StarRating from '../../components/ui/StarRating';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  Play,
  Check,
  Ban,
  Receipt,
  Star,
  ExternalLink,
} from 'lucide-react';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { success, error: toastError } = useToast();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status mutation state
  const [statusLoading, setStatusLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Counterpart user ID for messaging
  const [counterpartUserId, setCounterpartUserId] = useState(null);

  // Load booking, payments, reviews
  const loadAll = useCallback(async () => {
    const [bookingRaw, paymentsRaw, reviewsRaw] = await Promise.all([
      bookingApi.getById(id),
      paymentApi.getByBooking(id).catch(() => []),
      reviewApi.getByBooking(id).catch(() => []),
    ]);

    const normBooking = normalizeBooking(bookingRaw);
    const normPayments = toList(paymentsRaw).map(normalizePayment);
    const normReviews = toList(reviewsRaw).map(normalizeReview);

    setBooking(normBooking);
    setPayments(normPayments);
    setReviews(normReviews);
    setPaymentAmount(String(normBooking.agreedPrice || ''));

    return normBooking;
  }, [id]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    loadAll()
      .then((b) => {
        if (!ignore && b && user) {
          // Resolve counterpart user ID for messaging
          if (user.role === 'PROVIDER' && b.workerProfileId) {
            workerApi.getById(b.workerProfileId)
              .then((wProf) => { if (!ignore) setCounterpartUserId(wProf.userId); })
              .catch(() => {});
          } else if (user.role === 'WORKER' && b.providerProfileId) {
            providerApi.getById(b.providerProfileId)
              .then((pProf) => { if (!ignore) setCounterpartUserId(pProf.userId); })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Failed to load booking');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [loadAll, user]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" id="booking-detail-spinner" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <ErrorState
          message={error || 'Booking not found'}
          onRetry={() => {
            setLoading(true);
            loadAll()
              .then(setBooking)
              .catch((err) => setError(err.message))
              .finally(() => setLoading(false));
          }}
          id="booking-detail-error"
        />
      </div>
    );
  }

  // Check access authorization
  const isProvider = user?.role === 'PROVIDER' && profile?.id === booking.providerProfileId;
  const isWorker = user?.role === 'WORKER' && profile?.id === booking.workerProfileId;
  const isAdmin = user?.role === 'ADMIN';

  if (!isProvider && !isWorker && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16 text-center">
        <div className="card-static p-8">
          <h2 className="text-xl font-bold text-neutral-900 font-heading mb-2">Access Denied</h2>
          <p className="text-sm text-neutral-600 mb-6">
            You do not have permission to view this booking. Only the assigned worker, the gig
            provider, or an administrator can access this details page.
          </p>
          <Link to="/" id="booking-no-access-home-btn" className="btn btn-primary">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Status transitions
  const handleUpdateStatus = async (nextStatus) => {
    setStatusLoading(true);
    try {
      await bookingApi.updateStatus(booking.id, nextStatus);
      success(`Booking status changed to ${nextStatus.replace(/_/g, ' ')}`);
      await loadAll();
    } catch (err) {
      toastError(err.message || 'Failed to update booking status');
    } finally {
      setStatusLoading(false);
      setCancelModalOpen(false);
    }
  };

  // Payment Submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toastError('Please enter a valid payment amount');
      return;
    }

    setSubmittingPayment(true);
    try {
      await paymentApi.create({
        bookingId: booking.id,
        amount: amountNum,
        method: paymentMethod,
      });
      success('Payment recorded successfully!');
      await loadAll();
    } catch (err) {
      toastError(err.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewApi.create({
        bookingId: booking.id,
        reviewerId: user.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      success('Review submitted successfully!');
      setReviewComment('');
      await loadAll();
    } catch (err) {
      if (err.status === 409) {
        toastError('You have already submitted a review for this booking.');
      } else {
        toastError(err.message || 'Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasPaidPayment = payments.some((p) => p.status === 'PAID');
  const userAlreadyReviewed = reviews.some((r) => r.reviewerId === user?.id);
  const estimatedPlatformFee = Math.round(Number(paymentAmount || 0) * 0.1 * 100) / 100;
  const estimatedWorkerNet = Math.round((Number(paymentAmount || 0) - estimatedPlatformFee) * 100) / 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Booking #{booking.id.slice(0, 8)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-heading mt-1">
            {booking.gigTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} size="md" id="booking-header-status-badge" />
          {counterpartUserId && (
            <Link
              to={`/messages?gig=${booking.gigId}&with=${counterpartUserId}`}
              id="booking-message-counterpart-btn"
              className="btn btn-secondary btn-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </Link>
          )}
        </div>
      </div>

      {/* Overview & Timeline */}
      <div className="card-static p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-neutral-100 pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 block font-medium">
              Agreed Contract Price
            </span>
            <span className="text-2xl font-bold font-heading text-neutral-950 mt-1 block">
              {formatMoney(booking.agreedPrice)}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 block font-medium">
              Provider (Client)
            </span>
            <span className="text-base font-semibold text-neutral-900 mt-1 block">
              {booking.providerName}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 block font-medium">
              Assigned Worker
            </span>
            <span className="text-base font-semibold text-neutral-900 mt-1 block">
              {booking.workerName}
            </span>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
            Booking Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl border ${
                booking.status !== 'CANCELLED'
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Created & Scheduled</span>
              </div>
              <p className="text-xs text-neutral-600">Contract confirmed by provider</p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                booking.startedAt || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED'
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Work In Progress</span>
              </div>
              <p className="text-xs text-neutral-600">
                {booking.startedAt ? formatDateTime(booking.startedAt) : 'Pending work start'}
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                booking.completedAt || booking.status === 'COMPLETED'
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                  : booking.status === 'CANCELLED'
                  ? 'border-rose-200 bg-rose-50/50 text-rose-900'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {booking.status === 'CANCELLED' ? (
                  <Ban className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {booking.status === 'CANCELLED' ? 'Cancelled' : 'Completed'}
                </span>
              </div>
              <p className="text-xs text-neutral-600">
                {booking.completedAt
                  ? formatDateTime(booking.completedAt)
                  : booking.status === 'CANCELLED'
                  ? 'Booking terminated'
                  : 'Pending completion'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        {booking.status === 'SCHEDULED' && (
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-neutral-500">
              Work is scheduled. When the worker arrives on site, start work tracking.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="booking-cancel-trigger-btn"
                onClick={() => setCancelModalOpen(true)}
                disabled={statusLoading}
                className="btn btn-secondary border-rose-200 text-rose-600 hover:bg-rose-50 btn-sm"
              >
                <Ban className="w-4 h-4" />
                Cancel Booking
              </button>
              {isWorker && (
                <button
                  type="button"
                  id="booking-start-work-btn"
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={statusLoading}
                  className="btn btn-primary btn-sm"
                >
                  {statusLoading ? <Spinner size="sm" /> : <Play className="w-4 h-4" />}
                  Start Work
                </button>
              )}
            </div>
          </div>
        )}

        {booking.status === 'IN_PROGRESS' && (
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-neutral-500">
              Work is currently underway. Worker can mark the job completed once finished.
            </div>
            {isWorker && (
              <button
                type="button"
                id="booking-complete-work-btn"
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={statusLoading}
                className="btn btn-primary btn-sm"
              >
                {statusLoading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                Mark Completed
              </button>
            )}
          </div>
        )}

        {/* View Related Gig Link */}
        <div className="pt-2">
          <Link
            to={`/gigs/${booking.gigId}`}
            id="booking-view-gig-link"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Original Gig Posting
          </Link>
        </div>
      </div>

      {/* Payment Section */}
      <div className="card-static p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-neutral-600" />
            <h2 className="text-lg font-bold text-neutral-950 font-heading">Payment & Receipts</h2>
          </div>
          {hasPaidPayment && <StatusBadge status="PAID" size="sm" id="booking-paid-badge" />}
        </div>

        {/* Stored Payments List */}
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                id={`payment-receipt-${p.id}`}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-neutral-900 font-heading text-lg">
                      {formatMoney(p.amount)}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-neutral-500 bg-white border border-neutral-200 px-2 py-0.5 rounded-md">
                      {p.method}
                    </span>
                    <StatusBadge status={p.status} size="sm" id={`payment-status-${p.id}`} />
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 flex flex-wrap gap-x-4">
                    <span>Platform Fee (10%): {formatMoney(p.platformFee)}</span>
                    <span>Worker Payout: {formatMoney(p.netWorkerAmount)}</span>
                    {p.paidAt && <span>Paid on: {formatDateTime(p.paidAt)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-500">
            {booking.status === 'COMPLETED'
              ? 'No payment has been recorded yet.'
              : 'Payment will be recorded after the booking is completed.'}
          </div>
        )}

        {/* Provider Payment Form (When COMPLETED and not paid yet) */}
        {booking.status === 'COMPLETED' && !hasPaidPayment && isProvider && (
          <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 mt-4 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">
              Record Job Payment
            </h3>
            <p className="text-xs text-neutral-500">
              Confirm payment to the worker. The platform automatically calculates the 10% fee.
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4" id="record-payment-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="payment-amount-input">
                    Total Payment Amount (INR)
                  </label>
                  <input
                    id="payment-amount-input"
                    type="number"
                    min="1"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="payment-method-select">
                    Payment Method
                  </label>
                  <select
                    id="payment-method-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="select"
                  >
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="WALLET">Wallet</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              {/* Live Fee Preview */}
              <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-600 flex justify-between items-center">
                <span>
                  Estimated 10% Platform Fee: <strong>{formatMoney(estimatedPlatformFee)}</strong>{' '}
                  <span className="text-[10px] text-neutral-400">(Server value is final)</span>
                </span>
                <span>
                  Worker Net: <strong>{formatMoney(estimatedWorkerNet)}</strong>
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="record-payment-submit-btn"
                  disabled={submittingPayment}
                  className="btn btn-primary"
                >
                  {submittingPayment && <Spinner size="sm" id="payment-spinner" />}
                  Submit Payment Record
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="card-static p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-neutral-600" />
            <h2 className="text-lg font-bold text-neutral-950 font-heading">Reviews & Feedback</h2>
          </div>
          <span className="text-xs text-neutral-400">{reviews.length} reviews</span>
        </div>

        {/* Existing Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                id={`review-item-${r.id}`}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900">{r.reviewerName}</span>
                    <span className="text-xs text-neutral-400">reviewed</span>
                    <span className="text-sm font-medium text-neutral-700">{r.revieweeName}</span>
                  </div>
                  <StarRating value={r.rating} readOnly id={`review-star-${r.id}`} />
                </div>
                {r.comment && <p className="text-xs sm:text-sm text-neutral-700">"{r.comment}"</p>}
                <div className="text-[11px] text-neutral-400">{formatDate(r.createdAt)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No reviews posted yet for this booking.</p>
        )}

        {/* Review Form (When COMPLETED, user hasn't reviewed yet, and user is either provider or worker) */}
        {booking.status === 'COMPLETED' && !userAlreadyReviewed && (isProvider || isWorker) && (
          <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 mt-4 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">
              Leave a Review for {isProvider ? booking.workerName : booking.providerName}
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4" id="leave-review-form">
              <div>
                <label className="label">Rating</label>
                <StarRating
                  value={reviewRating}
                  onChange={setReviewRating}
                  id="leave-review-star-rating"
                />
              </div>

              <div>
                <label className="label" htmlFor="review-comment-input">
                  Comment
                </label>
                <textarea
                  id="review-comment-input"
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="textarea"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  id="leave-review-submit-btn"
                  disabled={submittingReview}
                  className="btn btn-primary"
                >
                  {submittingReview && <Spinner size="sm" id="review-spinner" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Cancel Booking Confirm Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={() => handleUpdateStatus('CANCELLED')}
        loading={statusLoading}
        danger
        title="Cancel This Booking?"
        message="Are you sure you want to cancel this booking? This is a terminal action."
        confirmText="Yes, Cancel Booking"
        id="cancel-booking-dialog"
      />
    </div>
  );
}
