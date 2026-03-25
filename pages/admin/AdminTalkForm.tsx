/**
 * Admin Talk Form
 * 
 * Create/Edit talk form with video embedding support.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Eye,
    Trash2,
    Plus,
    X,
    Link as LinkIcon,
    Video,
    Play,
    Clock,
    Lock,
    Globe,
    CheckCircle,
    AlertCircle,
    Youtube,
} from 'lucide-react';
import {
    getTalkById,
    createTalk,
    updateTalk,
    deleteTalk,
    getSpeakers,
} from '../../lib/adminApi';
import { DbTalk, DbTalkInput, DbSpeaker, ContentStatus, VideoPlatform } from '../../types/admin';
import { useRequiredAdminAuth, RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Video Preview Component
// ============================================

interface VideoPreviewProps {
    platform: VideoPlatform | null;
    embedId: string;
    url: string;
}

function VideoPreview({ platform, embedId, url }: VideoPreviewProps) {
    if (!embedId && !url) {
        return (
            <div className="aspect-video bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center">
                <div className="text-center">
                    <Video className="w-12 h-12 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">No video added</p>
                </div>
            </div>
        );
    }

    if (platform === 'youtube' && embedId) {
        return (
            <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                    src={`https://www.youtube.com/embed/${embedId}`}
                    title="Video preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    if (platform === 'vimeo' && embedId) {
        return (
            <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                    src={`https://player.vimeo.com/video/${embedId}`}
                    title="Video preview"
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="aspect-video bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-lg hover:bg-[#E62B1E]/90 transition-colors"
            >
                <Play className="w-5 h-5" />
                Open Video
            </a>
        </div>
    );
}

// ============================================
// Video URL Parser
// ============================================

function parseVideoUrl(url: string): { platform: VideoPlatform | null; embedId: string } {
    if (!url) return { platform: null, embedId: '' };

    // YouTube
    const youtubeMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
        return { platform: 'youtube', embedId: youtubeMatch[1] };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
        return { platform: 'vimeo', embedId: vimeoMatch[1] };
    }

    return { platform: 'custom', embedId: '' };
}

// ============================================
// Tags Input Component
// ============================================

interface TagsInputProps {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
}

function TagsInput({ label, tags, onChange }: TagsInputProps) {
    const [input, setInput] = useState('');

    const addTag = () => {
        const tag = input.trim();
        if (tag && !tags.includes(tag)) {
            onChange([...tags, tag]);
        }
        setInput('');
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div>
            <label className="block text-white/70 text-sm font-medium mb-2">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#E62B1E]/10 text-[#E62B1E] text-sm rounded-full"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tag..."
                    className="flex-1 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-white/[0.05] text-white/70 rounded-lg hover:bg-white/[0.1] hover:text-white transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// ============================================
// Main Form Component
// ============================================

function TalkFormContent() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { adminUser } = useRequiredAdminAuth();
    const isEditing = !!id && id !== 'new';

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [speakers, setSpeakers] = useState<DbSpeaker[]>([]);

    // Form state
    const [formData, setFormData] = useState<DbTalkInput>({
        slug: '',
        speaker_id: '',
        title: '',
        description: '',
        short_description: '',
        video_url: '',
        video_platform: null,
        video_embed_id: '',
        duration_seconds: undefined,
        thumbnail_url: '',
        tags: [],
        is_public: true,
        requires_registration: false,
        status: 'draft',
        is_featured: false,
        display_order: 0,
        recorded_at: '',
    });

    // Load speakers
    useEffect(() => {
        getSpeakers({ limit: 100 })
            .then(result => setSpeakers(result.data))
            .catch(console.error);
    }, []);

    // Load existing talk
    useEffect(() => {
        if (isEditing) {
            setIsLoading(true);
            getTalkById(id!)
                .then((talk) => {
                    if (talk) {
                        setFormData({
                            slug: talk.slug,
                            speaker_id: talk.speaker_id,
                            title: talk.title,
                            description: talk.description || '',
                            short_description: talk.short_description || '',
                            video_url: talk.video_url || '',
                            video_platform: talk.video_platform,
                            video_embed_id: talk.video_embed_id || '',
                            duration_seconds: talk.duration_seconds || undefined,
                            thumbnail_url: talk.thumbnail_url || '',
                            tags: talk.tags || [],
                            is_public: talk.is_public,
                            requires_registration: talk.requires_registration,
                            status: talk.status,
                            is_featured: talk.is_featured,
                            display_order: talk.display_order,
                            recorded_at: talk.recorded_at || '',
                        });
                    } else {
                        setError('Talk not found');
                    }
                })
                .catch((err) => {
                    console.error('Failed to load talk:', err);
                    setError('Failed to load talk');
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditing]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditing && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, isEditing]);

    // Parse video URL when changed
    useEffect(() => {
        if (formData.video_url) {
            const { platform, embedId } = parseVideoUrl(formData.video_url);
            setFormData(prev => ({
                ...prev,
                video_platform: platform,
                video_embed_id: embedId,
            }));
        }
    }, [formData.video_url]);

    const updateField = <K extends keyof DbTalkInput>(field: K, value: DbTalkInput[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            // Sanitize: convert empty strings to null for timestamp/optional fields
            const sanitizedData = {
                ...formData,
                recorded_at: formData.recorded_at || null,
                published_at: (formData as any).published_at || null,
                video_url: formData.video_url || null,
                video_embed_id: formData.video_embed_id || null,
                thumbnail_url: formData.thumbnail_url || null,
                description: formData.description || null,
                short_description: formData.short_description || null,
                duration_seconds: formData.duration_seconds || null,
            };

            if (isEditing) {
                await updateTalk(id!, sanitizedData, adminUser?.id);
            } else {
                await createTalk(sanitizedData, adminUser?.id);
            }
            setSuccess(true);
            setTimeout(() => navigate('/admin/talks'), 1000);
        } catch (err) {
            console.error('Failed to save talk:', err);
            const message = err instanceof Error ? err.message : 'Failed to save talk. Please check your input and try again.';
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this talk? This action cannot be undone.')) {
            return;
        }

        setIsSaving(true);
        try {
            await deleteTalk(id!);
            navigate('/admin/talks');
        } catch (err) {
            console.error('Failed to delete talk:', err);
            setError('Failed to delete talk');
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/talks')}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">
                        {isEditing ? 'Edit Talk' : 'Add New Talk'}
                    </h1>
                    <p className="text-white/50">
                        {isEditing ? 'Update talk details and video' : 'Create a new talk with video content'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-400">{error}</p>
                </motion.div>
            )}

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl"
                >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-green-400">Talk saved successfully!</p>
                </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Basic Information</h2>

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Speaker <span className="text-[#E62B1E]">*</span>
                        </label>
                        <select
                            value={formData.speaker_id}
                            onChange={(e) => updateField('speaker_id', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                        >
                            <option value="">Select a speaker...</option>
                            {speakers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                Talk Title <span className="text-[#E62B1E]">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="The Future of AI in Healthcare"
                                required
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                URL Slug <span className="text-[#E62B1E]">*</span>
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => updateField('slug', e.target.value)}
                                    placeholder="future-of-ai-healthcare"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Short Description
                        </label>
                        <input
                            type="text"
                            value={formData.short_description || ''}
                            onChange={(e) => updateField('short_description', e.target.value)}
                            placeholder="A brief summary for listings..."
                            maxLength={500}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Full Description
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Write a detailed description of the talk..."
                            rows={6}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors resize-none"
                        />
                    </div>

                    <TagsInput
                        label="Tags"
                        tags={formData.tags || []}
                        onChange={(tags) => updateField('tags', tags)}
                    />
                </div>

                {/* Video Content */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-[#E62B1E]" />
                        Video Content
                    </h2>

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Video URL
                        </label>
                        <div className="relative">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="url"
                                value={formData.video_url || ''}
                                onChange={(e) => updateField('video_url', e.target.value)}
                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                        </div>
                        <p className="text-white/40 text-xs mt-2">
                            Supports YouTube, Vimeo, or custom video URLs
                        </p>
                    </div>

                    {/* Video Preview */}
                    <VideoPreview
                        platform={formData.video_platform || null}
                        embedId={formData.video_embed_id || ''}
                        url={formData.video_url || ''}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                Duration (seconds)
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="number"
                                    value={formData.duration_seconds || ''}
                                    onChange={(e) => updateField('duration_seconds', parseInt(e.target.value) || undefined)}
                                    placeholder="1080 (18 minutes)"
                                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                Thumbnail URL
                            </label>
                            <input
                                type="url"
                                value={formData.thumbnail_url || ''}
                                onChange={(e) => updateField('thumbnail_url', e.target.value)}
                                placeholder="https://example.com/thumbnail.jpg"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Access & Publishing */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Access & Publishing</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => updateField('status', e.target.value as ContentStatus)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Display Order</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => updateField('display_order', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_public}
                                onChange={(e) => updateField('is_public', e.target.checked)}
                                className="w-5 h-5 rounded border-white/20 bg-white/[0.03] text-[#E62B1E] focus:ring-[#E62B1E] focus:ring-offset-0"
                            />
                            <Globe className="w-5 h-5 text-white/50" />
                            <span className="text-white">Public (visible to all visitors)</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.requires_registration}
                                onChange={(e) => updateField('requires_registration', e.target.checked)}
                                className="w-5 h-5 rounded border-white/20 bg-white/[0.03] text-[#E62B1E] focus:ring-[#E62B1E] focus:ring-offset-0"
                            />
                            <Lock className="w-5 h-5 text-white/50" />
                            <span className="text-white">Require registration to watch</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={(e) => updateField('is_featured', e.target.checked)}
                                className="w-5 h-5 rounded border-white/20 bg-white/[0.03] text-[#E62B1E] focus:ring-[#E62B1E] focus:ring-offset-0"
                            />
                            <span className="text-white">Featured Talk</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    {isEditing ? (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Talk
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/talks')}
                            className="px-6 py-2.5 text-white/70 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Save Changes' : 'Create Talk'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function AdminTalkForm() {
    return (
        <RequireAuth requiredPermission="manage_talks">
            <TalkFormContent />
        </RequireAuth>
    );
}
