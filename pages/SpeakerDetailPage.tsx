/**
 * Speaker Detail Page - TEDxSRKR 2026
 * 
 * Displays comprehensive speaker profile including:
 * - Bio and credentials
 * - Talk description and topic
 * - Social links
 * - Related speakers
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    ArrowLeft,
    Linkedin,
    Instagram,
    Twitter,
    Clock,
    Calendar,
    Mic,
    Sparkles,
    Share2,
    ChevronRight,
    ExternalLink,
    Play,
    Video
} from 'lucide-react';
import { getSpeakers, getTalksBySpeaker } from '../lib/adminApi';
import { DbSpeaker, DbTalk } from '../types/admin';
import VideoPlayer from '../components/VideoPlayer';

const SpeakerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [speaker, setSpeaker] = useState<DbSpeaker | null>(null);
    const [talk, setTalk] = useState<DbTalk | null>(null);
    const [relatedSpeakers, setRelatedSpeakers] = useState<DbSpeaker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        setNotFound(false);
        
        getSpeakers({ status: 'published', limit: 100 })
            .then(async result => {
                const all = result.data;
                const found = all.find(s => s.slug === id);
                if (!found) {
                    setNotFound(true);
                } else {
                    setSpeaker(found);
                    setRelatedSpeakers(all.filter(s => s.slug !== id).slice(0, 3));
                    
                    // Fetch talk for this speaker
                    try {
                        const talks = await getTalksBySpeaker(found.id);
                        if (talks && talks.length > 0) {
                            setTalk(talks[0]);
                        }
                    } catch (err) {
                        console.error('Error fetching speaker talk:', err);
                    }
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setIsLoading(false));
    }, [id]);


    // Handle share
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${speaker?.name} at TEDxSRKR 2026`,
                    text: `Check out ${speaker?.name}'s talk on "${speaker?.topic}" at TEDxSRKR 2026`,
                    url,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: prefersReducedMotion ? 0.1 : 0.6 }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <section className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]" />
            </section>
        );
    }

    // 404 state
    if (notFound || !speaker) {
        return (
            <section className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E62B1E]/10 flex items-center justify-center">
                        <Mic className="w-10 h-10 text-[#E62B1E]/50" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Speaker Not Found</h1>
                    <p className="text-white/50 mb-8">
                        The speaker you're looking for doesn't exist or may have been removed.
                    </p>
                    <button
                        onClick={() => navigate('/speakers')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#E62B1E] text-white font-semibold rounded-full hover:bg-[#cc2019] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Speakers
                    </button>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
            {/* Background effects */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 20% 20%, rgba(230, 43, 30, 0.08) 0%, transparent 50%)'
                }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 80% 80%, rgba(230, 43, 30, 0.05) 0%, transparent 40%)'
                }}
                aria-hidden="true"
            />

            {/* Back button - Fixed */}
            <div className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.05]">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/speakers')}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded-lg px-2 py-1 -ml-2"
                        aria-label="Back to all speakers"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">All Speakers</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E62B1E]"
                        aria-label="Share speaker profile"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-6 py-12 md:py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Image Column */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                    >
                        {/* Image skeleton */}
                        {!imageLoaded && (
                            <div className="aspect-[4/5] w-full rounded-3xl bg-white/[0.03] animate-pulse" />
                        )}

                        <motion.div
                            className={`relative aspect-[4/5] w-full rounded-3xl overflow-hidden ${!imageLoaded ? 'absolute inset-0' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: imageLoaded ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <img
                                src={speaker.image_url}
                                alt={`Portrait of ${speaker.name}, ${speaker.title}`}
                                className="w-full h-full object-cover"
                                onLoad={() => setImageLoaded(true)}
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

                            {/* Featured badge */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-[#E62B1E] rounded-full shadow-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-white text-sm font-semibold uppercase tracking-wider">TEDx Speaker</span>
                            </div>

                            {/* Social links on image */}
                            {(speaker.linkedin_url || speaker.instagram_url || speaker.twitter_url) && (
                                <div className="absolute bottom-6 left-6 right-6 flex justify-center gap-3">
                                    {speaker.linkedin_url && (
                                        <a
                                            href={speaker.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-[#0077B5] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                            aria-label={`${speaker.name} on LinkedIn`}
                                        >
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {speaker.instagram_url && (
                                        <a
                                            href={speaker.instagram_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-[#E1306C] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                            aria-label={`${speaker.name} on Instagram`}
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {speaker.twitter_url && (
                                        <a
                                            href={speaker.twitter_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-[#1DA1F2] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                            aria-label={`${speaker.name} on Twitter`}
                                        >
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Content Column */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                        className="lg:sticky lg:top-24"
                    >
                        {/* Role */}
                        <p className="text-[#E62B1E] font-semibold uppercase tracking-wider text-sm mb-3">
                            {speaker.title}
                        </p>

                        {/* Name */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
                            {speaker.name}
                        </h1>

                        {/* Topic badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-3 bg-[#E62B1E]/10 border border-[#E62B1E]/20 rounded-2xl mb-8">
                            <Mic className="w-5 h-5 text-[#E62B1E] flex-shrink-0" />
                            <span className="text-white font-semibold">{speaker.topic}</span>
                        </div>

                        {/* Talk info */}
                        <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm mb-8">
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#E62B1E]/60" />
                                <span>18 minute talk</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#E62B1E]/60" />
                                <span>March 26, 2026</span>
                            </span>
                        </div>

                        {/* Bio section */}
                        <div className="space-y-6 mb-10">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-3">About</h2>
                                <p className="text-white/70 leading-relaxed">
                                    {speaker.bio || 'More information about this speaker coming soon.'}
                                </p>
                            </div>

                            {speaker.bio && speaker.bio.length > 200 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-3">About the Talk</h2>
                                    <p className="text-white/70 leading-relaxed">
                                        {speaker.topic}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Expertise tags from topic/tags */}
                        {speaker.expertise && speaker.expertise.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold text-white mb-3">Topics</h2>
                                <div className="flex flex-wrap gap-2">
                                    {speaker.expertise.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-full text-white/70 text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E62B1E] text-white font-semibold rounded-full hover:bg-[#cc2019] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] shadow-[0_8px_30px_rgba(230,43,30,0.3)]"
                        >
                            Register to Attend
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>

                {/* Talk/Video Section */}
                <AnimatePresence>
                    {talk && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
                            className="mt-24 md:mt-32"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 rounded-2xl bg-[#E62B1E]/10 border border-[#E62B1E]/20">
                                    <Video className="w-6 h-6 text-[#E62B1E]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-4xl font-bold text-white">Watch the Talk</h2>
                                    <p className="text-white/40 text-sm mt-1">{talk.title}</p>
                                </div>
                            </div>

                            <div className="relative group">
                                {/* Decorative elements */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d] rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                                
                                <div className="relative bg-[#0F0F0F] rounded-[28px] border border-white/10 overflow-hidden shadow-2xl">
                                    <VideoPlayer talk={talk} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Related Speakers */}
                {relatedSpeakers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
                        className="mt-24 md:mt-32"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                Other Speakers
                            </h2>
                            <Link
                                to="/speakers"
                                className="inline-flex items-center gap-1 text-[#E62B1E] font-medium hover:gap-2 transition-all"
                            >
                                View all
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedSpeakers.map((relatedSpeaker, index) => (
                                <Link
                                    key={relatedSpeaker.slug}
                                    to={`/speakers/${relatedSpeaker.slug}`}
                                    className="group block"
                                >
                                    <motion.article
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.15] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#E62B1E]"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            <img
                                                src={relatedSpeaker.image_url}
                                                alt={`${relatedSpeaker.name}, ${relatedSpeaker.title}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

                                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                                <p className="text-[#E62B1E]/80 text-xs uppercase tracking-wider mb-1 font-medium">
                                                    {relatedSpeaker.title}
                                                </p>
                                                <h3 className="text-lg font-bold text-white">
                                                    {relatedSpeaker.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Hover accent line */}
                                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default SpeakerDetailPage;