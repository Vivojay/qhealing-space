import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Globe2,
  MapPin,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';
import { PaytmLogo, WiseLogo, PayPalLogo, RemitlyLogo, WesternUnionLogo, SwiftLogo } from '@/components/BrandLogos';
import { useTheme } from '@/context/ThemeContext';
import { PRICING } from '@/constants/pricing';
import { ALL_BOOKABLE_SERVICES, BOOKING_SERVICE_ALIASES } from '@/data/serviceCatalog';
import { apiUrl } from '@/utils';

const FORMAT = ['In-person (Gurugram)', 'Online - WhatsApp', 'Online - Skype'];
const UPI_QR = apiUrl('/api/payments/upi-qr/booking-consultation');
const SERVICES = ALL_BOOKABLE_SERVICES;

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

const INTL_RAILS = [
  { name: 'Wise', tagline: 'Fast international transfer', detail: 'Outside-India checkout will be enabled here once the rail is activated.', icon: WiseLogo },
  { name: 'PayPal', tagline: 'Cards and balance', detail: 'This rail will appear here once international payments are turned on.', icon: PayPalLogo },
  { name: 'Remitly', tagline: 'Bank-to-bank transfer', detail: 'This rail is reserved for the upcoming outside-India flow.', icon: RemitlyLogo },
  { name: 'Western Union', tagline: 'Global transfer option', detail: 'This rail is reserved for the upcoming outside-India flow.', icon: WesternUnionLogo },
  { name: 'SWIFT Bank Transfer', tagline: 'Wire transfer option', detail: 'This rail is reserved for the upcoming outside-India flow.', icon: SwiftLogo },
];

function normalizeService(value) {
  return value
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9/'&\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function PaymentLogo({ Icon }) {
  return Icon ? <Icon size={28} /> : null;
}

function PaytmButton({ onClick, label = 'Continue with' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl overflow-hidden transition-all"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,46,110,0.18)',
        color: '#002E6E',
        boxShadow: '0 1px 2px rgba(0,46,110,0.08), 0 2px 8px rgba(0,46,110,0.06)',
      }}
    >
      <span className="inline-flex items-center gap-2 min-w-0">
        <span className="text-[11px] sm:text-[11.5px] font-medium whitespace-nowrap" style={{ color: '#5b6b85', letterSpacing: '-0.01em' }}>
          {label}
        </span>
        <span className="h-3.5 w-px" style={{ background: 'rgba(0, 46, 110, 0.2)' }} />
        <PaytmLogo size={58} />
      </span>
      <span className="text-[8px] sm:text-[8.5px] tracking-[0.12em] uppercase whitespace-nowrap text-right" style={{ color: '#7a8aa8', fontFamily: "'JetBrains Mono', monospace" }}>
        UPI · Cards · Wallet
      </span>
    </button>
  );
}

