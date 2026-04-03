import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-20 lg:py-28">

        <div className="grid lg:grid-cols-3 gap-16 lg:gap-24 mb-20">

          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[10px] tracking-[0.5em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>
                Quantum Healing Space
              </p>
              <h3
                className="text-4xl lg:text-5xl mb-8 leading-tight"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--fg)' }}
              >
                A sanctuary for those
                <br /><em style={{ color: 'var(--fg2)' }}>called to go deeper.</em>
              </h3>
              <p className="text-sm font-light leading-relaxed max-w-md mb-10" style={{ color: 'var(--fg2)' }}>
                Individual Healings · Spiritual Workshops · Retreats · Corporate Interventions.<br />
                Guided by Vartika Shukla — healer, hypnotherapist, life coach.
              </p>
              <a
                href="https://www.instagram.com/quantum_healingspace"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60"
                  style={{ border: '1px solid var(--border2)' }}
                >
                  <Instagram className="w-4 h-4" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
                </div>
                <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--fg3)' }}>
                  @quantum_healingspace
                </span>
              </a>
            </motion.div>
          </div>

          {/* Contact */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-8" style={{ color: 'var(--fg3)' }}>
                Connect
              </p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--fg3)' }} strokeWidth={1.5} />
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                    Sector 56, Gurugram<br />
                    Haryana – 122011
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fg3)' }} strokeWidth={1.5} />
                  <span className="text-sm font-light" style={{ color: 'var(--fg2)' }}>+91 9267904256</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fg3)' }} strokeWidth={1.5} />
                  <span className="text-sm font-light" style={{ color: 'var(--fg2)' }}>vartikashukla@xyz.com</span>
                </li>
              </ul>
            </motion.div>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs font-light" style={{ color: 'var(--fg3)' }}>
            © {new Date().getFullYear()} Quantum Healing Space · All rights reserved.
          </p>
          <p className="text-xs font-light" style={{ color: 'var(--fg3)' }}>
            Individual Healings · Workshops · Retreats · Corporate Programs
          </p>
        </div>

      </div>
    </footer>
  );
}
