/**
 * Talks Component - Premium TEDxSRKR 2026 Design
 * 
 * Displays a grid of talk videos from the database.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getTalks } from '../lib/adminApi';
import { DbTalkWithSpeaker } from '../types/admin';
import { Play, Clock, Search, X, Mic, Video, ArrowRight, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const Talks: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [talksData, setTalksData] = useState<DbTalkWithSpeaker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTalk, setSelectedTalk] = useState<DbTalkWithSpeaker | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    useEffect(() => {
        setIsLoading(true);
        getTalks({ status: 'published', limit: 100 })
            .then(result => {
                setTalksData(result.data);
            })
            .catch(err => console.error('Failed to load talks:', err))
            .finally(() => setIsLoading(false));
    }, []);

    // Close modal on Escape key, navigate with arrow keys
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedTalk(null);
            if (e.key === 'ArrowRight') navigateModal(1);
            if (e.key === 'ArrowLeft') navigateModal(-1);
        };
        if (selectedTalk) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedTalk, selectedIndex]);

    const filteredTalks = useMemo(() => {
        return talksData.filter(talk => {
            const matchesSearch = searchQuery === '' ||
                talk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                talk.speaker?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                talk.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [talksData, searchQuery]);

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return null;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-generate thumbnail from YouTube embed ID if no thumbnail_url is set
    const getThumbnail = (talk: DbTalkWithSpeaker): string | null => {
        if (talk.thumbnail_url) return talk.thumbnail_url;
        if (talk.video_embed_id && talk.video_platform === 'youtube') {
            return `https://img.youtube.com/vi/${talk.video_embed_id}/maxresdefault.jpg`;
        }
        if (talk.video_embed_id && (talk.video_platform === 'youtube' || !talk.video_platform)) {
            // Try to extract YouTube ID if platform not set but embed_id exists
            return `https://img.youtube.com/vi/${talk.video_embed_id}/hqdefault.jpg`;
        }
        return null;
    };


    const openTalk = (talk: DbTalkWithSpeaker) => {
        const idx = filteredTalks.findIndex(t => t.id === talk.id);
        setSelectedIndex(idx >= 0 ? idx : 0);
        setSelectedTalk(talk);
    };

    const navigateModal = (dir: number) => {
        const nextIdx = selectedIndex + dir;
        if (nextIdx >= 0 && nextIdx < filteredTalks.length) {
            setSelectedIndex(nextIdx);
            setSelectedTalk(filteredTalks[nextIdx]);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]" />
                    <p className="text-white/40 text-sm">Loading talks...</p>
                </div>
            </div>
        );
    }

    if (talksData.length === 0) {
        return (
            <div className="py-32 text-center">
                <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
                    <Video className="w-10 h-10 text-white/20" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Talks Coming Soon</h2>
                <p className="text-white/40 max-w-md mx-auto">The videos will be uploaded shortly after the event. Stay tuned!</p>
            </div>
        );
    }

    return (
        <section className="relative py-12 md:py-20 container mx-auto px-6">
            {/* Search Bar */}
            <div className="max-w-lg mx-auto mb-16">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#E62B1E] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search talks or speakers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 focus:ring-2 focus:ring-[#E62B1E]/10 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Talks Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
                }}
            >
                {filteredTalks.map((talk) => (
                    <motion.div
                        key={talk.id}
                        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    >
                        <article
                            className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#E62B1E]/30 hover:shadow-[0_8px_40px_rgba(230,43,30,0.08)] transition-all duration-500 h-full flex flex-col cursor-pointer"
                            onClick={() => openTalk(talk)}
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden shrink-0">
                                {getThumbnail(talk) ? (
                                    <img
                                        src={getThumbnail(talk)!}
                                        alt={talk.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#E62B1E]/10 to-black flex items-center justify-center">
                                        <Play className="w-12 h-12 text-white/10" />
                                    </div>
                                )}

                                {/* Play overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-16 h-16 rounded-full bg-[#E62B1E] shadow-[0_0_50px_rgba(230,43,30,0.7)] flex items-center justify-center"
                                    >
                                        <Play className="w-7 h-7 text-white fill-current ml-1" />
                                    </motion.div>
                                </div>

                                {/* Duration badge */}
                                {formatDuration(talk.duration_seconds) && (
                                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-md text-xs font-mono text-white/90 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(talk.duration_seconds)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mic className="w-3.5 h-3.5 text-[#E62B1E] shrink-0" />
                                    <span className="text-[#E62B1E] text-xs font-bold uppercase tracking-wider truncate">
                                        {talk.speaker?.name || 'TEDxSRKR'}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-white/80 transition-colors">
                                    {talk.title}
                                </h3>

                                <p className="text-white/40 text-sm line-clamp-2 flex-1 mb-4">
                                    {talk.description || talk.short_description || 'Watch this insightful TEDxSRKR talk.'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                                    <div className="flex items-center gap-1.5 text-xs text-white/30">
                                        {talk.view_count !== undefined && talk.view_count > 0 && (
                                            <>
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{talk.view_count.toLocaleString()} views</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-[#E62B1E] font-semibold">
                                        Watch Now <Play className="w-3 h-3 fill-current" />
                                    </div>
                                </div>
                            </div>
                        </article>
                    </motion.div>
                ))}
            </motion.div>

            {/* ───── PREMIUM VIDEO MODAL ───── */}
            <AnimatePresence>
                {selectedTalk && (
                    <motion.div
                        key="modal-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[200] flex flex-col bg-black/98 backdrop-blur-2xl"
                        onClick={() => setSelectedTalk(null)}
                    >
                        {/* Top bar */}
                        <div
                            className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[#E62B1E] font-black text-xl tracking-tight">TEDx</span>
                                <span className="text-white/20 text-lg">|</span>
                                <span className="text-white/50 text-sm hidden sm:block truncate max-w-xs">{selectedTalk.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/30 text-sm mr-2 hidden sm:block">{selectedIndex + 1} / {filteredTalks.length}</span>
                                <button
                                    onClick={() => navigateModal(-1)}
                                    disabled={selectedIndex === 0}
                                    className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 transition-all"
                                    title="Previous talk"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigateModal(1)}
                                    disabled={selectedIndex === filteredTalks.length - 1}
                                    className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 transition-all"
                                    title="Next talk"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setSelectedTalk(null)}
                                    className="ml-1 p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div
                            className="flex flex-col lg:flex-row flex-1 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Video area */}
                            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-[#050505]">
                                <motion.div
                                    key={selectedTalk.id}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.25 }}
                                    className="w-full max-w-5xl"
                                >
                                    <VideoPlayer talk={selectedTalk} />
                                </motion.div>
                            </div>

                            {/* Side Info Panel */}
                            <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col shrink-0 overflow-y-auto bg-black/60">
                                {/* Speaker + title */}
                                <div className="p-6 border-b border-white/[0.06]">
                                    {selectedTalk.speaker?.image_url ? (
                                        <div className="flex items-center gap-3 mb-5">
                                            <img
                                                src={selectedTalk.speaker.image_url}
                                                alt={selectedTalk.speaker.name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-[#E62B1E]/50 shadow-[0_0_20px_rgba(230,43,30,0.3)]"
                                            />
                                            <div>
                                                <p className="text-[#E62B1E] text-xs font-bold uppercase tracking-wider mb-0.5">Speaker</p>
                                                <p className="text-white font-semibold">{selectedTalk.speaker.name}</p>
                                                {selectedTalk.speaker.title && (
                                                    <p className="text-white/40 text-xs mt-0.5 truncate">{selectedTalk.speaker.title}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : selectedTalk.speaker?.name && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <Mic className="w-4 h-4 text-[#E62B1E]" />
                                            <span className="text-[#E62B1E] font-bold text-sm uppercase tracking-wider">
                                                {selectedTalk.speaker.name}
                                            </span>
                                        </div>
                                    )}

                                    <h2 className="text-xl font-bold text-white leading-snug mb-3">
                                        {selectedTalk.title}
                                    </h2>

                                    <div className="flex items-center gap-4 text-sm text-white/40">
                                        {formatDuration(selectedTalk.duration_seconds) && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDuration(selectedTalk.duration_seconds)}</span>
                                            </div>
                                        )}
                                        {selectedTalk.view_count !== undefined && selectedTalk.view_count > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="w-4 h-4" />
                                                <span>{selectedTalk.view_count.toLocaleString()} views</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {(selectedTalk.description || selectedTalk.short_description) && (
                                    <div className="p-6 border-b border-white/[0.06]">
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">About this talk</p>
                                        <p className="text-white/65 text-sm leading-relaxed">
                                            {selectedTalk.description || selectedTalk.short_description}
                                        </p>
                                    </div>
                                )}

                                {/* Up next */}
                                {selectedIndex < filteredTalks.length - 1 && (
                                    <div className="p-6 border-b border-white/[0.06]">
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Up Next</p>
                                        <button
                                            onClick={() => navigateModal(1)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all text-left group"
                                        >
                                            {filteredTalks[selectedIndex + 1].thumbnail_url ? (
                                                <img
                                                    src={filteredTalks[selectedIndex + 1].thumbnail_url!}
                                                    className="w-20 h-12 object-cover rounded-lg shrink-0"
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="w-20 h-12 bg-white/[0.05] rounded-lg shrink-0 flex items-center justify-center">
                                                    <Play className="w-4 h-4 text-white/20" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white/50 text-xs mb-1">{filteredTalks[selectedIndex + 1].speaker?.name}</p>
                                                <p className="text-white text-sm font-medium line-clamp-2 leading-snug group-hover:text-[#E62B1E]/90 transition-colors">
                                                    {filteredTalks[selectedIndex + 1].title}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* Speaker profile link */}
                                <div className="p-6 mt-auto">
                                    <Link
                                        to={`/speakers/${selectedTalk.speaker?.slug}`}
                                        onClick={() => setSelectedTalk(null)}
                                        className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 rounded-xl text-white text-sm font-medium transition-all"
                                    >
                                        View Speaker Profile
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty search results */}
            {filteredTalks.length === 0 && searchQuery && (
                <div className="text-center py-20">
                    <p className="text-white/40 text-lg">No talks found matching "{searchQuery}"</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-[#E62B1E] hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            )}
        </section>
    );
};

export default Talks;
