import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Loader2,
  LogOut,
  Mail,
  User,
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
import { firebaseAuth, firebaseConfigured, firebaseGoogleProvider } from '@/lib/firebaseClient';

function GoogleMark({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.04 5.04 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.85 0-5.26-1.92-6.12-4.5H2.18v2.84A10.98 10.98 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.88 14.13A6.56 6.56 0 0 1 5.53 12c0-.74.13-1.47.35-2.13V7.03H2.18A10.92 10.92 0 0 0 1 12c0 1.77.42 3.45 1.18 4.97l3.7-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.98 10.98 0 0 0 2.18 7.03l3.7 2.84c.86-2.58 3.27-4.5 6.12-4.5z"
      />
    </svg>
  );
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

function sanitizeNextPath(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
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

export default function AuthPortal() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedMode = useMemo(() => {
    const raw = String(searchParams.get('mode') || '').trim().toLowerCase();
    return raw === 'login' ? 'login' : 'signup';
  }, [searchParams]);

  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get('next')),
    [searchParams],
  );

  const [authUser, setAuthUser] = useState(null);
  const [authMode, setAuthMode] = useState(requestedMode);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  const emailVerificationPending = useMemo(
    () => isUnverifiedPasswordUser(authUser),
    [authUser],
  );

  const syncModeInQuery = useCallback((mode) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (nextPath) {
      params.set('next', nextPath);
    }
    setSearchParams(params, { replace: true });
  }, [nextPath, setSearchParams]);

  const switchAuthMode = useCallback((mode) => {
    setAuthMode(mode);
    setAuthError('');
    setAuthNotice('');
    setResendCooldown(0);
    syncModeInQuery(mode);
  }, [syncModeInQuery]);

  useEffect(() => {
    setAuthMode(requestedMode);
  }, [requestedMode]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      setAuthUser(null);
      return undefined;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setAuthUser(user || null);
      if (isUnverifiedPasswordUser(user)) {
        setAuthMode('login');
        setAuthError('Please verify your email before login.');
        setAuthNotice((prev) => prev || `Check your inbox/spam for the verification link sent to ${user?.email || 'your email'}.`);
        syncModeInQuery('login');
      }
    });

    return () => unsub();
  }, [syncModeInQuery]);

  const onGoogleAuth = async () => {
    if (!firebaseConfigured || !firebaseAuth || !firebaseGoogleProvider) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const cred = await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
      await getIdToken(cred.user, true);
      setAuthNotice('Signed in successfully.');
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
      if (authMode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, authForm.password);
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

        setAuthMode('login');
        syncModeInQuery('login');
        setAuthForm((prev) => ({ ...prev, password: '' }));

        if (verificationSent) {
          setAuthNotice(`Verification link sent to ${email}. Verify your email, then log in.`);
        } else {
          setAuthError('Account created, but verification email could not be sent automatically.');
          setAuthNotice(`${verificationError} Check Firebase Auth email template/domain settings, then try Login again.`);
        }
        return;
      }

      const userCred = await signInWithEmailAndPassword(firebaseAuth, email, authForm.password);
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
        setAuthError('Please verify your email before login.');
        setAuthNotice(
          resent
            ? `A fresh verification link was sent to ${email}.`
            : `${resendError} Check inbox/spam for an earlier verification email, then log in again.`,
        );
        return;
      }

      await getIdToken(userCred.user, true);
      setAuthNotice('Signed in successfully.');
    } catch (err) {
      setAuthError(humanizeAuthError(err, 'Authentication failed.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!firebaseConfigured || !firebaseAuth) return;
    if (resendLoading || resendCooldown > 0) return;

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;
    if (!email || !password) {
      setAuthError('Enter the same email and password, then resend verification.');
      return;
    }

    const actionSettings = buildVerificationActionSettings();
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
      setResendLoading(false);
    }
  };

  const onAuthSignOut = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth).catch(() => {});
    setAuthNotice('Signed out. You can sign in with a different account.');
  };

  return (
    <div style={{ background: 'var(--bg)' }}>
      <section className="relative overflow-hidden py-16 lg:py-20" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 82% 20%, rgba(107,160,204,0.14), transparent 52%)' }} />
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative">
          <p className="text-[10px] tracking-[0.42em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>
            Account Access
          </p>
          <h1 className="hero-display text-5xl lg:text-7xl" style={{ color: 'var(--fg)' }}>
            Join quickly,
            <span style={{ color: 'var(--special-accent)', marginLeft: '0.35ch' }}>consult deeply.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-sm lg:text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            Use your account to unlock Instant Consult messaging and payment verification. Google sign-in works instantly, while email sign-up requires verification.
          </p>
          <Link
            to={nextPath || '/'}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] tracking-[0.2em] uppercase hover-feedback"
            style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg-elev)' }}
          >
            {nextPath ? 'Back to previous page' : 'Stay on this page'}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.9} />
          </Link>
        </div>
      </section>

      <section className="pt-8 pb-20 lg:pt-10 lg:pb-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            {!firebaseConfigured ? (
              <div className="rounded-xl p-4" style={{ border: '1px solid rgba(224,106,106,0.4)', background: 'rgba(224,106,106,0.08)' }}>
                <p className="text-sm" style={{ color: 'var(--fg)' }}>Authentication is not configured yet.</p>
                <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>
                  Set Firebase frontend env vars to enable email/password and Google sign-in.
                </p>
              </div>
            ) : (authUser && !emailVerificationPending) ? (
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--accent-text)' }}>You are signed in</p>
                <h2 className="text-2xl mt-2" style={{ color: 'var(--fg)' }}>{authUser.displayName || authUser.email || 'Member'}</h2>
                <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>
                  Your account is active. Use the app menu to continue, or sign out to switch profiles.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {nextPath && (
                    <Link
                      to={nextPath}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase hover-feedback"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.9} />
                      Continue
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={onAuthSignOut}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                    style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Onboarding</p>
                <h2 className="text-2xl mt-2" style={{ color: 'var(--fg)' }}>
                  {authMode === 'signup' ? 'Create your account' : 'Login to continue'}
                </h2>

                <div className="mt-4 flex gap-2">
                  {['signup', 'login'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => switchAuthMode(mode)}
                      className="px-3 py-2 rounded-lg text-[11px] tracking-[0.2em] uppercase"
                      style={{
                        border: '1px solid var(--border2)',
                        background: authMode === mode ? 'var(--accent-soft)' : 'transparent',
                        color: authMode === mode ? 'var(--accent-text)' : 'var(--fg2)',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <form className="mt-4 space-y-3" onSubmit={onEmailAuth}>
                  {authMode === 'signup' && (
                    <div>
                      <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Full name</label>
                      <input
                        value={authForm.name}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                        style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                        placeholder="Your name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Email</label>
                    <input
                      value={authForm.email}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                      type="email"
                      required
                      className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                      style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                      placeholder="you@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Password</label>
                    <input
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                      type="password"
                      required
                      className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                      style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {authLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                      : authMode === 'signup'
                        ? <Mail className="w-3.5 h-3.5" strokeWidth={1.9} />
                        : <User className="w-3.5 h-3.5" strokeWidth={1.9} />}
                    {authMode === 'signup' ? 'Create account' : 'Login'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={onGoogleAuth}
                  disabled={authLoading}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[11px] tracking-[0.18em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                >
                  <GoogleMark className="w-3.5 h-3.5" />
                  Continue with Google
                </button>

                {authError && (
                  <p className="mt-3 text-xs" style={{ color: '#E08A6F' }}>{authError}</p>
                )}
                {authNotice && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent-text)' }}>{authNotice}</p>
                )}

                {authMode === 'login' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={authLoading || resendLoading || resendCooldown > 0}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase disabled:opacity-55"
                      style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                    >
                      {resendLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} />
                        : <Mail className="w-3.5 h-3.5" strokeWidth={1.8} />}
                      {resendLoading
                        ? 'Sending...'
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend verification email'}
                    </button>
                    <p className="mt-1 text-[11px]" style={{ color: 'var(--fg3)' }}>
                      Uses the same email and password entered above.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
