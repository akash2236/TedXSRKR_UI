import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/galleryData';

const AUTO_ADVANCE_MS = 3000;

// ─── Responsive: detect how many cards to show ───────────────────────────────
function useVisible() {
    const [visible, setVisible] = useState(3);
    useEffect(() => {
        const update = () => {
            if (window.innerWidth < 640) setVisible(1);
            else if (window.innerWidth < 1024) setVisible(2);
            else setVisible(3);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return visible;
}

// ─── Per-category sliding carousel ───────────────────────────────────────────
function CategoryCarousel({
    category,
    images,
    onImageClick,
}: {
    category: string;
    images: typeof GALLERY_IMAGES;
    onImageClick: (url: string) => void;
}) {
    const visible = useVisible();
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const total = images.length;
    const maxIndex = Math.max(total - visible, 0);

    // Reset current index if visible count changes and current is out of range
    useEffect(() => {
        setCurrent((c) => Math.min(c, Math.max(total - visible, 0)));
    }, [visible, total]);

    const goTo = useCallback(
        (idx: number) => {
            setCurrent(Math.max(0, Math.min(idx, maxIndex)));
        },
        [maxIndex]
    );

    const next = useCallback(() => {
        setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, [maxIndex]);

    const prev = useCallback(() => {
        setCurrent((c) => (c <= 0 ? maxIndex : c - 1));
    }, [maxIndex]);

    // Auto-advance
    useEffect(() => {
        if (total <= visible) return;
        timerRef.current = setTimeout(next, AUTO_ADVANCE_MS);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [current, next, total, visible]);

    const gapPx = 16;
    const cardWidthPct = 100 / visible;

    return (
        <section className="mb-16">
            {/* ── Category label + arrows ─────────────────── */}
            <div className="flex items-center justify-between px-4 sm:px-8 md:px-12 mb-5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#E62B1E] shadow-[0_0_10px_rgba(230,43,30,0.9)]" />
                    <h2 className="text-white font-bold text-base sm:text-lg uppercase tracking-widest truncate">
                        {category}
                    </h2>
                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#E62B1E] bg-[#E62B1E]/10 border border-[#E62B1E]/25 px-2 py-0.5 rounded-full">
                        {images.length}
                    </span>
                </div>

                {total > visible && (
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <button
                            onClick={prev}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/8 border border-white/12 hover:bg-[#E62B1E] hover:border-[#E62B1E] transition-all duration-200 group"
                            aria-label="Previous"
                        >
                            <ChevronLeft size={18} className="text-gray-400 group-hover:text-white" />
                        </button>
                        <button
                            onClick={next}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/8 border border-white/12 hover:bg-[#E62B1E] hover:border-[#E62B1E] transition-all duration-200 group"
                            aria-label="Next"
                        >
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Sliding track ───────────────────────────── */}
            <div className="overflow-hidden px-4 sm:px-8 md:px-12">
                <motion.div
                    className="flex"
                    animate={{
                        x: `calc(-${current * cardWidthPct}% - ${current * gapPx}px)`,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                    style={{ gap: `${gapPx}px` }}
                >
                    {images.map((img) => (
                        <motion.div
                            key={img.id}
                            className="flex-shrink-0 cursor-pointer group"
                            style={{
                                width: `calc(${cardWidthPct}% - ${(gapPx * (visible - 1)) / visible}px)`,
                            }}
                            onClick={() => onImageClick(img.url)}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.55)] group-hover:shadow-[0_14px_40px_rgba(230,43,30,0.22)] group-hover:border-[#E62B1E]/40 transition-all duration-300">
                                {/* Image */}
                                <div
                                    className="overflow-hidden relative"
                                    style={{
                                        height: visible === 1 ? '240px' : '220px',
                                    }}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.title}
                                        className="w-full h-full object-cover"
                                        style={{ transition: 'transform 500ms ease' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <span className="text-xs text-white/90 font-medium bg-[#E62B1E]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                            Tap to view
                                        </span>
                                    </div>
                                </div>

                                {/* Caption */}
                                <div className="px-4 py-3 border-t border-white/6">
                                    <p className="text-white font-semibold text-sm leading-snug truncate">
                                        {img.title}
                                    </p>
                                    {img.description && (
                                        <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                                            {img.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* ── Dot indicators ──────────────────────────── */}
            {total > visible && (
                <div className="flex justify-center gap-1.5 mt-5">
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === current
                                    ? 'w-6 bg-[#E62B1E]'
                                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                            }`}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// ─── Main Gallery Page ────────────────────────────────────────────────────────
export default function GalleryPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const categorySections = useMemo(() => {
        const map = new Map<string, typeof GALLERY_IMAGES>();
        GALLERY_IMAGES.forEach((img) => {
            const cat = img.category || 'General';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(img);
        });
        return Array.from(map.entries());
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[500px] bg-[#E62B1E]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

            <div className="relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14 px-4"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Our{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d]">
                            Gallery
                        </span>
                    </h1>
                    <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto">
                        Relive the best moments, inspiring talks, and behind-the-scenes
                        action from TEDxSRKR.
                    </p>
                </motion.div>

                {/* Category Carousels */}
                {categorySections.length > 0 ? (
                    categorySections.map(([category, images], catIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: catIndex * 0.15 }}
                        >
                            <CategoryCarousel
                                category={category}
                                images={images}
                                onImageClick={setSelectedImage}
                            />
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-24 text-gray-500 px-4">
                        <p className="text-lg">No gallery images yet. Check back soon!</p>
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={24} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            src={selectedImage}
                            alt="Fullscreen view"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