function InternationalRails() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{ background: 'var(--bg-elev)', border: '1px solid var(--border2)' }}
    >
      <div className="absolute right-4 top-4 z-[2] pointer-events-none">
        <span
          className="px-2.5 py-1 rounded-full text-[9px] tracking-[0.22em] uppercase"
          style={{ background: 'var(--bg2)', color: 'var(--accent-text)', border: '1px solid var(--accent-soft)' }}
        >
          Coming Soon
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center gap-3 px-5 py-4 pr-24 text-left hover-surface"
      >
        <Globe2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg2)' }}>
            Paying from outside India?
          </p>
          <p className="text-[12px] mt-1 font-light" style={{ color: 'var(--fg3)' }}>
            International payment options are coming soon.
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
                These rails are visible for reference only right now. They remain disabled until
                the outside-India flow is activated.
              </p>

              <div className="space-y-2">
                {INTL_RAILS.map((rail) => (
                  <div
                    key={rail.name}
                    className="group relative flex items-start gap-4 p-3.5 rounded-lg transition-all"
                    style={{ border: '1px solid var(--border)', opacity: 0.58 }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <PaymentLogo Icon={rail.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--fg)' }}>
                          {rail.name}
                        </span>
                      </div>
                      <p className="text-[10.5px] tracking-[0.18em] uppercase opacity-70 mb-1.5" style={{ color: 'var(--accent-text)' }}>
                        {rail.tagline}
                      </p>
                      <p className="text-[12px] leading-relaxed font-light" style={{ color: 'var(--fg2)' }}>
                        {rail.detail}
                      </p>
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-lg"
                      style={{ background: 'rgba(9, 12, 19, 0.62)' }}
                    >
                      <span
                        className="px-3 py-1 rounded-full text-[10px] tracking-[0.22em] uppercase"
                        style={{ background: 'var(--bg2)', color: 'var(--accent-text)', border: '1px solid var(--accent-soft)' }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <Send className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                <a
                  href="https://wa.me/919819962635"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="expand-link inline-flex items-center gap-2"
                >
                  Ask Vartika on WhatsApp
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
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    phone: '',
    country: 'India',
    service: '',
    format: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [serviceAutoFilled, setServiceAutoFilled] = useState(false);

  const serviceParam = (searchParams.get('service') || '').trim();
  const isIndia = form.country === 'India';

  useEffect(() => {
    if (!serviceParam) {
      setServiceAutoFilled(false);
      return;
    }
    const key = normalizeService(serviceParam);
    const mapped =
      BOOKING_SERVICE_ALIASES[key] ||
      SERVICES.find((option) => normalizeService(option) === key);
    if (!mapped) {
      setServiceAutoFilled(false);
      return;
    }
    setForm((prev) => (prev.service === mapped ? prev : { ...prev, service: mapped }));
    setServiceAutoFilled(true);
  }, [serviceParam]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setService = (event) => {
    setForm((prev) => ({ ...prev, service: event.target.value }));
    setServiceAutoFilled(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const lines = [
      `Country: ${form.country}`,
      `Phone/WhatsApp: ${form.phone}`,
      `Service: ${form.service}`,
      `Format: ${form.format}`,
      `Start Date: ${form.startDate}`,
      `End Date: ${form.endDate || 'N/A'}`,
      `Notes: ${form.notes || 'None'}`,
    ].join('%0A');
    const subject = `Booking Request - ${form.service || 'Healing Session'}`;
    window.open(`mailto:vartikashukla@xyz.com?subject=${encodeURIComponent(subject)}&body=${lines}`);
    setSubmitted(true);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <style>{`
        .qhs-date-input::-webkit-calendar-picker-indicator {
          filter: ${isDark ? 'invert(1) opacity(0.72)' : 'invert(0) opacity(0.82)'};
        }
      `}</style>

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
            Book a session
            <br />
            <span
              style={{
                color: 'var(--accent-text)',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontWeight: 300,
                letterSpacing: '-0.02em',
              }}
            >
              with Vartika Shukla
            </span>
          </motion.h1>

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
                <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg2)' }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 lg:px-16 py-20 grid lg:grid-cols-5 gap-16 lg:gap-20">
        <div className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-10">
            <Calendar className="w-4 h-4" style={{ color: isDark ? 'var(--accent)' : 'var(--fg)' }} strokeWidth={1.5} />
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
                Vartika will respond within 24 hours to confirm your appointment and share the next
                step. You can also reach her directly at <a href="tel:+919267904256" style={{ color: 'var(--accent-text)' }}>+91 9267904256</a>.
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
                <div
                  className="rounded-lg transition-all"
                  style={serviceAutoFilled ? {
                    background: 'linear-gradient(180deg, var(--accent-soft), transparent 78%)',
                    border: '1px solid var(--accent-soft)',
                    padding: '10px 12px 8px',
                  } : undefined}
                >
                  <select
                    required
                    value={form.service}
                    onChange={setService}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                      borderBottom: serviceAutoFilled ? '1px solid var(--accent)' : inputStyle.borderBottom,
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--bg2)' }}>Select a service...</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service} style={{ background: 'var(--bg2)' }}>
                        {service}
                      </option>
                    ))}
                  </select>
                  {serviceAutoFilled && (
                    <p className="text-[10px] tracking-[0.18em] uppercase mt-2" style={{ color: 'var(--accent-text)' }}>
                      Auto-selected from service card
                    </p>
                  )}
                </div>
              </Field>

              <Field label="Session Format *">
                <select required value={form.format} onChange={set('format')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="" disabled style={{ background: 'var(--bg2)' }}>Preferred format...</option>
                  {FORMAT.map((format) => (
                    <option key={format} value={format} style={{ background: 'var(--bg2)' }}>
                      {format}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid sm:grid-cols-2 gap-9">
                <Field label="Preferred Start Date *">
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={set('startDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="qhs-date-input"
                    style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }}
                  />
                </Field>

                <Field label="End Date (for Retreats)">
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={set('endDate')}
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    className="qhs-date-input"
                    style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }}
                  />
                </Field>
              </div>

              <Field label="Intention / Notes">
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  placeholder="Share what you are seeking, any relevant context, or questions..."
                  style={{ ...inputStyle, resize: 'none', borderBottom: 'none', border: '1px solid var(--border2)', padding: '14px', borderRadius: '8px' }}
                />
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
                By submitting, you agree to be contacted by Quantum Healing Space to confirm your
                session details and payment.
              </p>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="relative overflow-hidden rounded-xl p-7" style={{ background: 'var(--bg-accent-section)', border: '1px solid var(--accent-soft)' }}>
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
            <p className="text-[11px] font-light" style={{ color: 'var(--fg2)' }}>
              Fixed upfront · paid at checkout.
            </p>
          </div>

          <div className="rounded-xl p-7" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <h3 className="text-sm tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>Payment</h3>
              <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-soft)' }}>
                <Shield className="w-3 h-3" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--accent-text)' }}>Secure</span>
              </div>
            </div>

            <PaytmButton onClick={() => setShowQr((value) => !value)} label={isIndia ? 'Continue with' : 'India checkout via'} />
            <p className="mt-2 text-[9px] tracking-[0.14em] uppercase text-center" style={{ color: 'var(--fg3)' }}>
              Trusted by 350M+ Indians
            </p>

            <AnimatePresence initial={false}>
              {showQr && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}>
                    <p className="text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>
                      Booking consultation QR
                    </p>
                    <div className="rounded-xl p-4 flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f6f7fb' }}>
                      <img src={UPI_QR} alt="Booking consultation payment QR" className="w-full max-w-[250px] rounded-lg" />
                    </div>
                    <p className="mt-3 text-[12px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                      This QR is for the booking consultation fee. Outside-India payments are not
                      enabled yet, so please use this only for India-side payment.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <InternationalRails />
        </div>
      </div>

      <Footer />
    </div>
  );
}
