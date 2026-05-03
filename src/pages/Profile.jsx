import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Mail, Shield, User, ArrowRight } from 'lucide-react';
import { firebaseAuth, firebaseConfigured } from '@/lib/firebaseClient';

function formatProvider(providerId) {
  if (!providerId) return 'Unknown';
  if (providerId === 'google.com') return 'Google';
  if (providerId === 'password') return 'Email / Password';
  return providerId;
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser || null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const providerLabel = useMemo(
    () => formatProvider(user?.providerData?.[0]?.providerId || user?.providerId),
    [user],
  );

  if (loading) {
    return (
      <div className="min-h-screen px-8 lg:px-16 py-24" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <p className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen px-8 lg:px-16 py-24" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <div className="max-w-3xl rounded-[28px] p-8 lg:p-10" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
          <p className="text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--accent-text)' }}>Profile</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>No active session</h1>
          <p className="text-sm font-light mt-4 max-w-xl" style={{ color: 'var(--fg2)' }}>
            You are currently signed out. Sign in again to view your profile details.
          </p>
          <Link
            to="/auth?mode=login"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[11px] tracking-[0.18em] uppercase"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Go to login
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 lg:px-16 py-24" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="max-w-4xl">
        <p className="text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--accent-text)' }}>Profile</p>
        <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Your account</h1>
        <p className="text-sm font-light mt-4 max-w-2xl" style={{ color: 'var(--fg2)' }}>
          Basic profile scaffold. This can later expand into saved sessions, payments, requests, and preferences.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-[26px] p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 overflow-hidden" style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || user.email || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" style={{ color: 'var(--fg2)' }} strokeWidth={1.8} />
              )}
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>Name</p>
            <p className="text-lg" style={{ color: 'var(--fg)' }}>{user.displayName || 'Not set'}</p>
          </div>

          <div className="rounded-[26px] p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
            <Mail className="w-5 h-5 mb-4" style={{ color: 'var(--accent-text)' }} strokeWidth={1.8} />
            <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>Email</p>
            <p className="text-lg break-all" style={{ color: 'var(--fg)' }}>{user.email || 'Not available'}</p>
          </div>

          <div className="rounded-[26px] p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
            <Shield className="w-5 h-5 mb-4" style={{ color: 'var(--accent-text)' }} strokeWidth={1.8} />
            <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>Signed in with</p>
            <p className="text-lg" style={{ color: 'var(--fg)' }}>{providerLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
