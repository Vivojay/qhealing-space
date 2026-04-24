import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ChatBot from '@/components/ChatBot';

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
  { label: 'Healings', page: 'Healings', number: '01' },
  { label: 'Global Practices', page: 'Global Practices', number: '02' },
  { label: 'Retreats', page: 'Retreats', number: '03' },
  { label: 'Hindu Rituals', page: 'Hindu Rituals', number: '04' },
  { label: 'Transcendence Rituals', page: 'Transcendence Rituals', number: '05' },
];

export default function Layout({ children }) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // Auto-collapse the sidebar whenever the route changes (mobile-friendly)
  useEffect(() => { setExpanded(false); }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>

      <TopBanner />

      {/* ── Sidebar — visible on ALL screen sizes ── */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 252 : 60 }}
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
              style={{ border: '1px solid var(--border2)' }}
            >
              <Leaf className="w-3 h-3" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
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
                onClick={() => setExpanded(false)}
                className="group relative flex items-center gap-4 px-2 py-4 lg:py-4 rounded hover-surface"
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded"
                    style={{ background: 'var(--accent-soft)', borderLeft: '2px solid var(--accent)' }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span
                  className="text-[10px] font-mono flex-shrink-0 relative w-6 text-center"
                  style={{ color: active ? 'var(--fg2)' : 'var(--fg3)' }}
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
                      style={{ color: active ? 'var(--fg)' : 'var(--fg2)' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

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

      {/* ── Theme Toggle — single dedicated circle, all screen sizes ── */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-5 right-5 lg:right-8 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          zIndex: 60,
          color: 'var(--fg2)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.25 }}
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
      </motion.button>

      {/* ── Main Content ── */}
      <main className="pl-[60px] pt-9">
        {children}
      </main>

      <ChatBot />
    </div>
  );
}
