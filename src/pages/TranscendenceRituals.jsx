import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/wellness/Footer';
import { useTheme } from '@/context/ThemeContext';

const SMOOTH = { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

const FAQ_ITEMS = [
  {
    number: '01',
    phase: 'Charges',
    title: 'What are the consultation charges?',
    description:
      'The consultation charge is INR 1000 for clients in India and 3 USD for clients outside India. This is the initial paid step before the detailed service flow is confirmed.',
    duration: 'Pricing',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=90',
  },
  {
    number: '02',
    phase: 'Distance Work',
    title: 'Do you offer long-distance healing sessions?',
    description:
      'Yes. Long-distance healing sessions are available and are offered with the same care and process as in-person work, depending on the modality selected.',
    duration: 'Remote',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=900&q=90',
  },
  {
    number: '03',
    phase: 'Payments',
    title: 'Which payment modes are available?',
    description:
      'India-side payments are currently supported through the active local checkout flow. Payments from outside India are being prepared and will be enabled soon.',
    duration: 'Payments',
    image: 'https://images.unsplash.com/photo-1502810365585-56ffa361fdde?w=900&q=90',
  },
  {
    number: '04',
    phase: 'Workshops',
    title: 'Are workshops available through WhatsApp or Skype?',
    description:
      'Yes. Workshops and guided sessions can be coordinated online through WhatsApp or Skype when the format is suitable for that service.',
    duration: 'Online',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=90',
  },
  {
    number: '05',
    phase: 'Booking',
    title: 'How do I book a reading or session?',
    description:
      'Use the relevant service or ritual card and continue to the booking page. The booking form can auto-select the service for you and route your request into the correct flow.',
    duration: 'Process',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=90',
  },
  {
    number: '06',
    phase: 'Format',
    title: 'Is an in-person reading necessary, or can it be done remotely?',
    description:
      'Both are possible. Some clients prefer in-person work, while many readings and sessions can be conducted remotely depending on the modality and your preference.',
    duration: 'Format',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=900&q=90',
  },
  {
    number: '07',
    phase: 'Boundaries',
    title: 'Are there any restrictions on the type of questions I can ask?',
    description:
      'Please keep questions clear, sincere, and respectful. The session is best used for guidance, healing, and insight rather than harmful intent or invasive requests about third parties.',
    duration: 'Guidelines',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=90',
  },
];

function Mandala({ size = 320, reverse = false, color = 'var(--accent)' }) {
  const cx = 100;
  const cy = 100;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={reverse ? 'mandala-rotate-rev' : 'mandala-rotate'} style={{ opacity: 0.16 }} aria-hidden="true">
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <g strokeWidth="0.9" opacity="0.9">
          {[90, 62, 34].map((r) => <circle key={`ring-${r}`} cx={cx} cy={cy} r={r} />)}
        </g>
        <g strokeWidth="0.75" opacity="0.62">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`spoke-${i}`} x1={cx} y1={cy - 90} x2={cx} y2={cy - 34} transform={`rotate(${i * 45} ${cx} ${cy})`} />
          ))}
        </g>
        <g strokeWidth="1.2" opacity="0.7">
          <path d="M100 10 A90 90 0 0 1 190 100" />
          <path d="M100 190 A90 90 0 0 1 10 100" />
        </g>
        <g strokeWidth="1" opacity="0.78">
          <circle cx={cx} cy={cy} r="9" />
        </g>
      </g>
    </svg>
  );
}

