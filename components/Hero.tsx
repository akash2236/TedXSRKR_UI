import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
    return (
        <section id="home" className="h-screen w-full relative flex flex-col justify-center items-center text-center overflow-hidden bg-black">
            {/* Simple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

            {/* Animated lines background */}
            <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#b80a2d" />
                            <stop offset="33%" stopColor="#0c0808" />
                            <stop offset="66%" stopColor="#940a0a" />
                            <stop offset="100%" stopColor="#0d0808" />
                        </linearGradient>
                    </defs>

                    {/* Animated flowing lines */}
                    {[...Array(8)].map((_, i) => (
                        <motion.path
                            key={i}
                            d={`M ${i * 150} 0 Q ${i * 150 + 100} ${200 + i * 80}, ${i * 150} 400 T ${i * 150} 800`}
                            stroke="url(#lineGradient1)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: [0.3, 0.6, 0.3],
                                y: [0, -20, 0]
                            }}
                            transition={{
                                pathLength: { duration: 2, delay: i * 0.2 },
                                opacity: { duration: 3, repeat: Infinity, delay: i * 0.3 },
                                y: { duration: 4, repeat: Infinity, delay: i * 0.2 }
                            }}
                        />
                    ))}
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 px-4 max-w-7xl mx-auto">
                {/* Main Title */}
                <motion.h1
                    className="font-heading text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-8"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <span className="inline-block bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                        THE NEXT{' '}
                    </span>
                    <span className="inline-block bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent">
                        CHAPTER
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="text-xl md:text-3xl text-red-500 font-bold tracking-[0.3em] uppercase mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    Turn the page. Define the future.
                </motion.p>

                {/* Decorative Line */}
                <motion.div
                    className="h-1 w-64 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-12"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                />

                {/* CTA Button */}
                <motion.a
                    href="/register"
                    className="inline-block bg-red-600 text-white font-bold py-4 px-12 rounded-full text-lg uppercase tracking-wider hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-red-600/50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Register Now
                </motion.a>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ArrowDown className="text-white/60" size={32} />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;