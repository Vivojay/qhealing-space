import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock3, Sparkles } from 'lucide-react';
import Footer from '@/components/wellness/Footer';
import textureVadym from '../assets/textures/vadym-alyekseyenko-0ARnshcVqfc-unsplash.jpg';

const SERVICE_SECTIONS = [
  {
    number: '01',
    title: 'Mind-Body Therapies',
    color: '#5C2A88',
    tintA: 'rgba(92, 42, 136, 0.22)',
    tintB: 'rgba(92, 42, 136, 0.11)',
    services: [
      {
        id: 1,
        name: 'Hypnotherapy',
        description:
          'Guided trance work to access the subconscious, release limiting beliefs, and create positive behavioral change.',
        duration: '90-120 min / session',
      },
      {
        id: 2,
        name: 'Neuro-Linguistic Programming (NLP)',
        description:
          'Repattern thought and language structures to shift emotional responses and habits.',
        duration: '60 min / session',
      },
      {
        id: 3,
        name: 'Cognitive Behavioral Therapy (CBT)',
        description:
          'Evidence-based approach to identify and reframe unhelpful thought patterns.',
        duration: '50 min / session',
      },
      {
        id: 4,
        name: 'Counseling & Psychotherapy',
        description:
          'Supportive, confidential sessions for anxiety, depression, relationship issues, grief, and life transitions.',
        duration: '50 min / session',
      },
      {
        id: 5,
        name: 'Guided Meditation & Breathwork',
        description:
          'Structured practices to calm the nervous system, enhance focus, and cultivate inner stillness.',
        duration: '45-60 min / session',
      },
    ],
  },
  {
    number: '02',
    title: 'Energy Therapies',
    color: '#1E5F9C',
    tintA: 'rgba(30, 95, 156, 0.2)',
    tintB: 'rgba(30, 95, 156, 0.1)',
    services: [
      {
        id: 6,
        name: 'Reiki Healing',
        description:
          'Channelled universal life-force energy to restore balance across physical, emotional, and spiritual layers.',
        duration: '60 min / session',
      },
      {
        id: 7,
        name: 'Chakra Healing & Balancing',
        description: 'Diagnosis and realignment of the seven primary energy centers.',
        duration: '60-75 min / session',
      },
      {
        id: 8,
        name: 'Meridian Work',
        description: "Techniques to clear blockages along the body's energy pathways.",
        duration: '60 min / session',
      },
      {
        id: 9,
        name: 'Points Therapy For Release',
        description: 'Light touch on 32 points of the head to release stored limitations and judgments.',
        duration: '60 min / session',
      },
      {
        id: 10,
        name: 'Jin Shin Jyutsu',
        description: 'Ancient Japanese art of harmonizing life energy through gentle hand placements.',
        duration: '60 min / session',
      },
      {
        id: 11,
        name: 'Prana Energy Therapy',
        description: 'No-touch cleansing and energizing of the aura and chakras.',
        duration: '45-60 min / session',
      },
      {
        id: 12,
        name: 'Theta State Healing',
        description:
          'Meditation-based modality accessing the theta brainwave state to facilitate instant healing.',
        duration: '60 min / session',
      },
    ],
  },
  {
    number: '03',
    title: 'Energy Field & Aura Cleansing',
    color: '#0F7E77',
    tintA: 'rgba(15, 126, 119, 0.2)',
    tintB: 'rgba(15, 126, 119, 0.1)',
    services: [
      {
        id: 13,
        name: 'Aura Clearing & Repair',
        description: 'Removal of cords, attachments, and energetic debris from the auric field.',
        duration: '45-60 min / session',
      },
      {
        id: 14,
        name: 'Space & Home Clearing',
        description: 'Energetic cleansing of living or work environments to restore harmony.',
        duration: '90-120 min / on-site',
      },
      {
        id: 15,
        name: 'Dowsing & Pendulum Work',
        description: 'Intuitive tool-based diagnostics and energy correction.',
        duration: '45 min / session',
      },
      {
        id: 16,
        name: 'Protection & Shielding Rituals',
        description: 'Personalized practices to maintain energetic boundaries.',
        duration: '45-60 min / session',
      },
    ],
  },
  {
    number: '04',
    title: 'Subconscious & Inner Child Healing',
    color: '#7B1B65',
    tintA: 'rgba(123, 27, 101, 0.2)',
    tintB: 'rgba(123, 27, 101, 0.1)',
    services: [
      {
        id: 17,
        name: 'Inner Child Healing',
        description: 'Compassionate reconnection and healing of wounded childhood aspects.',
        duration: '60-90 min / session',
      },
      {
        id: 18,
        name: 'Past Life Regression (PLR)',
        description:
          'Hypnotic journey to uncover and release patterns originating in previous lifetimes.',
        duration: '90-120 min / session',
      },
      {
        id: 19,
        name: 'Cellular Memory Release',
        description: 'Techniques to discharge trauma held at a cellular and body-memory level.',
        duration: '60 min / session',
      },
      {
        id: 20,
        name: 'EFT with Matrix Reimprinting',
        description: 'Tapping combined with memory reconsolidation to transform core beliefs.',
        duration: '60-90 min / session',
      },
      {
        id: 21,
        name: 'Shadow Work',
        description: 'Exploration and integration of disowned parts of the psyche.',
        duration: '60-90 min / session',
      },
    ],
  },
  {
    number: '05',
    title: 'Ancestral & Karmic Healing',
    color: '#99561D',
    tintA: 'rgba(153, 86, 29, 0.2)',
    tintB: 'rgba(153, 86, 29, 0.1)',
    services: [
      {
        id: 22,
        name: 'Ancestral Lineage Healing',
        description:
          'Clearing inherited patterns, traumas, and unresolved issues across generations.',
        duration: '180 min / ritual',
      },
      {
        id: 23,
        name: 'Akashic Records',
        description: "Access to the soul's cosmic archive for insight and karmic clearing.",
        duration: '60 min / session',
      },
      {
        id: 24,
        name: 'Karmic Cord Cutting',
        description: 'Release of energetic ties to past-life relationships and contracts.',
        duration: '60 min / session',
      },
      {
        id: 25,
        name: 'Pitra Dosh Remediation',
        description: 'Rituals to appease and liberate ancestral spirits.',
        duration: '180 min / ritual',
      },
    ],
  },
  {
    number: '06',
    title: 'Divine Feminine & Womb Healing',
    color: '#1F7499',
    tintA: 'rgba(31, 116, 153, 0.2)',
    tintB: 'rgba(31, 116, 153, 0.1)',
    services: [
      {
        id: 26,
        name: 'Womb Healing & Activation',
        description:
          'Energetic restoration of the sacral center for fertility, creativity, and feminine power.',
        duration: '60-75 min / session',
      },
      {
        id: 27,
        name: 'Pre-Natal & Birth Trauma Healing',
        description: 'Release of imprints acquired in utero or during birth.',
        duration: '60-90 min / session',
      },
      {
        id: 28,
        name: 'Menstrual Cycle Alignment',
        description: 'Support for hormonal balance and cyclical self-care.',
        duration: '45-60 min / session',
      },
      {
        id: 29,
        name: 'Divine Feminine Awakening',
        description: 'Practices to embody and reclaim feminine archetypal energy.',
        duration: '60-90 min / session',
      },
    ],
  },
  {
    number: '07',
    title: 'Vibrational & Sound Therapies',
    color: '#597D1E',
    tintA: 'rgba(89, 125, 30, 0.2)',
    tintB: 'rgba(89, 125, 30, 0.1)',
    services: [
      {
        id: 30,
        name: 'Sound Healing',
        description:
          'Singing bowls, tuning forks, and voice toning to recalibrate the energy body.',
        duration: '45-60 min / session',
      },
      {
        id: 31,
        name: 'Color Therapy',
        description:
          'Intentional use of specific color frequencies for emotional and energetic balance.',
        duration: '45 min / session',
      },
      {
        id: 32,
        name: 'Water Therapy & Charging',
        description: 'Programming water with healing intentions and vibrational imprints.',
        duration: '30-45 min / session',
      },
    ],
  },
  {
    number: '08',
    title: 'Symbol, Code & Intention-Based Healing',
    color: '#92205A',
    tintA: 'rgba(146, 32, 90, 0.2)',
    tintB: 'rgba(146, 32, 90, 0.1)',
    services: [
      {
        id: 33,
        name: 'Switch Words',
        description: 'Powerful single-word affirmations that activate subconscious change.',
        duration: '45 min / session',
      },
      {
        id: 34,
        name: 'Grabovoi Number Sequences',
        description: 'Numerical codes for manifestation and restoration of health.',
        duration: '45 min / session',
      },
      {
        id: 35,
        name: 'Zibu Symbols',
        description: 'Angelic symbols channelled for specific intentions and healing.',
        duration: '45-60 min / session',
      },
      {
        id: 36,
        name: 'Sigil Crafting',
        description: 'Creation of personalized symbolic glyphs to encode desires.',
        duration: '45-60 min / session',
      },
      {
        id: 37,
        name: 'Runes Reading & Healing',
        description: 'Ancient Norse symbols for guidance and energetic work.',
        duration: '45-60 min / session',
      },
    ],
  },
  {
    number: '09',
    title: 'Rituals, Magic & Ceremonial Practices',
    color: '#1B8A4B',
    tintA: 'rgba(27, 138, 75, 0.2)',
    tintB: 'rgba(27, 138, 75, 0.1)',
    services: [
      {
        id: 38,
        name: 'Candle Magic Rituals',
        description: 'Intention-setting ceremonies using flame, color, and timing.',
        duration: '45-60 min / session',
      },
      {
        id: 39,
        name: 'Magic Spells & Manifestation Work',
        description: 'Customized spellwork aligned with ethical intention.',
        duration: '60 min / session',
      },
      {
        id: 40,
        name: "Ho'oponopono Sessions",
        description: 'Hawaiian forgiveness practice to clear memories and restore peace.',
        duration: '45-60 min / session',
      },
      {
        id: 41,
        name: 'Auto Writing / Channelling',
        description: 'Intuitive written messages from higher self or spirit guides.',
        duration: '45-60 min / session',
      },
    ],
  },
  {
    number: '10',
    title: 'Hindu Vedic Rituals & Pujas',
    color: '#8A6617',
    tintA: 'rgba(138, 102, 23, 0.2)',
    tintB: 'rgba(138, 102, 23, 0.1)',
    services: [
      {
        id: 42,
        name: 'Havan (Yagna)',
        description:
          'Sacred fire ceremonies for peace, prosperity, fertility, abundance, or specific intentions.',
        duration: '90-180 min / ceremony',
      },
      {
        id: 43,
        name: 'Grih Shanti Puja',
        description:
          'Rituals to nullify or reduce the negative impact of planets in our horoscope.',
        duration: '90-120 min / puja',
      },
      {
        id: 44,
        name: 'Pitru Dosh Puja',
        description:
          'Ancestral appeasement ceremony to remove hurdles and untoward incidents.',
        duration: '180 min / ritual',
      },
      {
        id: 45,
        name: 'Purnima (Full Moon) Ritual',
        description: 'Lunar cycle ceremony for release and gratitude.',
        duration: '60 min / ritual',
      },
      {
        id: 46,
        name: 'Amavasya (New Moon) Ritual',
        description: 'Lunar cycle ceremony for intention-setting and shadow work.',
        duration: '60 min / ritual',
      },
      {
        id: 47,
        name: 'Maha Shivratri Ritual',
        description: "Harnessing Lord Shiva's energy for blessings and transformation.",
        duration: '90 min / ritual',
      },
      {
        id: 48,
        name: 'Auspicious Day & Festival Rituals',
        description:
          'Customized ceremonies for Navratri, eclipses, and other sacred dates like Holi and Deepawali.',
        duration: '60-120 min / ritual',
      },
      {
        id: 49,
        name: 'Chakra Tantra',
        description: 'Tantric practices for chakra activation and spiritual awakening.',
        duration: '60-90 min / session',
      },
      {
        id: 50,
        name: 'Personalized Mantra Prescription',
        description: 'Issue-specific mantras for healing, protection, or manifestation.',
        duration: '45-60 min / consultation',
      },
    ],
  },
  {
    number: '11',
    title: 'Specialized Healing Programs',
    color: '#4B5E96',
    tintA: 'rgba(75, 94, 150, 0.2)',
    tintB: 'rgba(75, 94, 150, 0.1)',
    services: [
      {
        id: 51,
        name: '5-Day Intensive Healing Program',
        description: 'Structured multi-modality deep-dive for accelerated transformation.',
        duration: '5 days / program',
      },
      {
        id: 52,
        name: 'Customized Sessions',
        description: 'Tailored session for meeting specific needs of individuals.',
        duration: '60-90 min / session',
      },
      {
        id: 53,
        name: 'Relationship & Cord Disentanglement',
        description: 'Clearing energetic entanglements with partners, family, or colleagues.',
        duration: '60-90 min / session',
      },
      {
        id: 54,
        name: 'Abundance & Financial Block Clearing',
        description: 'Targeted work on scarcity mindset and money-related limiting beliefs.',
        duration: '60-90 min / session',
      },
    ],
  },
];

