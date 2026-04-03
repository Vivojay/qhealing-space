import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/wellness/Footer';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=95',
    label: 'Transcendence',
    tagline: 'Beyond the Ordinary',
  },
  {
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=2000&q=95',
    label: 'Ceremony',
    tagline: 'Ancient & Sacred',
  },
  {
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=2000&q=95',
    label: 'Earth',
    tagline: 'Rooted in Nature',
  },
];

const links = [
  { label: 'Healings', page: 'Healings' },
  { label: 'Global Practices', page: 'Global Practices' },
  { label: 'Retreats', page: 'Retreats' },
  { label: 'Hindu Rituals', page: 'Hindu Rituals' },
  { label: 'Transcendence Rituals', page: 'Transcendence Rituals' },
];

function NavLink({ label, page, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.8 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={createPageUrl(page)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-3 group"
      >
        <span className="text-[10px] font-mono text-white/30">0{index + 1}</span>
        <span className="text-white/70 font-light text-sm tracking-wide relative overflow-hidden">
          {label}
          <motion.span
            className="absolute bottom-0 left-0 h-px bg-white/50 w-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
        <motion.span
          animate={{ x: hovered ? 4 : 0, opacity: hovered ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white text-xs"
        >
          →
        </motion.span>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const slide = slides[current];

  return (
    <div>
      {/* Full-viewport hero */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-stone-950">

        {/* Parallax image layer */}
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{
              transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * -18}px, ${(mousePos.y / window.innerHeight - 0.5) * -12}px) scale(1.05)`,
            }}
          >
            <img
              src={slide.image}
              alt={slide.label}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-14">

          {/* Top bar */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/30">Est. 2009</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex gap-2"
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="relative h-px w-10 bg-white/20 overflow-hidden"
                >
                  {i === current && (
                    <motion.div
                      className="absolute inset-0 bg-white/70 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 6, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Center — main headline */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div key={current}>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6 }}
                    className="text-xs tracking-[0.4em] uppercase text-white/40 mb-6"
                  >
                    {slide.tagline}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[clamp(4rem,10vw,9rem)] font-extralight text-white leading-none tracking-tight"
                  >
                    {slide.label}
                  </motion.h1>
                </motion.div>
              </AnimatePresence>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="text-white/50 font-light text-base lg:text-lg leading-relaxed mt-6 max-w-lg"
              >
                A sanctuary for those called to go deeper — where ancient wisdom,
                sacred ritual, and transformative practice converge.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 }}
                className="mt-10 flex gap-4"
              >
                <Link
                  to="/retreats"
                  className="group px-8 py-3.5 bg-white text-stone-950 text-xs tracking-widest uppercase font-medium hover:bg-stone-100 transition-colors duration-300"
                >
                  Begin Your Journey
                </Link>
                <Link
                  to="/healings"
                  className="px-8 py-3.5 border border-white/25 text-white text-xs tracking-widest uppercase hover:border-white/60 transition-colors duration-300"
                >
                  Explore
                </Link>
              </motion.div>
            </div>

            {/* Right — quick nav */}
            <div className="flex flex-col gap-4 lg:items-end lg:text-right">
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 mb-2">Navigate</p>
              {links.map((link, i) => (
                <NavLink key={link.page} {...link} index={i} />
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-[10px] tracking-[0.3em] uppercase text-white/25"
            >
              Scroll to explore
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ opacity: { duration: 1, delay: 1 }, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
              className="text-white/25 text-sm"
            >
              ↓
            </motion.div>
          </div>
        </div>
      </section>

      {/* Second section — manifesto */}
      <section className="bg-stone-950 py-36 px-8 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-16 items-start"
          >
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-8">Our Purpose</p>
              <h2 className="text-5xl lg:text-6xl font-extralight text-white leading-tight tracking-tight">
                The path inward<br />
                <span className="italic text-white/40">is the path forward</span>
              </h2>
            </div>
            <div className="lg:pt-16">
              <p className="text-white/40 font-light leading-relaxed text-[15px] mb-8">
                We exist at the intersection of the ancient and the present. Every practice we offer has been refined over thousands of years — not as belief, but as technology for the human nervous system.
              </p>
              <p className="text-white/40 font-light leading-relaxed text-[15px]">
                Whether you arrive seeking healing, ritual, or the dissolution of all that is not you, this is your sanctuary.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Third section — featured paths */}
      <section className="bg-stone-950 border-t border-white/5">
        <div className="divide-y divide-white/5">
          {links.map((link, i) => (
            <motion.div
              key={link.page}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <Link
                to={createPageUrl(link.page)}
                className="group flex items-center justify-between px-8 lg:px-20 py-8 hover:bg-white/3 transition-colors duration-500"
              >
                <div className="flex items-center gap-8">
                  <span className="text-[10px] font-mono text-white/20">0{i + 1}</span>
                  <span className="text-xl lg:text-3xl font-extralight text-white/50 group-hover:text-white transition-colors duration-500">
                    {link.label}
                  </span>
                </div>
                <motion.span
                  animate={{ x: 0 }}
                  whileHover={{ x: 6 }}
                  className="text-white/20 group-hover:text-white/60 transition-colors duration-300 text-lg"
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="bg-stone-950 border-t border-white/5">
        <Footer />
      </div>
    </div>
  );
}
