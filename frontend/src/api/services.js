import api from './client';

const u = (p) => p.then((env) => env.data);
const clean = (o = {}) =>
  Object.fromEntries(
    Object.entries(o).filter(
      ([, v]) => v !== '' && v != null && v !== 'ALL' && v !== 'all'
    )
  );

export const toList = (v) => (Array.isArray(v) ? v : v?.content ?? []);

export const authApi = {
  register: (d) => u(api.post('/auth/register', d)),
  login: (d) => u(api.post('/auth/login', d)),
};

export const userApi = {
  getById: (id) => u(api.get(`/users/${id}`)),
  list: (role) => u(api.get('/users', { params: clean({ role }) })),
  verify: (id) => u(api.put(`/users/${id}/verify`)),
};

export const categoryApi = {
  list: (activeOnly = true) => u(api.get('/categories', { params: { activeOnly } })),
  getById: (id) => u(api.get(`/categories/${id}`)),
  create: (d) => u(api.post('/categories', d)),
  update: (id, d) => u(api.put(`/categories/${id}`, d)),
  remove: (id) => u(api.delete(`/categories/${id}`)),
};

export const workerApi = {
  getById: (id) => u(api.get(`/workers/${id}`)),
  getByUserId: (uid) => u(api.get(`/workers/user/${uid}`)),
  list: (status) => u(api.get('/workers', { params: clean({ status }) })),
  update: (id, d) => u(api.put(`/workers/${id}`, d)),
  addService: (d) => u(api.post('/workers/services', d)),
  getServices: (id) => u(api.get(`/workers/${id}/services`)),
  removeService: (id) => u(api.delete(`/workers/services/${id}`)),
  addDocument: (d) => u(api.post('/workers/documents', d)),
  getDocuments: (id) => u(api.get(`/workers/${id}/documents`)),
  updateDocumentStatus: (docId, status) =>
    u(api.put(`/workers/documents/${docId}/status`, null, { params: { status } })),
  addSlot: (d) => u(api.post('/workers/slots', d)),
  getSlots: (id) => u(api.get(`/workers/${id}/slots`)),
  removeSlot: (slotId) => u(api.delete(`/workers/slots/${slotId}`)),
};

export const providerApi = {
  getById: (id) => u(api.get(`/providers/${id}`)),
  getByUserId: (uid) => u(api.get(`/providers/user/${uid}`)),
  list: () => u(api.get('/providers')),
  update: (id, d) => u(api.put(`/providers/${id}`, d)),
};

export const addressApi = {
  create: (d) => u(api.post('/addresses', d)),
  getById: (id) => u(api.get(`/addresses/${id}`)),
  getByUserId: (uid) => u(api.get(`/addresses/user/${uid}`)),
  remove: (id) => u(api.delete(`/addresses/${id}`)),
};

export const gigApi = {
  list: (p) => u(api.get('/gigs', { params: clean(p) })), // only categoryId, status, keyword
  getById: (id) => u(api.get(`/gigs/${id}`)),
  getByProvider: (pid) => u(api.get(`/gigs/provider/${pid}`)),
  create: (d) => u(api.post('/gigs', d)),
  update: (id, d) => u(api.put(`/gigs/${id}`, d)),
  cancel: (id) => u(api.post(`/gigs/${id}/cancel`)),
};

export const applicationApi = {
  create: (d) => u(api.post('/applications', d)),
  getById: (id) => u(api.get(`/applications/${id}`)),
  getByGig: (gigId) => u(api.get(`/applications/gig/${gigId}`)),
  getByWorker: (wid) => u(api.get(`/applications/worker/${wid}`)),
  withdraw: (id) => u(api.post(`/applications/${id}/withdraw`)),
};

export const bookingApi = {
  accept: (appId) => u(api.post(`/bookings/accept/${appId}`)),
  getById: (id) => u(api.get(`/bookings/${id}`)),
  getByProvider: (pid) => u(api.get(`/bookings/provider/${pid}`)),
  getByWorker: (wid) => u(api.get(`/bookings/worker/${wid}`)),
  updateStatus: (id, status) => u(api.put(`/bookings/${id}/status`, { status })),
};

export const paymentApi = {
  create: (d) => u(api.post('/payments', d)),
  getById: (id) => u(api.get(`/payments/${id}`)),
  getByBooking: (bid) => u(api.get(`/payments/booking/${bid}`)),
};

export const reviewApi = {
  create: (d) => u(api.post('/reviews', d)),
  getByBooking: (bid) => u(api.get(`/reviews/booking/${bid}`)),
  getByUser: (uid) => u(api.get(`/reviews/user/${uid}`)),
};

export const messageApi = {
  send: ({ gigId, senderId, receiverId, text }) =>
    u(api.post('/messages', { gigId, senderId, receiverId, body: text, content: text })),
  getByGig: (gigId) => u(api.get(`/messages/gig/${gigId}`)),
};

