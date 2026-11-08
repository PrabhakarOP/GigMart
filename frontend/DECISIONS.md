# Phase 0 Contract Discovery & Technical Decisions

## 1. API Probing Results

The backend was probed on `http://localhost:8081/api/v1` using `scripts/probe-api.mjs`. All 38 sample interactions succeeded and were saved to `docs/api-samples/`.

### Key Findings

| Probe Question | Backend Reality | Decision & Implementation |
| --- | --- | --- |
| User verified key | `"verified": false` (boolean) | Standard Jackson naming serialized `isVerified()` as `verified`. Normalizer sets both `isVerified` and `verified` for safety. |
| Login response | Returns `UserResponse` (`id`, `fullName`, `email`, `phone`, `role`, `verified`, `createdAt`). No profile ID. | After login/mount, fetch profile via `workerApi.getByUserId(user.id)` or `providerApi.getByUserId(user.id)`. Admin has no profile. |
| Message payload | POST `/messages` requires `body` string (returns 400 if only `content` sent). Response contains `body` and `sentAt`. | Send `body: text`. Read `m.body ?? m.content`. |
| Payments list | `GET /payments/booking/{id}` returns array `data: [ PaymentResponse ]`. | Use `toList()` which handles both arrays and fallbacks. |
| List pagination | Endpoints return plain JSON arrays `data: [ ... ]`, not Spring Data `Page` objects. | `toList` safely handles `Array.isArray(v) ? v : v?.content ?? []`. |
| Worker sub-resources | All request DTOs (`WorkerServiceRequest`, `AvailabilitySlotRequest`, `WorkerDocumentRequest`) require `workerProfileId`. | Send `workerProfileId: profile.id`. |
| Availability slot format | Requires `dayOfWeek` (1-7), `startTime` ("HH:mm"), `endTime` ("HH:mm"). | Send 24-hr `HH:mm` format string. |
| Document creation | Requires `workerProfileId`, `docType`, `fileUrl`. No binary upload. | URL text input and document type selector. |
| Booking accept | Returns `BookingResponse` with `id`, `gigId`, `applicationId`, `workerProfileId`, `providerProfileId`, `agreedPrice`, `status: "SCHEDULED"`. | Navigate to `/bookings/${booking.id}` upon accepting bid. |
| Platform fee computation | Payment response includes `amount: 1400`, `platformFee: 140` (10%), `netWorkerAmount: 1260`. | Matches client-side estimate preview formula `Math.round(amount * 0.10 * 100) / 100`. |
| Review posting | Requires `bookingId`, `reviewerId` (user ID), `rating` (1-5), `comment`. | Pass `reviewerId: user.id`. Both worker and provider can post once. |
| Categories list | Plain array of `{ id, name, icon, isActive }`. | Rendered as chips and dropdown options. |

## 2. Normalization Strategy (`src/api/normalizers.js`)

Components consume only normalized models so that UI code never makes assumptions about backend nesting:
- `normalizeUser`: guarantees `id`, `fullName`, `email`, `phone`, `role`, `isVerified` (from `raw.verified ?? raw.isVerified`).
- `normalizeGig`: guarantees `id`, `providerProfileId`, `providerName`, `categoryId`, `categoryName`, `addressId`, `addressSummary`, `title`, `description`, `budget`, `scheduledAt`, `status`, `applicationCount`.
- `normalizeApplication`: guarantees `id`, `gigId`, `gigTitle`, `workerProfileId`, `workerName`, `workerRating`, `quotedPrice`, `coverNote`, `status`, `createdAt`.
- `normalizeBooking`: guarantees `id`, `gigId`, `gigTitle`, `applicationId`, `workerProfileId`, `workerName`, `providerProfileId`, `providerName`, `agreedPrice`, `startedAt`, `completedAt`, `status`.
- `normalizeMessage`: guarantees `id`, `gigId`, `senderId`, `senderName`, `receiverId`, `receiverName`, `text` (from `raw.body ?? raw.content`), `sentAt`.
- `normalizePayment`: guarantees `id`, `bookingId`, `amount`, `platformFee`, `netWorkerAmount`, `method`, `status`, `paidAt`.
- `normalizeReview`: guarantees `id`, `bookingId`, `reviewerId`, `reviewerName`, `revieweeId`, `revieweeName`, `rating`, `comment`, `createdAt`.

## 3. Storage & State Decisions

- `localStorage['gigmart_user']` stores only the user payload, never credentials.
- `AuthContext` boots synchronously from storage, verifies user asynchronously via `userApi.getById(user.id)`, and loads the corresponding profile.
- Routing guards wait for `initializing === false` before redirecting to avoid flash of redirect.

