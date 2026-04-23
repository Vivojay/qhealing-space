import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle, Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Shield, Sparkles, Globe2,
  ChevronDown, MessageCircle, Send,
} from 'lucide-react';
import Footer from '@/components/wellness/Footer';
import { findRetreat } from '@/constants/retreats';
import { PRICING } from '@/constants/pricing';
import { PaytmLogo, WiseLogo, PayPalLogo, RemitlyLogo, WesternUnionLogo, SwiftLogo } from '@/components/BrandLogos';

const SMOOTH = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

const inputStyle = {
  background: 'transparent',
  color: 'var(--fg)',
  borderBottom: '1px solid var(--border2)',
  outline: 'none',
  paddingBottom: '10px',
  paddingTop: '6px',
  fontSize: '14px',
  fontFamily: "'Inter Tight', sans-serif",
  fontWeight: 300,
  width: '100%',
  display: 'block',
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: 'var(--fg3)',
  marginBottom: '8px',
};

/* ── Slow marquee gallery — 1:1 squares, hover-zoom ── */
function GalleryMarquee({ images }) {
  return (
    <div className="relative overflow-hidden" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div
        className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }}
      />
      <motion.div
        className="flex gap-6 py-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {[...images, ...images].map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-56 h-56 lg:w-64 lg:h-64 flex-shrink-0 overflow-hidden rounded-sm"
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)' }} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

const PaymentLogo = ({ name }) => {
  const logos = {
    'Paytm': PaytmLogo,
    'Wise': WiseLogo,
    'PayPal': PayPalLogo,
    'Remitly': RemitlyLogo,
    'Western Union': WesternUnionLogo,
    'SWIFT Bank Transfer': SwiftLogo,
  };
  const C = logos[name];
  return C ? <C size={28} /> : null;
};

const INTL_RAILS = [
  { name: 'Wise', tagline: 'Best rate · 50+ currencies', detail: 'Send in your local currency to the Indian bank account — funds Paytm directly.', href: 'https://wise.com/send-money/send-money-to-india', badge: 'Recommended' },
  { name: 'PayPal', tagline: 'Cards & PayPal balance', detail: 'vartikashukla2000@yahoo.com — withdrawn to the Paytm-linked account.', href: 'https://www.paypal.com/myaccount/transfer/homepage/pay' },
  { name: 'Remitly', tagline: 'Fast bank-to-bank', detail: 'Quick INR settlement to the same Indian Paytm account.', href: 'https://www.remitly.com/us/en/india' },
  { name: 'Western Union', tagline: 'Global cash & bank pickup', detail: 'Settles to HDFC — Paytm wallet auto-funded.', href: 'https://www.westernunion.com/in/en/send-money-to-india.html' },
  { name: 'SWIFT Bank Transfer', tagline: 'Direct international wire', detail: 'HDFC · A/C 02931140001114 · IFSC HDFC0000293', href: null },
];

