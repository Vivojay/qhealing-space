import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, CreditCard, Shield, Globe2, MessageCircle, ChevronDown, Sparkles, MapPin, ArrowRight, Banknote, Send } from 'lucide-react';
import Footer from '@/components/wellness/Footer';
import { PRICING } from '@/constants/pricing';
import { PaytmLogo, WiseLogo, PayPalLogo, RemitlyLogo, WesternUnionLogo, SwiftLogo } from '@/components/BrandLogos';

const SMOOTH = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };
const SMOOTH_SLOW = { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

const SERVICES = [
  'Reiki Healing',
  'Deep Chakra Healing',
  'Akashic Records',
  'Past Life Regression',
  'Angel Therapy',
  'Ancestral Healing',
  'Emotional Freedom Technique (EFT)',
  'Sound Therapy',
  'Inner Child Healing',
  'Hypnosis / Hypnotherapy',
  "Ho'oponopono",
  'Tarot Card Reading',
  'Aura Reading & Clearing',
  'Individual Counseling',
  'Stress Busting Retreat',
  'Silent Meditation & Yoga Retreat',
  'Chakra Balancing Retreat',
  'Spiritual Healing Retreat',
  'Reiki Healing Retreat',
  'Forgiveness Retreat',
  'Corporate Workshop / Program',
  "Children's Healing Workshop",
  'Other / Not sure yet',
];

const FORMAT = ['In-person (Gurugram)', 'Online — WhatsApp', 'Online — Skype'];

// UPI payment QR — encodes UPI deep-link; works with Google Pay / PhonePe / Paytm
const UPI_QR = 'https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=12&data=' +
  encodeURIComponent('upi://pay?pa=9819962635@paytm&pn=Vartika Shukla&cu=INR&tn=Quantum Healing Space');

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

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────
   Paytm branded button (trust signal)
   Paytm brand colors: light blue #00BAF2, deep navy #002E6E
   ────────────────────────────────────────── */
function PaytmButton({ onClick, label = 'Continue with' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl overflow-hidden transition-all"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,46,110,0.18)',
        color: '#002E6E',
        boxShadow: '0 1px 2px rgba(0,46,110,0.08), 0 2px 8px rgba(0,46,110,0.06)',
        cursor: 'pointer',
      }}
    >
      <span className="text-sm font-medium tracking-tight inline-flex items-center gap-2">
        <PaytmLogo size={22} />
        <span style={{ color: '#5b6b85' }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#002E6E', letterSpacing: '-0.01em' }}>Paytm</span>
      </span>
      <span
        className="ml-auto text-[10px] tracking-[0.25em] uppercase"
        style={{ color: '#7a8aa8', fontFamily: "'JetBrains Mono', monospace" }}
      >
        UPI · Cards · Wallet
      </span>
    </button>
  );
}

const PaymentLogo = ({ name }) => {
  const map = {
    'Wise': WiseLogo, 'PayPal': PayPalLogo, 'Remitly': RemitlyLogo,
    'Western Union': WesternUnionLogo, 'SWIFT Bank Transfer': SwiftLogo,
  };
  const C = map[name];
  return C ? <C size={28} /> : null;
};

/* ──────────────────────────────────────────
   International payment rails — every option
   ultimately settles into the same Indian
   Paytm-linked bank account.
   ────────────────────────────────────────── */
