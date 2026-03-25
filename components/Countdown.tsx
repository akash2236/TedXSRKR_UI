/**
 * Premium Countdown Timer - TEDxSRKR 2026
 * 
 * Design Language (matched to website):
 * ─────────────────────────────────────
 * - TEDx red (#E62B1E) as primary accent
 * - Dark cinematic background with subtle red radial glow
 * - Bold typography with dramatic scale
 * - Wide letter-spacing on labels (tracking-[0.3em])
 * - Glassmorphism cards with subtle borders
 * - Red glow effects matching hero aesthetic
 */

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ════════════════════════════════════════════════════════════════════════════
// Configuration
// ════════════════════════════════════════════════════════════════════════════

const EVENT_DATE = new Date('2026-03-26T09:00:00+05:30');

// ════════════════════════════════════════════════════════════════════════════
// Types & Helpers
// ════════════════════════════════════════════════════════════════════════════

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

function calculateTimeLeft(): TimeLeft {
    const diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
    };
}

// ════════════════════════════════════════════════════════════════════════════
// Animated Number Component
// ════════════════════════════════════════════════════════════════════════════

const AnimatedNumber = memo<{ value: number; isSeconds?: boolean; reducedMotion: boolean }>(
    ({ value, isSeconds, reducedMotion }) => {
        const formatted = String(value).padStart(2, '0');

        if (reducedMotion || !isSeconds) {
            return <span className="tabular-nums">{formatted}</span>;
        }

        // Only seconds get the micro-animation
        return (
            <span className="inline-flex">
                {formatted.split('').map((digit, i) => (
                    <span key={i} className="inline-block w-[0.6em] text-center overflow-hidden relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={`${i}-${digit}`}
                                initial={{ y: -4, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 4, opacity: 0 }}
                                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                                className="inline-block tabular-nums"
                            >
                                {digit}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                ))}
            </span>
        );
    }
);

AnimatedNumber.displayName = 'AnimatedNumber';

// ════════════════════════════════════════════════════════════════════════════
// Time Unit Card
// ════════════════════════════════════════════════════════════════════════════

interface TimeUnitProps {
    value: number;
    label: string;
    isSeconds?: boolean;
    isUrgent?: boolean;
    reducedMotion: boolean;
}