export default function TranscendenceRituals() {
  const [activePhase, setActivePhase] = useState(0);
  const { isDark } = useTheme();
  const current = FAQ_ITEMS[activePhase];
  const heroOverlayBackground = isDark
    ? 'linear-gradient(to bottom, transparent, rgba(12,10,9,0.35), var(--bg))'
    : 'linear-gradient(to bottom, transparent 0%, rgba(12,10,9,0.2) 74%, rgba(244,242,236,0.58) 90%, var(--bg) 100%)';

  return (
    <div style={{ background: 'var(--transcendence-rituals-bg)', minHeight: '100vh', color: 'var(--fg)' }}>
      <div className="relative h-[78vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div className="absolute inset-0 scale-110">
          {/* <img src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1800&q=90" alt="FAQ" className="w-full h-full object-cover opacity-60" /> */}
          <img src="https://images.unsplash.com/photo-1593067243214-b2e1be0aff8b" alt="FAQ" className="w-full h-full object-cover opacity-60" />
        </motion.div>
        <div className="absolute inset-0" style={{ background: heroOverlayBackground }} />
        <div className="absolute -right-32 -top-20 pointer-events-none">
          <Mandala size={520} color="#fff" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-xs tracking-[0.5em] uppercase mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
            ◊ Guidance Notes
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} className="hero-display text-6xl lg:text-8xl text-white tracking-tight leading-none mb-6">
            Frequently
            <br />
            <span className="italic" style={{ color: '#9CC8E6' }}>Asked Questions</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="font-light max-w-lg text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            The same visual shell as the earlier route, now carrying the current FAQ content.
          </motion.p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="absolute -left-8 lg:left-4 top-12 hero-display select-none pointer-events-none" style={{ fontSize: '13rem', lineHeight: 1, color: '#f8eaea', opacity: 0.04, fontWeight: 300 }}>
          {current.number}
        </div>

        <div className="relative grid lg:grid-cols-5 gap-12 lg:gap-0">
          <div className="lg:col-span-2 lg:pr-16 lg:border-r" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <p className="text-xs tracking-[0.4em] uppercase mb-10" style={{ color: '#9CC8E6' }}>
              ◊ FAQ Index
            </p>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, i) => {
                const active = activePhase === i;
                return (
                  <button key={item.number} onClick={() => setActivePhase(i)} className="w-full text-left group">
                    <motion.div className="flex items-center gap-6 py-5 transition-colors duration-300" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} whileHover={{ x: 4 }} transition={SMOOTH}>
                      <span className="text-xs font-mono transition-colors duration-300" style={{ color: active ? '#9CC8E6' : 'rgba(245, 246, 250, 0.22)' }}>
                        {item.number}
                      </span>
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase mb-1 transition-colors duration-300" style={{ color: active ? '#9CC8E6' : 'rgba(245, 246, 250, 0.22)' }}>
                          {item.phase}
                        </p>
                        <p className="text-lg font-light transition-colors duration-300" style={{ color: active ? 'rgba(245, 246, 250, 0.94)' : 'rgba(245, 246, 250, 0.55)' }}>
                          {item.title}
                        </p>
                      </div>
                      <span className="ml-auto text-xs transition-colors duration-300" style={{ color: active ? 'rgba(245, 246, 250, 0.55)' : 'rgba(245, 246, 250, 0.22)' }}>
                        {item.duration}
                      </span>
                    </motion.div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 lg:pl-16 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SMOOTH}
              >
                <div className="aspect-[16/10] overflow-hidden mb-10 rounded-sm relative">
                  <img src={current.image} alt={current.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{ background: 'linear-gradient(135deg, navy, transparent 70%)', opacity: 0.7 }} />
                </div>
                <p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: '#9CC8E6' }}>
                  {current.phase}
                </p>
                <h2 className="hero-display text-4xl mb-6" style={{ color: '#F5F6FA', opacity: '0.94' }}>
                  {current.title}
                </h2>
                <p className="font-light leading-relaxed text-[15px] max-w-2xl" style={{ color: '#F5F6FA', opacity: '0.55' }}>
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative py-32 overflow-hidden text-center" style={{ borderTop: '1px solid var(--border)', background: '#928c82' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: '#9CC8E6' }}>
          <Mandala size={560} reverse />
        </div>
        <div className="relative px-8">
          <p className="text-[10px] tracking-[0.45em] uppercase mb-5" style={{ color: '#f6f7fb' }}>
            ◊ Still unsure?
          </p>
          <h2 className="hero-display text-4xl lg:text-6xl" style={{ color: '#fff' }}>
            Start with the service
            <span className="italic" style={{ color: '#d7ebff' }}> that feels closest</span>
          </h2>
        </div>
      </div>

      <Footer />
    </div>
  );
}
