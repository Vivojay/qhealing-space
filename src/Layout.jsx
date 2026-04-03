import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ChatBot from '@/components/ChatBot';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── Desktop Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 252 : 60 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="fixed left-0 top-0 h-full hidden lg:flex flex-col overflow-hidden"
        style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)', zIndex: 50 }}
      >
        {/* Logo */}
        <div className="h-[72px] flex items-center px-4" style={{ borderBottom: '1px solid var(--border)' }}>
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
                  transition={{ duration: 0.2 }}
                  className="text-[11px] tracking-[0.18em] uppercase whitespace-nowrap"
                  style={{ color: 'var(--fg2)', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  QHS
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-8 px-2 flex flex-col gap-0.5">
          {navItems.map((item, i) => {
            const href = createPageUrl(item.page);
            const active = location.pathname === href;
            return (
              <Link key={item.page} to={href} className="group relative flex items-center gap-4 px-2 py-3 rounded">
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded"
                    style={{ background: 'var(--border)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span
                  className="text-[10px] font-mono flex-shrink-0 relative"
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
                      transition={{ duration: 0.18, delay: i * 0.02 }}
                      className="text-sm font-light whitespace-nowrap relative"
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

        {/* Bottom */}
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

      {/* ── Mobile Header ── */}
      <header
        className="fixed top-0 left-0 right-0 h-14 lg:hidden flex items-center justify-between px-5"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', zIndex: 50 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border2)' }}>
            <Leaf className="w-3 h-3" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
          </div>
          <span className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--fg2)' }}>QHS</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60">
            {isDark
              ? <Sun className="w-4 h-4" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
              : <Moon className="w-4 h-4" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />}
          </button>
          <button onClick={() => setMobileOpen(p => !p)} className="w-8 h-8 flex items-center justify-center" style={{ color: 'var(--fg2)' }}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 lg:hidden pt-14"
            style={{ background: 'var(--bg)', zIndex: 40 }}
          >
            <nav className="p-6 pt-10">
              {navItems.map((item, i) => {
                const href = createPageUrl(item.page);
                const active = location.pathname === href;
                return (
                  <motion.div
                    key={item.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-5 py-5 group"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <span className="text-[10px] font-mono" style={{ color: 'var(--fg3)' }}>{item.number}</span>
                      <span className="text-xl font-light" style={{ color: active ? 'var(--fg)' : 'var(--fg2)' }}>
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Theme Toggle (Desktop, top-right fixed) ── */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-5 right-5 lg:right-8 w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          zIndex: 60,
          color: 'var(--fg2)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div key="sun" initial={{ rotate: -60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 60, opacity: 0 }} transition={{ duration: 0.25 }}>
              <Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.div key="moon" initial={{ rotate: 60, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -60, opacity: 0 }} transition={{ duration: 0.25 }}>
              <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Main Content ── */}
      <main className="lg:pl-[60px] pt-14 lg:pt-0">
        {children}
      </main>

      <ChatBot />
    </div>
  );
}
