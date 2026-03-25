import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Ticket } from 'lucide-react';

/* ─────────────────────────────────────────
   SVG real-ticket shape with neon glow
───────────────────────────────────────── */
const NeonTicketSVG: React.FC = () => {
    const W = 260;
    const H = 380;
    const cr = 18;      // corner radius
    const nr = 26;      // notch radius
    const ny = H * 0.52; // notch vertical centre

    // Real ticket path: rectangle with rounded corners + concave notches on both sides
    const d = [
        `M ${cr} 0`,
        `L ${W - cr} 0`,
        `Q ${W} 0 ${W} ${cr}`,
        `L ${W} ${ny - nr}`,
        `A ${nr} ${nr} 0 0 0 ${W} ${ny + nr}`,   // right notch (concave inward)
        `L ${W} ${H - cr}`,
        `Q ${W} ${H} ${W - cr} ${H}`,
        `L ${cr} ${H}`,
        `Q 0 ${H} 0 ${H - cr}`,
        `L 0 ${ny + nr}`,
        `A ${nr} ${nr} 0 0 0 0 ${ny - nr}`,       // left notch (concave inward)
        `L 0 ${cr}`,
        `Q 0 0 ${cr} 0 Z`,
    ].join(' ');

    // Dashed bars (like in the reference image)
    const dashY = ny;
    const dashBars = [40, 75, 110, 145];

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            style={{ overflow: 'visible', display: 'block' }}
        >
            <defs>
                {/* Main body gradient — deep crimson to dark red */}
                <linearGradient id="tg-body" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a0202" />
                    <stop offset="40%" stopColor="#5a0a0a" />
                    <stop offset="75%" stopColor="#8b1010" />
                    <stop offset="100%" stopColor="#b81a1a" />
                </linearGradient>

                {/* Edge glow gradient (stroke) */}
                <linearGradient id="tg-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6644" stopOpacity="1" />
                    <stop offset="40%" stopColor="#E62B1E" stopOpacity="1" />
                    <stop offset="70%" stopColor="#ff3333" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff8866" stopOpacity="1" />
                </linearGradient>

                {/* Gloss overlay gradient */}
                <linearGradient id="tg-gloss" x1="0%" y1="0%" x2="30%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Outer bloom filter */}
                <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
                    <feColorMatrix in="blur" type="matrix"
                        values="0 0 0 0 0.9
                                0 0 0 0 0.15
                                0 0 0 0 0.1
                                0 0 0 0.8 0" result="colorBlur" />
                    <feMerge>
                        <feMergeNode in="colorBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Crisp edge glow filter */}
                <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Clip path using the same ticket shape */}
                <clipPath id="tc">
                    <path d={d} />
                </clipPath>
            </defs>

            {/* ── Layer 1: outer bloom (blurred copy) */}
            <path d={d} fill="#8B1010" filter="url(#bloom)" opacity="0.7" />

            {/* ── Layer 2: main body */}
            <path d={d} fill="url(#tg-body)" />

            {/* ── Layer 3: gloss overlay (clipped inside ticket) */}
            <rect x="0" y="0" width={W} height={H}
                fill="url(#tg-gloss)"
                clipPath="url(#tc)" />

            {/* ── Layer 4: neon edge stroke */}
            <path d={d}
                fill="none"
                stroke="url(#tg-edge)"
                strokeWidth="2.5"
                filter="url(#edgeGlow)"
                opacity="0.95" />

            {/* ── Layer 5: horizontal dashed perforation */}
            <line
                x1={nr + 4} y1={dashY}
                x2={W - nr - 4} y2={dashY}
                stroke="#ff6644"
                strokeWidth="1.8"
                strokeDasharray="7 5"
                opacity="0.7"
            />

            {/* ── Layer 6: dashed vertical bars below perforation (like reference) */}
            <g opacity="0.45">
                {dashBars.map((x) => (
                    <rect key={x}
                        x={x} y={dashY + 18}
                        width={22} height={8}
                        rx={3}
                        fill="#E62B1E" />
                ))}
            </g>

            {/* ── Layer 7: TEDx text inside ticket with proper superscript x */}
            <text
                textAnchor="middle"
                fontFamily="'Arial Black', sans-serif"
                fontWeight="900"
                fill="white"
                opacity="0.25"
            >
                <tspan x={W / 2} y={dashY - 28} fontSize="20">TED</tspan>
                <tspan fontSize="12" dy="-7">x</tspan>
                <tspan fontSize="20" dy="7">SRKR</tspan>
            </text>

            {/* ── Layer 8: corner accent dots */}
            {[[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={3} fill="#ff6644" opacity="0.5" />
            ))}
        </svg>
    );
};

