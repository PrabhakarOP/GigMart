# GigMart REST API Specification

**Base URL**: `http://localhost:8081`  
**API Prefix**: `/api/v1`  
**Content-Type**: `application/json`

---

## 1. Standard Response Structure

All endpoints return a uniform JSON envelope:

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

In case of error (4xx / 5xx):
```json
{
  "success": false,
  "message": "Error description or validation summary",
  "data": {
    "field": "Validation message"
  },
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

## 2. API Endpoints Overview

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | Register new User & auto-initialize profile |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user with email and password |
| **Users** | `GET` | `/api/v1/users/{id}` | Get user by ID |
| **Users** | `GET` | `/api/v1/users?role={role}` | List users (optional filter by `WORKER`, `PROVIDER`, `ADMIN`) |
| **Users** | `PUT` | `/api/v1/users/{id}/verify` | Mark user as verified |
| **Categories** | `GET` | `/api/v1/categories?activeOnly=true`| List master service categories |
| **Categories** | `POST` | `/api/v1/categories` | Create new service category |
| **Categories** | `GET` | `/api/v1/categories/{id}` | Get category by ID |
| **Categories** | `PUT` | `/api/v1/categories/{id}` | Update category |
| **Categories** | `DELETE`| `/api/v1/categories/{id}` | Delete category |
| **Workers** | `POST` | `/api/v1/workers` | Create worker profile manually |
| **Workers** | `GET` | `/api/v1/workers/{id}` | Get worker profile by ID |
| **Workers** | `GET` | `/api/v1/workers/user/{userId}` | Get worker profile by user ID |
| **Workers** | `GET` | `/api/v1/workers?status={status}`| List workers (filter by `PENDING`, `VERIFIED`, `REJECTED`) |
| **Workers** | `PUT` | `/api/v1/workers/{id}` | Update worker bio, experience, radius, or status |
| **Worker Skills**| `POST` | `/api/v1/workers/services` | Add service offering with rate |
| **Worker Skills**| `GET` | `/api/v1/workers/{id}/services` | Get services offered by worker |
| **Worker Skills**| `DELETE`| `/api/v1/workers/services/{id}` | Remove service offering |
| **Worker Docs**| `POST` | `/api/v1/workers/documents` | Upload ID proof or certification |
| **Worker Docs**| `GET` | `/api/v1/workers/{id}/documents` | Get uploaded documents |
| **Worker Docs**| `PUT` | `/api/v1/workers/documents/{docId}/status?status={status}` | Update document status |
| **Worker Slots**| `POST` | `/api/v1/workers/slots` | Add weekly availability slot |
| **Worker Slots**| `GET` | `/api/v1/workers/{id}/slots` | Get worker availability slots |
| **Worker Slots**| `DELETE`| `/api/v1/workers/slots/{slotId}` | Remove availability slot |
| **Providers** | `POST` | `/api/v1/providers` | Create provider profile manually |
| **Providers** | `GET` | `/api/v1/providers/{id}` | Get provider profile by ID |
| **Providers** | `GET` | `/api/v1/providers/user/{userId}`| Get provider profile by user ID |
| **Providers** | `GET` | `/api/v1/providers` | List provider profiles |
| **Providers** | `PUT` | `/api/v1/providers/{id}` | Update provider type or business name |
| **Addresses** | `POST` | `/api/v1/addresses` | Save address for a user |
| **Addresses** | `GET` | `/api/v1/addresses/{id}` | Get address by ID |
| **Addresses** | `GET` | `/api/v1/addresses/user/{userId}`| List addresses for user |
| **Addresses** | `DELETE`| `/api/v1/addresses/{id}` | Delete saved address |
| **Gigs** | `POST` | `/api/v1/gigs` | Post a new job/gig |
| **Gigs** | `GET` | `/api/v1/gigs?categoryId={id}&status={status}&keyword={kw}` | Search and browse gigs |
| **Gigs** | `GET` | `/api/v1/gigs/{id}` | Get gig details |
| **Gigs** | `GET` | `/api/v1/gigs/provider/{providerId}`| Get gigs posted by provider |
| **Gigs** | `PUT` | `/api/v1/gigs/{id}` | Update gig |
| **Gigs** | `POST` | `/api/v1/gigs/{id}/cancel` | Cancel gig |
| **Applications**| `POST` | `/api/v1/applications` | Worker bids / applies for gig |
| **Applications**| `GET` | `/api/v1/applications/{id}` | Get application details |
| **Applications**| `GET` | `/api/v1/applications/gig/{gigId}`| List all applications for a gig |
| **Applications**| `GET` | `/api/v1/applications/worker/{workerId}` | List applications by a worker |
| **Applications**| `POST` | `/api/v1/applications/{id}/withdraw` | Worker withdraws application |
| **Bookings** | `POST` | `/api/v1/bookings/accept/{appId}`| **Accept bid -> Confirm Booking** |
| **Bookings** | `GET` | `/api/v1/bookings/{id}` | Get booking details |
| **Bookings** | `GET` | `/api/v1/bookings/provider/{providerId}` | Get bookings for provider |
| **Bookings** | `GET` | `/api/v1/bookings/worker/{workerId}` | Get bookings for worker |
| **Bookings** | `PUT` | `/api/v1/bookings/{id}/status` | Update booking status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| **Payments** | `POST` | `/api/v1/payments` | Record payment for a booking |
| **Payments** | `GET` | `/api/v1/payments/{id}` | Get payment by ID |
| **Payments** | `GET` | `/api/v1/payments/booking/{bookingId}` | Get payments for a booking |
| **Reviews** | `POST` | `/api/v1/reviews` | Submit rating & review for completed booking |
| **Reviews** | `GET` | `/api/v1/reviews/booking/{bookingId}` | Get reviews for a booking |
| **Reviews** | `GET` | `/api/v1/reviews/user/{userId}` | Get reviews received by a user |
| **Messages** | `POST` | `/api/v1/messages` | Send chat message scoped to a gig |
| **Messages** | `GET` | `/api/v1/messages/gig/{gigId}` | Get conversation thread for a gig |

---

## 3. End-to-End Core Flow Example (cURL)

### Step 1: User Registration
```bash
# Register a Provider
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Connor",
    "email": "sarah@provider.com",
    "phone": "+19876543210",
    "password": "mypassword123",
    "role": "PROVIDER"
  }'

