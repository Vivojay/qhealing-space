export function createPageUrl(page) {
  const routes = {
    'Home': '/',
    'Services': '/services',
    'Instant Consult': '/instant-consult',
    'Combined Healings': '/combined-healings',
    'Auth': '/auth',
    'Healings': '/healings',
    'Global Practices': '/global-practices',
    'Retreats': '/retreats',
    'Hindu Rituals': '/hindu-rituals',
    'Transcendence Rituals': '/transcendence-rituals',
    'Booking': '/booking',
  };
  return routes[page] || '/';
}

const DEFAULT_API_ORIGIN = 'https://qhs.onrender.com';

function normalizeApiOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export const API_ORIGIN = normalizeApiOrigin(import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_ORIGIN;

export function apiUrl(path) {
  const rawPath = String(path || '');
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return `${API_ORIGIN}${normalizedPath}`;
}