/* ─────────────────────────────────────────
   3-D rotating wrapper
───────────────────────────────────────── */
const Ticket3D: React.FC = () => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const isHovering = useRef(false);
    const angleRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    const rotY = useMotionValue(-20);
    const rotX = useMotionValue(12);

    const springY = useSpring(rotY, { stiffness: 60, damping: 16 });
    const springX = useSpring(rotX, { stiffness: 60, damping: 16 });

    // subtle scale on hover
    const scaleVal = useSpring(1, { stiffness: 120, damping: 14 });

    useEffect(() => {
        const spin = () => {
            if (!isHovering.current) {
                angleRef.current += 0.35;
                const a = angleRef.current;
                rotY.set(Math.sin((a * Math.PI) / 180) * 38);
                rotX.set(Math.cos((a * Math.PI) / 240) * 14);
            }
            rafRef.current = requestAnimationFrame(spin);
        };
        rafRef.current = requestAnimationFrame(spin);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []);

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotY.set(x * 55);
        rotX.set(-y * 35);
    };

    const onEnter = () => { isHovering.current = true; scaleVal.set(1.06); };
    const onLeave = () => {
        isHovering.current = false;
        rotY.set(-20);
        rotX.set(12);
        scaleVal.set(1);
    };

    return (
        <div
            ref={wrapRef}
            onMouseMove={onMouseMove}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{ perspective: '900px', cursor: 'grab' }}
            className="select-none flex items-center justify-center"
        >
            <motion.div
                style={{
                    rotateY: springY,
                    rotateX: springX,
                    scale: scaleVal,
                    transformStyle: 'preserve-3d',
                }}
            >
                <NeonTicketSVG />

                {/* Floor shadow */}
                <motion.div
                    style={{ rotateX: '90deg', translateZ: '-40px', translateY: '20px' }}
                    className="absolute inset-x-6 h-8 bg-[#4422ff]/20 blur-2xl rounded-full"
                />
            </motion.div>
        </div>
    );
};

