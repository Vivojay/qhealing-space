import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { X, Sun, Moon, Globe, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ChatBot from '@/components/ChatBot';
import { firebaseAuth, firebaseConfigured } from '@/lib/firebaseClient';
import atomDemoLogo from '../attached_assets/icons/atom-demo-logo.png';

/* Banner appears ONLY on payment / booking / checkout pages */
function isPaymentPage(pathname) {
  return (
    pathname === '/booking' ||
    pathname.startsWith('/booking/') ||
    /\/book(\/?|$)/.test(pathname) ||      // any /…/book path
    pathname.includes('/checkout')
  );
}

function TopBanner() {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('qhs-banner-dismissed') === '1';
  });
  if (!isPaymentPage(pathname) || hidden) return null;
  return (
    <div className="top-banner fixed top-0 left-0 right-0 z-[55] flex items-center justify-center gap-3 px-4 py-2.5">
      <Globe className="w-3 h-3" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
      <span className="text-center" style={{ color: 'var(--fg)', textTransform: 'none' }}>
        <span
          style={{
            color: 'var(--accent-text)',
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent)',
            borderRadius: '999px',
            fontWeight: 700,
            padding: '2px 8px',
          }}
        >
          placeholder
        </span>
        <span style={{ color: '#fff', fontWeight: 400 }} className="ml-2">
          text
        </span>
      </span>
      <button
        onClick={() => { sessionStorage.setItem('qhs-banner-dismissed', '1'); setHidden(true); }}
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
        style={{ color: 'var(--fg2)' }}
      >
        <X className="w-3 h-3" strokeWidth={1.8} />
      </button>
    </div>
  );
}

const navItems = [
  { label: 'Home', page: 'Home', number: '00' },
  { label: 'Services', page: 'Services', number: '01' },
  { label: 'Instant Consult', page: 'Instant Consult', number: 'IC', special: true },
  { label: 'Combined Healings', page: 'Combined Healings', number: 'CH', special: true },
  { label: 'Healings', page: 'Healings', number: '02' },
  { label: 'Global Practices', page: 'Global Practices', number: '03' },
  { label: 'Retreats', page: 'Retreats', number: '04' },
  { label: 'Hindu Rituals', page: 'Hindu Rituals', number: '05' },
  { label: 'Transcendence Rituals', page: 'Transcendence Rituals', number: '06' },
];

const SIDEBAR_COLLAPSED_WIDTH = 60;
const SIDEBAR_EXPANDED_WIDTH = 286;

function scrollToTopImmediate() {
  if (typeof window === 'undefined') return;
  if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
    window.__lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}

