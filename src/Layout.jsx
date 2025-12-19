import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, 
    Sparkles, 
    Users, 
    Calendar, 
    BookOpen, 
    Mail, 
    Menu,
    X,
    Leaf
} from 'lucide-react';

const navItems = [
    { icon: Home, label: 'Home', page: 'Home' },
    { icon: Sparkles, label: 'Services', page: 'Home' },
    { icon: Users, label: 'About', page: 'Home' },
    { icon: Calendar, label: 'Book', page: 'Home' },
    { icon: BookOpen, label: 'Journal', page: 'Home' },
    { icon: Mail, label: 'Contact', page: 'Home' },
];

export default function Layout({ children }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isExpanded ? 240 : 72 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className="fixed left-0 top-0 h-full bg-white border-r border-stone-100 z-50 hidden lg:flex flex-col shadow-sm"
            >
                {/* Logo */}
                <div className="h-20 flex items-center px-5 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                            <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-lg font-light text-stone-800 whitespace-nowrap"
                                >
                                    Serenity
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-3">
                    <ul className="space-y-2">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <li key={index}>
                                    <Link
                                        to={createPageUrl(item.page)}
                                        className="flex items-center gap-4 px-3 py-3 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all duration-300 group"
                                    >
                                        <Icon 
                                            className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" 
                                            strokeWidth={1.5} 
                                        />
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-sm font-light whitespace-nowrap"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-stone-100">
                    <AnimatePresence>
                        {isExpanded ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <p className="text-xs text-stone-400 font-light">Book a Session</p>
                                <p className="text-xs text-stone-500 mt-1">+1 (555) 123-4567</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full h-1 bg-stone-100 rounded-full overflow-hidden"
                            >
                                <div className="w-1/2 h-full bg-stone-300 rounded-full" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-stone-100 z-50 lg:hidden flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg font-light text-stone-800">Serenity</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-10 h-10 flex items-center justify-center text-stone-600"
                >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-40 lg:hidden pt-16"
                    >
                        <nav className="p-6">
                            <ul className="space-y-4">
                                {navItems.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={createPageUrl(item.page)}
                                                onClick={() => setIsMobileOpen(false)}
                                                className="flex items-center gap-4 py-4 text-stone-600 border-b border-stone-100"
                                            >
                                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                                                <span className="text-lg font-light">{item.label}</span>
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="lg:pl-[72px] pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