/* ─────────────────────────────────────────
   Full Section
───────────────────────────────────────── */
const TicketSection: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) controls.start('visible');
    }, [isInView, controls]);

    const fade = (delay = 0): Variants => ({
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut', delay } }
    });

    const ticketFeatures = [
        'Entry to all sessions',
        'Networking with speakers',
        'Conference kit & goodies',
        'Access to the auditorium',
    ];

    return (
        <section ref={ref} className="py-20 md:py-28 bg-[#0A0A0A] relative overflow-hidden">
            {/* Ambient purple glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#E62B1E]/8 blur-[160px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Section header */}
                <motion.div className="text-center mb-16" initial="hidden" animate={controls}>
                    <motion.p variants={fade(0)} className="text-[#E62B1E] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                        Limited Seats Available
                    </motion.p>
                    <motion.h2 variants={fade(0.12)} className="font-sans text-3xl md:text-5xl font-bold text-white mb-4">
                        Get Your <span className="text-[#E62B1E]">Ticket</span>
                    </motion.h2>
                    <motion.p variants={fade(0.22)} className="text-gray-400 max-w-lg mx-auto text-base md:text-lg">
                        Secure your spot at TEDxSRKR 2026 — experience ideas that change the world.
                    </motion.p>
                </motion.div>

                {/* Layout: ticket + info */}
                <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20 max-w-5xl mx-auto">

                    {/* 3D Ticket */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        className="flex-shrink-0"
                    >
                        <Ticket3D />
                        <p className="text-center text-gray-600 text-xs mt-4 tracking-wide">
                            🖱 Hover to interact
                        </p>
                    </motion.div>

                    {/* Ticket-shaped info card */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 }}
                        className="flex-1 max-w-sm mx-auto lg:mx-0"
                    >
                        {/* Outer ticket wrapper — black bg, red X watermark */}
                        <div
                            className="relative rounded-2xl overflow-hidden border border-[#E62B1E]/30 shadow-[0_20px_60px_rgba(230,43,30,0.25)]"
                            style={{ background: '#0d0d0d' }}
                        >
                            {/* Large red X watermark — fills full card via scale */}
                            <div
                                aria-hidden
                                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                            >
                                <span
                                    style={{
                                        fontSize: '4rem',
                                        fontWeight: 900,
                                        lineHeight: 1,
                                        color: '#E62B1E',
                                        opacity: 0.10,
                                        fontFamily: "'Arial Black', sans-serif",
                                        userSelect: 'none',
                                        display: 'block',
                                        transform: 'scale(14)',
                                    }}
                                >
                                    x
                                </span>
                            </div>
                            {/* ── TOP STUB ── */}
                            <div className="relative z-10 px-7 pt-6 pb-5">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">
                                        TED<sup style={{ fontSize: '7px', verticalAlign: 'super', fontWeight: 900, letterSpacing: 0 }}>x</sup>SRKR 2026
                                    </p>
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                                        <Ticket size={15} className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-white text-xl font-bold tracking-wide">ENTRY PASS</h3>
                                <p className="text-white/40 text-xs mt-0.5">Access to the Auditorium</p>
                            </div>

                            {/* ── PERFORATION ROW with notch circles ── */}
                            <div className="relative z-10 flex items-center">
                                {/* Left notch circle (bleeds outside card) */}
                                <div
                                    className="absolute -left-4 w-8 h-8 rounded-full z-10"
                                    style={{ background: '#0A0A0A' }}
                                />
                                {/* Dashed line */}
                                <div className="flex-1 mx-6 border-t-2 border-dashed border-white/15" />
                                {/* Right notch circle */}
                                <div
                                    className="absolute -right-4 w-8 h-8 rounded-full z-10"
                                    style={{ background: '#0A0A0A' }}
                                />
                            </div>

                            {/* ── BOTTOM BODY ── */}
                            <div className="relative z-10 px-7 pt-5 pb-7">
                                {/* Single admission + price */}
                                <p className="text-white/50 text-xs mb-1">Single Admission</p>
                                <div className="flex items-baseline gap-1 mb-5">
                                    <span className="text-white/70 text-xl font-semibold">₹</span>
                                    <span className="text-white text-5xl font-bold leading-none tracking-tight">200</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2.5 mb-6">
                                    {ticketFeatures.map((feat, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ delay: 0.65 + i * 0.1, duration: 0.5 }}
                                            className="flex items-center gap-2.5 text-white/70 text-sm"
                                        >
                                            <CheckCircle2 size={15} className="text-[#ff6644] flex-shrink-0" />
                                            {feat}
                                        </motion.li>
                                    ))}
                                </ul>

                                {/* Thin divider */}
                                <div className="border-t border-white/10 mb-5" />

                                {/* Buy button */}
                                <Link
                                    to="/register"
                                    className="group flex items-center justify-between w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-bold px-5 py-3.5 rounded-xl transition-all duration-300 text-sm"
                                >
                                    <span>Buy Ticket</span>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E62B1E] group-hover:bg-[#c8241a] transition-colors">
                                        <ArrowUpRight size={16} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </Link>

                                <p className="text-white/30 text-[10px] text-center mt-4">
                                    By purchasing you agree to our Terms & Conditions
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TicketSection;