const INTL_RAILS = [
  {
    name: 'Wise',
    tagline: 'Best rate · 50+ currencies',
    detail: 'Send in your local currency to the Indian bank account below — funds Paytm directly.',
    href: 'https://wise.com/send-money/send-money-to-india',
    badge: 'Recommended',
  },
  {
    name: 'PayPal',
    tagline: 'Cards & PayPal balance',
    detail: 'Pay vartikashukla2000@yahoo.com — withdrawn to the Indian Paytm-linked account.',
    href: 'https://www.paypal.com/myaccount/transfer/homepage/pay',
  },
  {
    name: 'Remitly',
    tagline: 'Fast bank-to-bank transfer',
    detail: 'Quick INR settlement to the same Indian account funding Paytm.',
    href: 'https://www.remitly.com/us/en/india',
  },
  {
    name: 'Western Union',
    tagline: 'Global cash & bank pickup',
    detail: 'Settles to the linked HDFC account — Paytm wallet is funded automatically.',
    href: 'https://www.westernunion.com/in/en/send-money-to-india.html',
  },
  {
    name: 'SWIFT Bank Transfer',
    tagline: 'Direct international wire',
    detail: 'HDFC · A/C 02931140001114 · IFSC HDFC0000293 · SWIFT HDFCINBB',
    href: null,
  },
];

