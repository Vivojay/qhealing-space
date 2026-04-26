import { apiUrl } from '@/utils';

const TOKEN_KEY = 'qhs_admin_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function parseError(res) {
  let body = null;
  try { body = await res.json(); } catch {}
  if (body && typeof body.detail === 'string') return body.detail;
  if (body && Array.isArray(body.detail)) return body.detail[0]?.msg || `HTTP ${res.status}`;
  return `HTTP ${res.status}`;
}

export async function apiFetch(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const token = getToken();
  const requestUrl = /^https?:\/\//i.test(path) ? path : apiUrl(path);
  const finalHeaders = { ...headers };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(requestUrl, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined' && !path.endsWith('/api/admin/login')) {
      // soft redirect — let component handle next render
      const evt = new CustomEvent('qhs-admin-unauthorized');
      window.dispatchEvent(evt);
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (raw) return res;
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const adminApi = {
  login: (password) =>
    apiFetch('/api/admin/login', { method: 'POST', body: { password } }),
  me: () => apiFetch('/api/admin/me'),

  metrics: () => apiFetch('/api/admin/metrics'),

  getInstagram: (force = false) =>
    apiFetch(`/api/admin/instagram${force ? '?force=true' : ''}`),
  refreshInstagram: () =>
    apiFetch('/api/admin/instagram/refresh', { method: 'POST' }),
  getCuration: () => apiFetch('/api/admin/instagram/curation'),
  setCuration: (selected_ids) =>
    apiFetch('/api/admin/instagram/curation', { method: 'PUT', body: { selected_ids } }),

  listSubscribers: () => apiFetch('/api/admin/newsletter/subscribers'),
  deleteSubscriber: (email) =>
    apiFetch(`/api/admin/newsletter/subscribers/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  exportSubscribers: () =>
    apiFetch('/api/admin/newsletter/export', { raw: true }),

  listInstantConsult: (status) =>
    apiFetch(`/api/admin/consult/messages${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateInstantConsultStatus: (id, status) =>
    apiFetch(`/api/admin/consult/messages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { status },
    }),
  sendInstantConsultReply: (id, formData) =>
    apiFetch(`/api/admin/consult/messages/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      body: formData,
    }),

  listInstantConsultPaymentClaims: (status = 'pending') =>
    apiFetch(`/api/admin/consult/payment-claims${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateInstantConsultPaymentClaimStatus: (id, status, note = '') =>
    apiFetch(`/api/admin/consult/payment-claims/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { status, note },
    }),

  getConfig: () => apiFetch('/api/admin/config'),
  putConfig: (patch) => apiFetch('/api/admin/config', { method: 'PUT', body: patch }),

  publicHealth: () => apiFetch('/api/health'),
};
