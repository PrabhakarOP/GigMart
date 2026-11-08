import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res.data, // envelope: { success, message, data, timestamp }
  (error) => {
    const body = error.response?.data;
    const msg =
      body?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Is the backend running on port 8081?'
        : error.message) ||
      'Unexpected error';
    const err = new Error(msg);
    err.status = error.response?.status;
    err.fieldErrors = body?.data && typeof body.data === 'object' ? body.data : null; // validation map
    return Promise.reject(err);
  }
);

export default api;

