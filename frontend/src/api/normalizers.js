/**
 * Normalizes user object across various backend representations
 */
export function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    fullName: raw.fullName ?? raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: raw.role,
    isVerified: Boolean(raw.isVerified ?? raw.verified),
    verified: Boolean(raw.isVerified ?? raw.verified),
    createdAt: raw.createdAt ?? null,
  };
}

/**
 * Normalizes gig object
 */
export function normalizeGig(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    providerProfileId: raw.providerProfileId ?? raw.providerId ?? raw.provider?.id,
    providerName: raw.providerName ?? raw.provider?.name ?? '',
    categoryId: raw.categoryId ?? raw.category?.id,
    categoryName: raw.categoryName ?? raw.category?.name ?? '',
    addressId: raw.addressId ?? raw.address?.id,
    addressSummary:
      raw.addressSummary ??
      (raw.address
        ? `${raw.address.line1}, ${raw.address.city}`
        : ''),
    title: raw.title ?? '',
    description: raw.description ?? '',
    budget: Number(raw.budget ?? 0),
    scheduledAt: raw.scheduledAt ?? '',
    status: raw.status ?? 'OPEN',
    applicationCount: Number(raw.applicationCount ?? 0),
  };
}

/**
 * Normalizes application object
 */
export function normalizeApplication(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    gigId: raw.gigId ?? raw.gig?.id,
    gigTitle: raw.gigTitle ?? raw.gig?.title ?? '',
    workerProfileId: raw.workerProfileId ?? raw.workerId ?? raw.worker?.id,
    workerName: raw.workerName ?? raw.worker?.name ?? '',
    workerRating: raw.workerRating != null ? Number(raw.workerRating) : null,
    quotedPrice: Number(raw.quotedPrice ?? 0),
    coverNote: raw.coverNote ?? raw.coverLetter ?? '',
    status: raw.status ?? 'PENDING',
    createdAt: raw.createdAt ?? '',
  };
}

/**
 * Normalizes booking object
 */
export function normalizeBooking(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    gigId: raw.gigId ?? raw.gig?.id,
    gigTitle: raw.gigTitle ?? raw.gig?.title ?? '',
    applicationId: raw.applicationId ?? raw.application?.id,
    workerProfileId: raw.workerProfileId ?? raw.workerId ?? raw.worker?.id,
    workerName: raw.workerName ?? raw.worker?.name ?? '',
    providerProfileId: raw.providerProfileId ?? raw.providerId ?? raw.provider?.id,
    providerName: raw.providerName ?? raw.provider?.name ?? '',
    agreedPrice: Number(raw.agreedPrice ?? 0),
    startedAt: raw.startedAt ?? null,
    completedAt: raw.completedAt ?? null,
    status: raw.status ?? 'SCHEDULED',
  };
}

/**
 * Normalizes message object
 */
export function normalizeMessage(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    gigId: raw.gigId,
    senderId: raw.senderId,
    senderName: raw.senderName ?? '',
    receiverId: raw.receiverId,
    receiverName: raw.receiverName ?? '',
    text: raw.body ?? raw.content ?? '',
    body: raw.body ?? raw.content ?? '',
    sentAt: raw.sentAt ?? new Date().toISOString(),
  };
}

/**
 * Normalizes payment object
 */
export function normalizePayment(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    bookingId: raw.bookingId,
    amount: Number(raw.amount ?? 0),
    platformFee: Number(raw.platformFee ?? 0),
    netWorkerAmount: Number(raw.netWorkerAmount ?? 0),
    method: raw.method ?? 'CARD',
    status: raw.status ?? 'PENDING',
    paidAt: raw.paidAt ?? null,
  };
}

/**
 * Normalizes review object
 */
export function normalizeReview(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    bookingId: raw.bookingId,
    reviewerId: raw.reviewerId,
    reviewerName: raw.reviewerName ?? '',
    revieweeId: raw.revieweeId,
    revieweeName: raw.revieweeName ?? '',
    rating: Number(raw.rating ?? 5),
    comment: raw.comment ?? '',
    createdAt: raw.createdAt ?? '',
  };
}

