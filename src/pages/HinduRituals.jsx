import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';
import { getVedicCategory } from '@/data/serviceCatalog';

const RITUAL_IMAGES = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=90',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=90',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=90',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=90',
  'https://images.unsplash.com/photo-1502810365585-56ffa361fdde?w=900&q=90',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=90',
];

function Mandala({ size = 480, opacity = 0.08, reverse = false, className = '' }) {
  const cx = 100;
  const cy = 100;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`${reverse ? 'mandala-rotate-rev' : 'mandala-rotate'} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g strokeWidth="0.42" opacity="0.95">
          {[98, 92, 86, 78, 70, 60, 50, 38, 26, 14].map((r) => (
            <circle key={`ring-${r}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g strokeWidth="0.48" opacity="0.85">
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={`spoke-${i}`} x1={cx} y1={cy - 98} x2={cx} y2={cy - 26} transform={`rotate(${i * 15} ${cx} ${cy})`} />
          ))}
        </g>
        <g strokeWidth="0.52" opacity="0.8">
          {Array.from({ length: 32 }).map((_, i) => (
            <ellipse key={`petal-${i}`} cx={cx} cy={cy - 76} rx="4.8" ry="16.5" transform={`rotate(${i * 11.25} ${cx} ${cy})`} />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <ellipse key={`inner-petal-${i}`} cx={cx} cy={cy - 54} rx="4.6" ry="12" transform={`rotate(${i * 22.5} ${cx} ${cy})`} />
          ))}
        </g>
        <g strokeWidth="0.56" opacity="0.82">
          {[0, 40, 80, 120, 160].map((angle) => (
            <polygon key={`tri-up-${angle}`} points="100,18 154,140 46,140" transform={`rotate(${angle} ${cx} ${cy})`} />
          ))}
          {[20, 60, 100, 140, 180].map((angle) => (
            <polygon key={`tri-down-${angle}`} points="100,182 42,62 158,62" transform={`rotate(${angle} ${cx} ${cy})`} />
          ))}
        </g>
        <g fill="currentColor" stroke="none" opacity="0.6">
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i * 7.5 * Math.PI) / 180;
            const r = i % 2 ? 84 : 66;
            return <circle key={`dot-${i}`} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={i % 4 === 0 ? 1.2 : 0.8} />;
          })}
        </g>
        <g strokeWidth="0.78" opacity="0.9">
          <circle cx={cx} cy={cy} r="6" />
          <circle cx={cx} cy={cy} r="2.8" />
        </g>
      </g>
    </svg>
  );
}

function OmGlyph({ size = 56, opacity = 0.9, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }} aria-hidden="true">
      <text x="50" y="68" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="64" fontWeight="300" fill={color}>
        ॐ
      </text>
    </svg>
  );
}