const TimeUnit = memo<TimeUnitProps>(({ value, label, isSeconds, isUrgent, reducedMotion }) => (
    <div className="flex flex-col items-center group">
        {/* Card */}
        <div
            className={`
                relative overflow-visible
                px-5 py-6 sm:px-7 sm:py-8 md:px-8 md:py-10
                rounded-2xl md:rounded-3xl
                backdrop-blur-sm
                transition-all duration-500
                ${isUrgent && isSeconds
                    ? 'bg-[#E62B1E]/10 border-2 border-[#E62B1E]/30'
                    : 'bg-white/[0.03] border border-white/[0.08]'
                }
            `}
        >
            {/* Glow effect behind each card */}
            <div
                className="absolute -inset-4 -z-10 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(230, 43, 30, 0.35) 0%, rgba(230, 43, 30, 0.15) 40%, transparent 70%)',
                    filter: 'blur(25px)',
                }}
            />

            {/* Subtle inner glow */}
            <div
                className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                    ${isUrgent && isSeconds
                        ? 'bg-gradient-to-b from-[#E62B1E]/10 to-transparent'
                        : 'bg-gradient-to-b from-white/[0.03] to-transparent'
                    }
                `}
            />

            {/* Number */}
            <div
                className={`
                    relative z-10
                    text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                    font-bold tracking-tight
                    ${isUrgent && isSeconds
                        ? 'text-[#E62B1E]'
                        : 'text-white'
                    }
                `}
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                <AnimatedNumber value={value} isSeconds={isSeconds} reducedMotion={reducedMotion} />
            </div>

            {/* Red accent line at top for seconds when urgent */}
            {isUrgent && isSeconds && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent" />
            )}
        </div>

        {/* Label */}
        <span
            className={`
                mt-4 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.3em]
                ${isUrgent && isSeconds ? 'text-[#E62B1E]' : 'text-white/50'}
            `}
        >
            {label}
        </span>
    </div>
));

TimeUnit.displayName = 'TimeUnit';

// ════════════════════════════════════════════════════════════════════════════
// Separator
// ════════════════════════════════════════════════════════════════════════════

const Separator = memo(() => (
    <div className="hidden md:flex flex-col items-center justify-center gap-3 self-center pb-8">
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="w-1 h-1 rounded-full bg-white/20" />
    </div>
));

Separator.displayName = 'Separator';

// ════════════════════════════════════════════════════════════════════════════
// Main Countdown Component
// ════════════════════════════════════════════════════════════════════════════

const Countdown: React.FC = () => {
    const [time, setTime] = useState<TimeLeft>(calculateTimeLeft);
    const [isHydrated, setIsHydrated] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setIsHydrated(true);

        // Sync to second boundary for precision
        const msToNext = 1000 - (Date.now() % 1000);
        const syncTimeout = setTimeout(() => {
            setTime(calculateTimeLeft());
            intervalRef.current = setInterval(() => setTime(calculateTimeLeft()), 1000);
        }, msToNext);

        return () => {
            clearTimeout(syncTimeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const reducedMotion = prefersReducedMotion ?? false;
    const isUrgent = useMemo(() => time.total <= 24 * 60 * 60 * 1000, [time.total]); // < 24 hours

    // Event complete
    if (time.total <= 0 && isHydrated) {
        return (
            <section className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#E62B1E]/5 to-transparent" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                        The Event Has <span className="text-[#E62B1E]">Begun</span>
                    </motion.h2>
                    <p className="text-white/60 text-lg">Welcome to TEDxSRKR 2026</p>
                </div>
            </section>
        );
    }

    return (
        <section
            className="py-20 md:py-28 lg:py-32 bg-[#0A0A0A] relative overflow-hidden"
            aria-label="Countdown to TEDxSRKR 2026"
        >
            {/* Background glow - matches hero style */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 100%, rgba(230, 43, 30, 0.08) 0%, transparent 50%)'
                }}
            />

            {/* Enhanced glow behind countdown timer */}
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                    width: '600px',
                    height: '400px',
                    background: 'radial-gradient(ellipse at center, rgba(230, 43, 30, 0.15) 0%, rgba(230, 43, 30, 0.08) 30%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                    width: '400px',
                    height: '300px',
                    background: 'radial-gradient(ellipse at center, rgba(230, 43, 30, 0.12) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Date badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
                        <span className="text-[#E62B1E] text-sm font-semibold">●</span>
                        <span className="text-white/60 text-sm font-medium tracking-wide">
                            March 26, 2026 · 9:00 AM IST
                        </span>
                    </div>

                    {/* Main heading - matches hero typography */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        Until Ideas Take the{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d]">
                            Stage
                        </span>
                    </h2>
                </motion.div>

                {/* Countdown grid */}
                <motion.div
                    className={`
                        flex flex-wrap justify-center items-start
                        gap-3 sm:gap-4 md:gap-5 lg:gap-6
                        max-w-4xl mx-auto
                        transition-opacity duration-500
                        ${isHydrated ? 'opacity-100' : 'opacity-0'}
                    `}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <TimeUnit value={time.days} label="Days" reducedMotion={reducedMotion} />
                    <Separator />
                    <TimeUnit value={time.hours} label="Hours" reducedMotion={reducedMotion} />
                    <Separator />
                    <TimeUnit value={time.minutes} label="Minutes" reducedMotion={reducedMotion} />
                    <Separator />
                    <TimeUnit value={time.seconds} label="Seconds" isSeconds isUrgent={isUrgent} reducedMotion={reducedMotion} />
                </motion.div>

                {/* Urgency message */}
                <AnimatePresence>
                    {isUrgent && time.total > 0 && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center mt-10 text-[#E62B1E] text-sm font-medium tracking-wide"
                        >
                            {time.total <= 60 * 60 * 1000
                                ? '⏱ Less than an hour remaining'
                                : '📅 Less than 24 hours to go'
                            }
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Countdown;