export default function RetreatCheckout() {
  const { slug } = useParams();
  const retreat = findRetreat(slug);
  const [country, setCountry] = useState('India');
  const [form, setForm] = useState({ name: '', email: '', phone: '', startDate: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [intlOpen, setIntlOpen] = useState(false);

  if (!retreat) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: 'var(--bg)' }}>
        <p className="hero-display text-3xl mb-6" style={{ color: 'var(--fg)' }}>Retreat not found</p>
        <Link to="/retreats" className="text-sm tracking-widest uppercase" style={{ color: 'var(--accent-text)' }}>
          ← Back to all retreats
        </Link>
      </div>
    );
  }

  const isIndia = country === 'India';
  const fee = isIndia ? PRICING.consultation.india.label : PRICING.consultation.international.label;
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const body = [
      `Retreat: ${retreat.name}`,
      `Location: ${retreat.location}`,
      `Country: ${country}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Preferred Start: ${form.startDate}`,
      `Notes: ${form.notes || 'None'}`,
    ].join('%0A');
    window.open(
      `mailto:vartikashukla@xyz.com?subject=${encodeURIComponent(`Retreat Booking — ${retreat.name}`)}&body=${body}`,
    );
    setSubmitted(true);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <div className="relative h-[58vh] overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
        <img src={retreat.image} alt={retreat.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)' }} />

        <div className="absolute top-6 left-6 lg:left-16 z-10">
          <Link
            to="/retreats"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase backdrop-blur-md hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Retreats
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16 z-10">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
              ◊ Book This Retreat
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SMOOTH}
              className="hero-display text-5xl lg:text-7xl text-white max-w-4xl"
            >
              {retreat.name}
            </motion.h1>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
              <span className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Clock className="w-3.5 h-3.5" strokeWidth={1.6} /> {retreat.duration}
              </span>
              <span className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.6} /> {retreat.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MARQUEE GALLERY ═══ */}
      <GalleryMarquee images={retreat.gallery} />

      {/* ═══ MAIN BODY ═══ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 grid lg:grid-cols-5 gap-12 lg:gap-20">

        {/* ── Booking Form ── */}
        <div className="lg:col-span-3">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>
            ◊ Reserve Your Spot
          </p>
          <h2 className="hero-display text-3xl lg:text-4xl mb-10" style={{ color: 'var(--fg)' }}>
            A few details, then Vartika confirms personally.
          </h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SMOOTH}
              className="flex flex-col items-start gap-5 py-12"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: 'var(--accent)' }} strokeWidth={1} />
              <h3 className="hero-display text-3xl" style={{ color: 'var(--fg)' }}>
                Your retreat enquiry has been sent
              </h3>
              <p className="text-sm font-light leading-relaxed max-w-md" style={{ color: 'var(--fg2)' }}>
                Vartika will reach out within 24 hours with available dates, accommodation options, and the consultation payment link.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-9">
              <div className="grid sm:grid-cols-2 gap-9">
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required value={form.name} onChange={set('name')} style={inputStyle} placeholder="Your full name" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" value={form.email} onChange={set('email')} style={inputStyle} placeholder="your@email.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-9">
                <div>
                  <label style={labelStyle}>Country *</label>
                  <select required value={country} onChange={(e) => setCountry(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="India" style={{ background: 'var(--bg2)' }}>India</option>
                    <option value="Outside India" style={{ background: 'var(--bg2)' }}>Outside India</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Phone *</label>
                  <input required value={form.phone} onChange={set('phone')} style={inputStyle} placeholder={isIndia ? '+91 ...' : '+ country code ...'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Preferred Start Date *</label>
                <input required type="date" value={form.startDate} onChange={set('startDate')} min={new Date().toISOString().split('T')[0]} style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>

              <div>
                <label style={labelStyle}>Notes / Special Requirements</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Dietary needs, group size, anything else..." style={{ ...inputStyle, resize: 'none', borderBottom: 'none', border: '1px solid var(--border2)', padding: '14px', borderRadius: '8px' }} />
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full sm:w-auto inline-flex items-center gap-3 px-12 py-4 text-xs tracking-widest uppercase rounded-lg"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Book This Retreat <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          )}
        </div>

        {/* ── Side panel ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Consultation deposit card */}
          <div className="relative overflow-hidden rounded-xl p-7" style={{ background: 'var(--bg-accent-section)', border: '1px solid var(--accent-soft)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent-text)' }}>
              ◊ Consultation Deposit
            </p>
            <div className="flex items-baseline gap-3">
              <span className="hero-display text-4xl" style={{ color: 'var(--fg)' }}>{fee}</span>
              <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg2)' }}>
                {isIndia ? 'India' : 'International'}
              </span>
            </div>
            <p className="mt-4 text-[12px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
              Reserves your spot and unlocks a 1:1 planning call with Vartika. Adjusted against the final retreat invoice.
            </p>
          </div>

          {/* Treatment pricing reference card */}
          <div className="rounded-xl p-7" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>
              ◊ In-retreat Treatment Pricing
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>India · 1st hour</span>
                <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{PRICING.treatment.india.firstHour.label}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>India · each additional hr</span>
                <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{PRICING.treatment.india.subsequentHourly.label}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>International · 1st hour</span>
                <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{PRICING.treatment.international.firstHour.label}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg2)' }}>
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>International · each additional hr</span>
                <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{PRICING.treatment.international.subsequentHourly.label}</span>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="rounded-xl p-7" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>◊ Includes</p>
            <div className="space-y-2.5">
              {retreat.highlights.map((h) => (
                <div
                  key={h}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all hover-surface"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <span className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <span className="text-[13px] font-light" style={{ color: 'var(--fg)' }}>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* International rails — collapsed */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border2)' }}
          >
            <button
              type="button"
              onClick={() => setIntlOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover-surface"
            >
              <Globe2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
              <div className="flex-1">
                <p className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg2)' }}>Paying from outside India?</p>
                <p className="text-[12px] mt-1 font-light" style={{ color: 'var(--fg3)' }}>5 international rails · all fund the same Paytm account</p>
              </div>
              <motion.div animate={{ rotate: intlOpen ? 180 : 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--fg3)' }} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {intlOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 space-y-2">
                    {INTL_RAILS.map((rail) => {
                      const Inner = (
                        <div
                          className="group flex items-start gap-4 p-3.5 rounded-lg transition-all hover-surface"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          <div className="flex-shrink-0 mt-0.5"><PaymentLogo name={rail.name} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-medium" style={{ color: 'var(--fg)' }}>{rail.name}</span>
                              {rail.badge && (
                                <span className="text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}>
                                  {rail.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] leading-relaxed font-light" style={{ color: 'var(--fg2)' }}>{rail.detail}</p>
                          </div>
                          {rail.href && (
                            <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
                          )}
                        </div>
                      );
                      return rail.href ? (
                        <a key={rail.name} href={rail.href} target="_blank" rel="noopener noreferrer" className="block">{Inner}</a>
                      ) : (
                        <div key={rail.name}>{Inner}</div>
                      );
                    })}
                    <div className="mt-5 pt-5 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <Send className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                      <a href="https://wa.me/919819962635" target="_blank" rel="noopener noreferrer" className="expand-link inline-flex items-center gap-2">
                        Confirm with Vartika on WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Direct contact */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>Talk to Vartika</p>
            <a href="https://wa.me/919267904256" target="_blank" rel="noopener noreferrer" className="text-sm font-light block mb-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--accent-text)' }}>
              WhatsApp · +91 9267904256 →
            </a>
            <a href="mailto:vartikashukla@xyz.com" className="text-sm font-light block hover:opacity-70 transition-opacity" style={{ color: 'var(--fg2)' }}>
              vartikashukla@xyz.com
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
