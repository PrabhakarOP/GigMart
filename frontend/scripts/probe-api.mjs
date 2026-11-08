import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:8081/api/v1';
const OUT_DIR = path.resolve('docs/api-samples');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const timestamp = Date.now();
const providerEmail = `probe.provider.${timestamp}@gigmart.test`;
const workerEmail = `probe.worker.${timestamp}@gigmart.test`;
const providerPhone = `98${String(timestamp).slice(-8)}`;
const workerPhone = `99${String(timestamp).slice(-8)}`;

async function req(name, method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    const sample = {
      name,
      endpoint,
      method,
      status: res.status,
      body: data,
    };
    fs.writeFileSync(path.join(OUT_DIR, `${name}.json`), JSON.stringify(sample, null, 2));
    console.log(`[${res.status}] ${method} ${endpoint} -> saved to ${name}.json`);
    return { status: res.status, data };
  } catch (err) {
    console.error(`FAILED: ${method} ${endpoint}:`, err.message);
    fs.writeFileSync(path.join(OUT_DIR, `${name}-error.json`), JSON.stringify({ error: err.message }, null, 2));
    return { status: 0, error: err.message };
  }
}

async function runProbe() {
  console.log('--- Starting API Probe ---');

  // 1. Categories
  const catRes = await req('01-categories', 'GET', '/categories?activeOnly=true');
  const categories = catRes.data?.data || [];
  const categoryId = categories[0]?.id;

  // 2. Register Provider
  const regProvRes = await req('02-register-provider', 'POST', '/auth/register', {
    fullName: 'Probe Provider',
    email: providerEmail,
    phone: providerPhone,
    password: 'password123',
    role: 'PROVIDER',
  });
  const providerUser = regProvRes.data?.data;
  const providerUserId = providerUser?.id;

  // 3. Register Worker
  const regWorkRes = await req('03-register-worker', 'POST', '/auth/register', {
    fullName: 'Probe Worker',
    email: workerEmail,
    phone: workerPhone,
    password: 'password123',
    role: 'WORKER',
  });
  const workerUser = regWorkRes.data?.data;
  const workerUserId = workerUser?.id;

  // 4. Login Provider
  const loginProvRes = await req('04-login-provider', 'POST', '/auth/login', {
    email: providerEmail,
    password: 'password123',
  });

  // 5. Login Worker
  const loginWorkRes = await req('05-login-worker', 'POST', '/auth/login', {
    email: workerEmail,
    password: 'password123',
  });

  // 6. Provider Profile
  const provProfRes = await req('06-provider-profile', 'GET', `/providers/user/${providerUserId}`);
  const providerProfileId = provProfRes.data?.data?.id;

  // 7. Worker Profile
  const workProfRes = await req('07-worker-profile', 'GET', `/workers/user/${workerUserId}`);
  const workerProfileId = workProfRes.data?.data?.id;

  // 8. Create Address
  const addrRes = await req('08-create-address', 'POST', '/addresses', {
    userId: providerUserId,
    line1: '123 Test Street, Suite 4',
    city: 'Bengaluru',
    pincode: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const addressId = addrRes.data?.data?.id;

  // 9. Get Addresses for User
  await req('09-get-addresses', 'GET', `/addresses/user/${providerUserId}`);

  // 10. Create Gig
  const futureDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 19);
  const gigRes = await req('10-create-gig', 'POST', '/gigs', {
    providerProfileId,
    categoryId,
    addressId,
    title: 'AC Deep Cleaning and Gas Refill',
    description: 'Looking for a certified technician to clean and service two split AC units.',
    budget: 1500,
    scheduledAt: futureDate,
  });
  const gigId = gigRes.data?.data?.id;

  // 11. Get Gig
  await req('11-get-gig', 'GET', `/gigs/${gigId}`);

  // 12. List Gigs
  await req('12-list-gigs', 'GET', '/gigs');

  // 13. Apply to Gig
  const appRes = await req('13-apply-gig', 'POST', '/applications', {
    gigId,
    workerProfileId,
    quotedPrice: 1400,
    coverNote: 'I have 5 years experience servicing split ACs. Available on time.',
  });
  const applicationId = appRes.data?.data?.id;

  // 14. List Applications for Gig
  await req('14-list-applications-gig', 'GET', `/applications/gig/${gigId}`);

  // 15. List Applications for Worker
  await req('15-list-applications-worker', 'GET', `/applications/worker/${workerProfileId}`);

  // 16. Accept Application -> Creates Booking
  const acceptRes = await req('16-accept-bid', 'POST', `/bookings/accept/${applicationId}`);
  const bookingId = acceptRes.data?.data?.id;

  // 17. Get Booking
  await req('17-get-booking', 'GET', `/bookings/${bookingId}`);

  // 18. Booking IN_PROGRESS
  await req('18-booking-inprogress', 'PUT', `/bookings/${bookingId}/status`, { status: 'IN_PROGRESS' });

  // 19. Booking COMPLETED
  await req('19-booking-completed', 'PUT', `/bookings/${bookingId}/status`, { status: 'COMPLETED' });

  // 20. Create Payment
  const payRes = await req('20-create-payment', 'POST', '/payments', {
    bookingId,
    amount: 1400,
    method: 'CARD',
  });

  // 21. Get Payments for Booking
  await req('21-get-payments-booking', 'GET', `/payments/booking/${bookingId}`);

  // 22. Review Provider -> Worker
  await req('22-review-provider-to-worker', 'POST', '/reviews', {
    bookingId,
    reviewerId: providerUserId,
    rating: 5,
    comment: 'Punctual and very thorough service!',
  });

  // 23. Review Worker -> Provider
  await req('23-review-worker-to-provider', 'POST', '/reviews', {
    bookingId,
    reviewerId: workerUserId,
    rating: 5,
    comment: 'Great host, clear instructions and quick payment.',
  });

  // 24. Get Reviews for Booking
  await req('24-get-reviews-booking', 'GET', `/reviews/booking/${bookingId}`);

  // 25. Get Reviews for User
  await req('25-get-reviews-user', 'GET', `/reviews/user/${workerUserId}`);

  // 26. Send Message with body
  await req('26-send-message-body', 'POST', '/messages', {
    gigId,
    senderId: providerUserId,
    receiverId: workerUserId,
    body: 'Hi worker, thanks for the service!',
  });

  // 26b. Send Message with content (probe if backend accepts 'content' or fails)
  await req('26b-send-message-content-only', 'POST', '/messages', {
    gigId,
    senderId: providerUserId,
    receiverId: workerUserId,
    content: 'Testing content key only',
  });

  // 27. Get Messages for Gig
  await req('27-get-messages-gig', 'GET', `/messages/gig/${gigId}`);

  // 28. Worker Update
  await req('28-worker-update', 'PUT', `/workers/${workerProfileId}`, {
    bio: 'Professional HVAC technician with 8 years field experience.',
    experienceYears: 8,
    serviceRadiusKm: 30,
  });

  // 29. Provider Update
  await req('29-provider-update', 'PUT', `/providers/${providerProfileId}`, {
    providerType: 'BUSINESS',
    businessName: 'Apex Property Care',
  });

  // 30. Add Worker Service
  await req('30-add-worker-service', 'POST', '/workers/services', {
    workerProfileId,
    categoryId,
    baseRate: 450,
    rateType: 'HOURLY',
  });

  // 31. Get Worker Services
  await req('31-get-worker-services', 'GET', `/workers/${workerProfileId}/services`);

  // 32. Add Availability Slot
  await req('32-add-slot', 'POST', '/workers/slots', {
    workerProfileId,
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '18:00',
  });

  // 33. Get Availability Slots
  await req('33-get-slots', 'GET', `/workers/${workerProfileId}/slots`);

  // 34. Add Worker Document
  await req('34-add-document', 'POST', '/workers/documents', {
    workerProfileId,
    docType: 'CERTIFICATION',
    fileUrl: 'https://storage.gigmart.test/cert-123.pdf',
  });

  // 35. Get Worker Documents
  await req('35-get-documents', 'GET', `/workers/${workerProfileId}/documents`);

  // 36. Create Category
  await req('36-create-category', 'POST', '/categories', {
    name: `Test Category ${timestamp}`,
    icon: 'wrench',
    isActive: true,
  });

  // 37. Users List & User verify
  await req('37-users-list', 'GET', '/users');
  await req('38-user-verify', 'PUT', `/users/${workerUserId}/verify`);

  console.log('--- API Probe Complete ---');
}

runProbe().catch(console.error);

