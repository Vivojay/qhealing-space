import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, CreditCard } from 'lucide-react';
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
  'Ho\'oponopono',
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
  'Children\'s Healing Workshop',
  'Other / Not sure yet',
];

const FORMAT = ['In-person (Gurugram)', 'Online — WhatsApp', 'Online — Skype'];

const inputStyle = {
  background: 'transparent',
  color: 'var(--fg)',
  borderBottom: '1px solid var(--border2)',
  outline: 'none',
  paddingBottom: '10px',
  paddingTop: '6px',
  fontSize: '14px',
  fontFamily: 'Space Grotesk, sans-serif',
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

export default function Booking() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', format: '', startDate: '', endDate: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = [
      `Name: ${form.name}`,
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

      {/* Hero */}
      <div className="relative py-20 px-8 lg:px-16 pt-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[10px] tracking-[0.45em] uppercase mb-5"
          style={{ color: 'var(--fg3)' }}
        >
          Begin Your Healing
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl lg:text-6xl font-light leading-tight max-w-2xl"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--fg)' }}
        >
          Book a Session<br />
          <em style={{ color: 'var(--accent-text)' }}>with Vartika Shukla</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-6 text-sm font-light leading-relaxed max-w-lg"
          style={{ color: 'var(--fg2)' }}
        >
          Fill the form below and Vartika will personally respond within 24 hours to confirm your appointment and share further details.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-8 lg:px-16 py-16 grid lg:grid-cols-5 gap-16 lg:gap-20">

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
              <h3 className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--fg)' }}>
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
              <Field label="WhatsApp / Phone *">
                <input required value={form.phone} onChange={set('phone')} style={inputStyle} placeholder="+91 ..." />
              </Field>

              <Field label="Healing Service / Retreat *">
                <select
                  required
                  value={form.service}
                  onChange={set('service')}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="" disabled style={{ background: '#1c1917' }}>Select a service...</option>
                  {SERVICES.map(s => (
                    <option key={s} value={s} style={{ background: '#1c1917' }}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Session Format *">
                <select
                  required
                  value={form.format}
                  onChange={set('format')}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="" disabled style={{ background: '#1c1917' }}>Preferred format...</option>
                  {FORMAT.map(f => (
                    <option key={f} value={f} style={{ background: '#1c1917' }}>{f}</option>
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
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </Field>
                <Field label="End Date (for Retreats)">
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={set('endDate')}
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </Field>
              </div>

              <Field label="Intention / Notes">
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  placeholder="Share what you are seeking, any relevant context, or questions..."
                  style={{ ...inputStyle, resize: 'none', borderBottom: 'none', border: '1px solid var(--border2)', padding: '14px' }}
                />
              </Field>

              <motion.button
                whileHover={{ opacity: 0.85 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full sm:w-auto px-12 py-4 text-xs tracking-widest uppercase transition-opacity"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Send Booking Request
              </motion.button>

              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--fg3)' }}>
                By submitting, you agree to be contacted by Quantum Healing Space to confirm your session details and payment.
              </p>
            </form>
          )}
        </div>

        {/* ── Info + Payment ── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Session info */}
          <div className="p-8" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-soft)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--accent)' }}>
              Good to Know
            </p>
            <ul className="space-y-4 text-sm font-light" style={{ color: 'var(--fg2)' }}>
              <li className="flex gap-3">
                <span style={{ color: 'var(--accent)' }}>→</span>
                Consultations: <span style={{ color: 'var(--fg)' }}>₹1,000 (India) · USD 3 (international)</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--accent)' }}>→</span>
                Booking deposit for in-person: ₹500 / USD 3
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--accent)' }}>→</span>
                Distance sessions: full payment 24 hrs in advance
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--accent)' }}>→</span>
                Both in-person and online sessions available
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--accent)' }}>→</span>
                Response within 24 hours of submission
              </li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <CreditCard className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <h3 className="text-sm tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>Payment</h3>
            </div>

            {/* QR Code placeholder */}
            <div
              className="w-full aspect-square max-w-[200px] flex flex-col items-center justify-center mb-8 mx-auto"
              style={{ border: '2px dashed var(--accent-soft)', background: 'var(--bg2)' }}
            >
              <div className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-sm" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-soft)' }} />
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>
                  QR Code
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--fg3)' }}>
                  Coming soon
                </p>
              </div>
            </div>

            <div className="space-y-5 text-sm font-light" style={{ color: 'var(--fg2)' }}>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>Bank Transfer</p>
                <p>Vartika Shukla</p>
                <p style={{ color: 'var(--fg3)', fontSize: '12px' }}>A/C: 02931140001114</p>
                <p style={{ color: 'var(--fg3)', fontSize: '12px' }}>IFSC: HDFC0000293</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>Paytm</p>
                <p>9819962635</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>PayPal</p>
                <p>vartikashukla2000@yahoo.com</p>
              </div>
            </div>
          </div>

          {/* Direct contact */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>Direct Contact</p>
            <a
              href="https://wa.me/919267904256"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light block mb-2 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent-text)' }}
            >
              WhatsApp: +91 9267904256 →
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
