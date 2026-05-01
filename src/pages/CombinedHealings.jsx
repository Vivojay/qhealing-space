import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { getIdToken, onAuthStateChanged, signOut } from 'firebase/auth';
import Footer from '@/components/wellness/Footer';
import { apiUrl, createPageUrl } from '@/utils';
import { firebaseAuth, firebaseConfigured } from '@/lib/firebaseClient';
import { PRICING } from '@/constants/pricing';

const MAX_WISH_LEN = 200;
const MAX_WISHES = 40;
const DEFAULT_OUTSIDE_RAILS = [
  { id: 'wise', name: 'Wise', detail: 'Best for direct bank transfer into India.' },
  { id: 'remitly', name: 'Remitly', detail: 'Fast INR settlement to India account rails.' },
  { id: 'western-union', name: 'Western Union', detail: 'Global transfer rails with India payout support.' },
];
const OUTSIDE_NOTICE = 'International checkout is currently disabled. Use the listed India-side rails and contact support for confirmation.';
const SURFACE_STYLE = { border: '1px solid var(--border2)', background: 'var(--bg-elev)' };

function nextWishId() {
  return `wish_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyWish() {
  return { id: nextWishId(), text: '', status: 'draft', admin_note: '' };
}

function isUnverifiedPasswordUser(user) {
  if (!user) return false;
  const providers = Array.isArray(user.providerData) ? user.providerData : [];
  const usesPasswordSignIn = providers.some((item) => item?.providerId === 'password');
  return usesPasswordSignIn && !user.emailVerified;
}

async function parseApiError(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    return `HTTP ${res.status}`;
  }
  if (body && typeof body.detail === 'string') return body.detail;
  if (body && Array.isArray(body.detail)) return body.detail[0]?.msg || `HTTP ${res.status}`;
  return `HTTP ${res.status}`;
}

function normalizeWish(wish) {
  return {
    id: String(wish?.id || nextWishId()),
    text: String(wish?.text || ''),
    status: String(wish?.status || 'draft').toLowerCase(),
    admin_note: String(wish?.admin_note || ''),
  };
}

function resolveApiMediaSrc(pathOrUrl) {
  const value = String(pathOrUrl || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return apiUrl(value);
}

function normalizeCheckoutSession(session, fallbackProfile = 'india') {
  if (!session) return null;
  const qrSrc = String(session?.qr_src || '').trim();
  return {
    id: String(session?.id || ''),
    status: String(session?.status || 'awaiting_payment').toLowerCase(),
    amount: Number(session?.amount || 0),
    currency: String(session?.currency || (fallbackProfile === 'outside_india' ? 'USD' : 'INR')),
    wish_count: Number(session?.wish_count || 0),
    selected_wish_ids: Array.isArray(session?.selected_wish_ids)
      ? session.selected_wish_ids.map((item) => String(item).trim()).filter(Boolean)
      : [],
    request_id: String(session?.request_id || ''),
    country_profile: String(session?.country_profile || fallbackProfile || 'india').toLowerCase() === 'outside_india'
      ? 'outside_india'
      : 'india',
    qr_src: resolveApiMediaSrc(qrSrc),
    upi_intent: String(session?.upi_intent || ''),
    expires_at: String(session?.expires_at || ''),
    paid_at: String(session?.paid_at || ''),
  };
}

function buildEventPayload(event) {
  if (!event) {
    return {
      ritual_event_id: null,
      ritual_event_date: null,
      ritual_event_label: null,
      ritual_hindu_lunar_label: null,
    };
  }
  return {
    ritual_event_id: String(event.id || '').trim() || null,
    ritual_event_date: String(event.date || '').trim() || null,
    ritual_event_label: String(event.label || '').trim() || null,
    ritual_hindu_lunar_label: String(event?.hindu_lunar?.label || '').trim() || null,
  };
}

function draftFingerprintFromState({ selectedEventId, countryProfile, countryCode, wishes }) {
  return JSON.stringify({
    ritual_event_id: String(selectedEventId || ''),
    country_profile: String(countryProfile || 'india'),
    country_code: String(countryCode || '').trim().toUpperCase(),
    wishes: wishes.map((wish) => ({
      id: String(wish.id || ''),
      text: String(wish.text || '').trim(),
    })),
  });
}

function draftFingerprintFromRow(row) {
  if (!row) return '';
  const wishes = Array.isArray(row?.wishes) ? row.wishes : [];
  return JSON.stringify({
    ritual_event_id: String(row?.ritual_event_id || ''),
    country_profile: String(row?.country_profile || 'india'),
    country_code: String(row?.country_code || '').trim().toUpperCase(),
    wishes: wishes.map((wish) => ({
      id: String(wish?.id || ''),
      text: String(wish?.text || '').trim(),
    })),
  });
}

function selectionSignature(ids, countryProfile) {
  const normalizedIds = Array.isArray(ids)
    ? ids.map((item) => String(item).trim()).filter(Boolean).sort()
    : [];
  return `${String(countryProfile || 'india')}::${normalizedIds.join('|')}`;
}

function toneForWishStatus(status) {
  const normalized = String(status || 'draft').toLowerCase();
  if (normalized === 'approved') {
    return {
      label: 'Approved',
      style: {
        background: 'rgba(67,154,106,0.16)',
        color: '#7DE5B1',
        border: '1px solid rgba(99,230,168,0.34)',
      },
    };
  }
  if (normalized === 'needs_correction') {
    return {
      label: 'Needs Correction',
      style: {
        background: 'rgba(224,138,111,0.14)',
        color: '#F2B199',
        border: '1px solid rgba(224,138,111,0.34)',
      },
    };
  }
  if (normalized === 'corrected') {
    return {
      label: 'Corrected',
      style: {
        background: 'rgba(139,111,213,0.16)',
        color: '#D3C3FF',
        border: '1px solid rgba(173,145,255,0.34)',
      },
    };
  }
  if (normalized === 'in_review') {
    return {
      label: 'In Review',
      style: {
        background: 'rgba(171,130,51,0.16)',
        color: '#F5D07D',
        border: '1px solid rgba(245,208,125,0.34)',
      },
    };
  }
  return {
    label: 'Draft',
    style: {
      background: 'rgba(95,124,165,0.16)',
      color: '#A6CBF5',
      border: '1px solid rgba(160,191,233,0.3)',
    },
  };
}

function toneForRequestStatus(status) {
  const normalized = String(status || 'draft').toLowerCase();
  if (normalized === 'checkout_paid') return toneForWishStatus('approved');
  if (normalized === 'checkout_pending') return toneForWishStatus('in_review');
  if (normalized === 'approved_all') return toneForWishStatus('approved');
  if (normalized === 'needs_correction') return toneForWishStatus('needs_correction');
  if (normalized === 'in_review') return toneForWishStatus('in_review');
  return toneForWishStatus('draft');
}

function toneForCheckoutStatus(status) {
  const normalized = String(status || 'not_started').toLowerCase();
  if (normalized === 'paid') return toneForWishStatus('approved');
  if (normalized === 'awaiting_payment') return toneForWishStatus('in_review');
  if (normalized === 'failed' || normalized === 'expired') return toneForWishStatus('needs_correction');
  return toneForWishStatus('draft');
}

function formatMoney(amount, countryProfile) {
  if (countryProfile === 'outside_india') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function combinedAmountForProfile(countryProfile, wishCount) {
  const safeCount = Math.max(0, Number(wishCount || 0));
  return safeCount * (
    countryProfile === 'outside_india'
      ? PRICING.combinedHealings.international.amount
      : PRICING.combinedHealings.india.amount
  );
}

function StatusBadge({ meta }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase"
      style={meta.style}
    >
      {meta.label}
    </span>
  );
}

function MetricPill({ label, value, accent = 'var(--accent-text)' }) {
  return (
    <div
      className="rounded-[22px] px-4 py-3 min-h-[74px] flex flex-col justify-between"
      style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}
    >
      <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>{label}</p>
      <p className="mt-2 text-sm sm:text-[15px] leading-tight" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`rounded-[28px] p-5 lg:p-6 ${className}`} style={SURFACE_STYLE}>
      {children}
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-[min(92vw,380px)] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = toast.tone === 'error'
            ? {
              border: '1px solid rgba(224,138,111,0.34)',
              background: 'rgba(224,138,111,0.14)',
              color: '#F2B199',
            }
            : {
              border: '1px solid rgba(99,230,168,0.26)',
              background: 'rgba(67,154,106,0.14)',
              color: '#7DE5B1',
            };
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl px-4 py-3 shadow-2xl"
              style={tone}
            >
              <p className="text-sm leading-relaxed">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function StepCard({ index, title, copy }) {
  return (
    <div className="rounded-2xl p-4 h-full" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
      <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--accent-text)' }}>0{index}</p>
      <h3 className="mt-3 text-lg" style={{ color: 'var(--fg)' }}>{title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg2)' }}>{copy}</p>
    </div>
  );
}

export default function CombinedHealings() {
  const navigate = useNavigate();
  const paymentCardRef = useRef(null);
  const qrScrollRef = useRef('');
  const checkoutSyncRequestRef = useRef(0);
  const qrImageCacheRef = useRef(new Map());
  const toastTimersRef = useRef(new Map());

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  const [geoLoading, setGeoLoading] = useState(true);
  const [countryProfile, setCountryProfile] = useState('india');
  const [countryCode, setCountryCode] = useState('IN');

  const [authUser, setAuthUser] = useState(null);
  const [idToken, setIdToken] = useState('');

  const [requestRow, setRequestRow] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [wishes, setWishes] = useState([createEmptyWish()]);
  const [selectedWishIds, setSelectedWishIds] = useState([]);

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [checkoutSession, setCheckoutSession] = useState(null);
  const [checkoutSyncing, setCheckoutSyncing] = useState(false);
  const [checkoutRefreshing, setCheckoutRefreshing] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [checkoutRails, setCheckoutRails] = useState(DEFAULT_OUTSIDE_RAILS);
  const [checkoutQrDisplaySrc, setCheckoutQrDisplaySrc] = useState('');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const emailVerificationPending = useMemo(() => isUnverifiedPasswordUser(authUser), [authUser]);
  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const unitPrice = countryProfile === 'outside_india'
    ? PRICING.combinedHealings.international.amount
    : PRICING.combinedHealings.india.amount;
  const unitLabel = countryProfile === 'outside_india'
    ? PRICING.combinedHealings.international.label
    : PRICING.combinedHealings.india.label;

  const approvedWishIds = useMemo(
    () => wishes.filter((wish) => String(wish.status || '').toLowerCase() === 'approved').map((wish) => wish.id),
    [wishes],
  );
  const approvedWishIdSet = useMemo(() => new Set(approvedWishIds), [approvedWishIds]);

  useEffect(() => {
    setSelectedWishIds((prev) => prev.filter((id) => approvedWishIdSet.has(id)));
  }, [approvedWishIdSet]);

  const selectedApprovedWishIds = useMemo(
    () => selectedWishIds.filter((id) => approvedWishIdSet.has(id)),
    [selectedWishIds, approvedWishIdSet],
  );

  const requestStatusMeta = useMemo(
    () => toneForRequestStatus(requestRow?.status || 'draft'),
    [requestRow],
  );
  const checkoutStatusMeta = useMemo(
    () => toneForCheckoutStatus(checkoutSession?.status || requestRow?.checkout_status || 'not_started'),
    [checkoutSession, requestRow],
  );

  const totalLabel = useMemo(
    () => formatMoney(unitPrice * selectedApprovedWishIds.length, countryProfile),
    [unitPrice, selectedApprovedWishIds.length, countryProfile],
  );
  const expectedCheckoutAmount = unitPrice * selectedApprovedWishIds.length;

  const draftFingerprint = useMemo(
    () => draftFingerprintFromState({
      selectedEventId,
      countryProfile,
      countryCode,
      wishes,
    }),
    [selectedEventId, countryProfile, countryCode, wishes],
  );
  const serverFingerprint = useMemo(
    () => draftFingerprintFromRow(requestRow),
    [requestRow],
  );
  const hasUnsavedChanges = Boolean(idToken) && draftFingerprint !== serverFingerprint;

  const checkoutSelectionSig = useMemo(
    () => selectionSignature(selectedApprovedWishIds, countryProfile),
    [selectedApprovedWishIds, countryProfile],
  );
  const sessionSelectionSig = useMemo(
    () => selectionSignature(checkoutSession?.selected_wish_ids || [], checkoutSession?.country_profile || countryProfile),
    [checkoutSession, countryProfile],
  );

  const checkoutCompleted = String(checkoutSession?.status || requestRow?.checkout_status || '').toLowerCase() === 'paid';
  const checkoutSessionReady = Boolean(checkoutSession?.id && checkoutSession?.qr_src);
  const checkoutSessionMatches = useMemo(() => {
    if (!checkoutSession?.id) return false;
    if (checkoutCompleted) return true;
    return (
      checkoutSelectionSig === sessionSelectionSig
      && expectedCheckoutAmount === Number(checkoutSession?.amount || 0)
      && countryProfile === (checkoutSession?.country_profile || countryProfile)
    );
  }, [checkoutCompleted, checkoutSelectionSig, sessionSelectionSig, expectedCheckoutAmount, checkoutSession, countryProfile]);

  const allWishTextValid = useMemo(
    () => wishes.length > 0 && wishes.every((wish) => {
      const trimmed = String(wish.text || '').trim();
      return trimmed.length > 0 && trimmed.length <= MAX_WISH_LEN;
    }),
    [wishes],
  );

  const canSave = Boolean(
    authUser
    && !emailVerificationPending
    && !checkoutCompleted
    && allWishTextValid
    && !saving
    && !reviewing
    && !cancelling
    && hasUnsavedChanges
  );

  const canSubmitReview = Boolean(
    authUser
    && !emailVerificationPending
    && !checkoutCompleted
    && !requestRow?.client_review_pending
    && allWishTextValid
    && selectedEvent
    && !saving
    && !reviewing
    && !cancelling
  );

  const checkoutBlockedReason = useMemo(() => {
    if (!authUser || emailVerificationPending) return 'Authenticate first to unlock checkout.';
    if (checkoutCompleted) return 'Checkout already confirmed for this request.';
    if (!selectedEvent) return 'Choose a ritual date before checkout.';
    if (!allWishTextValid) return 'Every wish must be filled before checkout sync.';
    if (hasUnsavedChanges) return 'Save your latest request changes before checkout.';
    if (countryProfile === 'outside_india') return OUTSIDE_NOTICE;
    if (!selectedApprovedWishIds.length) return 'Select at least one approved wish to generate a QR.';
    if (loadingRequest || saving || reviewing || cancelling || checkoutSyncing) return 'Wait for current sync to finish.';
    return '';
  }, [
    authUser,
    emailVerificationPending,
    checkoutCompleted,
    selectedEvent,
    allWishTextValid,
    hasUnsavedChanges,
    countryProfile,
    selectedApprovedWishIds.length,
    loadingRequest,
    saving,
    reviewing,
    cancelling,
    checkoutSyncing,
  ]);

  const canGenerateCheckout = checkoutBlockedReason === '';

  const pushToast = useCallback((message, tone = 'success') => {
    if (!message) return;
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      toastTimersRef.current.delete(id);
    }, 4200);
    toastTimersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    if (!notice) return;
    pushToast(notice, 'success');
    setNotice('');
  }, [notice, pushToast]);

  useEffect(() => {
    if (!error) return;
    pushToast(error, 'error');
    setError('');
  }, [error, pushToast]);

  const nudgeAuth = useCallback((mode = 'signup') => {
    const normalizedMode = mode === 'login' ? 'login' : 'signup';
    const nextPath = createPageUrl('Combined Healings');
    navigate(`/auth?mode=${normalizedMode}&next=${encodeURIComponent(nextPath)}`);
  }, [navigate]);

  const applyRequestRow = useCallback((row, { preserveSelection = true } = {}) => {
    setRequestRow(row || null);

    if (!row) {
      setWishes([createEmptyWish()]);
      setSelectedWishIds([]);
      setCheckoutSession(null);
      setCheckoutNotice('');
      return;
    }

    const nextWishes = Array.isArray(row?.wishes) && row.wishes.length
      ? row.wishes.map(normalizeWish)
      : [createEmptyWish()];
    setWishes(nextWishes);

    if (row?.ritual_event_id) {
      setSelectedEventId(String(row.ritual_event_id));
    }
    if (row?.country_profile) {
      setCountryProfile(String(row.country_profile).toLowerCase() === 'outside_india' ? 'outside_india' : 'india');
    }
    if (row?.country_code) {
      setCountryCode(String(row.country_code).trim().toUpperCase());
    }

    const approvedIds = nextWishes
      .filter((wish) => String(wish.status || '').toLowerCase() === 'approved')
      .map((wish) => wish.id);

    setSelectedWishIds((prev) => {
      const validPrev = preserveSelection
        ? prev.filter((id) => approvedIds.includes(id))
        : [];
      const restored = Array.isArray(row?.checkout_selected_wish_ids)
        ? row.checkout_selected_wish_ids.map((item) => String(item)).filter((id) => approvedIds.includes(id))
        : [];
      if (validPrev.length) return validPrev;
      if (restored.length) return restored;
      return approvedIds;
    });

    const existingSessionId = String(row?.checkout_session_id || '');
    if (!existingSessionId) {
      setCheckoutSession(null);
      return;
    }

    setCheckoutSession((prev) => normalizeCheckoutSession({
      id: existingSessionId,
      status: row?.checkout_status || prev?.status || 'awaiting_payment',
      amount: prev?.id === existingSessionId
        ? prev.amount
        : combinedAmountForProfile(row?.country_profile || 'india', row?.checkout_wish_count || 0),
      currency: prev?.id === existingSessionId ? prev.currency : (row?.country_profile === 'outside_india' ? 'USD' : 'INR'),
      wish_count: Number(row?.checkout_wish_count || 0),
      selected_wish_ids: Array.isArray(row?.checkout_selected_wish_ids) ? row.checkout_selected_wish_ids : [],
      request_id: String(row?.checkout_request_id || ''),
      country_profile: row?.country_profile || prev?.country_profile || 'india',
      qr_src: prev?.id === existingSessionId ? prev.qr_src : '',
      upi_intent: prev?.id === existingSessionId ? prev.upi_intent : '',
      expires_at: prev?.id === existingSessionId ? prev.expires_at : '',
      paid_at: row?.checkout_paid_at || prev?.paid_at || '',
    }, row?.country_profile || 'india'));
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await fetch(apiUrl('/api/combined-healings/events?limit=5'));
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setEvents(rows);
    } catch (err) {
      setEvents([]);
      setEventsError(err.message || 'Unable to load ritual dates right now.');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadGeoHint = useCallback(async () => {
    setGeoLoading(true);
    try {
      const res = await fetch(apiUrl('/api/geo/country'));
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const profile = String(payload?.country_profile || '').trim().toLowerCase();
      const code = String(payload?.country_code || 'IN').trim().toUpperCase() || 'IN';
      setCountryProfile(profile === 'outside_india' ? 'outside_india' : 'india');
      setCountryCode(code);
    } catch {
      setCountryProfile('india');
      setCountryCode('IN');
    } finally {
      setGeoLoading(false);
    }
  }, []);

  const loadMyRequest = useCallback(async ({ quiet = false, preserveSelection = true } = {}) => {
    if (!idToken) return null;
    if (!quiet) {
      setLoadingRequest(true);
      setError('');
    }
    try {
      const res = await fetch(apiUrl('/api/combined-healings/my-request'), {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const row = payload?.data || null;
      applyRequestRow(row, { preserveSelection });
      return row;
    } catch (err) {
      if (!quiet) setError(err.message || 'Unable to load your Combined Healings request.');
      return null;
    } finally {
      if (!quiet) setLoadingRequest(false);
    }
  }, [idToken, applyRequestRow]);

  useEffect(() => {
    loadEvents();
    loadGeoHint();
  }, [loadEvents, loadGeoHint]);

  useEffect(() => {
    if (selectedEventId || !events.length) return;
    setSelectedEventId(String(events[0].id || ''));
  }, [events, selectedEventId]);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      setAuthUser(null);
      setIdToken('');
      return undefined;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setAuthUser(user || null);
      if (user && !isUnverifiedPasswordUser(user)) {
        const token = await getIdToken(user, true);
        setIdToken(token);
      } else {
        setIdToken('');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!idToken || emailVerificationPending) return;
    loadMyRequest();
  }, [idToken, emailVerificationPending, loadMyRequest]);

  useEffect(() => {
    if (!idToken || !requestRow) return undefined;
    if (typeof document !== 'undefined' && document.hidden) return undefined;
    const timer = setInterval(() => {
      loadMyRequest({ quiet: true });
    }, 10000);
    return () => clearInterval(timer);
  }, [idToken, requestRow, loadMyRequest]);

  const persistRequest = useCallback(async ({ silent = false } = {}) => {
    if (!idToken) return null;
    if (!silent) {
      setSaving(true);
      setError('');
      setNotice('');
    }

    try {
      if (!allWishTextValid) {
        throw new Error(`Each wish must be filled and stay within ${MAX_WISH_LEN} characters.`);
      }

      const eventPayload = buildEventPayload(selectedEvent);
      const res = await fetch(apiUrl('/api/combined-healings/my-request'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ...eventPayload,
          country_profile: countryProfile,
          country_code: countryCode,
          wishes: wishes.map((wish) => ({
            id: wish.id,
            text: String(wish.text || '').trim(),
          })),
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const row = payload?.data || null;
      applyRequestRow(row);
      if (!silent) setNotice('Request saved. Checkout can only use the synced server state.');
      return row;
    } catch (err) {
      if (!silent) setError(err.message || 'Unable to save your request right now.');
      throw err;
    } finally {
      if (!silent) setSaving(false);
    }
  }, [
    idToken,
    allWishTextValid,
    selectedEvent,
    countryProfile,
    countryCode,
    wishes,
    applyRequestRow,
  ]);

  const refreshCheckoutSession = useCallback(async (sessionId, { quiet = false } = {}) => {
    if (!idToken || !sessionId) return null;
    if (!quiet) setCheckoutRefreshing(true);
    try {
      const res = await fetch(apiUrl(`/api/combined-healings/my-request/checkout/session/${encodeURIComponent(sessionId)}`), {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const session = normalizeCheckoutSession(payload?.data, countryProfile);
      setCheckoutSession(session);

      if (session?.status === 'paid') {
        setCheckoutNotice('Payment confirmed. Approved wishes are now locked.');
        await loadMyRequest({ quiet: true, preserveSelection: false });
      } else if (session?.status === 'expired') {
        setCheckoutNotice('The checkout session expired. Generate a fresh QR to continue.');
      } else if (session?.status === 'failed') {
        setCheckoutNotice('The checkout session failed. Generate a fresh QR to continue.');
      }
      return session;
    } catch (err) {
      if (!quiet) setCheckoutNotice(err.message || 'Unable to refresh checkout state.');
      return null;
    } finally {
      if (!quiet) setCheckoutRefreshing(false);
    }
  }, [idToken, countryProfile, loadMyRequest]);

  const syncCheckoutSession = useCallback(async ({ reason = 'manual' } = {}) => {
    if (!idToken) return null;
    if (!canGenerateCheckout) return null;

    const requestNumber = checkoutSyncRequestRef.current + 1;
    checkoutSyncRequestRef.current = requestNumber;
    setCheckoutSyncing(true);
    setCheckoutNotice(
      reason === 'selection'
        ? 'Selection changed. Regenerating QR to match the latest approved total.'
        : 'Creating checkout session and QR for the current approved selection.',
    );
    setError('');
    setNotice('');
    setCheckoutSession((prev) => (prev ? { ...prev, qr_src: '', upi_intent: '' } : prev));

    try {
      let row = requestRow;
      if (hasUnsavedChanges || !row) {
        row = await persistRequest({ silent: true });
      }

      const sourceWishes = Array.isArray(row?.wishes) ? row.wishes.map(normalizeWish) : wishes;
      const approvedNow = selectedWishIds.filter((id) => {
        const match = sourceWishes.find((wish) => wish.id === id);
        return match && String(match.status || '').toLowerCase() === 'approved';
      });
      if (!approvedNow.length) {
        throw new Error('Select at least one approved wish to create the checkout QR.');
      }

      const res = await fetch(apiUrl('/api/combined-healings/my-request/checkout/session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          country_profile: countryProfile,
          country_code: countryCode,
          selected_wish_ids: approvedNow,
          request_id: checkoutSession?.request_id || row?.checkout_request_id || undefined,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));

      const payload = await res.json();
      if (checkoutSyncRequestRef.current !== requestNumber) return null;

      setCheckoutRails(Array.isArray(payload?.international_rails) && payload.international_rails.length
        ? payload.international_rails
        : DEFAULT_OUTSIDE_RAILS);

      const session = normalizeCheckoutSession(payload?.data, countryProfile);
      setCheckoutSession(session);
      setCheckoutNotice(payload?.client_notice || 'Checkout session ready.');
      await loadMyRequest({ quiet: true, preserveSelection: false });
      return session;
    } catch (err) {
      if (checkoutSyncRequestRef.current === requestNumber) {
        setCheckoutNotice(err.message || 'Unable to sync checkout QR.');
      }
      return null;
    } finally {
      if (checkoutSyncRequestRef.current === requestNumber) {
        setCheckoutSyncing(false);
      }
    }
  }, [
    idToken,
    canGenerateCheckout,
    requestRow,
    hasUnsavedChanges,
    persistRequest,
    wishes,
    selectedWishIds,
    countryProfile,
    countryCode,
    checkoutSession,
    loadMyRequest,
  ]);

  useEffect(() => {
    if (checkoutCompleted) return undefined;
    if (!canGenerateCheckout) return undefined;
    if (countryProfile !== 'india') return undefined;
    if (checkoutSession?.id && checkoutSessionMatches) return undefined;

    setCheckoutSession((prev) => (prev ? { ...prev, qr_src: '', upi_intent: '' } : prev));
    const timer = setTimeout(() => {
      syncCheckoutSession({ reason: 'selection' });
    }, 320);
    return () => clearTimeout(timer);
  }, [
    checkoutCompleted,
    canGenerateCheckout,
    checkoutSession?.id,
    countryProfile,
    checkoutSessionMatches,
    syncCheckoutSession,
  ]);

  useEffect(() => {
    if (!checkoutSession?.id || checkoutCompleted) return;
    if (countryProfile === 'india' && selectedApprovedWishIds.length > 0 && !hasUnsavedChanges) return;
    setCheckoutSession((prev) => (prev ? { ...prev, qr_src: '', upi_intent: '' } : prev));
  }, [
    checkoutSession?.id,
    checkoutCompleted,
    countryProfile,
    selectedApprovedWishIds.length,
    hasUnsavedChanges,
  ]);

  useEffect(() => {
    if (!checkoutSession?.id || !idToken) return undefined;
    if (['paid', 'failed', 'expired'].includes(String(checkoutSession.status || ''))) return undefined;
    if (!checkoutCompleted && sessionSelectionSig !== checkoutSelectionSig) return undefined;

    refreshCheckoutSession(checkoutSession.id, { quiet: true });
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      refreshCheckoutSession(checkoutSession.id, { quiet: true });
    }, 5000);
    return () => clearInterval(timer);
  }, [
    checkoutSession?.id,
    checkoutSession?.status,
    idToken,
    refreshCheckoutSession,
    checkoutCompleted,
    sessionSelectionSig,
    checkoutSelectionSig,
  ]);

  useEffect(() => {
    const src = String(checkoutSession?.qr_src || '').trim();
    if (!src) {
      setCheckoutQrDisplaySrc('');
      return undefined;
    }

    const cached = qrImageCacheRef.current.get(src);
    if (cached) {
      setCheckoutQrDisplaySrc(cached);
      return undefined;
    }

    let cancelled = false;
    setCheckoutQrDisplaySrc(src);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        qrImageCacheRef.current.set(src, objectUrl);
        setCheckoutQrDisplaySrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setCheckoutQrDisplaySrc(src);
      });

    return () => {
      cancelled = true;
    };
  }, [checkoutSession?.qr_src]);

  useEffect(() => () => {
    qrImageCacheRef.current.forEach((value) => {
      try {
        URL.revokeObjectURL(value);
      } catch {}
    });
    qrImageCacheRef.current.clear();
    toastTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    toastTimersRef.current.clear();
  }, []);

  useEffect(() => {
    if (!checkoutSession?.id || !checkoutSession?.qr_src) return;
    const qrKey = `${checkoutSession.id}:${checkoutSession.qr_src}`;
    if (qrScrollRef.current === qrKey) return;
    qrScrollRef.current = qrKey;
    paymentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [checkoutSession?.id, checkoutSession?.qr_src]);

  const onAddWish = useCallback(() => {
    if (checkoutCompleted || wishes.length >= MAX_WISHES) return;
    setWishes((prev) => [...prev, createEmptyWish()]);
  }, [checkoutCompleted, wishes.length]);

  const onRemoveWish = useCallback((wishId) => {
    if (checkoutCompleted || wishes.length <= 1) return;
    setWishes((prev) => prev.filter((wish) => wish.id !== wishId));
    setSelectedWishIds((prev) => prev.filter((id) => id !== wishId));
  }, [checkoutCompleted, wishes.length]);

  const onWishTextChange = useCallback((wishId, text) => {
    if (checkoutCompleted) return;
    setWishes((prev) => prev.map((wish) => (
      wish.id === wishId ? { ...wish, text } : wish
    )));
  }, [checkoutCompleted]);

  const onToggleCheckoutWish = useCallback((wishId) => {
    if (checkoutCompleted || !approvedWishIdSet.has(wishId)) return;
    setSelectedWishIds((prev) => (
      prev.includes(wishId)
        ? prev.filter((id) => id !== wishId)
        : [...prev, wishId]
    ));
  }, [checkoutCompleted, approvedWishIdSet]);

  const saveNow = useCallback(async () => {
    try {
      await persistRequest({ silent: false });
    } catch {}
  }, [persistRequest]);

  const submitReview = useCallback(async () => {
    if (!idToken) return;
    setReviewing(true);
    setError('');
    setNotice('');
    try {
      const row = await persistRequest({ silent: true });
      const eventPayload = buildEventPayload(selectedEvent || {
        id: row?.ritual_event_id,
        date: row?.ritual_event_date,
        label: row?.ritual_event_label,
        hindu_lunar: { label: row?.ritual_hindu_lunar_label },
      });

      const res = await fetch(apiUrl('/api/combined-healings/my-request/review'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(eventPayload),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      applyRequestRow(payload?.data || null, { preserveSelection: false });
      pushToast(payload?.client_notice || 'Review submitted. Wait for admin approval or correction notes.');
    } catch (err) {
      pushToast(err.message || 'Unable to submit this request for review.', 'error');
    } finally {
      setReviewing(false);
    }
  }, [idToken, persistRequest, selectedEvent, applyRequestRow, pushToast]);

  const cancelRequest = useCallback(async () => {
    if (!idToken) return;
    setCancelling(true);
    setCancelConfirmOpen(false);
    try {
      const res = await fetch(apiUrl('/api/combined-healings/my-request/cancel'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      applyRequestRow(null);
      pushToast('Request cancelled. Approved wishes and checkout were cleared.');
    } catch (err) {
      pushToast(err.message || 'Unable to cancel this request right now.', 'error');
    } finally {
      setCancelling(false);
    }
  }, [idToken, applyRequestRow, pushToast]);

  const onSignOut = useCallback(async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth).catch(() => {});
    setAuthUser(null);
    setIdToken('');
    setRequestRow(null);
    setWishes([createEmptyWish()]);
    setSelectedWishIds([]);
    setCheckoutSession(null);
    setCheckoutNotice('');
    setNotice('');
    setError('');
  }, []);

  return (
    <div style={{ background: 'var(--bg)' }}>
      <ToastStack toasts={toasts} />
      <section className="relative overflow-hidden pt-20 pb-14 lg:pt-24 lg:pb-18" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 16% 18%, rgba(224,106,106,0.16), transparent 30%),
              radial-gradient(circle at 82% 16%, rgba(107,160,204,0.18), transparent 34%),
              linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 100%)
            `,
          }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <p className="text-[10px] tracking-[0.42em] uppercase" style={{ color: 'var(--accent-text)' }}>
            Combined Healings
          </p>
          <div className="mt-5 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-end">
            <div>
              <h1 className="hero-display text-5xl lg:text-7xl" style={{ color: 'var(--fg)' }}>
                One ritual date,
                <span style={{ color: 'var(--special-accent)', marginLeft: '0.34ch' }}>many wishes.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-sm lg:text-[15px] leading-relaxed" style={{ color: 'var(--fg2)' }}>
                Build your wish list, submit it for review, then generate a QR that is always tied to the current approved selection and current total. If the total changes, the old QR is cleared and recreated.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[28px] p-5"
              style={{
                border: '1px solid var(--border2)',
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg-elev) 92%, transparent), color-mix(in srgb, var(--bg) 90%, transparent))',
                boxShadow: '0 28px 70px -50px rgba(0,0,0,0.8)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>Price Guide</p>
                  <p className="mt-2 text-lg" style={{ color: 'var(--fg)' }}>Your total updates from the approved wishes you include.</p>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg2)' }}>
                    The QR amount refreshes to match the latest selection.
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full inline-flex items-center justify-center"
                  style={{ background: 'var(--special-bg)', border: '1px solid var(--special-border)' }}
                >
                  <ShieldCheck className="w-5 h-5" style={{ color: 'var(--special-accent)' }} strokeWidth={1.9} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MetricPill label="Per Wish" value={unitLabel} accent="var(--fg)" />
                <MetricPill label="Approved Count" value={selectedApprovedWishIds.length} accent="var(--fg)" />
                <MetricPill label="Pay Total" value={totalLabel} accent="var(--special-accent)" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            <StepCard index={1} title="Draft Wishes" copy="Add the wishes you want included and keep editing until the wording is stable." />
            <StepCard index={2} title="Submit Review" copy="Send the current draft to admin. Wishes move through approval or correction rounds." />
            <StepCard index={3} title="Select Approved Wishes" copy="Only approved wishes can be included in checkout. Selection directly controls the amount." />
            <StepCard index={4} title="Generate Synced QR" copy="The QR is recreated whenever the approved checkout selection changes so payment always matches the live total." />
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
          <SectionCard>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--special-accent)' }}>Ritual Dates</p>
                <h2 className="mt-2 text-2xl" style={{ color: 'var(--fg)' }}>Choose the next sacred date</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--fg2)' }}>Each event includes its Hindu lunar label so the request and checkout stay tied to the same date.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
                <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="text-[10px] tracking-[0.18em] uppercase">Asia/Kolkata</span>
              </div>
            </div>

            {eventsLoading ? (
              <div className="mt-5 inline-flex items-center gap-2" style={{ color: 'var(--fg2)' }}>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
                Loading ritual dates...
              </div>
            ) : eventsError ? (
              <div className="mt-5 rounded-2xl p-4 flex items-start gap-3" style={{ border: '1px solid rgba(224,138,111,0.35)', background: 'rgba(224,138,111,0.08)' }}>
                <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#F2B199' }} strokeWidth={1.9} />
                <p className="text-sm" style={{ color: '#F2B199' }}>{eventsError}</p>
              </div>
            ) : (
              <div className="mt-5 grid lg:grid-cols-5 gap-3">
                {events.map((event) => {
                  const active = selectedEventId === event.id;
                  return (
                    <button
                      key={`${event.id}-${event.date}`}
                      type="button"
                      onClick={() => setSelectedEventId(String(event.id))}
                      className="text-left rounded-2xl p-4"
                      style={{
                        border: active ? '1px solid var(--special-border)' : '1px solid var(--border2)',
                        background: active ? 'var(--special-bg)' : 'var(--bg)',
                      }}
                    >
                      <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: active ? 'var(--special-accent)' : 'var(--fg3)' }}>{event.date}</p>
                      <p className="mt-3 text-base leading-snug" style={{ color: 'var(--fg)' }}>{event.label}</p>
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--fg2)' }}>{event?.hindu_lunar?.label || 'Lunar label unavailable'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {!firebaseConfigured ? (
            <SectionCard>
              <p className="text-sm" style={{ color: 'var(--fg)' }}>Firebase auth is not configured for this page yet.</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--fg2)' }}>Set the frontend Firebase env vars before using Combined Healings.</p>
            </SectionCard>
          ) : !authUser ? (
            <SectionCard>
              <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--special-accent)' }}>Access Required</p>
              <h2 className="mt-2 text-2xl" style={{ color: 'var(--fg)' }}>Sign up or log in to build your request</h2>
              <p className="mt-3 text-sm max-w-2xl" style={{ color: 'var(--fg2)' }}>
                Combined Healings keeps one live request per signed-in client. Your review rounds, approved wishes, and checkout session all attach to that account.
              </p>
              <div className="mt-5 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => nudgeAuth('signup')}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                  style={{ background: 'var(--special-accent)', color: '#fff' }}
                >
                  Sign up
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => nudgeAuth('login')}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                >
                  Log in
                </button>
              </div>
            </SectionCard>
          ) : emailVerificationPending ? (
            <SectionCard>
              <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--special-accent)' }}>Email Verification Needed</p>
              <h2 className="mt-2 text-2xl" style={{ color: 'var(--fg)' }}>Verify {authUser?.email || 'your email'} before continuing</h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--fg2)' }}>
                The request, review cycle, and checkout session stay locked until the email/password account is verified.
              </p>
              <button
                type="button"
                onClick={() => nudgeAuth('login')}
                className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                style={{ border: '1px solid var(--special-border)', color: 'var(--special-accent)' }}
              >
                Go to login
              </button>
            </SectionCard>
          ) : (
            <>
              <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                <SectionCard>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--special-accent)' }}>Wish Ledger</p>
                      <h2 className="mt-2 text-2xl" style={{ color: 'var(--fg)' }}>{authUser.displayName || authUser.email}</h2>
                      <p className="mt-2 text-sm" style={{ color: 'var(--fg2)' }}>
                        Edit text here, then save. Checkout is only enabled when the server-synced draft matches what you see on screen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] tracking-[0.18em] uppercase"
                      style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                    >
                      <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
                      Sign out
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 xl:grid-cols-4 gap-3">
                    <MetricPill label="Request" value={requestStatusMeta.label} accent="var(--fg)" />
                    <MetricPill label="Checkout" value={checkoutStatusMeta.label} accent="var(--fg)" />
                    <MetricPill label="Approved" value={requestRow?.approved_count || 0} />
                    <MetricPill label="Review Rounds" value={requestRow?.review_count || 0} />
                  </div>

                  {requestRow?.client_review_pending && (
                    <div className="mt-5 rounded-2xl p-4" style={{ border: '1px solid rgba(245,208,125,0.34)', background: 'rgba(171,130,51,0.12)' }}>
                      <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: '#F5D07D' }}>Review Pending</p>
                      <p className="mt-2 text-sm" style={{ color: 'var(--fg)' }}>
                        Admin review is pending. You can still save edits, but submitting another review will stay blocked until the current round clears.
                      </p>
                    </div>
                  )}

                  {requestRow?.admin_last_note && !requestRow?.client_review_pending && (
                    <div className="mt-5 rounded-2xl p-4" style={{ border: '1px solid rgba(224,138,111,0.34)', background: 'rgba(224,138,111,0.08)' }}>
                      <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: '#F2B199' }}>Latest Admin Note</p>
                      <p className="mt-2 text-sm" style={{ color: 'var(--fg)' }}>{requestRow.admin_last_note}</p>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    {wishes.map((wish, index) => {
                      const meta = toneForWishStatus(wish.status);
                      const isApproved = String(wish.status || '').toLowerCase() === 'approved';
                      const selectedForCheckout = selectedApprovedWishIds.includes(wish.id);
                      const chars = String(wish.text || '').length;
                      return (
                        <div
                          key={wish.id}
                          className="rounded-[24px] p-4"
                          style={{
                            border: selectedForCheckout ? '1px solid var(--special-border)' : '1px solid var(--border2)',
                            background: selectedForCheckout ? 'var(--special-bg)' : 'var(--bg)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedForCheckout}
                                  disabled={!isApproved || checkoutCompleted}
                                  onChange={() => onToggleCheckoutWish(wish.id)}
                                />
                                <span className="text-[11px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>
                                  Wish {index + 1}
                                </span>
                              </label>
                              <StatusBadge meta={meta} />
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveWish(wish.id)}
                              disabled={checkoutCompleted || wishes.length <= 1}
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] tracking-[0.16em] uppercase disabled:opacity-45"
                              style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                              Remove
                            </button>
                          </div>

                          <textarea
                            rows={4}
                            value={wish.text}
                            disabled={checkoutCompleted}
                            onChange={(event) => onWishTextChange(wish.id, event.target.value)}
                            className="mt-4 w-full bg-transparent border-0 outline-none resize-y text-sm leading-relaxed"
                            style={{
                              color: 'var(--fg)',
                              borderBottom: '1px solid var(--border2)',
                              paddingBottom: '10px',
                            }}
                            placeholder="Describe the wish clearly and specifically."
                          />

                          <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
                            <div className="text-xs" style={{ color: isApproved ? 'var(--fg2)' : 'var(--fg3)' }}>
                              {isApproved ? 'Approved wishes can be toggled into checkout.' : 'Only approved wishes can be included in checkout.'}
                            </div>
                            <div className="text-[11px]" style={{ color: chars > MAX_WISH_LEN ? '#F2B199' : 'var(--fg3)' }}>
                              {chars}/{MAX_WISH_LEN}
                            </div>
                          </div>

                          {wish.admin_note ? (
                            <div className="mt-3 rounded-xl px-3 py-2" style={{ border: '1px solid rgba(224,138,111,0.32)', background: 'rgba(224,138,111,0.08)' }}>
                              <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: '#F2B199' }}>Correction Note</p>
                              <p className="mt-1 text-sm" style={{ color: 'var(--fg)' }}>{wish.admin_note}</p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={onAddWish}
                      disabled={checkoutCompleted || wishes.length >= MAX_WISHES}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] tracking-[0.18em] uppercase disabled:opacity-45"
                      style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
                      Add wish
                    </button>
                    <p className="text-xs" style={{ color: 'var(--fg3)' }}>
                      {selectedApprovedWishIds.length} approved wish{selectedApprovedWishIds.length === 1 ? '' : 'es'} selected for checkout
                    </p>
                  </div>
                </SectionCard>

                <SectionCard className="xl:sticky xl:top-8">
                  <div ref={paymentCardRef}>
                    <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--special-accent)' }}>Checkout Console</p>
                    <h2 className="mt-2 text-2xl" style={{ color: 'var(--fg)' }}>Sync first. Then pay.</h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--fg2)' }}>
                      This panel never trusts stale UI state. If the approved selection changes, the QR is cleared and rebuilt before the panel returns to ready.
                    </p>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCountryProfile('india')}
                        className="rounded-2xl p-3 text-left"
                        style={{
                          border: countryProfile === 'india' ? '1px solid var(--accent)' : '1px solid var(--border2)',
                          background: countryProfile === 'india' ? 'var(--accent-dim)' : 'var(--bg)',
                        }}
                      >
                        <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>India</p>
                        <p className="mt-2 text-sm" style={{ color: 'var(--fg)' }}>{PRICING.combinedHealings.india.label} / wish</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCountryProfile('outside_india')}
                        className="rounded-2xl p-3 text-left"
                        style={{
                          border: countryProfile === 'outside_india' ? '1px solid var(--special-border)' : '1px solid var(--border2)',
                          background: countryProfile === 'outside_india' ? 'var(--special-bg)' : 'var(--bg)',
                        }}
                      >
                        <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>Outside India</p>
                        <p className="mt-2 text-sm" style={{ color: 'var(--fg)' }}>{PRICING.combinedHealings.international.label} / wish</p>
                      </button>
                    </div>

                    {!geoLoading && (
                      <p className="mt-3 text-[11px]" style={{ color: 'var(--fg3)' }}>
                        Auto-country: {countryCode || 'IN'} (manual override allowed)
                      </p>
                    )}

                    <div className="mt-5 rounded-[24px] p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>Selected Ritual</p>
                          <p className="mt-2 text-lg" style={{ color: 'var(--fg)' }}>{selectedEvent?.label || 'Choose an event above'}</p>
                          <p className="mt-1 text-sm" style={{ color: 'var(--fg2)' }}>{selectedEvent?.date || 'No date selected yet'}</p>
                          <p className="mt-1 text-xs" style={{ color: 'var(--fg3)' }}>{selectedEvent?.hindu_lunar?.label || 'Lunar label will appear here'}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <MetricPill label="Approved Selected" value={selectedApprovedWishIds.length} accent="var(--fg)" />
                        <MetricPill label="Unit Price" value={unitLabel} accent="var(--fg)" />
                      </div>

                      <div className="mt-4 rounded-2xl p-4" style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)' }}>
                        <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--special-accent)' }}>Total for QR</p>
                        <p className="mt-2 text-3xl" style={{ color: 'var(--fg)' }}>{totalLabel}</p>
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--fg2)' }}>
                          The QR is considered valid only when it reflects this exact total and this exact approved selection.
                        </p>
                      </div>
                    </div>

                    {countryProfile === 'outside_india' && (
                      <div className="mt-5 rounded-[24px] p-4" style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)' }}>
                        <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--special-accent)' }}>International Rail Notice</p>
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>{OUTSIDE_NOTICE}</p>
                        <div className="mt-4 space-y-2">
                          {checkoutRails.map((rail) => (
                            <div key={rail.id || rail.name} className="rounded-xl px-3 py-2" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                              <p className="text-sm" style={{ color: 'var(--fg)' }}>{rail.name}</p>
                              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--fg2)' }}>{rail.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={saveNow}
                        disabled={!canSave}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] tracking-[0.2em] uppercase disabled:opacity-45"
                        style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} /> : <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={submitReview}
                        disabled={!canSubmitReview}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] tracking-[0.2em] uppercase disabled:opacity-45"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} /> : <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => syncCheckoutSession({ reason: 'manual' })}
                        disabled={!canGenerateCheckout}
                        className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] tracking-[0.22em] uppercase disabled:opacity-45"
                        style={{
                          border: canGenerateCheckout ? '1px solid var(--special-border)' : '1px solid var(--border2)',
                          color: canGenerateCheckout ? 'var(--special-accent)' : 'var(--fg3)',
                        }}
                      >
                        {checkoutSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} /> : <WalletCards className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        {checkoutSessionMatches && checkoutSessionReady && !checkoutCompleted ? 'Regenerate QR' : 'Generate Checkout QR'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelConfirmOpen(true)}
                        disabled={checkoutCompleted || cancelling}
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] tracking-[0.2em] uppercase disabled:opacity-45"
                        style={{ border: '1px solid rgba(224,138,111,0.35)', color: '#F2B199' }}
                      >
                        {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Cancel Request
                      </button>
                    </div>

                    {checkoutBlockedReason && (
                      <div className="mt-4 rounded-2xl p-4 flex items-start gap-3" style={{ border: '1px solid rgba(245,208,125,0.34)', background: 'rgba(171,130,51,0.12)' }}>
                        <Clock3 className="w-4 h-4 mt-0.5" style={{ color: '#F5D07D' }} strokeWidth={1.9} />
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>{checkoutBlockedReason}</p>
                      </div>
                    )}

                    <div className="mt-5 rounded-[28px] p-5" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>QR Status</p>
                          <p className="mt-2 text-lg" style={{ color: 'var(--fg)' }}>
                            {checkoutCompleted
                              ? 'Payment confirmed'
                              : checkoutSyncing
                                ? 'Syncing checkout session'
                                : checkoutSessionReady
                                  ? 'QR ready'
                                  : 'No active QR'}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-5 rounded-[24px] p-3 sm:p-4 flex items-center justify-center min-h-[240px] sm:min-h-[320px]"
                        style={{
                          border: '1px solid var(--border2)',
                          background: checkoutSessionReady ? 'var(--bg-elev)' : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {checkoutSyncing ? (
                          <div className="text-center" style={{ color: 'var(--fg2)' }}>
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" strokeWidth={1.8} />
                            <p className="mt-3 text-sm">Clearing stale QR and creating a fresh one...</p>
                          </div>
                        ) : checkoutSessionReady ? (
                          <div
                            className="w-full max-w-[320px] rounded-[22px] p-3 sm:p-4"
                            style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}
                          >
                            <img
                              src={checkoutQrDisplaySrc || checkoutSession.qr_src}
                              alt="Combined Healings checkout QR"
                              className="block w-full h-auto max-w-[280px] mx-auto aspect-square object-contain"
                            />
                          </div>
                        ) : (
                          <div className="text-center max-w-xs" style={{ color: 'var(--fg2)' }}>
                            <WalletCards className="w-7 h-7 mx-auto" strokeWidth={1.7} />
                            <p className="mt-3 text-sm">
                              Generate checkout after the request is saved and at least one approved wish is selected.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <MetricPill label="Session Wishes" value={checkoutSession?.wish_count || 0} accent="var(--fg)" />
                        <MetricPill label="Session Amount" value={checkoutSession?.amount ? formatMoney(checkoutSession.amount, checkoutSession.country_profile) : 'Not ready'} accent="var(--fg)" />
                      </div>

                      <div className="mt-4 space-y-3">
                        {checkoutSession?.upi_intent && !checkoutCompleted && (
                          <a
                            href={checkoutSession.upi_intent}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                            style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                            Open UPI App
                          </a>
                        )}

                        {checkoutNotice && (
                          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ border: '1px solid var(--border2)', background: 'rgba(255,255,255,0.02)' }}>
                            {checkoutCompleted ? (
                              <CheckCircle2 className="w-4 h-4 mt-0.5" style={{ color: '#7DE5B1' }} strokeWidth={1.9} />
                            ) : (
                              <Clock3 className="w-4 h-4 mt-0.5" style={{ color: 'var(--accent-text)' }} strokeWidth={1.9} />
                            )}
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>{checkoutNotice}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {loadingRequest && (
                <div className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--fg2)' }}>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
                  Syncing latest request state...
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {cancelConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-4"
            style={{ background: 'rgba(5, 8, 14, 0.72)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-[28px] p-5 sm:p-6"
              style={{ border: '1px solid rgba(224,138,111,0.34)', background: 'var(--bg-elev)' }}
            >
              <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: '#F2B199' }}>Danger Move</p>
              <h3 className="mt-2 text-2xl" style={{ color: 'var(--fg)' }}>Cancel this request?</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--fg2)' }}>
                This clears your current request, approved wishes, and active checkout session.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCancelConfirmOpen(false)}
                  className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[11px] tracking-[0.2em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  onClick={cancelRequest}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] tracking-[0.2em] uppercase disabled:opacity-55"
                  style={{ border: '1px solid rgba(224,138,111,0.35)', color: '#F2B199', background: 'rgba(224,138,111,0.1)' }}
                >
                  {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />}
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
