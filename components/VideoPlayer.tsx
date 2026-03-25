/**
 * Video Player Component
 * 
 * Embeddable video player with view tracking for talks.
 * Supports YouTube, Vimeo, and custom video URLs.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, User, Clock, Eye, Volume2, VolumeX } from 'lucide-react';
import { trackVideoView, updateVideoViewProgress } from '../lib/adminApi';
import { DbTalk, VideoPlatform } from '../types/admin';

// ============================================
// Types
// ============================================

interface VideoPlayerProps {
    talk: DbTalk;
    isRegistered?: boolean;
    onRequireRegistration?: () => void;
}

// ============================================
// Helper Functions
// ============================================

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Locked Video Overlay
// ============================================

interface LockedOverlayProps {
    thumbnailUrl?: string;
    title: string;
    onRegisterClick: () => void;
}

function LockedOverlay({ thumbnailUrl, title, onRegisterClick }: LockedOverlayProps) {
    return (
        <div
            className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent"
            style={thumbnailUrl ? {
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : undefined}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Lock icon and message */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6"
                >
                    <Lock className="w-10 h-10 text-white/80" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Registration Required</h3>
                <p className="text-white/60 mb-6 max-w-sm">
                    Register for the event to watch "{title}" and access all exclusive content.
                </p>
                <button
                    onClick={onRegisterClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                >
                    <User className="w-5 h-5" />
                    Register Now
                </button>
            </div>
        </div>
    );
}

// ============================================
// YouTube Player
// ============================================

interface YouTubePlayerProps {
    embedId: string;
    onPlay: () => void;
    onProgress: (seconds: number) => void;
}

function YouTubePlayer({ embedId, onPlay, onProgress }: YouTubePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const thumbnailUrl = `https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`;
    const hqThumbnailUrl = `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`;

    const handleStart = () => {
        setIsPlaying(true);
        onPlay();
    };

    return (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            {!isPlaying ? (
                // Show thumbnail with click-to-play overlay until user presses play
                <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={handleStart}
                >
                    <img
                        src={thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fall back to hqdefault if maxresdefault is not available
                            (e.target as HTMLImageElement).src = hqThumbnailUrl;
                        }}
                    />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                    {/* TEDx Red play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-20 h-20 rounded-full bg-[#E62B1E] shadow-[0_0_60px_rgba(230,43,30,0.6)] flex items-center justify-center"
                        >
                            <Play className="w-9 h-9 text-white fill-current ml-1" />
                        </motion.div>
                    </div>
                </div>
            ) : (
                // Once clicked load the actual YouTube iframe with autoplay
                <iframe
                    src={`https://www.youtube.com/embed/${embedId}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1`}
                    title="Video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            )}
        </div>
    );
}

// ============================================
// Vimeo Player
// ============================================

interface VimeoPlayerProps {
    embedId: string;
    onPlay: () => void;
    onProgress: (seconds: number) => void;
}

function VimeoPlayer({ embedId, onPlay, onProgress }: VimeoPlayerProps) {
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'play') {
                    onPlay();
                } else if (data.event === 'timeupdate') {
                    onProgress(Math.floor(data.data.seconds));
                }
            } catch {
                // Not a Vimeo message
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onPlay, onProgress]);

    return (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
                src={`https://player.vimeo.com/video/${embedId}?api=1&title=0&byline=0&portrait=0`}
                title="Video player"
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

// ============================================
// Custom Video Player (for direct URLs)
// ============================================

interface CustomPlayerProps {
    url: string;
    thumbnailUrl?: string;
    onPlay: () => void;
    onProgress: (seconds: number) => void;
}

function CustomPlayer({ url, thumbnailUrl, onPlay, onProgress }: CustomPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const handlePlay = () => {
        setIsPlaying(true);
        onPlay();
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            onProgress(Math.floor(videoRef.current.currentTime));
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div
            className="relative aspect-video rounded-2xl overflow-hidden bg-black group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={url}
                poster={thumbnailUrl}
                className="w-full h-full object-cover"
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlayPause}
            />

            {/* Play button overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePlayPause}
                        className="w-20 h-20 rounded-full bg-[#E62B1E] flex items-center justify-center"
                    >
                        <Play className="w-10 h-10 text-white ml-1" />
                    </motion.button>
                </div>
            )}

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={togglePlayPause}
                        className="p-2 text-white/80 hover:text-white transition-colors"
                    >
                        {isPlaying ? (
                            <span className="w-6 h-6 flex items-center justify-center">⏸</span>
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                    </button>
                    <button
                        onClick={toggleMute}
                        className="p-2 text-white/80 hover:text-white transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Main VideoPlayer Component
// ============================================

export default function VideoPlayer({ talk, isRegistered = true, onRequireRegistration }: VideoPlayerProps) {
    const [viewId, setViewId] = useState<string | null>(null);
    const lastProgressRef = useRef<number>(0);

    // Handle registration required
    if (talk.requires_registration && !isRegistered) {
        return (
            <LockedOverlay
                thumbnailUrl={talk.thumbnail_url || undefined}
                title={talk.title}
                onRegisterClick={onRequireRegistration || (() => {})}
            />
        );
    }

    // Track video view on play
    const handlePlay = async () => {
        if (!viewId) {
            try {
                const id = await trackVideoView(talk.id);
                setViewId(id);
            } catch (err) {
                console.error('Failed to track view:', err);
            }
        }
    };

    // Update watch progress periodically
    const handleProgress = async (seconds: number) => {
        // Only update every 10 seconds to avoid too many requests
        if (viewId && seconds - lastProgressRef.current >= 10) {
            lastProgressRef.current = seconds;
            try {
                await updateVideoViewProgress(viewId, seconds);
            } catch (err) {
                console.error('Failed to update progress:', err);
            }
        }
    };

    // No video URL
    if (!talk.video_url && !talk.video_embed_id) {
        return (
            <div className="aspect-video rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                <div className="text-center">
                    <Play className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">Video coming soon</p>
                </div>
            </div>
        );
    }

    // Render appropriate player
    const renderPlayer = () => {
        switch (talk.video_platform) {
            case 'youtube':
                return (
                    <YouTubePlayer
                        embedId={talk.video_embed_id!}
                        onPlay={handlePlay}
                        onProgress={handleProgress}
                    />
                );
            case 'vimeo':
                return (
                    <VimeoPlayer
                        embedId={talk.video_embed_id!}
                        onPlay={handlePlay}
                        onProgress={handleProgress}
                    />
                );
            case 'custom':
            default:
                return (
                    <CustomPlayer
                        url={talk.video_url!}
                        thumbnailUrl={talk.thumbnail_url || undefined}
                        onPlay={handlePlay}
                        onProgress={handleProgress}
                    />
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Player */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {renderPlayer()}
            </motion.div>

            {/* Video Info */}
            <div className="flex items-center gap-4 text-white/50 text-sm">
                {talk.duration_seconds && (
                    <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(talk.duration_seconds)}
                    </span>
                )}
                {talk.view_count !== undefined && talk.view_count > 0 && (
                    <span className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {talk.view_count.toLocaleString()} views
                    </span>
                )}
            </div>
        </div>
    );
}