const TOTAL_SERVICES = SERVICE_SECTIONS.reduce((sum, section) => sum + section.services.length, 0);

function SectionTable({ section, index }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}
    >
      <div className="px-5 lg:px-8 py-4 lg:py-4 flex items-center justify-between gap-4" style={{ background: section.color }}>
        <h2 className="font-display text-lg lg:text-2xl text-white tracking-tight">
          {section.number}. {section.title}
        </h2>
        <span className="text-[10px] lg:text-[11px] tracking-[0.22em] uppercase text-white/80 font-mono whitespace-nowrap">
          {section.services.length} services
        </span>
      </div>

      <div className="hidden lg:grid grid-cols-[68px_1.1fr_2fr_220px] px-8 py-3 text-[10px] tracking-[0.26em] uppercase" style={{ color: 'var(--fg3)', borderBottom: '1px solid var(--border)' }}>
        <span>#</span>
        <span>Service</span>
        <span>Description</span>
        <span className="text-right">Duration / Format</span>
      </div>

      <div>
        {section.services.map((service, rowIndex) => {
          const rowBg = rowIndex % 2 === 0 ? section.tintA : section.tintB;
          return (
            <div
              key={service.id}
              className="hidden lg:grid grid-cols-[68px_1.1fr_2fr_220px] gap-6 px-8 py-5 items-start"
              style={{ borderBottom: '1px solid var(--border)', background: rowBg }}
            >
              <p className="font-mono text-[12px]" style={{ color: 'var(--fg2)' }}>
                {service.id}
              </p>
              <div>
                <h3 className="text-lg leading-tight" style={{ color: 'var(--fg)' }}>
                  {service.name}
                </h3>
              </div>
              <p className="text-[14px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                {service.description}
              </p>
              <div className="text-right">
                <p className="text-sm font-light" style={{ color: 'var(--fg)' }}>
                  {service.duration}
                </p>
                <Link
                  to={`/booking?service=${encodeURIComponent(service.name)}`}
                  className="inline-flex items-center gap-1.5 mt-2 text-[10px] tracking-[0.2em] uppercase hover-accent px-2 py-1 rounded"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Book
                  <ChevronRight className="w-3 h-3" strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          );
        })}

        <div className="lg:hidden">
          {section.services.map((service, rowIndex) => {
            const rowBg = rowIndex % 2 === 0 ? section.tintA : section.tintB;
            return (
              <div
                key={`${service.id}-mobile`}
                className="px-5 py-5"
                style={{ borderBottom: '1px solid var(--border)', background: rowBg }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[11px] font-mono" style={{ color: 'var(--fg3)' }}>
                    #{service.id}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--fg2)' }}>
                    {service.duration}
                  </p>
                </div>
                <h3 className="mt-2 text-xl leading-tight" style={{ color: 'var(--fg)' }}>
                  {service.name}
                </h3>
                <p className="mt-3 text-[14px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {service.description}
                </p>
                <Link
                  to={`/booking?service=${encodeURIComponent(service.name)}`}
                  className="inline-flex items-center gap-1.5 mt-4 text-[10px] tracking-[0.2em] uppercase hover-accent px-2 py-1 rounded"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Book
                  <ChevronRight className="w-3 h-3" strokeWidth={1.8} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default function Services() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);

  return (
    <div style={{ background: 'var(--bg)' }}>
      <section ref={heroRef} className="relative h-[58vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=2000&q=90"
            alt=""
            className="w-full h-full object-cover opacity-42"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0c0a09 0%, transparent 62%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(14,16,20,0.65) 12%, rgba(14,16,20,0.2) 52%, transparent 100%)' }} />

        <div className="absolute bottom-0 left-0 p-8 lg:p-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-[10px] tracking-[0.42em] uppercase mb-4"
            style={{ color: 'rgba(250,250,249,0.38)' }}
          >
            Quantum Healing Space
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl hero-display"
            style={{ color: '#fafaf9', fontFamily: 'Cormorant Garamond, serif' }}
          >
            Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.42 }}
            className="mt-6 max-w-2xl text-sm lg:text-[15px] font-light leading-relaxed"
            style={{ color: 'rgba(250,250,249,0.76)' }}
          >
            Comprehensive wellness and healing services curated across mind, energy, ritual, and transformational modalities.
          </motion.p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${textureVadym})`,
            backgroundSize: '560px auto',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            opacity: 0.16,
            mixBlendMode: 'soft-light',
          }}
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto px-5 lg:px-10 py-16 lg:py-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-12">
            <div className="rounded-xl px-4 py-3" style={{ border: '1px solid var(--border2)', background: 'var(--accent-dim)' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg3)' }}>Coverage</p>
              <p className="text-lg mt-1" style={{ color: 'var(--fg)' }}>11 Sections</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ border: '1px solid var(--border2)', background: 'var(--accent-dim)' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg3)' }}>Service Count</p>
              <p className="text-lg mt-1" style={{ color: 'var(--fg)' }}>{TOTAL_SERVICES} Modalities</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ border: '1px solid var(--border2)', background: 'var(--accent-dim)' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg3)' }}>Duration</p>
              <p className="text-lg mt-1" style={{ color: 'var(--fg)' }}>30 min to 5 days</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ border: '1px solid var(--border2)', background: 'var(--accent-dim)' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--fg3)' }}>Billing Note</p>
              <p className="text-lg mt-1" style={{ color: 'var(--fg)' }}>Charges in INR</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 mb-10">
            <p className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--accent-text)' }}>
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
              Comprehensive Wellness & Healing Services - Charges in INR
            </p>
            <p className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--fg3)' }}>
              <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
              Duration and format listed per service
            </p>
          </div>

          <div className="space-y-8 lg:space-y-10">
            {SERVICE_SECTIONS.map((section, sectionIndex) => (
              <SectionTable key={section.title} section={section} index={sectionIndex} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-16 lg:pb-24">
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
          <p className="mt-4 max-w-3xl text-sm lg:text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            If you are unsure which modality is right for your current life phase, begin with a guided consultation and receive a tailored healing sequence.
          </p>
          <Link
            to={`/booking?service=${encodeURIComponent('Customized Sessions')}`}
            className="inline-flex items-center gap-2 mt-7 text-[10px] tracking-[0.24em] uppercase hover-accent px-4 py-2.5 rounded-full"
            style={{ border: '1px solid var(--border2)', color: 'var(--accent-text)' }}
          >
            Book Consultation
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