function InternationalRails() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border2)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-surface"
      >
        <Globe2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg2)' }}>
            Paying from outside India?
          </p>
          <p className="text-[12px] mt-1 font-light" style={{ color: 'var(--fg3)' }}>
            5 international rails · all fund the same Paytm account
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--fg3)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1" style={{ color: 'var(--fg2)' }}>
              <p className="text-[12px] leading-relaxed font-light mb-5" style={{ color: 'var(--fg3)' }}>
                Vartika receives all sessions through her Indian Paytm-linked bank account.
                Pick any rail below — your payment lands in the same place.
              </p>

              <div className="space-y-2">
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
                            <span
                              className="text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded"
                              style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
                            >
                              {rail.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] tracking-[0.18em] uppercase opacity-70 mb-1.5" style={{ color: 'var(--accent-text)' }}>
                          {rail.tagline}
                        </p>
                        <p className="text-[12px] leading-relaxed font-light" style={{ color: 'var(--fg2)' }}>
                          {rail.detail}
                        </p>
                      </div>
                      {rail.href && (
                        <ArrowRight
                          className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
                          style={{ color: 'var(--accent)' }}
                          strokeWidth={1.6}
                        />
                      )}
                    </div>
                  );
                  return rail.href ? (
                    <a key={rail.name} href={rail.href} target="_blank" rel="noopener noreferrer" className="block">
                      {Inner}
                    </a>
                  ) : (
                    <div key={rail.name}>{Inner}</div>
                  );
                })}
              </div>

              <div className="mt-5 pt-5 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <Send className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                <a
                  href="https://wa.me/919819962635"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="expand-link inline-flex items-center gap-2"
                >
                  Confirm with Vartika on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Booking() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: 'India', service: '', format: '', startDate: '', endDate: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const isIndia = form.country === 'India';

  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = [
      `Name: ${form.name}`,
      `Country: ${form.country}`,
      `Email: ${form.email}`,
      `Phone/WhatsApp: ${form.phone}`,
      `Service: ${form.service}`,
      `Format: ${form.format}`,
      `Start Date: ${form.startDate}`,
      `End Date: ${form.endDate || 'N/A'}`,
      `Notes: ${form.notes || 'None'}`,
    ].join('%0A');
    const subject = `Booking Request — ${form.service || 'Healing Session'}`;
    window.open(`mailto:vartikashukla@xyz.com?subject=${encodeURIComponent(subject)}&body=${lines}`);
    setSubmitted(true);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ═══ HERO with bg image ═══ */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1800&q=80"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--bg) 0%, transparent 50%, var(--bg-accent-section) 100%)' }} />
        </div>
        <div className="relative py-24 lg:py-32 px-8 lg:px-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[10px] tracking-[0.45em] uppercase mb-6"
            style={{ color: 'var(--accent-text)' }}
          >
            ◊ Begin Your Healing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hero-display text-5xl lg:text-7xl max-w-3xl"
            style={{ color: 'var(--fg)' }}
          >
            Book a session<br />
            <span style={{ color: 'var(--accent-text)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.02em' }}>
              with Vartika Shukla
            </span>
          </motion.h1>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            {[
              { icon: Shield, label: 'Secure UPI' },
              { icon: Sparkles, label: 'Personal reply in 24 hrs' },
              { icon: MapPin, label: 'Sector 56, Gurugram' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="max-w-6xl mx-auto px-8 lg:px-16 py-20 grid lg:grid-cols-5 gap-16 lg:gap-20">

        {/* ── Booking Form ── */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-10">
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <h2 className="text-sm tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>
              Session Details
            </h2>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start gap-5 py-12"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: 'var(--accent)' }} strokeWidth={1} />
              <h3 className="hero-display text-3xl" style={{ color: 'var(--fg)' }}>
                Your request has been sent
              </h3>
              <p className="text-sm font-light leading-relaxed max-w-sm" style={{ color: 'var(--fg2)' }}>
                Vartika will respond within 24 hours to confirm your appointment and share payment details. You can also reach her directly at{' '}
                <a href="tel:+919267904256" style={{ color: 'var(--accent-text)' }}>+91 9267904256</a>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs tracking-widest uppercase pb-1 hover:opacity-60 transition-opacity"
                style={{ color: 'var(--fg2)', borderBottom: '1px solid var(--border2)' }}
              >
                Submit another request
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-9">
              <div className="grid sm:grid-cols-2 gap-9">
                <Field label="Full Name *">
                  <input required value={form.name} onChange={set('name')} style={inputStyle} placeholder="Your full name" />
                </Field>
                <Field label="Email *">
                  <input required type="email" value={form.email} onChange={set('email')} style={inputStyle} placeholder="your@email.com" />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-9">
                <Field label="Country *">
                  <select required value={form.country} onChange={set('country')} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="India" style={{ background: 'var(--bg2)' }}>India</option>
                    <option value="Outside India" style={{ background: 'var(--bg2)' }}>Outside India</option>
                  </select>
                </Field>
                <Field label="WhatsApp / Phone *">
                  <input required value={form.phone} onChange={set('phone')} style={inputStyle} placeholder={isIndia ? '+91 ...' : '+ country code ...'} />
                </Field>
              </div>

              <Field label="Healing Service / Retreat *">
                <select required value={form.service} onChange={set('service')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" disabled style={{ background: 'var(--bg2)' }}>Select a service...</option>
                  {SERVICES.map(s => (
                    <option key={s} value={s} style={{ background: 'var(--bg2)' }}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Session Format *">
                <select required value={form.format} onChange={set('format')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" disabled style={{ background: 'var(--bg2)' }}>Preferred format...</option>
                  {FORMAT.map(f => (
                    <option key={f} value={f} style={{ background: 'var(--bg2)' }}>{f}</option>
                  ))}
                </select>
              </Field>

              <div className="grid sm:grid-cols-2 gap-9">
                <Field label="Preferred Start Date *">
                  <input required type="date" value={form.startDate} onChange={set('startDate')}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </Field>
                <Field label="End Date (for Retreats)">
                  <input type="date" value={form.endDate} onChange={set('endDate')}
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </Field>
              </div>

              <Field label="Intention / Notes">
                <textarea value={form.notes} onChange={set('notes')} rows={3}
                  placeholder="Share what you are seeking, any relevant context, or questions..."
                  style={{ ...inputStyle, resize: 'none', borderBottom: 'none', border: '1px solid var(--border2)', padding: '14px', borderRadius: '8px' }} />
              </Field>

              <motion.button
                whileHover={{ opacity: 0.92, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full sm:w-auto px-12 py-4 text-xs tracking-widest uppercase transition-all rounded-lg"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Send Booking Request →
              </motion.button>

              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--fg3)' }}>
                By submitting, you agree to be contacted by Quantum Healing Space to confirm your session details and payment.
              </p>
            </form>
          )}
        </div>

        {/* ── Info + Payment side panel ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Consultation fee card — both regions */}
          <div className="relative overflow-hidden rounded-xl p-7" style={{ background: 'var(--bg-accent-section)', border: '1px solid var(--accent-soft)' }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 opacity-10 pointer-events-none">
              <img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80" alt="" className="w-full h-full object-cover rounded-full" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>
              ◊ Consultation Fee
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg2)', border: isIndia ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--fg3)' }}>India</p>
                <p className="hero-display text-2xl" style={{ color: 'var(--fg)' }}>{PRICING.consultation.india.label}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg2)', border: !isIndia ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--fg3)' }}>Outside India</p>
                <p className="hero-display text-2xl" style={{ color: 'var(--fg)' }}>{PRICING.consultation.international.label}</p>
              </div>
            </div>
            <p className="text-[11px] font-light" style={{ color: 'var(--fg2)' }}>Fixed upfront · paid before the session is scheduled.</p>
          </div>

          {/* Treatment pricing card */}
          <div className="rounded-xl p-7" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>◊ Treatment Pricing</p>
            <div className="space-y-2.5">
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

          {/* Payment block */}
          <div className="rounded-xl p-7" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <h3 className="text-sm tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>Payment</h3>
              <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-soft)' }}>
                <Shield className="w-3 h-3" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--accent-text)' }}>Secure</span>
              </div>
            </div>

            {/* Paytm — accepts UPI / Cards / Wallet for India, AND every international rail below ultimately funds the same Paytm account */}
            <PaytmButton onClick={() => setShowQr(s => !s)} label={isIndia ? 'Continue with' : 'Pay India-side via'} />
            <p className="mt-3 text-[10px] tracking-[0.18em] uppercase text-center" style={{ color: 'var(--fg3)' }}>
              Trusted by 350M+ Indians · Receives global rails
            </p>

            {/* Helper note for non-India */}
            {!isIndia && (
              <p className="mt-4 text-[12px] font-light leading-relaxed text-center" style={{ color: 'var(--fg3)' }}>
                Outside India? Use any global rail below — they all settle into this same Paytm account ↓
              </p>
            )}

            {/* QR reveal */}
            <AnimatePresence initial={false}>
              {showQr && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 flex flex-col items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="p-4 rounded-lg" style={{ background: '#fff' }}>
                      <img src={UPI_QR} alt="Paytm UPI QR — Vartika Shukla" className="w-44 h-44 block" />
                    </div>
                    <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>
                      Scan with Paytm / GPay / PhonePe
                    </p>
                    <p className="text-[10px] font-mono opacity-50" style={{ color: 'var(--fg3)' }}>
                      9819962635@paytm
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* International payment rails — expandable, all fund the Paytm account */}
          <InternationalRails />

          {/* Other payment options — collapsed by default */}
          <details
            className="rounded-xl overflow-hidden group"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
          >
            <summary className="cursor-pointer flex items-center justify-between px-5 py-4 list-none hover-surface">
              <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg2)' }}>
                Other payment options
              </span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" style={{ color: 'var(--fg3)' }} />
            </summary>
            <div className="px-5 pb-5 pt-1 space-y-4 text-sm font-light" style={{ color: 'var(--fg2)' }}>
              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>Bank Transfer (HDFC)</p>
                <p>Vartika Shukla</p>
                <p className="text-[12px] opacity-60">A/C 02931140001114 · IFSC HDFC0000293</p>
              </div>
              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>Paytm</p>
                <p>9819962635</p>
              </div>
              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>PayPal — international</p>
                <p>vartikashukla2000@yahoo.com</p>
              </div>
            </div>
          </details>

          {/* Direct contact */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>Direct Contact</p>
            <a
              href="https://wa.me/919267904256"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light block mb-2 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent-text)' }}
            >
              WhatsApp · +91 9267904256 →
            </a>
            <a
              href="mailto:vartikashukla@xyz.com"
              className="text-sm font-light block hover:opacity-70 transition-opacity"
              style={{ color: 'var(--fg2)' }}
            >
              vartikashukla@xyz.com
            </a>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
