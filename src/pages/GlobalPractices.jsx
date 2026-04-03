import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

const practices = [
  { region: 'East Asia', title: 'Qigong & Tai Chi', desc: 'Ancient Chinese movement arts that cultivate qi (life energy) through slow, intentional motion and breathwork.', image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&q=90' },
  { region: 'South Asia', title: 'Ayurvedic Medicine', desc: 'The oldest holistic healing system on earth, balancing the three doshas through herbs, diet, and lifestyle.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90' },
  { region: 'Americas', title: 'Shamanic Journeys', desc: 'Indigenous wisdom traditions using drumming, plant medicine, and ceremony to access non-ordinary states of healing.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=90' },
  { region: 'Middle East', title: 'Sufi Movement', desc: 'Sacred whirling and breath practice drawn from the Mevlevi order, used to dissolve the ego into divine presence.', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=90' },
  { region: 'Africa', title: 'Ubuntu Healing Circles', desc: 'Community-based healing rooted in the African philosophy of interconnectedness — I am because we are.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=90' },
  { region: 'Celtic', title: 'Forest Bathing', desc: 'Shinrin-yoku-inspired immersion in sacred groves, drawing on both Celtic animism and Japanese forest therapy.', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=90' },
];

export default function GlobalPractices() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <div className="bg-white min-h-screen">
      <div ref={heroRef} className="relative h-[55vh] overflow-hidden bg-stone-900">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1800&q=90"
            alt="Global Practices"
            className="w-full h-full object-cover opacity-40"
          />
        </motion.div>
        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase text-white/60 mb-4"
          >
            World Traditions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-extralight text-white tracking-tight"
          >
            Global Practices
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200">
          {practices.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group relative overflow-hidden bg-white cursor-pointer"
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
                <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">{p.region}</p>
                <h3 className="text-xl font-light text-stone-900 mb-3">{p.title}</h3>
                <p className="text-stone-500 text-sm font-light leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
