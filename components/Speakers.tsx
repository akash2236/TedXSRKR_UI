/**
 * Speakers Component - Premium TEDxSRKR 2026 Design
 * 
 * Design Philosophy:
 * ─────────────────
 * - Cinematic hero section with gradient background
 * - Featured speaker spotlight with dynamic content
 * - Responsive grid that adapts to speaker count
 * - Accessibility-first (keyboard focus, screen readers)
 * 
 * UX Enhancements:
 * ────────────────
 * - Stronger visual flow: headline → stats → featured speaker
 * - Informative stats with contextual meaning
 * - Clearer featured speaker hierarchy with interaction cues
 * - Pre-hover affordances on all cards
 * - Smooth section transitions
 * - Engaging "more speakers" CTA
 * - Mobile tap interactions
 * - Reduced motion support
 * - Animated counters
 * - Search and filtering
 * - Image loading states
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getSpeakers } from '../lib/adminApi';
import { Mic, Quote, ChevronRight, Sparkles, Users, Clock, Layers, ArrowRight, Search, X, Instagram, Linkedin } from 'lucide-react';

// Speaker shape used by this component (normalized from DB)
interface SpeakerItem {
    id: string;      // slug used for routing
    name: string;
    title: string;
    topic: string;
    image: string;
    talkDescription?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// Animated Counter Component
// ════════════════════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, suffix = '', duration = 1.5 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (!isInView) return;
        
        if (prefersReducedMotion) {
            setCount(value);
            return;
        }

        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, value, duration, prefersReducedMotion]);

    return <div ref={ref}>{count}{suffix}</div>;
};

// ════════════════════════════════════════════════════════════════════════════
// Speaker Card Component
// ════════════════════════════════════════════════════════════════════════════

interface SpeakerCardProps {
    speaker: SpeakerItem;
    index: number;
    isFeatured?: boolean;
    totalCount: number;
}

const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker, index, isFeatured, totalCount }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    // Mobile tap handling
    const handleTouchStart = () => setIsActive(true);
    const handleTouchEnd = () => setTimeout(() => setIsActive(false), 300);

    // Extract topic without quotes
    const topicText = speaker.topic.replace(/"/g, '');

    if (isFeatured) {
        return (
            <Link to={`/speakers/${speaker.id}`} className="block">
                <motion.article
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, delay: 0.2 }}
                    className="relative group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    aria-label={`Featured speaker: ${speaker.name}, ${speaker.title}. Topic: ${topicText}`}
                >
                    {/* Pre-hover affordance glow */}
                    <div 
                        className={`
                            absolute -inset-1 rounded-3xl pointer-events-none
                            bg-gradient-to-r from-[#E62B1E]/20 via-[#E62B1E]/5 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl
                            ${isActive ? 'opacity-100' : ''}
                        `}
                        aria-hidden="true"
                    />
                    
                    <div className={`
                        relative grid md:grid-cols-2 gap-0 
                        bg-gradient-to-br from-white/[0.04] to-transparent 
                        rounded-3xl overflow-hidden 
                        border border-white/[0.08] 
                        transition-all duration-500
                        group-hover:border-white/[0.15] group-hover:shadow-[0_20px_60px_-15px_rgba(230,43,30,0.2)]
                        group-focus-visible:ring-2 group-focus-visible:ring-[#E62B1E] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#0A0A0A]
                        ${isActive ? 'border-white/[0.15] shadow-[0_20px_60px_-15px_rgba(230,43,30,0.2)]' : ''}
                    `}>
                        {/* Image side */}
                        <div className="relative aspect-square md:aspect-[4/5] lg:aspect-square overflow-hidden">
                            {/* Skeleton loader */}
                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
                            )}
                            <motion.img
                                src={speaker.image}
                                alt={`Portrait of ${speaker.name}`}
                                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setImageLoaded(true)}
                                animate={{ scale: (isHovered || isActive) && !prefersReducedMotion ? 1.05 : 1 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            />
                            {/* Gradient overlays */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A0A0A] hidden md:block" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent md:hidden" />

                            {/* Featured badge */}
                            <motion.div 
                                className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[#E62B1E] rounded-full shadow-lg"
                                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                                <span className="text-white text-xs font-semibold uppercase tracking-wider">Featured</span>
                            </motion.div>
                        </div>

                        {/* Content side - Enhanced hierarchy */}
                        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                            <motion.div
                                animate={{ x: (isHovered || isActive) && !prefersReducedMotion ? 4 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Speaker credentials first for credibility */}
                                <p className="text-white/50 text-sm uppercase tracking-wider mb-2">{speaker.title}</p>
                                
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                                    {speaker.name}
                                </h3>

                                {/* Topic with stronger emphasis */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E62B1E]/10 border border-[#E62B1E]/20 rounded-full mb-6">
                                    <Mic className="w-4 h-4 text-[#E62B1E] flex-shrink-0" aria-hidden="true" />
                                    <span className="text-[#E62B1E] text-sm font-semibold">{topicText}</span>
                                </div>

                                {/* Talk value proposition */}
                                <blockquote className="relative pl-4 border-l-2 border-[#E62B1E]/50 mb-6">
                                    <Quote className="absolute -left-3 -top-2 w-5 h-5 text-[#E62B1E]/40" aria-hidden="true" />
                                    <p className="text-white/70 text-base md:text-lg leading-relaxed">
                                        {speaker.talkDescription 
                                            ? speaker.talkDescription.slice(0, 120) + '...'
                                            : `Discover insights on ${topicText.toLowerCase()} that will reshape your perspective.`
                                        }
                                    </p>
                                </blockquote>

                                {/* Talk info with context */}
                                <div className="flex items-center gap-6 text-white/50 text-sm mb-6">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#E62B1E]/60" aria-hidden="true" />
                                        <span>18 min talk</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#E62B1E]/60" aria-hidden="true" />
                                        <span>Live Q&A</span>
                                    </span>
                                </div>

                                {/* Clear interaction cue */}
                                <motion.div
                                    className={`
                                        inline-flex items-center gap-2 text-[#E62B1E] font-medium
                                        transition-opacity duration-300
                                        ${(isHovered || isActive) ? 'opacity-100' : 'opacity-60'}
                                    `}
                                    animate={{ x: (isHovered || isActive) && !prefersReducedMotion ? 4 : 0 }}
                                >
                                    <span>View full profile</span>
                                    <ArrowRight className="w-4 h-4" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.article>
            </Link>
        );
    }

    // Regular speaker card - Enhanced
    return (
        <Link to={`/speakers/${speaker.id}`} className="block">
            <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group relative h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-label={`Speaker: ${speaker.name}, ${speaker.title}. Topic: ${topicText}`}
            >
                {/* Pre-hover affordance - subtle border glow */}
                <div 
                    className={`
                        absolute -inset-0.5 rounded-2xl pointer-events-none
                        bg-gradient-to-b from-white/5 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-400
                        ${isActive ? 'opacity-100' : ''}
                    `}
                    aria-hidden="true"
                />
                
                <div className={`
                    relative bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden 
                    transition-all duration-300 h-full
                    group-hover:border-white/[0.15] group-hover:bg-white/[0.03]
                    group-hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)]
                    group-focus-visible:ring-2 group-focus-visible:ring-[#E62B1E] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#0A0A0A]
                    ${isActive ? 'border-white/[0.15] bg-white/[0.03] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)]' : ''}
                `}>
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                        {/* Skeleton loader */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
                        )}
                        <motion.img
                            src={speaker.image}
                            alt={`Portrait of ${speaker.name}`}
                            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            animate={{ scale: (isHovered || isActive) && !prefersReducedMotion ? 1.06 : 1 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />

                        {/* Gradient overlay - enhanced for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

                        {/* Topic badge - always visible with better contrast */}
                        <div className="absolute top-4 left-4 right-4">
                            <div className={`
                                inline-flex items-center gap-2 px-3 py-1.5 
                                bg-black/60 backdrop-blur-md border border-white/10 rounded-full 
                                max-w-full transition-all duration-300
                                group-hover:bg-black/80 group-hover:border-[#E62B1E]/30
                                ${isActive ? 'bg-black/80 border-[#E62B1E]/30' : ''}
                            `}>
                                <Mic className="w-3 h-3 text-[#E62B1E] flex-shrink-0" aria-hidden="true" />
                                <span className="text-white/90 text-xs truncate font-medium">{topicText}</span>
                            </div>
                        </div>

                        {/* Content overlay - improved hierarchy */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                            <p className="text-[#E62B1E]/80 text-xs uppercase tracking-wider mb-1 font-medium">{speaker.title}</p>
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {speaker.name}
                            </h3>
                            
                            {/* Interaction cue - always slightly visible */}
                            <motion.div
                                className={`
                                    flex items-center gap-1.5 mt-3 text-sm
                                    transition-all duration-300
                                    ${(isHovered || isActive) ? 'text-white/80' : 'text-white/40'}
                                `}
                                animate={{ y: (isHovered || isActive) && !prefersReducedMotion ? 0 : 4, opacity: (isHovered || isActive) ? 1 : 0.7 }}
                                transition={{ duration: 0.25 }}
                            >
                                <span>View profile</span>
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Red accent line - enhanced */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: (isHovered || isActive) ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ transformOrigin: 'left' }}
                        aria-hidden="true"
                    />
                </div>
            </motion.article>
        </Link>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// Main Speakers Component
// ════════════════════════════════════════════════════════════════════════════

const Speakers: React.FC = () => {
    const prefersReducedMotion = useReducedMotion();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [speakersData, setSpeakersData] = useState<SpeakerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch published speakers from Supabase
    useEffect(() => {
        setIsLoading(true);
        getSpeakers({ status: 'published', limit: 100 })
            .then(result => {
                const mapped: SpeakerItem[] = result.data.map(s => ({
                    id: s.slug,
                    name: s.name,
                    title: s.title,
                    topic: s.topic,
                    image: s.image_url,
                    talkDescription: s.bio || undefined,
                }));
                setSpeakersData(mapped);
            })
            .catch(err => console.error('Failed to load speakers:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const featuredSpeaker = speakersData[0];
    const otherSpeakers = speakersData.slice(1);
    const totalSpeakers = speakersData.length;
    const totalTalkMinutes = totalSpeakers * 18;

    // Extract unique topics for filtering
    const allTopics = useMemo(() => {
        const topics = speakersData.map(s => s.topic.replace(/"/g, ''));
        return [...new Set(topics)];
    }, [speakersData]);

    // Filter speakers based on search and topic
    const filteredOtherSpeakers = useMemo(() => {
        return otherSpeakers.filter(speaker => {
            const matchesSearch = searchQuery === '' || 
                speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                speaker.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                speaker.title.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesTopic = !selectedTopic || 
                speaker.topic.replace(/"/g, '') === selectedTopic;
            
            return matchesSearch && matchesTopic;
        });
    }, [otherSpeakers, searchQuery, selectedTopic]);

    // Check if featured speaker matches filters
    const showFeaturedSpeaker = useMemo(() => {
        if (!featuredSpeaker) return false;
        const matchesSearch = searchQuery === '' || 
            featuredSpeaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            featuredSpeaker.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            featuredSpeaker.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTopic = !selectedTopic || 
            featuredSpeaker.topic.replace(/"/g, '') === selectedTopic;
        
        return matchesSearch && matchesTopic;
    }, [featuredSpeaker, searchQuery, selectedTopic]);

    const hasActiveFilters = searchQuery !== '' || selectedTopic !== null;

    // Dynamic grid columns based on speaker count
    const getGridCols = () => {
        const count = filteredOtherSpeakers.length;
        if (count === 1) return 'grid-cols-1 max-w-md';
        if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl';
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    };

    // Animation variants
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.1,
                delayChildren: 0.1,
            },
        },
    };

    // Loading state
    if (isLoading) {
        return (
            <section id="speakers" className="relative bg-[#0A0A0A] overflow-hidden">
                <div className="flex items-center justify-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]" />
                </div>
            </section>
        );
    }

    // Empty state when no speakers in DB
    if (!isLoading && speakersData.length === 0) {
        return (
            <section id="speakers" className="relative bg-[#0A0A0A] overflow-hidden">
                <div className="py-40 text-center">
                    <Mic className="w-16 h-16 text-white/10 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Speakers Coming Soon</h2>
                    <p className="text-white/40">Our lineup will be announced shortly. Stay tuned!</p>
                </div>
            </section>
        );
    }

    return (
        <section id="speakers" className="relative bg-[#0A0A0A] overflow-hidden">
            {/* Hero Section */}
            <div className="relative py-24 md:py-32">
                {/* Background effects - enhanced visual flow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at 30% 20%, rgba(230, 43, 30, 0.1) 0%, transparent 50%)'
                    }}
                    aria-hidden="true"
                />
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at 70% 80%, rgba(230, 43, 30, 0.05) 0%, transparent 40%)'
                    }}
                    aria-hidden="true"
                />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />

                <div className="container mx-auto px-6">
                    {/* Header - Enhanced visual flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
                        className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
                    >
                        {/* Badge with subtle animation */}
                        <motion.div 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6"
                            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                        >
                            <motion.span 
                                className="text-[#E62B1E] font-bold" 
                                aria-hidden="true"
                                animate={prefersReducedMotion ? {} : { opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                ●
                            </motion.span>
                            <span className="text-white/60 text-sm font-medium tracking-wide">TEDxSRKR 2026</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
                            Meet Our{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d]">
                                Speakers
                            </span>
                        </h1>

                        <p className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                            Visionaries, innovators, and thought leaders sharing ideas that will change the way you see the world.
                        </p>
                    </motion.div>

                    {/* Stats - Animated counters with context */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.6, delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12 md:mb-16"
                    >
                        <motion.div 
                            className="text-center flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                            whileHover={prefersReducedMotion ? {} : { y: -2 }}
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#E62B1E]/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#E62B1E]" aria-hidden="true" />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl md:text-3xl font-bold text-white">
                                    <AnimatedCounter value={totalSpeakers} />
                                </div>
                                <div className="text-white/40 text-xs uppercase tracking-wider">Expert Speakers</div>
                            </div>
                        </motion.div>
                        <motion.div 
                            className="text-center flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                            whileHover={prefersReducedMotion ? {} : { y: -2 }}
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#E62B1E]/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[#E62B1E]" aria-hidden="true" />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl md:text-3xl font-bold text-white">
                                    <AnimatedCounter value={totalTalkMinutes} suffix="+" />
                                </div>
                                <div className="text-white/40 text-xs uppercase tracking-wider">Minutes of Insights</div>
                            </div>
                        </motion.div>
                        <motion.div 
                            className="text-center flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                            whileHover={prefersReducedMotion ? {} : { y: -2 }}
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#E62B1E]/10 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-[#E62B1E]" aria-hidden="true" />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl md:text-3xl font-bold text-white">
                                    <AnimatedCounter value={totalSpeakers} />
                                </div>
                                <div className="text-white/40 text-xs uppercase tracking-wider">Unique Topics</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Search and Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.6, delay: 0.3 }}
                        className="mb-12 md:mb-16"
                    >
                        {/* Search Bar */}
                        <div className="max-w-md mx-auto mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="Search speakers by name or topic..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 focus:ring-2 focus:ring-[#E62B1E]/20 transition-all"
                                    aria-label="Search speakers"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Topic Filter Pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedTopic === null
                                        ? 'bg-[#E62B1E] text-white'
                                        : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:border-white/20 hover:text-white'
                                }`}
                                aria-pressed={selectedTopic === null}
                            >
                                All Topics
                            </button>
                            {allTopics.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        selectedTopic === topic
                                            ? 'bg-[#E62B1E] text-white'
                                            : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:border-white/20 hover:text-white'
                                    }`}
                                    aria-pressed={selectedTopic === topic}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>

                        {/* Active filters indicator */}
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-4 text-center"
                                >
                                    <span className="text-white/50 text-sm">
                                        Showing {(showFeaturedSpeaker ? 1 : 0) + filteredOtherSpeakers.length} of {totalSpeakers} speakers
                                    </span>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedTopic(null); }}
                                        className="ml-2 text-[#E62B1E] text-sm hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Featured Speaker */}
                    <AnimatePresence mode="wait">
                        {showFeaturedSpeaker && (
                            <motion.div
                                key="featured"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SpeakerCard speaker={featuredSpeaker} index={0} isFeatured totalCount={totalSpeakers} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Transition divider - smooth visual flow */}
            <div className="relative h-24 md:h-32">
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.02) 50%, transparent)'
                    }}
                    aria-hidden="true"
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" aria-hidden="true" />
            </div>

            {/* Other Speakers Grid */}
            {filteredOtherSpeakers.length > 0 && (
                <div className="py-12 md:py-20">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-between mb-12"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                {hasActiveFilters ? 'Matching Speakers' : 'All Speakers'}
                            </h2>
                            <motion.div 
                                className="hidden md:block h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" 
                                aria-hidden="true"
                                initial={{ scaleX: 0, originX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, delay: 0.2 }}
                            />
                            <span className="text-white/30 text-sm font-medium">{filteredOtherSpeakers.length} speakers</span>
                        </motion.div>

                        <motion.div 
                            className={`grid ${getGridCols()} gap-6 md:gap-8 mx-auto`}
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredOtherSpeakers.map((speaker, index) => (
                                    <motion.div
                                        key={speaker.id || speaker.name}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <SpeakerCard speaker={speaker} index={index + 1} totalCount={totalSpeakers} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* No results message */}
                        {filteredOtherSpeakers.length === 0 && !showFeaturedSpeaker && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <p className="text-white/50 text-lg">No speakers match your search criteria.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedTopic(null); }}
                                    className="mt-4 px-6 py-2 bg-[#E62B1E] text-white rounded-full hover:bg-[#E62B1E]/90 transition-colors"
                                >
                                    Clear filters
                                </button>
                            </motion.div>
                        )}

                    </div>
                </div>
            )}

        </section>
    );
};

export default Speakers;
