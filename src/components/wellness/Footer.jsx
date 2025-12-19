import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-white py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand column */}
                    <div className="lg:col-span-2">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-3xl font-extralight mb-6"
                        >
                            Serenity
                        </motion.h3>
                        <p className="text-stone-400 font-light leading-relaxed max-w-md mb-8">
                            A sanctuary dedicated to the art of wellness, where every experience 
                            is crafted to nurture your journey toward balance and inner peace.
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Youtube].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:border-stone-500 hover:bg-stone-800 transition-all duration-300"
                                >
                                    <Icon className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-6">Explore</h4>
                        <ul className="space-y-4">
                            {['Our Story', 'Services', 'Practitioners', 'Retreats', 'Journal'].map((link) => (
                                <li key={link}>
                                    <a 
                                        href="#" 
                                        className="text-stone-400 font-light hover:text-white transition-colors duration-300"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-6">Connect</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-stone-500 mt-1" strokeWidth={1.5} />
                                <span className="text-stone-400 font-light text-sm">
                                    123 Tranquil Lane<br />
                                    Serenity Valley, CA 90210
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-stone-500" strokeWidth={1.5} />
                                <span className="text-stone-400 font-light text-sm">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-stone-500" strokeWidth={1.5} />
                                <span className="text-stone-400 font-light text-sm">hello@serenity.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-stone-500 text-sm font-light">
                        © 2024 Serenity Wellness. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {['Privacy', 'Terms', 'Cookies'].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-stone-500 text-sm font-light hover:text-stone-300 transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}