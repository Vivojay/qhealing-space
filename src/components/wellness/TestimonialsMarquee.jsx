import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        text: "This sanctuary transformed my approach to wellness. The peaceful atmosphere and expert guidance helped me find balance I never knew was possible.",
        author: "Sarah M.",
        role: "Yoga Practitioner",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
    },
    {
        id: 2,
        text: "A truly transcendent experience. Every session feels like a journey inward, leaving me refreshed and centered.",
        author: "James L.",
        role: "Meditation Student",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
    },
    {
        id: 3,
        text: "The attention to detail in every aspect—from the serene environment to the personalized care—is unmatched.",
        author: "Elena R.",
        role: "Wellness Enthusiast",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
    },
    {
        id: 4,
        text: "I've visited wellness centers worldwide, and this stands apart. The holistic approach addresses mind, body, and spirit.",
        author: "Michael C.",
        role: "Health Coach",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
    },
    {
        id: 5,
        text: "Life-changing. The practitioners here understand that true wellness is a deeply personal journey.",
        author: "Amara J.",
        role: "Mindfulness Teacher",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
    },
    {
        id: 6,
        text: "Every visit is a reminder to slow down, breathe, and reconnect with what matters most.",
        author: "David W.",
        role: "Retreat Guest",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
    }
];

const TestimonialCard = ({ testimonial }) => (
    <div className="flex-shrink-0 w-[380px] md:w-[420px] mx-4">
        <div className="bg-white rounded-2xl p-8 h-full shadow-lg shadow-stone-200/50 border border-stone-100 hover:shadow-xl hover:shadow-stone-200/60 transition-shadow duration-500">
            <Quote className="w-8 h-8 text-stone-200 mb-6" strokeWidth={1} />
            <p className="text-stone-600 font-light leading-relaxed mb-8 text-[15px]">
                "{testimonial.text}"
            </p>
            <div className="flex items-center gap-4">
                <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <p className="text-stone-800 font-medium text-sm">{testimonial.author}</p>
                    <p className="text-stone-400 text-xs tracking-wide">{testimonial.role}</p>
                </div>
            </div>
        </div>
    </div>
);

export default function TestimonialsMarquee() {
    // Double the testimonials for seamless loop
    const duplicatedTestimonials = [...testimonials, ...testimonials];

    return (
        <section className="py-32 bg-gradient-to-b from-stone-100 to-amber-50/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-4">Testimonials</p>
                    <h2 className="text-4xl md:text-5xl font-extralight text-stone-800">Voices of Transformation</h2>
                </motion.div>
            </div>

            {/* First row - scrolls left */}
            <div className="relative mb-8">
                <motion.div
                    animate={{ x: [0, -50 * testimonials.length * 8] }}
                    transition={{
                        x: {
                            duration: 60,
                            repeat: Infinity,
                            ease: "linear"
                        }
                    }}
                    className="flex"
                >
                    {duplicatedTestimonials.map((testimonial, index) => (
                        <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
                    ))}
                    {duplicatedTestimonials.map((testimonial, index) => (
                        <TestimonialCard key={`row1-dup-${index}`} testimonial={testimonial} />
                    ))}
                </motion.div>
            </div>

            {/* Second row - scrolls right */}
            <div className="relative">
                <motion.div
                    animate={{ x: [-50 * testimonials.length * 8, 0] }}
                    transition={{
                        x: {
                            duration: 70,
                            repeat: Infinity,
                            ease: "linear"
                        }
                    }}
                    className="flex"
                >
                    {[...duplicatedTestimonials].reverse().map((testimonial, index) => (
                        <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
                    ))}
                    {[...duplicatedTestimonials].reverse().map((testimonial, index) => (
                        <TestimonialCard key={`row2-dup-${index}`} testimonial={testimonial} />
                    ))}
                </motion.div>
            </div>

            {/* Gradient overlays for fade effect */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-stone-100 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-50/30 to-transparent z-10" />
        </section>
    );
}