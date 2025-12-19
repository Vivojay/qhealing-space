import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Wind, Sun, Leaf, Moon } from 'lucide-react';

const services = [
    {
        icon: Wind,
        title: 'Breathwork',
        description: 'Unlock the transformative power of conscious breathing for clarity and calm.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80'
    },
    {
        icon: Heart,
        title: 'Healing Touch',
        description: 'Therapeutic massage and bodywork to release tension and restore balance.',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80'
    },
    {
        icon: Sparkles,
        title: 'Meditation',
        description: 'Guided practices to quiet the mind and connect with inner stillness.',
        image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&q=80'
    },
    {
        icon: Sun,
        title: 'Yoga',
        description: 'Mindful movement classes for all levels, from gentle to dynamic flows.',
        image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80'
    },
    {
        icon: Leaf,
        title: 'Nutrition',
        description: 'Holistic dietary guidance to nourish your body from within.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'
    },
    {
        icon: Moon,
        title: 'Sleep Wellness',
        description: 'Restore your natural rhythms for deep, rejuvenating rest.',
        image: 'https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=600&q=80'
    }
];

const ServiceCard = ({ service, index }) => {
    const Icon = service.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-stone-300/50 transition-all duration-500"
        >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden">
                <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-60" />
            </div>

            {/* Content */}
            <div className="relative p-8 -mt-16">
                <div className="w-14 h-14 rounded-full bg-stone-800 flex items-center justify-center mb-6 shadow-lg">
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-light text-stone-800 mb-3">{service.title}</h3>
                <p className="text-stone-500 font-light text-sm leading-relaxed">{service.description}</p>
                
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '3rem' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="h-px bg-stone-300 mt-6"
                />
            </div>
        </motion.div>
    );
};

export default function ServicesSection() {
    return (
        <section className="py-32 bg-gradient-to-b from-amber-50/30 to-stone-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-4">Our Offerings</p>
                    <h2 className="text-4xl md:text-5xl font-extralight text-stone-800 mb-6">
                        Pathways to Wellness
                    </h2>
                    <p className="text-stone-500 font-light max-w-2xl mx-auto">
                        Discover our carefully curated programs designed to nurture every dimension of your wellbeing
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={service.title} service={service} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}