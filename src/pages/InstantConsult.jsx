import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Maximize2,
  Mic,
  Send,
  WalletCards,
  X,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import Footer from '@/components/wellness/Footer';
import { apiUrl, createPageUrl } from '@/utils';
import { firebaseAuth, firebaseConfigured, firebaseGoogleProvider } from '@/lib/firebaseClient';

const WAIT_NOTICE = 'Please wait for our reply (this may take up to 24 hours).';
const INSTANT_FEE_LABEL = '₹1,500';
const INSTANT_FEE_AMOUNT = 1500;
const PAYMENT_QR_SRC = apiUrl('/api/payments/upi-qr/instant-consult');
const DEFAULT_PAYMENT_CAPABILITIES = {
  provider: 'paytm',
  automation_enabled: false,
  manual_claim_enabled: false,
  international_enabled: false,
  international_rails: [
    { id: 'wise', name: 'Wise', detail: 'Best for direct bank transfer into India.' },
    { id: 'remitly', name: 'Remitly', detail: 'Fast INR settlement to India account rails.' },
    { id: 'western-union', name: 'Western Union', detail: 'Global transfer rails with India payout support.' },
  ],
  international_notice: 'International checkout is currently disabled for Instant Consult.',
  session_ttl_minutes: 30,
  fee_inr: INSTANT_FEE_AMOUNT,
};

const REQUESTED_CONSULT_TYPES = [
  {
    id: 'grabovoi-codes',
    legacyTypeId: 'career-abundance',
    label: 'Grabovoi Codes',
    description: 'Numeric sequence guidance for healing intentions, restoration targets, and manifestation alignment.',
    accent: '#3E63AE',
    images: [
      {
        place: 'Sequence Grid Journal',
        src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=85',
      },
      {
        place: 'Focused Number Meditation',
        src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=85',
      },
    ],
  },
  {
    id: 'zibu',
    legacyTypeId: 'healing-messages',
    label: 'Zibu Chat',
    description: 'Real-time Zibu chat for immediate guidance, messages, and intuitive updates.',
    accent: '#00C2FF',
    images: [
      {
        place: 'Live Chat Panel',
        src: 'https://images.unsplash.com/photo-1516280440614-6697286d5d10?w=1200&q=85',
      },
      {
        place: 'Message Flow',
        src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=85',
      },
    ],
  },
  {
    id: 'sigil-witchcraft',
    legacyTypeId: 'spiritual-direction',
    label: 'Sigil Witchcraft',
    description: 'Personal sigil design, charging rituals, and symbolic intention work for precise outcomes.',
    accent: '#8A3A6D',
    images: [
      {
        place: 'Sigil Ritual Desk',
        src: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=1200&q=85',
      },
      {
        place: 'Candle Charge Window',
        src: 'https://images.unsplash.com/photo-1514516816566-de580c8f76b9?w=1200&q=85',
      },
    ],
  },
  {
    id: 'angel-cards',
    legacyTypeId: 'relationship-clarity',
    label: 'Angel Cards',
    description: 'Angel card spreads for reassurance, heart-led direction, and immediate intuitive clarity.',
    accent: '#B67A2A',
    images: [
      {
        place: 'Card Pull Session',
        src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=85',
      },
      {
        place: 'Guidance and Light',
        src: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=1200&q=85',
      },
    ],
  },
  {
    id: 'dowsing',
    legacyTypeId: 'health-energy',
    label: 'Dowsing',
    description: 'Pendulum and chart-based dowsing for energetic diagnostics, yes-no clarity, and alignment checks.',
    accent: '#1B7B70',
    images: [
      {
        place: 'Pendulum Inquiry',
        src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=85',
      },
      {
        place: 'Subtle Energy Scan',
        src: 'https://images.unsplash.com/photo-1591348122449-02525d70379b?w=1200&q=85',
      },
    ],
  },
  {
    id: 'runes',
    legacyTypeId: 'spiritual-direction',
    label: 'Runes',
    description: 'Rune casting and interpretation for decision timing, energetic protection, and spiritual mapping.',
    accent: '#5D713F',
    images: [
      {
        place: 'Rune Cast Layout',
        src: 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=1200&q=85',
      },
      {
        place: 'Symbolic Guidance Path',
        src: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&q=85',
      },
    ],
  },
  {
    id: 'switchwords',
    legacyTypeId: 'career-abundance',
    label: 'Switchwords',
    description: 'Targeted switchword combinations for quick subconscious shifts and repeated intention activation.',
    accent: '#B3543C',
    images: [
      {
        place: 'Switchword Journal',
        src: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=85',
      },
      {
        place: 'Affirmation Practice Flow',
        src: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=85',
      },
    ],
  },
];

const CONSULT_SELECTION_TABS = [
  { id: 'manual', label: 'Let me select' },
  { id: 'auto', label: 'Auto' },
];

const AUTO_CONSULT_THREAD = {
  id: 'recommended-best-practice',
  heading: 'Get Instant Consultation with our Recommended best practice',
  accent: '#C6873A',
};

function statusPill(status) {
  const normalized = String(status || 'new').toLowerCase();
  if (normalized === 'done') {
    return {
      label: 'Done',
      style: {
        background: 'var(--status-done-bg)',
        color: 'var(--status-done-fg)',
        border: '1px solid var(--status-done-border)',
      },
    };
  }
  if (normalized === 'inprogress' || normalized === 'pending') {
    return {
      label: 'Pending',
      style: { background: 'rgba(168, 126, 47, 0.18)', color: '#F4D08F', border: '1px solid rgba(244, 208, 143, 0.34)' },
    };
  }
  return {
    label: 'New',
    style: { background: 'rgba(75, 121, 184, 0.18)', color: '#A6CBF5', border: '1px solid rgba(166, 203, 245, 0.34)' },
  };
}

function formatTs(value) {
  if (!value) return 'Just now';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Just now';
  return d.toLocaleString();
}

function isUnverifiedPasswordUser(user) {
  if (!user) return false;
  const providers = Array.isArray(user.providerData) ? user.providerData : [];
  const usesPasswordSignIn = providers.some((item) => item?.providerId === 'password');
  return usesPasswordSignIn && !user.emailVerified;
}

