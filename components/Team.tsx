/**
 * Team Section - Premium TED-Style Design
 * 
 * Design Principles:
 * ─────────────────
 * - Consistent auto-fit grid for even alignment regardless of member count
 * - Uniform card sizing with fixed aspect ratios
 * - Clear visual hierarchy: Section title → Cards → CTA
 * - Balanced negative space with consistent vertical rhythm
 * - Dark minimalist aesthetic with high contrast
 * 
 * Motion & Interaction Enhancements:
 * ──────────────────────────────────
 * - Pre-hover affordances for interactivity hints
 * - Layered hover effects with elevation and scaling
 * - Role hierarchy encoded through animation timing
 * - Reduced harsh grayscale while preserving monochrome aesthetic
 * - Section-level entrance animations
 * - Mobile tap interactions replicating hover behavior
 * - Accessibility: respects reduced motion and contrast preferences
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TEAM_CATEGORIES } from '../constants';
import { Linkedin, Instagram, Mail } from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
// Animation Variants
// ════════════════════════════════════════════════════════════════════════════

const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            delay: i * 0.06,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        },
    }),
};

// Role hierarchy timing - leadership roles animate slightly faster
const getRoleDelay = (role: string, baseIndex: number): number => {
    const isLeadership = /lead|head|director|organizer|licensee/i.test(role);
    return isLeadership ? baseIndex * 0.04 : baseIndex * 0.06;
};

// ════════════════════════════════════════════════════════════════════════════
// Team Member Card Component
// ════════════════════════════════════════════════════════════════════════════

interface MemberCardProps {
    id: string;
    name: string;
    role: string;
    image: string;
    linkedin?: string;
    instagram?: string;
    isOpenPosition?: boolean;
    index: number;
}

const MemberCard: React.FC<MemberCardProps> = ({
    id,
    name,
    role,
    image,
    linkedin,
    instagram,
    isOpenPosition,
    index,
}) => {
    const [isActive, setIsActive] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => { if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current); };
    }, []);

    // Handle social link click without nesting anchors
    const handleSocialClick = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Mobile tap handling
    const handleTouchStart = () => setIsActive(true);
    const handleTouchEnd = () => {
        if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = setTimeout(() => setIsActive(false), 300);
    };

    if (isOpenPosition) {
        return (
            <motion.div
                variants={cardVariants}
                custom={index}
                className="flex flex-col"
            >
                <div className="aspect-[3/4] w-full bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#E62B1E]/30 hover:bg-[#E62B1E]/[0.02] transition-all duration-500">
                    <div className="w-12 h-12 rounded-full bg-[#E62B1E]/10 flex items-center justify-center">
                        <span className="text-2xl text-[#E62B1E]">+</span>
                    </div>
                    <span className="text-white/40 text-sm font-medium">Open Position</span>
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-base font-bold text-[#E62B1E] uppercase tracking-wider">
                        {role}
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Join our team</p>
                </div>
            </motion.div>
        );
    }

    const roleDelay = getRoleDelay(role, index);

    return (
        <motion.div
            variants={cardVariants}
            custom={index}
            className="group flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Image Container - Wrapped in Link */}
            <Link
                to={`/team/${id}`}
                className="block relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white/[0.02]"
            >
                {/* ── Animated red glowing border ── */}
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                    initial={false}
                    animate={{
                        boxShadow: isActive
                            ? '0 0 0 2px #E62B1E, 0 0 30px 6px rgba(230,43,30,0.55), 0 0 60px 10px rgba(230,43,30,0.25)'
                            : '0 0 0 1.5px rgba(230,43,30,0)',
                    }}
                    transition={{ duration: 0.35 }}
                    style={{
                        '--tw-shadow': 'none',
                    } as React.CSSProperties}
                />
                {/* Also animate on group-hover via CSS */}
                <div
                    className={`
                        absolute inset-0 rounded-2xl pointer-events-none z-20
                        border-2 transition-all duration-500 ease-out
                        border-transparent
                        group-hover:border-[#E62B1E]
                        group-hover:shadow-[0_0_0_2px_#E62B1E,0_0_30px_6px_rgba(230,43,30,0.5),0_0_60px_12px_rgba(230,43,30,0.2)]
                    `}
                />

                {/* Image */}
                <motion.img
                    src={image}
                    alt={`${name}, ${role}`}
                    loading="lazy"
                    className={`
                        w-full h-full object-cover object-top
                        transition-all duration-500 ease-out
                        grayscale-[60%] group-hover:grayscale-0
                        ${!prefersReducedMotion ? 'group-hover:scale-[1.04]' : ''}
                        ${isActive ? 'grayscale-0 scale-[1.04]' : ''}
                    `}
                />

                {/* Gradient overlay at bottom — always subtle, stronger on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* TEDxSRKR Label — top left */}
                <div className="absolute top-3 left-3 z-30 pointer-events-none">
                    <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                        <span className="text-[#E62B1E] font-extrabold text-xs tracking-tighter">TED</span>
                        <span className="text-[#E62B1E] font-extrabold text-[9px] -mt-1 align-super">x</span>
                        <span className="text-white font-bold text-xs tracking-wide">SRKR</span>
                    </div>
                </div>

                {/* Social links */}
                {(linkedin || instagram) && (
                    <motion.div
                        className="absolute top-3 right-3 z-30 flex flex-col gap-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ opacity: undefined }}
                    >
                        {linkedin && (
                            <motion.button
                                type="button"
                                onClick={(e) => handleSocialClick(e, linkedin)}
                                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[#0077B5] transition-colors duration-200 focus:outline-none opacity-0 group-hover:opacity-100"
                                aria-label={`${name} on LinkedIn`}
                                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Linkedin size={15} />
                            </motion.button>
                        )}
                        {instagram && (
                            <motion.button
                                type="button"
                                onClick={(e) => handleSocialClick(e, instagram)}
                                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[#E1306C] transition-colors duration-200 focus:outline-none opacity-0 group-hover:opacity-100"
                                aria-label={`${name} on Instagram`}
                                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Instagram size={15} />
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* Name + Role overlay at bottom — like TEDxVishnu reference */}
                <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-8">
                    {/* Red left accent bar */}
                    <div className="flex items-start gap-3">
                        <div className="w-1 h-full min-h-[2.5rem] bg-[#E62B1E] rounded-full flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-white font-bold text-base leading-tight tracking-wide">
                                {name}
                            </h3>
                            <p className="text-[#E62B1E] text-[10px] font-bold uppercase tracking-widest mt-1">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// Main Team Component
// ════════════════════════════════════════════════════════════════════════════

const Team: React.FC = () => {
    const prefersReducedMotion = useReducedMotion();

    // Section entrance animation variants
    const headerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: prefersReducedMotion ? 0.1 : 0.6,
                ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            },
        },
    };

    const categoryHeaderVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: prefersReducedMotion ? 0.1 : 0.5,
                ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            },
        },
    };

    return (
        <section id="team" className="py-24 md:py-32 lg:py-40 bg-[#0A0A0A] overflow-hidden">
            <div className="container mx-auto px-6 md:px-8 lg:px-12">

                {/* Page Header */}
                <motion.header
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={headerVariants}
                    className="text-center mb-20 md:mb-28 lg:mb-32"
                >
                    {/* Badge with subtle pulse */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    >
                        <motion.span
                            className="text-[#E62B1E] font-bold"
                            animate={prefersReducedMotion ? {} : {
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            ●
                        </motion.span>
                        <span className="text-white/60 text-sm font-medium tracking-wide">TEDxSRKR 2026</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        Meet The{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d]">
                            Team
                        </span>
                    </h1>
                    <p className="mt-6 text-white/40 text-lg max-w-2xl mx-auto">
                        The passionate individuals working behind the scenes to bring ideas worth spreading to life.
                    </p>
                </motion.header>

                {/* Team Categories */}
                <div className="space-y-24 md:space-y-32 lg:space-y-40">
                    {TEAM_CATEGORIES.map((category, catIndex) => {
                        const memberCount = category.members.length;

                        return (
                            <section key={category.id} aria-labelledby={`category-${category.id}`}>
                                {/* Category Header with slide-in animation */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={categoryHeaderVariants}
                                    className="mb-10 md:mb-14"
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <h2
                                            id={`category-${category.id}`}
                                            className="text-2xl md:text-3xl font-bold text-white tracking-tight"
                                        >
                                            {category.name}
                                        </h2>
                                        <motion.div
                                            className="hidden md:block h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"
                                            initial={{ scaleX: 0, originX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: prefersReducedMotion ? 0.1 : 0.8,
                                                delay: 0.2,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                        />
                                        <motion.span
                                            className="text-white/20 text-sm font-medium"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                                        </motion.span>
                                    </div>
                                    {category.description && (
                                        <p className="text-white/40 text-sm md:text-base max-w-xl">
                                            {category.description}
                                        </p>
                                    )}
                                </motion.div>

                                {/* 
                                    Grid System with staggered entrance:
                                    - Uses CSS Grid with auto-fit for responsive columns
                                    - minmax ensures minimum card width of 200px
                                    - justify-center centers orphan cards
                                    - max-width constrains grid width for small member counts
                                */}
                                <motion.div
                                    className="grid gap-6 md:gap-8 justify-center"
                                    style={{
                                        gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
                                        maxWidth: memberCount <= 2 ? '620px' : memberCount <= 3 ? '900px' : '100%',
                                        margin: memberCount <= 3 ? '0 auto' : undefined,
                                    }}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={sectionVariants}
                                >
                                    {category.members.map((member, index) => (
                                        <MemberCard
                                            key={member.id}
                                            id={member.id}
                                            name={member.name}
                                            role={member.role}
                                            image={member.image}
                                            linkedin={member.linkedin}
                                            instagram={member.instagram}
                                            isOpenPosition={member.isOpenPosition}
                                            index={index}
                                        />
                                    ))}
                                </motion.div>
                            </section>
                        );
                    })}
                </div>

                {/* Join CTA with enhanced hover state */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
                    className="mt-28 md:mt-36 lg:mt-44 text-center"
                >
                    <motion.div
                        className="max-w-xl mx-auto p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.06] transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.03]"
                        whileHover={prefersReducedMotion ? {} : {
                            y: -4,
                            boxShadow: '0 20px 40px -12px rgba(230, 43, 30, 0.15)',
                        }}
                    >
                        <motion.div
                            className="w-12 h-12 rounded-full bg-[#E62B1E]/10 flex items-center justify-center mx-auto mb-6"
                            whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Mail className="w-5 h-5 text-[#E62B1E]" />
                        </motion.div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Want to Join Us?
                        </h3>
                        <p className="text-white/40 mb-8">
                            We're always looking for passionate individuals to help bring ideas worth spreading to life.
                        </p>
                        <motion.a
                            href="mailto:team@tedxsrkr.com"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E62B1E] text-white font-semibold rounded-full hover:bg-[#cc2019] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
                            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get in Touch
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Team;