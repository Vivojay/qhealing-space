import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, CreditCard, Shield, Globe2, MessageCircle, ChevronDown, Sparkles, MapPin } from 'lucide-react';
import Footer from '@/components/wellness/Footer';

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
   Google Pay branded button (trust signal)
   ────────────────────────────────────────── */
function GPayButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl overflow-hidden transition-all"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.12)',
        color: '#3c4043',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      {/* Google G + "Pay" mark */}
      <span className="text-sm font-medium tracking-tight inline-flex items-center gap-1.5">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
        </svg>
        <span style={{ color: '#5f6368' }}>Continue with</span>
        <span style={{ fontWeight: 600, color: '#3c4043' }}>Pay</span>
      </span>
      <span
        className="ml-auto text-[10px] tracking-[0.25em] uppercase"
        style={{ color: '#80868b', fontFamily: "'JetBrains Mono', monospace" }}
      >
        UPI
      </span>
    </button>
  );
}

/* ──────────────────────────────────────────
   International disclaimer — expandable card
   ────────────────────────────────────────── */
function InternationalNotice() {
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
            Outside India?
          </p>
          <p className="text-[12px] mt-1 font-light" style={{ color: 'var(--fg3)' }}>
            Tap to read how to reach Vartika directly
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-[13px] leading-relaxed font-light" style={{ color: 'var(--fg2)' }}>
              <p className="mb-3">
                Online UPI / Google Pay currently works for Indian bank accounts only. For all friends from outside India, please reach Vartika directly on WhatsApp — she will personally arrange a session, share fees in your local currency, and accept payment via{' '}
                <span style={{ color: 'var(--fg)' }}>PayPal</span> or{' '}
                <span style={{ color: 'var(--fg)' }}>international bank transfer</span>.
              </p>
              <a
                href="https://wa.me/919819962635"
                target="_blank"
                rel="noopener noreferrer"
                className="expand-link inline-flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Message Vartika on WhatsApp
              </a>
              <p className="mt-4 text-[11px] opacity-60">
                +91 98199 62635 · responds within 24 hrs
              </p>
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

          {/* Fee card with bg image */}
          <div className="relative overflow-hidden rounded-xl p-8" style={{ background: 'var(--bg-accent-section)', border: '1px solid var(--accent-soft)' }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 opacity-10 pointer-events-none">
              <img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80" alt="" className="w-full h-full object-cover rounded-full" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>
              ◊ Consultation Fee
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="hero-display text-5xl" style={{ color: 'var(--fg)' }}>₹2,000</span>
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: 'var(--fg2)' }}>fixed · upfront</span>
            </div>
            <p className="text-[12px] mt-3 font-light" style={{ color: 'var(--fg2)' }}>
              For Indian clients, paid via UPI / Google Pay before the session is scheduled.
            </p>
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

            {/* Google Pay button — disabled if outside India */}
            <GPayButton disabled={!isIndia} onClick={() => setShowQr(s => !s)} />
            <p className="mt-3 text-[10px] tracking-[0.18em] uppercase text-center" style={{ color: 'var(--fg3)' }}>
              Backed by Google Pay · Trusted by millions
            </p>

            {/* Disabled note for non-India */}
            {!isIndia && (
              <p className="mt-4 text-[12px] font-light leading-relaxed text-center" style={{ color: 'var(--fg3)' }}>
                UPI is unavailable for clients outside India — see options below ↓
              </p>
            )}

            {/* QR reveal */}
            <AnimatePresence initial={false}>
              {showQr && isIndia && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 flex flex-col items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="p-4 rounded-lg" style={{ background: '#fff' }}>
                      <img src={UPI_QR} alt="UPI QR — Vartika Shukla" className="w-44 h-44 block" />
                    </div>
                    <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>
                      Scan with any UPI app
                    </p>
                    <p className="text-[10px] font-mono opacity-50" style={{ color: 'var(--fg3)' }}>
                      9819962635@paytm
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* International notice — expandable */}
          <InternationalNotice />

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