export default function HinduRituals() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const category = useMemo(() => getVedicCategory(), []);
  const rituals = useMemo(() => {
    const services = category?.services || [];
    return services.map((service, index) => ({
      name: service.name,
      sanskrit: 'वैदिक अनुष्ठान',
      time: service.duration,
      description: service.description,
      mantra: 'Guided Ritual',
      image: RITUAL_IMAGES[index % RITUAL_IMAGES.length],
    }));
  }, [category]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div ref={heroRef} className="relative h-[72vh] overflow-hidden" style={{ background: '#1a0e00' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=90"
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0c0a09 0%, rgba(26,14,0,0.55) 55%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 30%, rgba(220,140,60,0.25), transparent 55%)' }} />
        <div className="absolute -right-32 -top-32 pointer-events-none" style={{ color: '#FAD58A' }}>
          <Mandala size={640} opacity={0.13} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="text-[10px] tracking-[0.45em] uppercase" style={{ color: 'rgba(250,200,100,0.6)' }}>
                ◊ Vedic Traditions
              </span>
              <span className="h-px w-12" style={{ background: 'rgba(250,200,100,0.4)' }} />
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(250,200,100,0.4)' }}>
                सनातन धर्म
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="hero-display text-6xl lg:text-[8.5rem]"
              style={{ color: '#fafaf9', lineHeight: 0.88 }}
            >
              Vedic{' '}
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.03em', color: 'rgba(250,200,120,0.95)' }}>
                Rituals
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55 }}
              className="mt-6 max-w-xl text-[15px] font-light leading-relaxed"
              style={{ color: 'rgba(250,245,235,0.7)' }}
            >
              Every section below is now drawn from the Vedic Rituals & Pujas table in the shared services catalog.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden py-8" style={{ background: 'var(--bg-accent-orange)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {[...rituals, ...rituals, ...rituals].map((r, i) => (
            <span
              key={i}
              className="text-3xl lg:text-5xl"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, color: 'var(--orange-deep)', letterSpacing: '-0.02em' }}
            >
              {r.name} <span style={{ opacity: 0.4 }}>·</span> <span className="font-sans" style={{ fontStyle: 'normal', fontWeight: 400 }}>{r.sanskrit}</span> <span style={{ opacity: 0.4 }}>·</span>
            </span>
          ))}
        </motion.div>
      </div>

      {rituals.map((ritual, i) => {
        const isAccent = i % 2 === 1;
        const reversed = i % 2 === 1;
        return (
          <section key={ritual.name} className={`relative overflow-hidden py-28 lg:py-40 ${isAccent ? 'section-orange' : ''}`} style={{ borderTop: '1px solid var(--border)' }}>
            <div className={`absolute pointer-events-none ${reversed ? '-left-40 -bottom-40' : '-right-40 -top-40'}`} style={{ color: isAccent ? 'var(--orange-deep)' : 'var(--accent)' }}>
              <Mandala size={520} opacity={isAccent ? 0.08 : 0.05} reverse={reversed} />
            </div>

            <div className={`absolute ${reversed ? 'right-8 lg:right-16' : 'left-8 lg:left-16'} top-12 hero-display select-none pointer-events-none`} style={{ fontSize: '11rem', lineHeight: 1, color: 'var(--fg)', opacity: 0.04, fontWeight: 300 }}>
              0{i + 1}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-7xl mx-auto px-8 lg:px-16 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center"
            >
              <div className={`lg:col-span-7 ${reversed ? 'lg:order-2' : ''}`}>
                <div className="relative overflow-hidden aspect-[4/3] rounded-sm">
                  <motion.img src={ritual.image} alt={ritual.name} className="w-full h-full object-cover" whileHover={{ scale: 1.04 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
                  <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(220,140,60,0.18), transparent 60%)' }} />
                  <div className="absolute bottom-4 left-4 right-4 px-4 py-2 backdrop-blur-md rounded-sm flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <span className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'rgba(250,200,100,0.75)' }}>
                      Booking Path
                    </span>
                    <Link
                      to={`/booking?service=${encodeURIComponent(ritual.name)}`}
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 400, color: '#fafaf9', fontSize: '18px' }}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-5 ${reversed ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <OmGlyph size={36} color="var(--orange-deep)" />
                  <div>
                    <p className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--orange-deep)', lineHeight: 1 }}>
                      {ritual.sanskrit}
                    </p>
                    <p className="text-[10px] tracking-[0.3em] uppercase mt-2" style={{ color: 'var(--fg3)' }}>
                      {ritual.time}
                    </p>
                  </div>
                </div>

                <h2 className="hero-display text-5xl lg:text-6xl mb-8" style={{ color: 'var(--fg)' }}>
                  {ritual.name}
                </h2>

                <p className="text-[15px] font-light leading-relaxed mb-8" style={{ color: 'var(--fg2)' }}>
                  {ritual.description}
                </p>

                <div className="pt-8" style={{ borderTop: '1px solid var(--border2)' }}>
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>
                    Service Format
                  </p>
                  <p className="text-4xl lg:text-5xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--orange-deep)', letterSpacing: '-0.01em' }}>
                    {ritual.mantra}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        );
      })}

      <section className="relative overflow-hidden py-32 lg:py-48 flex items-center justify-center" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: 'var(--orange-deep)' }}>
          <Mandala size={900} opacity={0.07} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: 'var(--accent)' }}>
          <Mandala size={620} opacity={0.05} reverse />
        </div>

        <div className="relative text-center max-w-3xl px-8">
          <OmGlyph size={84} color="var(--orange-deep)" opacity={0.8} />
          <p className="mt-6 text-[10px] tracking-[0.45em] uppercase" style={{ color: 'var(--orange-deep)' }}>
            ◊ Ritual Guidance
          </p>
          <h2 className="mt-6 text-4xl lg:text-6xl leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, color: 'var(--fg)' }}>
            Vedic service selection
          </h2>
          <p className="mt-8 text-[14px] font-light leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--fg2)' }}>
            These ritual cards now represent the exact rows from the Vedic Rituals & Pujas services table and each one continues directly into booking.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
