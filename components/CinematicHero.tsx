import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Ticket, Mic } from 'lucide-react';

/**
 * CinematicHero - Parallax hero with layered scroll effects
 * 
 * LAYER STRUCTURE (z-index):
 * 10: Background gradient (decorative, pointer-events: none)
 * 20: Typography + CTA buttons (interactive, pointer-events: auto)
 * 15: Microphone image (decorative, pointer-events: none) - BEHIND buttons
 * 25: Stage silhouette (decorative, pointer-events: none)
 * 35: Revealed content (decorative, pointer-events: none)
 * 40: Scroll indicator (decorative, pointer-events: none)
 */

const CinematicHero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Layer animations
    const textY = useTransform(scrollYProgress, [0, 0.5], [0, -350]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

    const micScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
    const micOpacity = useTransform(scrollYProgress, [0.35, 0.55], [1, 0]);
    const micY = useTransform(scrollYProgress, [0, 0.5], [0, -20]);

    const stageOpacity = useTransform(scrollYProgress, [0.35, 0.6], [0, 1]);
    const stageScale = useTransform(scrollYProgress, [0.35, 0.8], [1.1, 1]);

    const revealOpacity = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <section
                className="relative w-full"
                style={{ height: '220vh' }}
            >
                <div className="sticky top-0 h-screen w-full overflow-hidden">

                    {/* ========================================
                    LAYER 1: Background (z-10, decorative)
                   ======================================== */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 10 }}
                >
                    <div className="absolute inset-0 bg-[#050505]" />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at 70% 80%, rgba(230, 43, 30, 0.2) 0%, transparent 50%)'
                        }}
                    />
                </div>

                {/* ========================================
                    LAYER 2: Microphone (z-15, decorative)
                    Positioned BEHIND interactive content
                   ======================================== */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        scale: micScale,
                        opacity: micOpacity,
                        y: micY,
                        zIndex: 15
                    }}
                >
                    <div className="absolute inset-0 flex items-end">
                        <img
                            src="/mic-cutout.png"
                            alt=""
                            className="h-[60vh] md:h-[68vh] lg:h-[72vh] w-auto object-contain object-left-bottom"
                            style={{
                                marginLeft: '-5%',
                                filter: 'drop-shadow(0 0 60px rgba(0,0,0,0.95)) drop-shadow(0 0 30px rgba(230, 43, 30, 0.2))'
                            }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                </motion.div>

                {/* ========================================
                    LAYER 3: Interactive Content (z-20)
                    Typography + CTA Buttons
                   ======================================== */}
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-12"
                    style={{
                        y: textY,
                        opacity: textOpacity,
                        zIndex: 20
                    }}
                >
                    {/* Event Label */}
                    <motion.p
                        className="text-white font-bold text-xs sm:text-sm md:text-base tracking-[0.4em] md:tracking-[0.5em] uppercase mb-6 md:mb-8 text-center w-full"
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        TEDxSRKR 2026
                    </motion.p>

                    {/* Main Heading */}
                    <motion.h1
                        className="font-sans text-center leading-[0.9]"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                    >
                        <span
                            className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white/90 tracking-tight"
                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8)' }}
                        >
                            THE FUTURE OF
                        </span>
                        <span
                            className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-black tracking-tighter mt-2 md:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-[#E62B1E] via-[#ff3d3d] to-[#E62B1E]"
                            style={{ filter: 'drop-shadow(0 4px 30px rgba(230, 43, 30, 0.5))' }}
                        >
                            IDEAS
                        </span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-center max-w-xl mt-8 md:mt-10 mb-10 md:mb-12 px-4 leading-relaxed tracking-wide"
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 1px 5px rgba(0,0,0,0.8)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        Step onto the stage. Change the world.
                    </motion.p>

                    {/* CTA Buttons - MUST be interactive */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 sm:gap-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        <motion.a
                            href="/register"
                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 h-14 bg-[#E62B1E] text-white font-bold text-base rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(230,43,30,0.6)] focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-black"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Ticket size={20} />
                                Get Tickets
                            </span>
                            <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-[#ff4d4d] to-[#cc2020] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* ========================================
                    LAYER 4: Stage Silhouette (z-25, decorative)
                   ======================================== */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        opacity: stageOpacity,
                        scale: stageScale,
                        zIndex: 25
                    }}
                >
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: 'url(/hero-next-chapter.jpg)' }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center top, rgba(230, 43, 30, 0.5) 0%, transparent 60%)'
                        }}
                    />
                </motion.div>

                {/* ========================================
                    LAYER 5: Revealed Content (z-35, decorative)
                   ======================================== */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
                    style={{
                        opacity: revealOpacity,
                        zIndex: 35
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 60%)'
                        }}
                    />

                    <div className="text-center relative">
                        <motion.h2
                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[10rem] font-black tracking-tighter leading-none"
                            style={{
                                color: '#ffffff',
                                textShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.95)',
                            }}
                        >
                            THE NEXT
                        </motion.h2>

                        <motion.h2
                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[10rem] font-black tracking-tighter leading-none -mt-1 md:-mt-4"
                            style={{
                                color: '#E62B1E',
                                textShadow: '0 0 60px rgba(230, 43, 30, 1), 0 0 120px rgba(230, 43, 30, 0.8), 0 4px 30px rgba(0,0,0,0.95)',
                            }}
                        >
                            CHAPTER
                        </motion.h2>
                    </div>
                </motion.div>

                {/* ========================================
                    LAYER 6: Scroll Indicator (z-40, decorative)
                   ======================================== */}
                <motion.div
                    className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
                    style={{
                        opacity: textOpacity,
                        zIndex: 40
                    }}
                >
                    <motion.div
                        className="flex flex-col items-center"
                        animate={{ y: [0, 8, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <span className="text-[10px] md:text-xs font-medium text-white/50 tracking-[0.25em] uppercase mb-3">
                            Scroll
                        </span>
                        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
                            <motion.div
                                className="w-1 h-2 bg-white/60 rounded-full"
                                animate={{ y: [0, 8, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* ========================================
                    LAYER 7: Ember Particles (z-12, decorative)
                   ======================================== */}
                <div className="absolute inset-0 pointer-events-none hidden lg:block" style={{ zIndex: 12 }}>
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                left: `${15 + i * 15}%`,
                                bottom: `${15 + (i % 3) * 10}%`,
                                width: `${3 + (i % 2)}px`,
                                height: `${3 + (i % 2)}px`,
                                background: 'radial-gradient(circle, rgba(230, 43, 30, 0.9) 0%, rgba(230, 43, 30, 0) 70%)',
                                boxShadow: '0 0 10px rgba(230, 43, 30, 0.8), 0 0 20px rgba(230, 43, 30, 0.4)',
                            }}
                            animate={{
                                y: [0, -50 - i * 8, 0],
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 5 + i * 0.5,
                                repeat: Infinity,
                                delay: i * 0.6,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
                </div>
            </section>
        </div>
    );
};

export default CinematicHero;
