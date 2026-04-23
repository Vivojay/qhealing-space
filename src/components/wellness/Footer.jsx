import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--bg-elev) 0%, var(--bg-warm) 100%)',
        color: 'var(--fg)',
        borderTop: '1px solid var(--accent-soft)',
      }}
    >
      {/* Top accent strip */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

      {/* Subtle decorative blob */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--accent-soft), transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-24 lg:py-32 relative">

        {/* GIANT marquee word */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 lg:mb-28"
        >
          <p className="text-[10px] tracking-[0.5em] uppercase mb-6" style={{ color: 'var(--accent-text)' }}>
            ◊ Quantum Healing Space
          </p>
          <h3
            className="hero-display text-[14vw] lg:text-[10vw] leading-[0.9] -tracking-[0.05em]"
            style={{ color: 'var(--fg)', fontWeight: 300 }}
          >
            Go <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--accent-text)', fontWeight: 300 }}>deeper.</span>
          </h3>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-20">

          {/* Brand */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-sm font-light leading-relaxed max-w-md mb-8" style={{ color: 'var(--fg2)' }}>
                Individual Healings · Spiritual Workshops · Retreats · Corporate Interventions.
                Guided by Vartika Shukla — healer, hypnotherapist, life coach.
              </p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs tracking-[0.25em] uppercase hover-accent"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: '1px solid var(--accent)',
                }}
              >
                Book a session <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </motion.div>
          </div>

          {/* Sitemap */}
          <div className="lg:col-span-3">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--fg3)' }}>Explore</p>
            <ul className="space-y-3">
              {[
                ['Home', '/'],
                ['Healings', '/healings'],
                ['Global Practices', '/global-practices'],
                ['Retreats', '/retreats'],
                ['Hindu Rituals', '/hindu-rituals'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm font-light hover-accent inline-block px-2 -mx-2 py-1 rounded"
                    style={{ color: 'var(--fg2)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--fg3)' }}>Connect</p>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-text)' }} strokeWidth={1.5} />
                <span className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  Sector 56, Gurugram<br />Haryana – 122011
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-text)' }} strokeWidth={1.5} />
                <span className="text-sm font-light" style={{ color: 'var(--fg2)' }}>+91 9267904256</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-text)' }} strokeWidth={1.5} />
                <span className="text-sm font-light" style={{ color: 'var(--fg2)' }}>vartikashukla@xyz.com</span>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/quantum_healingspace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 mt-2 group"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center hover-accent"
                    style={{ border: '1px solid var(--border2)' }}
                  >
                    <Instagram className="w-3.5 h-3.5" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--fg3)' }}>
                    @quantum_healingspace
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--border2)' }}
        >
          <p className="text-xs font-light" style={{ color: 'var(--fg3)' }}>
            © {new Date().getFullYear()} Quantum Healing Space · All rights reserved.
          </p>
          <p className="text-xs font-mono tracking-wider" style={{ color: 'var(--fg3)' }}>
            QHS · v1.0 · Gurugram
          </p>
        </div>
      </div>
    </footer>
  );
}
