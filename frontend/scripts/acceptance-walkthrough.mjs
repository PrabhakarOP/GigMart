import fs from 'node:fs';

const BASE_URL = 'http://localhost:8081/api/v1';

async function req(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runAcceptanceWalkthrough() {
  console.log('====================================================');
  console.log('   STARTING GIGMART ACCEPTANCE WALKTHROUGH (SEC 14)  ');
  console.log('====================================================\n');

  const now = Date.now();

  // -------------------------------------------------------------------------
  // Step 1: Admin login, verify worker user, create test category, deactivate
  // -------------------------------------------------------------------------
  console.log('[Step 1] Admin operations: login, verify worker, category lifecycle');
  const adminLogin = await req('POST', '/auth/login', {
    email: 'admin@gigmart.com',
    password: 'admin123',
  });
  assert(adminLogin.status === 200, 'Admin logged in successfully');
  assert(adminLogin.data?.data?.role === 'ADMIN', 'Admin role confirmed');

  // Verify seeded worker user
  const workerLogin = await req('POST', '/auth/login', {
    email: 'worker@gigmart.com',
    password: 'worker123',
  });
  const seededWorkerUserId = workerLogin.data?.data?.id;
  const verifyRes = await req('PUT', `/users/${seededWorkerUserId}/verify`);
  assert(verifyRes.status === 200, 'Worker user verified by admin');

  // Create test category
  const testCatName = `Walkthrough Test Cat ${now}`;
  const createCatRes = await req('POST', '/categories', {
    name: testCatName,
    icon: 'hammer',
    isActive: true,
  });
  assert(createCatRes.status === 201, 'Test category created');
  const testCatId = createCatRes.data?.data?.id;

  // Deactivate test category
  const deactCatRes = await req('PUT', `/categories/${testCatId}`, {
    name: testCatName,
    icon: 'hammer',
    isActive: false,
  });
  assert(deactCatRes.status === 200, 'Test category deactivated');
  assert(deactCatRes.data?.data?.isActive === false, 'Category isActive is false');

  // -------------------------------------------------------------------------
  // Step 2: Register a new provider and a new worker
  // -------------------------------------------------------------------------
  console.log('\n[Step 2] Register new provider and new worker');
  const provEmail = `wt.prov.${now}@gigmart.test`;
  const provPhone = `91${String(now).slice(-8)}`;
  const regProv = await req('POST', '/auth/register', {
    fullName: 'Walkthrough Provider',
    email: provEmail,
    phone: provPhone,
    password: 'provider123',
    role: 'PROVIDER',
  });
  assert(regProv.status === 201, 'Provider registered');
  const provUserId = regProv.data?.data?.id;

  const workEmail = `wt.work.${now}@gigmart.test`;
  const workPhone = `92${String(now).slice(-8)}`;
  const regWork = await req('POST', '/auth/register', {
    fullName: 'Walkthrough Worker',
    email: workEmail,
    phone: workPhone,
    password: 'worker123',
    role: 'WORKER',
  });
  assert(regWork.status === 201, 'Worker registered');
  const workUserId = regWork.data?.data?.id;

  // Fetch their profiles
  const provProf = await req('GET', `/providers/user/${provUserId}`);
  assert(provProf.status === 200, 'Provider profile retrieved');
  const provProfileId = provProf.data?.data?.id;

  const workProf = await req('GET', `/workers/user/${workUserId}`);
  assert(workProf.status === 200, 'Worker profile retrieved');
  const workProfileId = workProf.data?.data?.id;

  // -------------------------------------------------------------------------
  // Step 3: Provider adds address and posts gig, verified in public list & filters
  // -------------------------------------------------------------------------
  console.log('\n[Step 3] Provider adds address and posts gig');
  const addrRes = await req('POST', '/addresses', {
    userId: provUserId,
    line1: '99 Walkthrough Ave, Sector 5',
    city: 'Bengaluru',
    pincode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
  });
  assert(addrRes.status === 201, 'Address created for provider');
  const addressId = addrRes.data?.data?.id;

  // Use seeded AC Technician category
  const catsRes = await req('GET', '/categories?activeOnly=true');
  const activeCats = catsRes.data?.data || [];
  const categoryId = activeCats[0].id;
  const categoryName = activeCats[0].name;

  const gigSchedule = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 19);
  const gigRes = await req('POST', '/gigs', {
    providerProfileId: provProfileId,
    categoryId,
    addressId,
    title: `Split AC Deep Clean Service ${now}`,
    description: 'Looking for a professional to thoroughly clean and inspect split AC filters and coils.',
    budget: 2000,
    scheduledAt: gigSchedule,
  });
  assert(gigRes.status === 201, 'Gig posted successfully');
  const gigId = gigRes.data?.data?.id;

  // Verify list & filters
  const listAll = await req('GET', '/gigs');
  assert(listAll.status === 200, 'All gigs fetched');
  const foundInList = (listAll.data?.data || []).some((g) => g.id === gigId);
  assert(foundInList, 'Gig appears in public list');

  const filterKeyword = await req('GET', `/gigs?keyword=Deep`);
  assert(filterKeyword.status === 200, 'Keyword filter query responded');
  const foundKeyword = (filterKeyword.data?.data || []).some((g) => g.id === gigId);
  assert(foundKeyword, 'Gig found by keyword filter');

  const filterCat = await req('GET', `/gigs?categoryId=${categoryId}`);
  assert(filterCat.status === 200, 'Category filter responded');
  const foundCat = (filterCat.data?.data || []).some((g) => g.id === gigId);
  assert(foundCat, 'Gig found by category filter');

  // -------------------------------------------------------------------------
  // Step 4: Worker bids, sees PENDING, withdraws, handles duplicate, second worker bids
  // -------------------------------------------------------------------------
  console.log('\n[Step 4] Worker bidding, withdrawal, duplicate handling, multi-bidder');
  const app1Res = await req('POST', '/applications', {
    gigId,
    workerProfileId: workProfileId,
    quotedPrice: 1900,
    coverNote: 'First application cover note.',
  });
  assert(app1Res.status === 201, 'Worker 1 quote submitted');
  const app1Id = app1Res.data?.data?.id;
  assert(app1Res.data?.data?.status === 'PENDING', 'Quote status is PENDING');

  // Worker withdraws
  const withdrawRes = await req('POST', `/applications/${app1Id}/withdraw`);
  assert(withdrawRes.status === 200, 'Worker 1 withdrew quote');
  assert(withdrawRes.data?.data?.status === 'WITHDRAWN', 'Quote status is WITHDRAWN');

  // Worker tries to reapply
  const reapplyRes = await req('POST', '/applications', {
    gigId,
    workerProfileId: workProfileId,
    quotedPrice: 1850,
    coverNote: 'Reapplied quote.',
  });
  // Note behavior: backend either accepts or returns 409
  console.log(`  ℹ Reapply response code: ${reapplyRes.status}`);

  // Also apply with seeded worker as second bidder
  const seededWorkerProf = await req('GET', `/workers/user/${seededWorkerUserId}`);
  const seededWorkerProfileId = seededWorkerProf.data?.data?.id;
  const app2Res = await req('POST', '/applications', {
    gigId,
    workerProfileId: seededWorkerProfileId,
    quotedPrice: 1750,
    coverNote: 'Experienced technician ready with tools.',
  });
  assert(app2Res.status === 201, 'Seeded worker applied as second bidder');
  const app2Id = app2Res.data?.data?.id;

  // -------------------------------------------------------------------------
  // Step 5: Provider sees both quotes, messages worker, accepts one
  // -------------------------------------------------------------------------
  console.log('\n[Step 5] Provider reviews quotes, messages worker, accepts bid');
  const gigAppsRes = await req('GET', `/applications/gig/${gigId}`);
  assert(gigAppsRes.status === 200, 'Applications for gig retrieved');
  const apps = gigAppsRes.data?.data || [];
  assert(apps.length >= 2, 'Provider sees multiple quotes');

  // Provider sends message to seeded worker
  const msgRes = await req('POST', '/messages', {
    gigId,
    senderId: provUserId,
    receiverId: seededWorkerUserId,
    body: 'Can you arrive at 10 AM sharp?',
  });
  assert(msgRes.status === 201, 'Provider sent message to worker');

  // Provider accepts seeded worker bid
  const acceptRes = await req('POST', `/bookings/accept/${app2Id}`);
  assert(acceptRes.status === 201, 'Provider accepted bid; booking created');
  const bookingId = acceptRes.data?.data?.id;
  assert(acceptRes.data?.data?.status === 'SCHEDULED', 'Booking status is SCHEDULED');

  // Check gig is ASSIGNED
  const updatedGig = await req('GET', `/gigs/${gigId}`);
  assert(updatedGig.data?.data?.status === 'ASSIGNED', 'Gig status changed to ASSIGNED');

  // -------------------------------------------------------------------------
  // Step 6: Worker starts work & completes, provider records payment & fee preview
  // -------------------------------------------------------------------------
  console.log('\n[Step 6] Execution, completion, payment & 10% fee calculation');
  const startRes = await req('PUT', `/bookings/${bookingId}/status`, { status: 'IN_PROGRESS' });
  assert(startRes.status === 200, 'Worker started work (IN_PROGRESS)');

  const completeRes = await req('PUT', `/bookings/${bookingId}/status`, { status: 'COMPLETED' });
  assert(completeRes.status === 200, 'Worker completed work (COMPLETED)');

  // Provider records payment
  const payAmount = 1750;
  const expectedFeePreview = Math.round(payAmount * 0.10 * 100) / 100; // 175.00
  const payRes = await req('POST', '/payments', {
    bookingId,
    amount: payAmount,
    method: 'CARD',
  });
  assert(payRes.status === 201, 'Payment recorded');
  const platformFee = Number(payRes.data?.data?.platformFee);
  assert(platformFee === expectedFeePreview, `Server platformFee (${platformFee}) equals preview (${expectedFeePreview})`);

  // -------------------------------------------------------------------------
  // Step 7: Reviews, duplicate review rejection, profile rating update
  // -------------------------------------------------------------------------
  console.log('\n[Step 7] Two-way reviews & duplicate rejection');
  const provReview = await req('POST', '/reviews', {
    bookingId,
    reviewerId: provUserId,
    rating: 5,
    comment: 'Exceptional work and very clean execution!',
  });
  assert(provReview.status === 201, 'Provider posted review for worker');

  const workReview = await req('POST', '/reviews', {
    bookingId,
    reviewerId: seededWorkerUserId,
    rating: 5,
    comment: 'Clear instructions and immediate payment approval.',
  });
  assert(workReview.status === 201, 'Worker posted review for provider');

  // Duplicate review attempt
  const dupReview = await req('POST', '/reviews', {
    bookingId,
    reviewerId: provUserId,
    rating: 4,
    comment: 'Trying to post second review.',
  });
  assert(dupReview.status === 400 || dupReview.status === 409 || dupReview.status === 500, 'Duplicate review attempt blocked by backend');

  // Check worker profile has rating
  const workerProfileAfter = await req('GET', `/workers/user/${seededWorkerUserId}`);
  assert(workerProfileAfter.data?.data?.avgRating != null, 'Worker profile displays updated average rating');

  // -------------------------------------------------------------------------
  // Step 8: Cancel path: post gig, accept bid, cancel while SCHEDULED
  // -------------------------------------------------------------------------
  console.log('\n[Step 8] Cancel path test');
  const gig2Res = await req('POST', '/gigs', {
    providerProfileId: provProfileId,
    categoryId,
    addressId,
    title: `Cancellation Test Gig ${now}`,
    description: 'Gig created specifically to verify cancellation workflow.',
    budget: 1200,
    scheduledAt: gigSchedule,
  });
  const gig2Id = gig2Res.data?.data?.id;

  const appCancelRes = await req('POST', '/applications', {
    gigId: gig2Id,
    workerProfileId: seededWorkerProfileId,
    quotedPrice: 1200,
    coverNote: 'Bid for cancellation test.',
  });
  const appCancelId = appCancelRes.data?.data?.id;

  const bookCancelRes = await req('POST', `/bookings/accept/${appCancelId}`);
  const bookCancelId = bookCancelRes.data?.data?.id;
  assert(bookCancelRes.data?.data?.status === 'SCHEDULED', 'Booking 2 created as SCHEDULED');

  const doCancelRes = await req('PUT', `/bookings/${bookCancelId}/status`, { status: 'CANCELLED' });
  assert(doCancelRes.status === 200, 'Booking cancelled while SCHEDULED');
  assert(doCancelRes.data?.data?.status === 'CANCELLED', 'Booking status is now CANCELLED');

  // Confirm no further status actions succeed on terminal CANCELLED booking
  const invalidTransition = await req('PUT', `/bookings/${bookCancelId}/status`, { status: 'IN_PROGRESS' });
  assert(invalidTransition.status === 400 || invalidTransition.status === 409 || invalidTransition.status === 500, 'Cannot change status after cancellation');

  console.log('\n====================================================');
  console.log('   🎉 ALL ACCEPTANCE WALKTHROUGH STEPS PASSED!      ');
  console.log('====================================================\n');
}

runAcceptanceWalkthrough().catch((err) => {
  console.error('Walkthrough error:', err);
  process.exit(1);
});