# Register a Worker
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Mike Electrician",
    "email": "mike@worker.com",
    "phone": "+19876543211",
    "password": "mypassword123",
    "role": "WORKER"
  }'
```

### Step 2: Post a Gig
```bash
curl -X POST http://localhost:8081/api/v1/gigs \
  -H "Content-Type: application/json" \
  -d '{
    "providerProfileId": "<PROVIDER_PROFILE_UUID>",
    "categoryId": "<CATEGORY_UUID>",
    "addressId": "<ADDRESS_UUID>",
    "title": "Fix circuit breaker and install 3 ceiling lights",
    "description": "Living room lighting tripping the breaker frequently.",
    "budget": 350.00,
    "scheduledAt": "2026-10-15T10:00:00"
  }'
```

### Step 3: Worker Submits Application / Quote
```bash
curl -X POST http://localhost:8081/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "gigId": "<GIG_UUID>",
    "workerProfileId": "<WORKER_PROFILE_UUID>",
    "quotedPrice": 320.00,
    "coverNote": "Licensed electrician with 8 years experience. Can bring high quality spare parts."
  }'
```

### Step 4: Provider Accepts Bid (Auto-Creates Booking)
```bash
curl -X POST http://localhost:8081/api/v1/bookings/accept/<APPLICATION_UUID>
```

### Step 5: Update Booking Status
```bash
# Worker starts work:
curl -X PUT http://localhost:8081/api/v1/bookings/<BOOKING_UUID>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'

# Work completed:
curl -X PUT http://localhost:8081/api/v1/bookings/<BOOKING_UUID>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

### Step 6: Process Payment
```bash
curl -X POST http://localhost:8081/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "<BOOKING_UUID>",
    "amount": 320.00,
    "method": "UPI"
  }'
```

### Step 7: Mutual Review & Dynamic Rating Recalculation
```bash
curl -X POST http://localhost:8081/api/v1/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "<BOOKING_UUID>",
    "reviewerId": "<PROVIDER_USER_UUID>",
    "rating": 5,
    "comment": "Outstanding electrician! Resolved the issue in 45 minutes."
  }'
```
