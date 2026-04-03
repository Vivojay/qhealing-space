import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

const practices = [
  { region: 'East Asia', title: 'Qigong & Tai Chi', desc: 'Ancient Chinese movement arts that cultivate qi (life energy) through slow, intentional motion and breathwork.', image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&q=90' },
  { region: 'South Asia', title: 'Ayurvedic Medicine', desc: 'The oldest holistic healing system on earth, balancing the three doshas through herbs, diet, and lifestyle.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90' },
  { region: 'Americas', title: 'Shamanic Journeys', desc: 'Indigenous wisdom traditions using drumming, plant medicine, and ceremony to access non-ordinary states of healing.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=90' },
  { region: 'Middle East', title: 'Sufi Movement', desc: 'Sacred whirling and breath practice drawn from the Mevlevi order, used to dissolve the ego into divine presence.', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=90' },
  { region: 'Africa', title: 'Ubuntu Healing Circles', desc: 'Community-based healing rooted in the African philosophy of interconnectedness — I am because we are.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=90' },
  { region: 'Celtic / Japan', title: 'Forest Bathing', desc: 'Shinrin-yoku immersion in sacred groves, drawing on both Celtic animism and Japanese forest therapy traditions.', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=90' },
];

export default function GlobalPractices() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div ref={heroRef} className="relative h-[55vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1800&q=90"
            alt=""
            className="w-full h-full object-cover opacity-40"
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
            World Traditions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-light tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fafaf9' }}
          >
            Global Practices
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-20">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] tracking-[0.45em] uppercase mb-12"
          style={{ color: 'var(--fg3)' }}
        >
          Healing wisdom from every corner of the earth
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
          {practices.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group overflow-hidden"
              style={{ background: 'var(--bg)' }}
              whileHover={{ backgroundColor: 'var(--bg2)' }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <motion.img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="p-8">
                <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>
                  {p.region}
                </p>
                <h3
                  className="text-xl mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, color: 'var(--fg)' }}
                >
                  {p.title}
                </h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