function buildVerificationActionSettings() {
  if (typeof window === 'undefined') return undefined;
  return {
    url: `${window.location.origin}/auth?mode=login`,
    handleCodeInApp: false,
  };
}

function resolveApiMediaSrc(pathOrUrl, fallback) {
  if (!pathOrUrl) return fallback;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return apiUrl(pathOrUrl);
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

function humanizeAuthError(err, fallback) {
  const code = String(err?.code || '').toLowerCase();
  const message = String(err?.message || '');

  if (code.includes('operation-not-allowed') || message.includes('OPERATION_NOT_ALLOWED')) {
    return 'Email/Password sign-in is disabled in Firebase. Enable it in Firebase Auth > Sign-in method.';
  }
  if (code.includes('invalid-api-key') || code.includes('api-key-not-valid')) {
    return 'Firebase API key is invalid for this project. Re-check VITE_FIREBASE_API_KEY.';
  }
  if (code.includes('auth-domain-config-required') || message.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Firebase project config is incomplete. Verify VITE_FIREBASE_* values from the same Firebase web app.';
  }
  if (code.includes('email-already-in-use')) {
    return 'This email is already registered. Please switch to Login.';
  }
  if (code.includes('weak-password')) {
    return 'Password is too weak. Use at least 6 characters.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('unauthorized-continue-uri') || code.includes('invalid-continue-uri')) {
    return 'Verification link domain is not authorized in Firebase Auth settings. Add your site domain to Authorized domains.';
  }
  if (
    code.includes('invalid-credential')
    || code.includes('wrong-password')
    || code.includes('user-not-found')
    || message.includes('INVALID_LOGIN_CREDENTIALS')
  ) {
    return 'Invalid email or password. If this is a new account, switch to Sign up first.';
  }
  if (code.includes('user-disabled')) {
    return 'This account is disabled. Please contact support.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many attempts. Please wait a bit and try again.';
  }
  if (code.includes('popup-closed-by-user')) {
    return 'Google sign-in popup was closed before completion.';
  }

  return message || fallback;
}

export default function InstantConsult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentCardRef = useRef(null);

  const [types, setTypes] = useState(REQUESTED_CONSULT_TYPES);
  const [selectedTypeId, setSelectedTypeId] = useState(REQUESTED_CONSULT_TYPES[0]?.id || '');
  const [consultSelectionTab, setConsultSelectionTab] = useState('manual');
  const loadMessagesRequestRef = useRef(0);

  const [authUser, setAuthUser] = useState(null);
  const [idToken, setIdToken] = useState('');
  const [authMode, setAuthMode] = useState('signup');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [paymentSessionId, setPaymentSessionId] = useState('');
  const [paymentSessionStatus, setPaymentSessionStatus] = useState('');
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);
  const [paymentStarting, setPaymentStarting] = useState(false);
  const [paymentCapabilities, setPaymentCapabilities] = useState(DEFAULT_PAYMENT_CAPABILITIES);
  const [paymentCapabilitiesLoaded, setPaymentCapabilitiesLoaded] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');
  const [paymentQrSrc, setPaymentQrSrc] = useState(PAYMENT_QR_SRC);
  const [paymentUpiIntent, setPaymentUpiIntent] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [countryProfile, setCountryProfile] = useState('india');
  const [countryCode, setCountryCode] = useState('IN');
  const [geoLoaded, setGeoLoaded] = useState(false);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [sendNotice, setSendNotice] = useState('');
  const [sendError, setSendError] = useState('');

  const emailVerificationPending = useMemo(() => isUnverifiedPasswordUser(authUser), [authUser]);
  const internationalEnabled = !!paymentCapabilities?.international_enabled;
  const paymentMode = useMemo(() => {
    if (countryProfile === 'outside_india' && !internationalEnabled) return 'international_blocked';
    if (!paymentCapabilities?.automation_enabled) return 'blocked';
    return 'auto';
  }, [paymentCapabilities, countryProfile, internationalEnabled]);

  const selectedType = useMemo(
    () => types.find((type) => type.id === selectedTypeId) || types[0] || null,
    [types, selectedTypeId],
  );
  const isAutoConsult = consultSelectionTab === 'auto';
  const showConsultTypePicker = consultSelectionTab === 'manual';
  const activeThreadTypeId = isAutoConsult ? AUTO_CONSULT_THREAD.id : (selectedType?.id || '');

  const requestedMode = useMemo(
    () => String(searchParams.get('mode') || '').trim().toLowerCase(),
    [searchParams],
  );
  const instantConsultHref = createPageUrl('Instant Consult');

  const consultAccent = isAutoConsult ? AUTO_CONSULT_THREAD.accent : (selectedType?.accent || '#3E63AE');
  const chatHeading = isAutoConsult
    ? AUTO_CONSULT_THREAD.heading
    : (selectedType?.label || 'Select a consult type');
  const paymentTargetLabel = isAutoConsult
    ? 'Recommended Best Practice'
    : (selectedType?.label || 'Selected consult');

  const bringPaymentIntoView = useCallback(() => {
    const target = paymentCardRef.current;
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      const focusNode = target.querySelector('input, textarea') || target.querySelector('button');
      if (focusNode && typeof focusNode.focus === 'function') {
        focusNode.focus({ preventScroll: true });
      }
    }, 220);
  }, []);

  const nudgeSignup = useCallback((mode = 'signup') => {
    const normalizedMode = mode === 'login' ? 'login' : 'signup';
    navigate(`/auth?mode=${normalizedMode}&next=${encodeURIComponent(instantConsultHref)}`);
  }, [navigate, instantConsultHref]);

  const nudgePayment = useCallback(() => {
    bringPaymentIntoView();
  }, [bringPaymentIntoView]);

  useEffect(() => {
    if (authUser) return;
    if (requestedMode !== 'signup' && requestedMode !== 'login') return;
    navigate(`/auth?mode=${requestedMode}&next=${encodeURIComponent(instantConsultHref)}`, { replace: true });
  }, [requestedMode, authUser, navigate, instantConsultHref]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/consult/types'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseApiError(res));
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const remote = Array.isArray(payload?.data) ? payload.data : [];
        if (!remote.length) return;
        const byId = new Map(REQUESTED_CONSULT_TYPES.map((item) => [item.id, item]));
        const merged = remote
          .map((item) => {
            const id = String(item?.id || '').trim();
            if (!id || !byId.has(id)) return null;
            const local = byId.get(id);
            return {
              id,
              label: String(item?.label || local?.label || id),
              description: String(item?.description || local?.description || ''),
              accent: String(item?.accent || local?.accent || '#3E63AE'),
              images: Array.isArray(item?.images) && item.images.length
                ? item.images
                : (Array.isArray(local?.images) ? local.images : []),
            };
          })
          .filter(Boolean);
        if (!merged.length) return;
        setTypes(merged);
        setSelectedTypeId((prev) => (merged.some((item) => item.id === prev) ? prev : merged[0].id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/geo/country'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseApiError(res));
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const profile = String(payload?.country_profile || '').trim().toLowerCase();
        const code = String(payload?.country_code || '').trim().toUpperCase();
        setCountryProfile(profile === 'outside_india' ? 'outside_india' : 'india');
        if (code) setCountryCode(code);
      })
      .catch(() => {
        if (cancelled) return;
        setCountryProfile('india');
        setCountryCode('IN');
      })
      .finally(() => {
        if (!cancelled) setGeoLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setAuthUser(user);
      if (user) {
        if (isUnverifiedPasswordUser(user)) {
          setIdToken('');
          setMessages([]);
          setPaymentUnlocked(false);
          setPaymentSessionId('');
          setPaymentSessionStatus('');
          setPaymentNotice('');
          setPaymentQrSrc(PAYMENT_QR_SRC);
          setPaymentUpiIntent('');
          setPaymentCapabilitiesLoaded(false);
          setAuthMode('login');
          setAuthError('Please verify your email before using Instant Consult.');
          setAuthNotice((prev) => prev || `Check your inbox/spam for the verification link sent to ${user.email || 'your email'}.`);
          setSendNotice('');
          return;
        }

        const token = await getIdToken(user, true);
        setIdToken(token);
      } else {
        setIdToken('');
        setAuthNotice('');
        setPaymentCapabilities(DEFAULT_PAYMENT_CAPABILITIES);
        setPaymentCapabilitiesLoaded(false);
      }
    });
    return () => unsub();
  }, []);

  const loadMessages = useCallback(async (tokenOverride, { quiet = false, typeId } = {}) => {
    const token = tokenOverride || idToken;
    const scopedTypeId = String(typeId || activeThreadTypeId || '').trim();
    if (!token || emailVerificationPending) {
      setMessages([]);
      return;
    }
    const requestId = loadMessagesRequestRef.current + 1;
    loadMessagesRequestRef.current = requestId;
    if (!quiet) {
      setLoadingMessages(true);
      setMessages([]);
    }
    try {
      const qs = new URLSearchParams({ limit: '60' });
      if (scopedTypeId) qs.set('type_id', scopedTypeId);
      const res = await fetch(apiUrl(`/api/consult/my-messages?${qs.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const apiError = await parseApiError(res);
        if (res.status === 403 && /verify your email/i.test(apiError)) {
          setMessages([]);
          setIdToken('');
          setPaymentUnlocked(false);
          setPaymentSessionId('');
          setPaymentSessionStatus('');
          setPaymentNotice('');
          setPaymentQrSrc(PAYMENT_QR_SRC);
          setPaymentUpiIntent('');
          setPaymentCapabilitiesLoaded(false);
          setAuthMode('login');
          setAuthError(apiError);
          setAuthNotice('Check your inbox/spam, verify your email, then log in again.');
          setSendNotice('');
          await signOut(firebaseAuth).catch(() => {});
          return;
        }
        throw new Error(apiError);
      }
      const payload = await res.json();
      if (requestId !== loadMessagesRequestRef.current) return;
      setMessages(payload?.data || []);
    } catch (err) {
      if (requestId !== loadMessagesRequestRef.current) return;
      if (!quiet) setSendError(err.message || 'Failed to load your consult history.');
    } finally {
      if (!quiet && requestId === loadMessagesRequestRef.current) {
        setLoadingMessages(false);
      }
    }
  }, [idToken, emailVerificationPending, activeThreadTypeId]);

  const loadPaymentCapabilities = useCallback(async (tokenOverride) => {
    const token = tokenOverride || idToken;
    if (!token) {
      setPaymentCapabilities(DEFAULT_PAYMENT_CAPABILITIES);
      setPaymentCapabilitiesLoaded(false);
      return;
    }
    setPaymentCapabilitiesLoaded(false);
    try {
      const res = await fetch(apiUrl('/api/consult/payments/capabilities'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      setPaymentCapabilities({ ...DEFAULT_PAYMENT_CAPABILITIES, ...(payload || {}) });
    } catch {
      setPaymentCapabilities(DEFAULT_PAYMENT_CAPABILITIES);
    } finally {
      setPaymentCapabilitiesLoaded(true);
    }
  }, [idToken]);

  useEffect(() => {
    if (!idToken || emailVerificationPending) {
      setMessages([]);
      return;
    }
    loadMessages(idToken, { typeId: activeThreadTypeId });
  }, [idToken, emailVerificationPending, activeThreadTypeId, loadMessages]);

  useEffect(() => {
    if (!idToken || emailVerificationPending) {
      setPaymentCapabilities(DEFAULT_PAYMENT_CAPABILITIES);
      setPaymentCapabilitiesLoaded(false);
      return;
    }
    loadPaymentCapabilities(idToken);
  }, [idToken, emailVerificationPending, loadPaymentCapabilities]);

  useEffect(() => {
    if (!idToken || emailVerificationPending) return undefined;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMessages(idToken, { quiet: true, typeId: activeThreadTypeId });
    }, 9000);
    return () => clearInterval(timer);
  }, [idToken, emailVerificationPending, activeThreadTypeId, loadMessages]);

  const onGoogleAuth = async () => {
    if (!firebaseConfigured || !firebaseAuth || !firebaseGoogleProvider) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const cred = await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
      const token = await getIdToken(cred.user, true);
      setIdToken(token);
      setAuthUser(cred.user);
      await loadMessages(token, { typeId: activeThreadTypeId });
      setSendNotice('Sign-in successful. Complete payment to unlock one message automatically.');
    } catch (err) {
      setAuthError(humanizeAuthError(err, 'Google sign-in failed.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const onEmailAuth = async (event) => {
    event.preventDefault();
    if (!firebaseConfigured || !firebaseAuth) return;
    const email = authForm.email.trim().toLowerCase();
    const actionSettings = buildVerificationActionSettings();

    setAuthLoading(true);
    setAuthError('');
    setAuthNotice('');
    try {
      let userCred;
      if (authMode === 'signup') {
        userCred = await createUserWithEmailAndPassword(firebaseAuth, email, authForm.password);
        if (authForm.name.trim()) {
          await updateProfile(userCred.user, { displayName: authForm.name.trim() });
        }

        let verificationSent = false;
        let verificationError = '';
        try {
          await sendEmailVerification(userCred.user, actionSettings);
          verificationSent = true;
        } catch (verificationErr) {
          verificationError = humanizeAuthError(verificationErr, 'Could not send verification email right now.');
        } finally {
          await signOut(firebaseAuth).catch(() => {});
        }

        setAuthUser(null);
        setIdToken('');
        setMessages([]);
        setAuthMode('login');
        setAuthForm((prev) => ({ ...prev, password: '' }));
        if (verificationSent) {
          setAuthNotice(`Verification link sent to ${email}. Verify your email, then log in.`);
          setSendNotice('Account created. Please verify your email from the inbox link before login.');
        } else {
          setAuthError('Account created, but verification email could not be sent automatically.');
          setAuthNotice(`${verificationError} Check Firebase Auth email template/domain settings, then try Login again.`);
          setSendNotice('');
        }
        return;
      } else {
        userCred = await signInWithEmailAndPassword(firebaseAuth, email, authForm.password);
        if (!userCred.user.emailVerified) {
          let resent = false;
          let resendError = '';
          try {
            await sendEmailVerification(userCred.user, actionSettings);
            resent = true;
          } catch (resendErr) {
            resendError = humanizeAuthError(resendErr, 'Could not resend verification email right now.');
          }
          await signOut(firebaseAuth);
          setAuthUser(null);
          setIdToken('');
          setMessages([]);
          setAuthError('Please verify your email before login.');
          setAuthNotice(
            resent
              ? `A fresh verification link was sent to ${email}.`
              : `${resendError} Check inbox/spam for an earlier verification email, then log in again.`,
          );
          return;
        }
      }

      const token = await getIdToken(userCred.user, true);
      setIdToken(token);
      setAuthUser(userCred.user);
      await loadMessages(token, { typeId: activeThreadTypeId });
      setAuthNotice('');
      setSendNotice('Account ready. Complete payment to unlock one message automatically.');
    } catch (err) {
      setAuthError(humanizeAuthError(err, 'Authentication failed.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!firebaseConfigured || !firebaseAuth || authMode !== 'login') return;
    if (resendLoading || resendCooldown > 0) return;

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;
    const actionSettings = buildVerificationActionSettings();
    if (!email || !password) {
      setAuthError('Enter the same email and password, then resend verification.');
      return;
    }

    setResendLoading(true);
    setAuthError('');
    setAuthNotice('');

    let tempSignedIn = false;
    try {
      const userCred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      tempSignedIn = true;

      if (userCred.user.emailVerified) {
        setAuthNotice('This email is already verified. You can log in now.');
        return;
      }

      await sendEmailVerification(userCred.user, actionSettings);
      setResendCooldown(60);
      setAuthNotice(`Verification link sent to ${email}. Check inbox/spam and verify before login.`);
    } catch (err) {
      setAuthError(humanizeAuthError(err, 'Could not resend verification email right now.'));
    } finally {
      if (tempSignedIn) {
        await signOut(firebaseAuth).catch(() => {});
      }
      setAuthUser(null);
      setIdToken('');
      setMessages([]);
      setResendLoading(false);
    }
  };

  const onSignOut = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    setAuthUser(null);
    setIdToken('');
    setMessages([]);
    setPaymentUnlocked(false);
    setPaymentSessionId('');
    setPaymentSessionStatus('');
    setPaymentNotice('');
    setPaymentQrSrc(PAYMENT_QR_SRC);
    setPaymentUpiIntent('');
    setPaymentCapabilities(DEFAULT_PAYMENT_CAPABILITIES);
    setPaymentCapabilitiesLoaded(false);
    setQrModalOpen(false);
    setAuthNotice('');
    setResendCooldown(0);
    setResendLoading(false);
    setSendNotice('');
  };

  const startAutomaticPayment = async () => {
    if (!idToken || paymentStarting || paymentMode === 'blocked' || paymentMode === 'international_blocked') return;

    setPaymentStarting(true);
    setPaymentUnlocked(false);
    setPaymentSessionId('');
    setPaymentSessionStatus('');
    setPaymentNotice('');
    setSendError('');

    try {
      const res = await fetch(apiUrl('/api/consult/payments/session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          payment_amount: INSTANT_FEE_AMOUNT,
          country_profile: countryProfile,
          country_code: countryCode,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const session = payload?.data || {};
      const modeAuto = !!payload?.automation_enabled;

      setPaymentCapabilities((prev) => ({
        ...prev,
        automation_enabled: modeAuto,
        manual_claim_enabled: false,
      }));
      setPaymentSessionId(session?.id || '');
      setPaymentSessionStatus(session?.status || 'awaiting_payment');
      setPaymentUnlocked(session?.status === 'paid');
      setPaymentQrSrc(resolveApiMediaSrc(session?.qr_src, PAYMENT_QR_SRC));
      setPaymentUpiIntent(session?.upi_intent || '');

      if (session?.status === 'paid') {
        setPaymentNotice('Payment already confirmed. You can send one message now.');
      } else if (modeAuto) {
        setPaymentNotice(payload?.client_notice || 'Payment session started. Complete the payment — unlock happens automatically.');
      } else {
        setPaymentNotice('Automatic confirmation is not configured yet. Please contact support to complete payment setup.');
      }
    } catch (err) {
      setPaymentNotice(err.message || 'Could not start payment session.');
    } finally {
      setPaymentStarting(false);
    }
  };

  const refreshPaymentSession = useCallback(async (sessionId, tokenOverride) => {
    const token = tokenOverride || idToken;
    if (!sessionId || !token) return;

    try {
      const res = await fetch(apiUrl(`/api/consult/payments/session/${encodeURIComponent(sessionId)}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const session = payload?.data || {};
      const status = session?.status || 'awaiting_payment';

      setPaymentSessionStatus(status);
      if (session?.qr_src) {
        setPaymentQrSrc(resolveApiMediaSrc(session.qr_src, PAYMENT_QR_SRC));
      }
      if (session?.upi_intent) {
        setPaymentUpiIntent(session.upi_intent);
      }

      if (status === 'paid') {
        setPaymentUnlocked(true);
        setPaymentNotice('Payment confirmed automatically. You can now send one message.');
      } else if (status === 'consumed') {
        setPaymentUnlocked(false);
      } else if (status === 'failed' || status === 'expired') {
        setPaymentUnlocked(false);
        setPaymentSessionId('');
        setPaymentNotice(status === 'expired' ? 'Payment session expired. Start a fresh payment.' : 'Payment failed. Start a fresh payment session.');
      }
    } catch (err) {
      setPaymentNotice(err.message || 'Could not refresh payment status.');
    }
  }, [idToken]);

  useEffect(() => {
    if (!paymentSessionId || !idToken || paymentMode !== 'auto' || paymentUnlocked) return undefined;

    refreshPaymentSession(paymentSessionId, idToken);
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      refreshPaymentSession(paymentSessionId, idToken);
    }, 5000);
    return () => clearInterval(timer);
  }, [paymentSessionId, idToken, paymentMode, paymentUnlocked, refreshPaymentSession]);

  const startVoiceCapture = () => {
    if (listening) return;
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SpeechRecognition) {
      setSendError('Voice input is not supported in this browser.');
      return;
    }

    setSendError('');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) finalChunk += `${transcript} `;
      }
      if (finalChunk.trim()) {
        setDraft((prev) => [prev.trim(), finalChunk.trim()].filter(Boolean).join(' ').trim());
      }
    };
    recognition.onerror = () => {
      setSendError('Could not capture voice input. Please try again or type manually.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const submitMessage = async (event) => {
    event.preventDefault();
    if (!idToken || !activeThreadTypeId || sending) return;

    const question = draft.trim();
    if (question.length < 8) {
      setSendError('Please enter a clearer question (minimum 8 characters).');
      return;
    }
    if (!paymentUnlocked) {
      setSendError('Complete payment confirmation before sending your message.');
      return;
    }
    if (paymentMode === 'auto' && !paymentSessionId) {
      setSendError('Payment session missing. Start a new payment session.');
      return;
    }
    if (paymentMode === 'international_blocked') {
      setSendError(paymentCapabilities?.international_notice || 'International checkout is currently disabled.');
      return;
    }
    if (paymentMode === 'blocked') {
      setSendError('Automatic payment is not configured yet. Please contact support.');
      return;
    }

    setSending(true);
    setSendError('');
    setSendNotice('');

    const resolvedTypeId = activeThreadTypeId;

    try {
      const res = await fetch(apiUrl('/api/consult/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          type_id: resolvedTypeId,
          question,
          payment_session_id: paymentSessionId || undefined,
          payment_amount: INSTANT_FEE_AMOUNT,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();

      setDraft('');
      setPaymentUnlocked(false);
      setPaymentSessionId('');
      setPaymentSessionStatus('');
      setPaymentQrSrc(PAYMENT_QR_SRC);
      setPaymentUpiIntent('');
      setPaymentNotice('A fresh confirmed payment is required for the next message.');
      setSendNotice(payload.client_notice || WAIT_NOTICE);
      await loadMessages(undefined, { typeId: activeThreadTypeId });
    } catch (err) {
      setSendError(err.message || 'Failed to send your consult message.');
    } finally {
      setSending(false);
    }
  };

  const hasMessageHistory = messages.length > 0;
  const chatSendLocked = !authUser || emailVerificationPending || !paymentUnlocked;
  const chatOverlayLocked = chatSendLocked && !hasMessageHistory;
  const lockPromptAction = !authUser
    ? () => nudgeSignup('signup')
    : emailVerificationPending
      ? () => nudgeSignup('login')
      : nudgePayment;
  const lockPromptLabel = !authUser ? 'Signup Required' : emailVerificationPending ? 'Verify Email' : 'Payment Required';
  const lockPromptHint = !authUser ? 'Tap to start signup' : emailVerificationPending ? 'Verify email to continue' : 'Tap to complete payment';
  const composerLockTooltip = !authUser
    ? 'Sign up to continue this service.'
    : emailVerificationPending
      ? 'Verify your email to continue this service.'
      : 'Payment required to continue service.';

  return (
    <div style={{ background: 'var(--bg)' }}>
      <section className="relative overflow-hidden py-16 lg:py-20" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 82% 20%, rgba(224,106,106,0.16), transparent 52%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <p className="text-[10px] tracking-[0.42em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>
            Instant Consult
          </p>
          <h1 className="hero-display text-5xl lg:text-7xl" style={{ color: 'var(--fg)' }}>
            Ask now,
            <span style={{ color: consultAccent, marginLeft: '0.35ch' }}>receive depth.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-sm lg:text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            This is a dedicated paid consult channel (separate from quick chat). Every message is reviewed personally and answered with clear text plus curated supporting images.
          </p>
          {!authUser && (
            <div className="mt-6">
              <button
                type="button"
                onClick={nudgeSignup}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase"
                style={{ background: 'var(--special-accent)', color: '#fff' }}
              >
                Sign up to unlock chat
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.9} />
              </button>
            </div>
          )}
          <div
            className="mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: 'var(--special-bg)', border: '1px solid var(--special-border)', color: 'var(--special-accent)' }}
          >
            <ImagePlus className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="text-[10px] tracking-[0.2em] uppercase">Responses include text + relevant pictures</span>
          </div>
        </div>
      </section>

      <section className="pt-6 pb-20 lg:pt-8 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6 lg:space-y-7">
          <div className="space-y-4 max-w-3xl mx-auto">
            {!firebaseConfigured ? (
              <div className="rounded-2xl p-5" style={{ border: '1px solid rgba(224,106,106,0.4)', background: 'rgba(224,106,106,0.08)' }}>
                <p className="text-sm" style={{ color: 'var(--fg)' }}>Instant Consult auth is not configured yet.</p>
                <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>
                  Set Firebase frontend env vars to enable email and Google sign-in.
                </p>
              </div>
            ) : !authUser ? (
              <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Onboarding</p>
                <h3 className="text-2xl mt-2" style={{ color: 'var(--fg)' }}>Sign up or login to unlock Instant Consult</h3>
                <p className="mt-2 text-xs" style={{ color: 'var(--fg2)' }}>
                  Authentication now lives on a dedicated page for a cleaner consult experience.
                </p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => nudgeSignup('signup')}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => nudgeSignup('login')}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                    style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                  >
                    Login
                  </button>
                </div>
              </div>
            ) : emailVerificationPending ? (
              <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)' }}>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Email verification required</p>
                <h3 className="text-xl mt-2" style={{ color: 'var(--fg)' }}>Verify {authUser?.email || 'your email'} first</h3>
                <p className="mt-2 text-xs" style={{ color: 'var(--fg2)' }}>
                  Open the verification link from your inbox/spam, then log in from the auth page.
                </p>
                <button
                  type="button"
                  onClick={() => nudgeSignup('login')}
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                  style={{ border: '1px solid var(--special-border)', color: 'var(--special-accent)', background: 'var(--bg)' }}
                >
                  Go to login
                </button>
              </div>
            ) : (
              <div ref={paymentCardRef} className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Selected Chat Payment</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl" style={{ color: 'var(--fg)' }}>Pay for {paymentTargetLabel}</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>This QR unlocks one message for the currently selected consult.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1.5 rounded"
                    style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                  >
                    <LogOut className="w-3 h-3" strokeWidth={1.8} />
                    Sign out
                  </button>
                </div>

                <div className="mt-4 rounded-xl p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      border: `1px solid ${consultAccent}55`,
                      background: `linear-gradient(140deg, ${consultAccent}16 0%, var(--bg-elev) 72%)`,
                    }}
                  >
                    <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: consultAccent }}>Paying For</p>
                    <p className="mt-2 text-lg" style={{ color: 'var(--fg)' }}>{paymentTargetLabel}</p>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--fg2)' }}>
                      The payment below belongs to this selected chat only.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Payment region</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                      {countryProfile === 'outside_india' ? 'Disabled' : INSTANT_FEE_LABEL}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCountryProfile('india')}
                      className="rounded-lg px-3 py-2 text-left"
                      style={{
                        border: countryProfile === 'india' ? '1px solid var(--accent)' : '1px solid var(--border2)',
                        background: countryProfile === 'india' ? 'var(--accent-dim)' : 'transparent',
                      }}
                    >
                      <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>India</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>UPI / Paytm QR</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCountryProfile('outside_india')}
                      className="rounded-lg px-3 py-2 text-left"
                      style={{
                        border: countryProfile === 'outside_india' ? '1px solid var(--special-border)' : '1px solid var(--border2)',
                        background: countryProfile === 'outside_india' ? 'var(--special-bg)' : 'transparent',
                      }}
                    >
                      <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>Outside India</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>International rails</p>
                    </button>
                  </div>

                  {geoLoaded && (
                    <p className="mt-2 text-[11px]" style={{ color: 'var(--fg3)' }}>
                      Auto-country: {countryCode || 'IN'} (manual override enabled)
                    </p>
                  )}

                  {countryProfile === 'india' ? (
                    <>
                      <div className="mt-3 flex justify-center">
                        <div
                          className="rounded-lg overflow-hidden w-full p-2"
                          style={{
                            border: '1px solid var(--border2)',
                            background: '#fff',
                            maxWidth: 'min(84vw, 320px)',
                          }}
                        >
                          <img
                            src={paymentQrSrc}
                            alt={`${paymentTargetLabel} payment QR`}
                            className="block w-full h-auto aspect-square object-contain"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setQrModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase"
                          style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg-elev)' }}
                        >
                          <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                          Open larger QR
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 rounded-lg p-3" style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)' }}>
                      <p className="text-xs" style={{ color: 'var(--special-accent)' }}>
                        {paymentCapabilities?.international_notice || 'International checkout is currently disabled.'}
                      </p>
                      {Array.isArray(paymentCapabilities?.international_rails) && paymentCapabilities.international_rails.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {paymentCapabilities.international_rails.map((rail) => (
                            <p key={rail.id || rail.name} className="text-[11px]" style={{ color: 'var(--fg2)' }}>
                              {rail.name}: {rail.detail}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {!paymentCapabilitiesLoaded ? (
                    <p className="text-xs" style={{ color: 'var(--fg2)' }}>Checking payment mode…</p>
                  ) : paymentMode === 'auto' ? (
                    <>
                      <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>
                        Automatic payment confirmation
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={startAutomaticPayment}
                          disabled={paymentStarting}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase"
                          style={{
                            border: paymentUnlocked ? '1px solid var(--status-done-border)' : '1px solid var(--special-border)',
                            color: paymentUnlocked ? 'var(--status-success-fg)' : 'var(--special-accent)',
                            opacity: paymentStarting ? 0.82 : 1,
                          }}
                        >
                          {paymentStarting
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} />
                            : paymentUnlocked
                              ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                              : <WalletCards className="w-3.5 h-3.5" strokeWidth={1.8} />}
                          {paymentStarting ? 'Starting...' : paymentUnlocked ? 'Confirmed for one message' : 'Start secure payment'}
                        </button>

                        {paymentSessionId && !paymentUnlocked && (
                          <button
                            type="button"
                            onClick={() => refreshPaymentSession(paymentSessionId)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase"
                            style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                          >
                            <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                            Check status
                          </button>
                        )}

                        {paymentUpiIntent && (
                          <a
                            href={paymentUpiIntent}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase"
                            style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                            Open UPI app
                          </a>
                        )}
                      </div>
                      {!!paymentSessionStatus && (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.17em]" style={{ color: 'var(--fg3)' }}>
                          Session status: {paymentSessionStatus.replace(/_/g, ' ')}
                        </p>
                      )}
                    </>
                  ) : paymentMode === 'international_blocked' ? (
                    <p className="text-xs" style={{ color: 'var(--fg2)' }}>
                      {paymentCapabilities?.international_notice || 'International checkout is currently disabled.'}
                    </p>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--fg2)' }}>
                      Automatic payment confirmation is not configured. Please contact support to enable gateway webhooks.
                    </p>
                  )}

                  {paymentNotice && (
                    <p className="mt-2 text-xs" style={{ color: paymentUnlocked ? 'var(--status-success-fg)' : 'var(--fg2)' }}>{paymentNotice}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full p-1"
              style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}
            >
              {CONSULT_SELECTION_TABS.map((tab) => {
                const active = consultSelectionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setConsultSelectionTab(tab.id)}
                    className="px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all"
                    style={{
                      border: `1px solid ${active ? 'var(--special-border)' : 'transparent'}`,
                      background: active ? 'var(--special-bg)' : 'transparent',
                      color: active ? 'var(--special-accent)' : 'var(--fg2)',
                    }}
                    aria-pressed={active}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {showConsultTypePicker && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {types.map((type) => {
                  const active = type.id === selectedType?.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedTypeId(type.id)}
                      className="px-4 py-2.5 rounded-full text-[11px] tracking-[0.2em] uppercase transition-all"
                      style={{
                        border: `1px solid ${active ? type.accent : 'var(--border2)'}`,
                        background: active ? `${type.accent}20` : 'var(--bg-elev)',
                        color: active ? type.accent : 'var(--fg2)',
                      }}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            )}

            {!isAutoConsult && selectedType && (
              <motion.div
                key={selectedType.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`${showConsultTypePicker ? 'mt-7' : 'mt-5'} rounded-2xl p-5 lg:p-7 relative overflow-hidden`}
                style={{ border: `1px solid ${selectedType.accent}55`, background: 'var(--bg-elev)' }}
              >
                <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full" style={{ background: `${selectedType.accent}1f` }} />
                <h2 className="hero-display text-3xl lg:text-4xl relative" style={{ color: 'var(--fg)' }}>{selectedType.label}</h2>
                <p
                  className="mt-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px]"
                  style={{ background: `${selectedType.accent}22`, border: `1px solid ${selectedType.accent}77`, color: 'var(--fg2)' }}
                >
                  {selectedType.description}
                </p>

                <div className="mt-6 grid md:grid-cols-2 gap-4 relative">
                  {(selectedType.images || []).slice(0, 2).map((img) => (
                    <div key={`${selectedType.id}-${img.place}`} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
                      <div className="aspect-[16/9] relative">
                        <img src={img.src} alt={img.place} className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,11,18,0.7), transparent 64%)' }} />
                        <p className="absolute left-3 bottom-3 text-[10px] tracking-[0.22em] uppercase" style={{ color: '#fff' }}>
                          {img.place} · Indicative
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden relative" style={{ border: `1px solid ${consultAccent}66`, background: 'var(--bg-elev)' }}>
            <div className="px-5 lg:px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>Instant Consult DM</p>
                <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>{chatHeading}</p>
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: `${consultAccent}1c`, border: `1px solid ${consultAccent}66`, color: consultAccent }}>
                {INSTANT_FEE_LABEL} / message
              </span>
            </div>

            <div className="relative">
              <div className={`${chatOverlayLocked ? 'blur-[2px] pointer-events-none select-none' : ''}`}>
                <div className="h-[360px] lg:h-[430px] overflow-y-auto px-4 lg:px-5 py-4 space-y-3" style={{ background: 'var(--bg)' }}>
                  {messages.length ? (
                    <>
                      {loadingMessages && (
                        <div className="flex justify-center pb-1">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--fg3)' }} />
                        </div>
                      )}
                      {messages.map((msg) => {
                        const pill = statusPill(msg.status);
                        return (
                          <div key={msg.id} className="space-y-2.5">
                          <div className="flex justify-end">
                            <div
                              className="max-w-[88%] rounded-2xl rounded-br-md px-4 py-3"
                              style={{ background: `${consultAccent}26`, border: `1px solid ${consultAccent}55`, color: 'var(--fg)' }}
                            >
                              <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.question}</p>
                            </div>
                          </div>

                          {msg.admin_reply?.text ? (
                            <div className="flex justify-start">
                              <div
                                className="max-w-[92%] rounded-2xl rounded-bl-md px-4 py-3.5 relative overflow-hidden"
                                style={{ border: `1px solid ${consultAccent}77`, background: `linear-gradient(140deg, ${consultAccent}24 0%, var(--bg-elev) 56%)` }}
                              >
                                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full" style={{ background: `${consultAccent}22` }} />
                                <div className="relative flex items-center gap-2 flex-wrap">
                                  <span
                                    className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                                    style={{ border: `1px solid ${consultAccent}66`, color: consultAccent, background: `${consultAccent}14` }}
                                  >
                                    Vartika
                                  </span>
                                  <span className="text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded-full" style={pill.style}>
                                    {pill.label}
                                  </span>
                                  <span className="text-[11px]" style={{ color: 'var(--fg2)' }}>
                                    {formatTs(msg.admin_reply.replied_at || msg.updated_at || msg.created_at)}
                                  </span>
                                </div>
                                <p className="relative mt-2.5 text-sm font-light leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fg)' }}>
                                  {msg.admin_reply.text}
                                </p>
                                {!!msg.admin_reply.images?.length && (
                                  <div className="relative mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {msg.admin_reply.images.filter((img) => img.url).map((img, idx) => (
                                      <a
                                        key={`${msg.id}-reply-image-${idx}`}
                                        href={img.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded overflow-hidden"
                                        style={{ border: '1px solid var(--border2)' }}
                                      >
                                        <img src={img.url} alt={img.name || `reply-${idx + 1}`} className="w-full h-24 object-cover" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                <p className="relative mt-2 text-[11px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>
                                  — Vartika Shukla
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-start">
                              <div className="max-w-[88%] rounded-2xl rounded-bl-md px-3.5 py-2.5" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded-full" style={pill.style}>
                                    {pill.label}
                                  </span>
                                  <span className="text-[11px]" style={{ color: 'var(--fg2)' }}>{formatTs(msg.created_at)}</span>
                                </div>
                                <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>
                                  {msg.status === 'done'
                                    ? 'Your response is ready. Please check your channel updates from our team.'
                                    : WAIT_NOTICE}
                                </p>
                              </div>
                            </div>
                          )}
                          </div>
                        );
                      })}
                    </>
                  ) : loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--fg3)' }} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center px-6 text-center">
                      <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                        No messages yet. Complete onboarding and payment to send your first Instant Consult DM.
                      </p>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={submitMessage}
                  className={`relative px-4 lg:px-5 py-4 ${chatSendLocked ? 'cursor-not-allowed' : ''}`}
                  style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elev)' }}
                  aria-disabled={chatSendLocked}
                >
                  <div className={chatSendLocked ? 'pointer-events-none select-none' : ''}>
                    <label className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>
                      Your Question
                    </label>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      placeholder="Type your question clearly. You may also use your device voice-to-text keyboard input."
                      className="w-full mt-2 bg-transparent border-0 outline-none resize-none text-sm leading-relaxed"
                      style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)', paddingBottom: '10px' }}
                      disabled={sending || chatSendLocked}
                    />
                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs font-light" style={{ color: 'var(--fg3)' }}>
                        Every sent DM requires a fresh {INSTANT_FEE_LABEL} payment.
                      </p>
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={startVoiceCapture}
                          disabled={listening || chatSendLocked}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase"
                          style={{ border: '1px solid var(--border2)', color: listening ? 'var(--accent-text)' : 'var(--fg2)' }}
                        >
                          <Mic className="w-3.5 h-3.5" strokeWidth={1.8} />
                          {listening ? 'Listening' : 'Voice'}
                        </button>
                        <button
                          type="submit"
                          disabled={sending || chatSendLocked || !draft.trim()}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase"
                          style={{ background: consultAccent, color: '#fff', opacity: chatSendLocked ? 0.56 : 1 }}
                        >
                          {sending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                            : chatSendLocked
                              ? <Lock className="w-3.5 h-3.5" strokeWidth={1.8} />
                              : <Send className="w-3.5 h-3.5" strokeWidth={1.9} />}
                          {sending ? 'Sending...' : chatSendLocked ? lockPromptLabel : 'Send DM'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {chatSendLocked && (
                    <div
                      className="group absolute inset-0 z-10"
                      style={{ background: 'var(--overlay-soft)', backdropFilter: 'blur(1.5px)', cursor: 'not-allowed' }}
                      title={composerLockTooltip}
                      aria-label={composerLockTooltip}
                    >
                      <div className="absolute right-4 bottom-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.12em] opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0" style={{ border: '1px solid var(--special-border)', background: 'var(--bg-elev)', color: 'var(--special-accent)' }}>
                        <Lock className="w-3 h-3" strokeWidth={1.8} />
                        {composerLockTooltip}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <AnimatePresence>
                {chatOverlayLocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center px-6"
                    style={{ background: 'rgba(10, 14, 21, 0.24)' }}
                  >
                    <button
                      type="button"
                      onClick={lockPromptAction}
                      className="orbit-circle-cta w-40 h-40 rounded-full flex flex-col items-center justify-center text-center"
                      style={{
                        '--orbit-ring': !authUser ? 'var(--special-accent)' : consultAccent,
                        border: `1px solid ${!authUser ? 'var(--special-border)' : `${consultAccent}88`}`,
                        background: 'rgba(12, 18, 28, 0.55)',
                        backdropFilter: 'blur(4px)',
                      }}
                      aria-label={lockPromptHint}
                    >
                      {!authUser ? <Lock className="w-7 h-7" style={{ color: 'var(--special-accent)' }} strokeWidth={1.7} /> : <WalletCards className="w-7 h-7" style={{ color: consultAccent }} strokeWidth={1.7} />}
                      <p className="text-[10px] tracking-[0.2em] uppercase mt-3" style={{ color: !authUser ? 'var(--special-accent)' : consultAccent }}>
                        {lockPromptLabel}
                      </p>
                      <p className="text-[9px] mt-1.5" style={{ color: 'var(--fg2)' }}>{lockPromptHint}</p>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {(sendError || sendNotice) && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-6">
            {sendError && <p className="text-sm" style={{ color: '#E08A6F' }}>{sendError}</p>}
            {sendNotice && (
              <p className="text-sm inline-flex items-center gap-2" style={{ color: 'var(--accent-text)' }}>
                <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                {sendNotice}
              </p>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-8">
          <div className="rounded-xl px-5 py-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>Service Disclaimer</p>
            <p className="text-sm mt-2 font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
              Each Instant Consult reply may include written interpretation, guidance notes, and supporting images where relevant. Typical response window is up to 24 hours.
            </p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {qrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] px-5 py-10 flex items-center justify-center"
            style={{ background: 'rgba(6, 10, 18, 0.78)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[480px] rounded-2xl p-4"
              style={{ background: 'var(--bg-elev)', border: '1px solid var(--border2)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Paytm QR · {INSTANT_FEE_LABEL}</p>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                  aria-label="Close QR preview"
                >
                  <X className="w-4 h-4" strokeWidth={1.9} />
                </button>
              </div>
              <div className="mt-3 rounded-lg overflow-hidden p-2" style={{ border: '1px solid var(--border2)', background: '#fff' }}>
                <img src={paymentQrSrc} alt={`Full size ${paymentTargetLabel} payment QR`} className="block w-full h-auto" />
              </div>
              <p className="mt-3 text-xs" style={{ color: 'var(--fg2)' }}>
                Keep your screen brightness high while scanning. Unlock happens automatically after payment confirmation.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
