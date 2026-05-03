import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';
import {
  BILLING_PROFILE_META,
  SERVICE_CATEGORIES,
  durationBaseLabel,
  durationSortKey,
  hexToRgba,
  servicePriceLabel,
  TABLE_ROW_TINT_A,
  TABLE_ROW_TINT_B,
} from '@/data/serviceCatalog';

function SectionTable({ section, index, billingProfile }) {
  const headerTintStrong = hexToRgba(section.color, 0.24, 'rgba(107, 160, 204, 0.24)');
  const headerTintSoft = hexToRgba(section.color, 0.1, 'rgba(107, 160, 204, 0.1)');
  const rowTintA = hexToRgba(section.color, 0.05, TABLE_ROW_TINT_A);
  const rowTintB = hexToRgba(section.color, 0.02, TABLE_ROW_TINT_B);

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-elev)' }}
    >
      <div
        className="px-5 lg:px-8 py-4 flex items-center justify-between gap-4"
        style={{
          background: `linear-gradient(120deg, ${headerTintStrong}, ${headerTintSoft} 70%)`,
          borderBottom: '1px solid var(--border2)',
        }}
      >
        <div>
          <p className="text-[10px] tracking-[0.24em] uppercase mb-2" style={{ color: section.color }}>
            {section.number}
          </p>
          <h2 className="font-display text-lg lg:text-2xl tracking-tight" style={{ color: 'var(--fg)' }}>
            {section.title}
          </h2>
        </div>
        <div className="text-right hidden lg:block">
          <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--fg3)' }}>
            {section.services.length} Services
          </p>
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-[1.2fr_2fr_220px] gap-6 px-8 py-3 text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)', borderBottom: '1px solid var(--border)' }}>
        <span>Service</span>
        <span>Overview</span>
        <span className="text-right">Price · Duration</span>
      </div>

      <div>
        {section.services.map((service, rowIndex) => {
          const rowBg = rowIndex % 2 === 0 ? rowTintA : rowTintB;
          const priceLabel = servicePriceLabel(service, billingProfile);
          return (
            <React.Fragment key={service.id}>
              <div
                className="hidden lg:grid grid-cols-[1.2fr_2fr_220px] gap-6 px-8 py-5 items-start"
                style={{ borderBottom: '1px solid var(--border)', background: rowBg }}
              >
                <div>
                  <h3 className="text-lg leading-tight" style={{ color: 'var(--fg)' }}>
                    {service.name}
                  </h3>
                </div>
                <p className="text-[14px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {service.description}
                </p>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--accent-text)' }}>
                    {priceLabel}
                  </p>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--fg2)' }}>
                    {service.duration}
                  </p>
                  <Link
                    to={`/booking?service=${encodeURIComponent(service.name)}`}
                    className="inline-flex mt-4 text-[10px] tracking-[0.22em] uppercase"
                    style={{ color: section.color }}
                  >
                    Book this service
                  </Link>
                </div>
              </div>

              <div
                className="lg:hidden px-5 py-5"
                style={{ borderBottom: '1px solid var(--border)', background: rowBg }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl leading-tight" style={{ color: 'var(--fg)' }}>
                      {service.name}
                    </h3>
                    <p className="mt-2 text-[10px] tracking-[0.2em] uppercase" style={{ color: section.color }}>
                      {priceLabel}
                    </p>
                  </div>
                  <p className="text-[11px] text-right" style={{ color: 'var(--fg2)' }}>
                    {service.duration}
                  </p>
                </div>
                <p className="mt-3 text-[14px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {service.description}
                </p>
                <Link
                  to={`/booking?service=${encodeURIComponent(service.name)}`}
                  className="inline-flex mt-4 text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: section.color }}
                >
                  Book this service
                </Link>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </motion.section>
  );
}

export default function Services() {
  const [billingProfile, setBillingProfile] = useState('indian');
  const [activeSectionFilters, setActiveSectionFilters] = useState([]);

  const visibleSections = useMemo(() => {
    if (!activeSectionFilters.length) return SERVICE_CATEGORIES;
    return SERVICE_CATEGORIES.filter((section) => activeSectionFilters.includes(section.title));
  }, [activeSectionFilters]);

  const durationBuckets = useMemo(() => {
    const found = new Set();
    visibleSections.forEach((section) => {
      section.services.forEach((service) => {
        const bucket = durationBaseLabel(service.duration);
        if (bucket) found.add(bucket);
      });
    });
    return [...found].sort((a, b) => durationSortKey(a) - durationSortKey(b) || a.localeCompare(b));
  }, [visibleSections]);

  const toggleSectionFilter = (title) => {
    setActiveSectionFilters((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <section className="px-6 lg:px-16 pt-24 lg:pt-28 pb-14 lg:pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="text-[10px] tracking-[0.42em] uppercase mb-5"
            style={{ color: 'var(--accent-text)' }}
          >
            ◊ Unified Services Directory
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="hero-display text-5xl lg:text-7xl max-w-4xl"
            style={{ color: 'var(--fg)' }}
          >
            Services, healings, rituals, and
            <span
              style={{
                color: 'var(--accent-text)',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              {' '}guided programs
            </span>
          </motion.h1>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <p className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
              Shared service catalog
            </p>
            <p className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--fg3)' }}>
              <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
              {durationBuckets.length} duration formats across {SERVICE_CATEGORIES.length} categories
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl px-5 lg:px-7 py-5 lg:py-6 mb-8"
            style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-[10px] tracking-[0.24em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>
                  Pricing Profile
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(BILLING_PROFILE_META).map(([profileId, meta]) => {
                    const active = billingProfile === profileId;
                    return (
                      <button
                        key={profileId}
                        type="button"
                        onClick={() => setBillingProfile(profileId)}
                        className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.16em] uppercase transition-colors"
                        style={{
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border2)'}`,
                          color: active ? 'var(--accent-text)' : 'var(--fg2)',
                          background: active ? 'var(--accent-dim)' : 'transparent',
                        }}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-[11px] font-light" style={{ color: 'var(--fg3)' }}>
                Showing {BILLING_PROFILE_META[billingProfile]?.currency || 'INR'} line-item prices.
              </p>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--fg3)' }}>
                  Filter categories
                </p>
                {activeSectionFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSectionFilters([])}
                    className="text-[10px] tracking-[0.18em] uppercase"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {SERVICE_CATEGORIES.map((section) => {
                  const selected = activeSectionFilters.includes(section.title);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => toggleSectionFilter(section.title)}
                      className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.16em] uppercase whitespace-nowrap"
                      style={{
                        border: `1px solid ${selected ? hexToRgba(section.color, 0.46, 'var(--accent)') : 'var(--border2)'}`,
                        color: selected ? section.color : 'var(--fg2)',
                        background: selected ? hexToRgba(section.color, 0.14, 'var(--accent-dim)') : 'transparent',
                      }}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:space-y-10">
            {visibleSections.map((section, sectionIndex) => (
              <SectionTable
                key={section.id}
                section={section}
                index={sectionIndex}
                billingProfile={billingProfile}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-16 pb-16 lg:pb-24">
        <div
          className="max-w-7xl mx-auto rounded-2xl px-6 lg:px-10 py-8 lg:py-10"
          style={{
            border: '1px solid var(--border2)',
            background: 'linear-gradient(120deg, var(--accent-dim), transparent 70%)',
          }}
        >
          <p className="text-[10px] tracking-[0.24em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>
            Need a custom pathway?
          </p>
          <h3 className="hero-display text-3xl lg:text-5xl" style={{ color: 'var(--fg)' }}>
            Personalized protocol design
          </h3>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            If you are not sure which modality fits best, we can map the right sequence for you
            and route you directly into the correct booking flow.
          </p>
          <Link
            to={`/booking?service=${encodeURIComponent('Other / Not sure yet')}`}
            className="inline-flex mt-6 text-[11px] tracking-[0.22em] uppercase"
            style={{ color: 'var(--accent-text)' }}
          >
            Book personalized guidance
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
