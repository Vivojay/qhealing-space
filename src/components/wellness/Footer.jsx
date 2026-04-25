import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';

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

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 mb-16 lg:mb-20">

          {/* Brand */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-sm font-light leading-relaxed max-w-lg mb-8" style={{ color: 'var(--fg2)' }}>
                Individual Healings · Spiritual Workshops · Retreats · Corporate Interventions.
                Guided by Vartika Shukla — healer, hypnotherapist, life coach.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-8">
                {['By appointment', 'Private sessions', 'Online + In person'].map((item) => (
                  <span
                    key={item}
                    className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full"
                    style={{
                      color: 'var(--accent-text)',
                      border: '1px solid var(--accent-soft)',
                      background: 'var(--accent-dim)',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to={`/booking?service=${encodeURIComponent('Other / Not sure yet')}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs tracking-[0.25em] uppercase hover-accent"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: '1px solid var(--accent)',
                }}
              >
                Book a session <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
              <Link
                to="/instant-consult?mode=signup"
                className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs tracking-[0.2em] uppercase hover-accent"
                style={{
                  border: '1px solid var(--special-border)',
                  color: 'var(--special-accent)',
                  background: 'var(--special-bg)',
                }}
              >
                Sign Up Instant Consult <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </motion.div>
          </div>

          {/* Sitemap */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="h-full rounded-2xl p-6"
              style={{
                border: '1px solid var(--border2)',
                background: 'linear-gradient(180deg, var(--accent-dim), transparent)',
              }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>Explore</p>
              <ul className="space-y-2">
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
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-light hover-accent"
                      style={{ color: 'var(--fg2)' }}
                    >
                      <span>{label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" strokeWidth={1.8} />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.14 }}
              className="h-full rounded-2xl p-6"
              style={{
                border: '1px solid var(--border2)',
                background: 'linear-gradient(180deg, var(--accent-dim), transparent)',
              }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>Connect</p>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://maps.google.com/?q=Sector+56,+Gurugram,+Haryana+122011"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group footer-contact-row flex w-full items-start gap-3 rounded-lg px-3 py-2.5 hover-accent"
                    style={{ color: 'var(--fg2)' }}
                  >
                    <div
                      className="footer-icon-chip w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border2)' }}
                    >
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} strokeWidth={1.5} />
                    </div>
                    <span className="min-w-0 text-sm font-light leading-relaxed">
                      Sector 56, Gurugram<br />Haryana - 122011
                    </span>
                  </a>
                </li>
                <li>
                  <a href="tel:+919267904256" className="group footer-contact-row flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover-accent" style={{ color: 'var(--fg2)' }}>
                    <div
                      className="footer-icon-chip w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border2)' }}
                    >
                      <Phone className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-light">+91 9267904256</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:vartikashukla@xyz.com" className="group footer-contact-row flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover-accent" style={{ color: 'var(--fg2)' }}>
                    <div
                      className="footer-icon-chip w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border2)' }}
                    >
                      <Mail className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} strokeWidth={1.5} />
                    </div>
                    <span className="min-w-0 break-all text-sm font-light leading-snug">vartikashukla@xyz.com</span>
                  </a>
                </li>
                <li className="pt-1">
                  <a
                    href="https://www.instagram.com/quantum_healingspace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group footer-contact-row flex w-full items-center gap-3 mt-1 rounded-lg px-3 py-2 hover-accent"
                  >
                    <div
                      className="footer-icon-chip w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border2)' }}
                    >
                      <Instagram className="w-3.5 h-3.5" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
                    </div>
                    <span className="min-w-0 break-all text-[10px] sm:text-[11px] tracking-[0.14em] uppercase" style={{ color: 'var(--fg3)' }}>
                      @quantum_healingspace
                    </span>
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Newsletter — full-width thin pill above the © bar */}
        <div className="mb-4">
          <NewsletterSignup />
        </div>

        {/* Bottom bar */}
        <div
          className="rounded-full px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
          style={{
            border: '1px solid var(--border2)',
            background: 'linear-gradient(90deg, var(--accent-dim), transparent 35%, var(--accent-dim))',
          }}
        >
          <p className="text-xs font-light" style={{ color: 'var(--fg3)' }}>
            © {new Date().getFullYear()} Quantum Healing Space · All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--fg3)' }}>
            <span className="font-mono tracking-wider">QHS v1.0</span>
            <span aria-hidden>·</span>
            <span className="font-light">Gurugram, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
