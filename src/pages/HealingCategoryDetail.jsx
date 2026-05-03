import React, { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, Navigate, useParams } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';
import { getNonVedicCategories } from '@/data/serviceCatalog';

const CATEGORY_IMAGES = {
  'Mind-Body Therapies': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=90',
  'Energy Therapies': 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=900&q=90',
  'Energy Field & Aura Cleansing': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=90',
  'Subconscious & Inner Child Healing': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=90',
  'Ancestral & Karmic Healing': 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=900&q=90',
  'Divine Feminine & Womb Healing': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=90',
  'Vibrational & Sound Therapies': 'https://images.unsplash.com/photo-1514025538096-5898bc23b3c3?w=900&q=90',
  'Symbol, Code & Intention-Based Healing': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=900&q=90',
  'Rituals, Magic & Ceremonial Practices': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=90',
  'Specialized Healing Programs': 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=900&q=90',
};

function ServiceRow({ h, i, backHref }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`peek group grid lg:grid-cols-5 gap-0 ${open ? 'is-open' : ''}`}
      style={{ borderBottom: '1px solid var(--border)' }}
      tabIndex={0}
    >
      <div className={`relative overflow-hidden lg:col-span-2 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
        <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[260px]">
          <motion.img
            src={h.image}
            alt={h.name}
            className="w-full h-full object-cover"
            animate={{ scale: hovered || open ? 1.05 : 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 transition-colors duration-300" style={{ background: hovered || open ? 'rgba(0,0,0,0.0)' : 'rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      <div
        className={`lg:col-span-3 flex flex-col justify-center px-10 lg:px-20 py-20 lg:py-24 ${i % 2 === 1 ? 'lg:order-1' : ''}`}
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[10px] font-mono" style={{ color: 'var(--fg3)' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--accent-text)' }}>
            {h.tag}
          </span>
        </div>
        <h2 className="hero-display text-4xl lg:text-6xl leading-[0.95]" style={{ color: 'var(--fg)' }}>
          {h.name}
        </h2>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
          <li className="flex items-center gap-2 text-[11px] tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} /> {h.duration}
          </li>
          <li className="flex items-center gap-2 text-[11px] tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} /> 1-on-1
          </li>
          <li className="flex items-center gap-2 text-[11px] tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} /> In-person · Online
          </li>
        </ul>

        <div className="peek-content">
          <p className="text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            {h.desc}
          </p>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="peek-hint" type="button">
            <span className="dot" />
            {open ? 'Less' : 'Read more'}
          </button>
          <div className="flex items-center gap-5">
            <Link
              to={backHref}
              className="text-xs tracking-widest uppercase pb-1 hover-accent inline-block"
              style={{ color: 'var(--fg3)', borderBottom: '1px solid var(--border2)' }}
            >
              Back
            </Link>
            <Link
              to={`/booking?service=${encodeURIComponent(h.name)}`}
              className="text-xs tracking-widest uppercase pb-1 hover-accent inline-block"
              style={{ color: 'var(--accent-text)', borderBottom: '1px solid var(--accent-soft)' }}
            >
              Book →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HealingCategoryDetail() {
  const { categorySlug } = useParams();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);

  const category = useMemo(
    () => getNonVedicCategories().find((item) => item.slug === categorySlug) || null,
    [categorySlug]
  );

  if (!category) {
    return <Navigate to="/healings" replace />;
  }

  const services = category.services.map((service) => ({
    name: service.name,
    tag: category.title,
    desc: service.description,
    duration: service.duration.split('/')[0].trim(),
    image: CATEGORY_IMAGES[category.title] || 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=900&q=90',
  }));

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div ref={heroRef} className="relative h-[55vh] overflow-hidden" style={{ background: '#0c0a09', position: 'relative' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src={CATEGORY_IMAGES[category.title] || 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1800&q=90'}
            alt=""
            className="w-full h-full object-cover opacity-35"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0c0a09 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 p-10 lg:p-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[10px] tracking-[0.45em] uppercase mb-4"
            style={{ color: 'rgba(250,250,249,0.35)' }}
          >
            {category.number} · {category.services.length} services
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-light tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fafaf9' }}
          >
            {category.title}
          </motion.h1>
        </div>
      </div>

      <div>
        {services.map((h, i) => (
          <ServiceRow key={`${h.name}-${i}`} h={h} i={i} backHref="/healings" />
        ))}
      </div>

      <Footer />
    </div>
  );
}
