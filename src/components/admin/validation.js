// Lightweight client-side validators with friendly messages.
// Each validator returns "" when valid, or an error message string.

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

export function validateEmail(v, { required = true } = {}) {
  const t = String(v || '').trim();
  if (!t) return required ? 'Email is required.' : '';
  if (t.length > 254) return 'Email is too long.';
  if (!isEmail(t)) return 'Please enter a valid email address.';
  return '';
}

export function validateInstagramHandle(v, { required = false } = {}) {
  let t = String(v || '').trim();
  if (!t) return required ? 'Instagram handle is required.' : '';
  if (t.startsWith('@')) t = t.slice(1);
  if (t.length < 1 || t.length > 30) return 'Handle must be 1–30 characters.';
  if (!/^[a-zA-Z0-9_.]+$/.test(t)) return 'Use only letters, numbers, underscores, and dots.';
  if (t.startsWith('.') || t.endsWith('.')) return 'Handle cannot start or end with a dot.';
  if (t.includes('..')) return 'Handle cannot contain consecutive dots.';
  return '';
}

export const normalizeInstagramHandle = (v) => {
  let t = String(v || '').trim();
  if (t.startsWith('@')) t = t.slice(1);
  return t;
};

export function validatePhone(v, { required = false } = {}) {
  const t = String(v || '').trim();
  if (!t) return required ? 'Phone is required.' : '';
  // Allow digits, spaces, +, -, (, )
  if (!/^[+\d][\d\s().-]{5,24}$/.test(t)) return 'Please enter a valid phone number.';
  const digits = t.replace(/\D/g, '');
  if (digits.length < 6 || digits.length > 15) return 'Phone number length looks off (6–15 digits).';
  return '';
}

export function validateLocation(v, { required = false } = {}) {
  const t = String(v || '').trim();
  if (!t) return required ? 'Location is required.' : '';
  if (t.length > 100) return 'Keep location under 100 characters.';
  return '';
}

export function validatePassword(v, { minLength = 1 } = {}) {
  const t = String(v || '');
  if (!t) return 'Password is required.';
  if (t.length < minLength) return `Password must be at least ${minLength} characters.`;
  return '';
}
