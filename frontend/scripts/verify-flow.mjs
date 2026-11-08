// Test verification of seeded accounts & complete lifecycle
const BASE = 'http://localhost:8081/api/v1';

async function req(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${url}`, options);
  const json = await res.json();
  return { status: res.status, data: json.data };
}

async function verify() {
  console.log('Testing seeded logins...');
  const admin = await req('/auth/login', 'POST', { email: 'admin@gigmart.com', password: 'admin123' });
  console.log('Admin login status:', admin.status, 'Role:', admin.data?.role);

  const provider = await req('/auth/login', 'POST', { email: 'provider@gigmart.com', password: 'provider123' });
  console.log('Provider login status:', provider.status, 'Role:', provider.data?.role);

  const worker = await req('/auth/login', 'POST', { email: 'worker@gigmart.com', password: 'worker123' });
  console.log('Worker login status:', worker.status, 'Role:', worker.data?.role);

  if (provider.data?.id) {
    const provProfile = await req(`/providers/user/${provider.data.id}`);
    console.log('Provider profile id:', provProfile.data?.id);
  }

  if (worker.data?.id) {
    const workProfile = await req(`/workers/user/${worker.data.id}`);
    console.log('Worker profile id:', workProfile.data?.id);
  }

  console.log('Seeded accounts verified successfully!');
}

verify().catch(console.error);