export default function Layout({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [sidebarUser, setSidebarUser] = useState(null);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const instantConsultHref = createPageUrl('Instant Consult');
  const instantSignupHref = `/auth?mode=signup&next=${encodeURIComponent(instantConsultHref)}`;
  const authSignupHref = `/auth?mode=signup&next=${encodeURIComponent(instantConsultHref)}`;
  const authLoginHref = `/auth?mode=login&next=${encodeURIComponent(instantConsultHref)}`;
  const authModeParam = new URLSearchParams(location.search).get('mode');
  const signupTopbarActive = location.pathname === '/auth' && authModeParam !== 'login';
  const loginTopbarActive = location.pathname === '/auth' && authModeParam === 'login';
  const topbarOffset = isPaymentPage(location.pathname) ? 52 : 16;

  const sidebarDisplayName = (sidebarUser?.displayName || sidebarUser?.email?.split('@')[0] || 'Member').trim();
  const sidebarDisplayEmail = sidebarUser?.email || 'Signed in';
  const sidebarInitial = (sidebarDisplayName[0] || 'M').toUpperCase();

  // Auto-collapse the sidebar whenever the route changes (mobile-friendly)
  useEffect(() => { setExpanded(false); }, [location.pathname]);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      setSidebarUser(null);
      return undefined;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setSidebarUser(user || null);
    });

    return () => unsub();
  }, []);

  const onSidebarSignOut = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth).catch(() => {});
  };

  // Admin pages render their own chrome — bypass the public site shell entirely.
  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>

      <TopBanner />

      <div className="fixed right-4 left-[72px] z-[61] pointer-events-none flex justify-end" style={{ top: `${topbarOffset}px` }}>
        <div
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full p-1.5"
          style={{
            border: '1px solid var(--border2)',
            background: 'color-mix(in srgb, var(--bg-elev) 82%, transparent)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Link
            to={authSignupHref}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase hover-feedback"
            style={{
              border: `1px solid ${signupTopbarActive ? 'var(--special-border)' : 'transparent'}`,
              background: signupTopbarActive ? 'var(--special-bg)' : 'transparent',
              color: signupTopbarActive ? 'var(--special-accent)' : 'var(--fg2)',
            }}
          >
            <UserPlus className="w-3.5 h-3.5" strokeWidth={1.8} />
            Signup
          </Link>

          <Link
            to={authLoginHref}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase hover-feedback"
            style={{
              border: `1px solid ${loginTopbarActive ? 'var(--accent)' : 'transparent'}`,
              background: loginTopbarActive ? 'var(--accent-soft)' : 'transparent',
              color: loginTopbarActive ? 'var(--accent-text)' : 'var(--fg2)',
            }}
          >
            <LogIn className="w-3.5 h-3.5" strokeWidth={1.8} />
            Login
          </Link>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-full w-8 h-8 hover-feedback"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              color: 'var(--fg2)',
            }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 60, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Sun className="w-4 h-4" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -60, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Moon className="w-4 h-4" strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Sidebar — visible on ALL screen sizes ── */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="fixed left-0 top-0 h-full flex flex-col overflow-hidden"
        style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)', zIndex: 50 }}
      >
        {/* Logo */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="h-[72px] flex items-center px-4 lg:cursor-default"
          style={{ borderBottom: '1px solid var(--border)' }}
          aria-label="Toggle navigation"
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: '1px solid var(--border2)',
                background: isDark ? '#ffffff' : 'var(--bg-elev)',
              }}
            >
              <img src={atomDemoLogo} alt="Quantum Healing Space logo" className="w-4 h-4 object-contain" />
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-[11px] tracking-[0.18em] uppercase whitespace-nowrap"
                  style={{ color: 'var(--fg2)', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  QHS
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </button>

        {/* Nav — roomier vertical spacing */}
        <nav className="flex-1 py-8 px-2 flex flex-col gap-1.5">
          {navItems.map((item, i) => {
            const href = createPageUrl(item.page);
            const active = location.pathname === href;
            return (
              <Link
                key={item.page}
                to={href}
                onClick={() => {
                  if (item.page === 'Instant Consult' || item.page === 'Combined Healings') scrollToTopImmediate();
                  setExpanded(false);
                }}
                className={`group relative flex items-center gap-4 px-2 py-4 lg:py-4 rounded ${item.special ? 'hover-feedback' : 'hover-surface'}`}
                style={item.special ? {
                  border: `1px solid ${active ? 'var(--special-accent)' : 'var(--special-border)'}`,
                  background: active ? 'var(--special-bg-active)' : 'var(--special-bg)',
                } : undefined}
              >
                {active && !item.special && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded"
                    style={{ background: 'var(--accent-soft)', borderLeft: '2px solid var(--accent)' }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span
                  className="text-[10px] font-mono flex-shrink-0 relative w-6 text-center"
                  style={{ color: item.special ? (active ? 'var(--special-accent)' : 'var(--special-text)') : (active ? 'var(--fg2)' : 'var(--fg3)') }}
                >
                  {item.number}
                </span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.28, delay: i * 0.025 }}
                      className="text-[15px] font-light whitespace-nowrap relative"
                      style={{ color: item.special ? (active ? 'var(--special-accent)' : 'var(--special-text)') : (active ? 'var(--fg)' : 'var(--fg2)') }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className={expanded ? 'px-2 pb-3' : 'px-2 pb-3 flex justify-center'}>
          {sidebarUser ? (
            <div
              className="rounded-2xl p-1.5"
              style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}
              title={`${sidebarDisplayName} (${sidebarDisplayEmail})`}
            >
              <Link
                to={instantConsultHref}
                onClick={() => {
                  scrollToTopImmediate();
                  setExpanded(false);
                }}
                className="group relative flex items-center gap-2 rounded-xl px-1.5 py-1.5 hover-surface"
              >
                <span
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center flex-shrink-0 text-[11px]"
                  style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)', color: 'var(--special-accent)' }}
                >
                  {sidebarUser.photoURL
                    ? <img src={sidebarUser.photoURL} alt={sidebarDisplayName} className="w-full h-full rounded-full object-cover" />
                    : sidebarInitial}
                </span>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.25 }}
                      className="min-w-0"
                    >
                      <p className="text-[11px] leading-tight truncate" style={{ color: 'var(--fg)' }}>
                        {sidebarDisplayName}
                      </p>
                      <p className="text-[10px] leading-tight truncate" style={{ color: 'var(--fg3)' }}>
                        {sidebarDisplayEmail}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>

              {expanded && (
                <button
                  type="button"
                  onClick={onSidebarSignOut}
                  className="mt-1.5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] tracking-[0.16em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                >
                  <LogOut className="w-3 h-3" strokeWidth={1.8} />
                  Sign out
                </button>
              )}
            </div>
          ) : (
              <Link
                to={instantSignupHref}
                onClick={() => {
                  scrollToTopImmediate();
                  setExpanded(false);
                }}
                className={`group relative flex items-center justify-center rounded-full hover-feedback ${expanded ? 'gap-3 px-2.5 py-2.5' : 'w-11 h-11 p-0'}`}
                style={{
                  border: '1px solid var(--special-border)',
                  background: 'var(--special-bg)',
                  color: 'var(--special-accent)',
                }}
            >
              <span
                className="w-7 h-7 rounded-full inline-flex items-center justify-center flex-shrink-0"
                style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg-active)' }}
              >
                <UserPlus className="w-3.5 h-3.5" strokeWidth={1.8} />
              </span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.25 }}
                    className="text-[10px] tracking-[0.14em] uppercase whitespace-nowrap text-center"
                  >
                    Instant Consult
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}
        </div>

        {/* Bottom — connect block */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <AnimatePresence>
            {expanded ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--fg3)' }}>Connect</p>
                <p className="text-[11px] font-light" style={{ color: 'var(--fg2)' }}>+91 9267904256</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-px w-full" style={{ background: 'var(--border)' }} />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="pl-[60px] pt-0">
        {children}
      </main>

      <ChatBot />
    </div>
  );
}
