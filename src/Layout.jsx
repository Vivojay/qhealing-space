import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf } from 'lucide-react';

const navItems = [
  { label: 'Home', page: 'Home', number: '00' },
  { label: 'Healings', page: 'Healings', number: '01' },
  { label: 'Global Practices', page: 'Global Practices', number: '02' },
  { label: 'Retreats', page: 'Retreats', number: '03' },
  { label: 'Hindu Rituals', page: 'Hindu Rituals', number: '04' },
  { label: 'Transcendence Rituals', page: 'Transcendence Rituals', number: '05' },
];

export default function Layout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 260 : 64 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="fixed left-0 top-0 h-full bg-stone-950 z-50 hidden lg:flex flex-col overflow-hidden"
      >
        {/* Logo mark */}
        <div className="h-20 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-3.5 h-3.5 text-white/70" strokeWidth={1.5} />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <span className="text-white/80 text-sm font-light tracking-[0.15em] uppercase whitespace-nowrap">
                    Serenity
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-10 flex flex-col gap-0.5 px-3">
          {navItems.map((item, index) => {
            const href = createPageUrl(item.page);
            const isActive = location.pathname === href;

            return (
              <Link
                key={item.page}
                to={href}
                className="group relative flex items-center gap-4 px-2 py-3 rounded"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white/5 rounded"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}

                {/* Number */}
                <span className={`text-[10px] font-mono flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-white/40' : 'text-white/15 group-hover:text-white/30'}`}>
                  {item.number}
                </span>

                {/* Label */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`text-sm font-light whitespace-nowrap transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom decoration */}
        <div className="p-5 border-t border-white/5">
          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 mb-1">Book a Session</p>
                <p className="text-xs text-white/30 font-light">+1 (555) 123-4567</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-px bg-white/10"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-stone-950/95 backdrop-blur-md z-50 lg:hidden flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
            <Leaf className="w-3 h-3 text-white/70" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-light tracking-[0.15em] uppercase text-white/80">Serenity</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-stone-950 z-40 lg:hidden pt-14"
          >
            <nav className="p-6 pt-10">
              {navItems.map((item, index) => {
                const href = createPageUrl(item.page);
                const isActive = location.pathname === href;
                return (
                  <motion.div
                    key={item.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-5 py-5 border-b border-white/5 group"
                    >
                      <span className="text-[10px] font-mono text-white/20">{item.number}</span>
                      <span className={`text-xl font-light transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
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

      {/* Main Content */}
      <main className="lg:pl-16 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
