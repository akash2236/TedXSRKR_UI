/**
 * Admin Speaker Form
 * 
 * Create/Edit speaker form with video attachment support.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Eye,
    Trash2,
    Upload,
    Plus,
    X,
    Link as LinkIcon,
    Instagram,
    Linkedin,
    Twitter,
    Globe,
    CheckCircle,
    AlertCircle,
    LucideIcon,
} from 'lucide-react';
import {
    getSpeakerById,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
} from '../../lib/adminApi';
import { DbSpeaker, DbSpeakerInput, ContentStatus } from '../../types/admin';
import { useRequiredAdminAuth, RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Form Input Component
// ============================================

interface FormInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'textarea' | 'url';
    placeholder?: string;
    required?: boolean;
    icon?: LucideIcon;
    rows?: number;
}

function FormInput({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder,
    required,
    icon: Icon,
    rows = 4,
}: FormInputProps) {
    const baseClasses = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 focus:ring-2 focus:ring-[#E62B1E]/20 transition-all";

    return (
        <div>
            <label htmlFor={name} className="block text-white/70 text-sm font-medium mb-2">
                {label} {required && <span className="text-[#E62B1E]">*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    rows={rows}
                    className={`${baseClasses} px-4 py-3 resize-none`}
                />
            ) : (
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    )}
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        className={`${baseClasses} ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3`}
                    />
                </div>
            )}
        </div>
    );
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
                    placeholder="Add expertise..."
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
// Image Preview Component
// ============================================

interface ImagePreviewProps {
    url: string;
    onUrlChange: (url: string) => void;
}

function ImagePreview({ url, onUrlChange }: ImagePreviewProps) {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [url]);

    return (
        <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
                Profile Image <span className="text-[#E62B1E]">*</span>
            </label>
            <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden flex-shrink-0">
                    {url && !error ? (
                        <img
                            src={url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white/20" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => onUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        required
                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                    />
                    <p className="text-white/40 text-xs mt-2">
                        Enter a URL to the speaker's profile image
                    </p>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Main Form Component
// ============================================

function SpeakerFormContent() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { adminUser } = useRequiredAdminAuth();
    const isEditing = !!id && id !== 'new';

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState<DbSpeakerInput>({
        slug: '',
        name: '',
        title: '',
        topic: '',
        bio: '',
        image_url: '',
        thumbnail_url: '',
        linkedin_url: '',
        instagram_url: '',
        twitter_url: '',
        website_url: '',
        expertise: [],
        status: 'draft',
        is_featured: false,
        display_order: 0,
    });

    // Load existing speaker
    useEffect(() => {
        if (isEditing) {
            setIsLoading(true);
            getSpeakerById(id!)
                .then((speaker) => {
                    if (speaker) {
                        setFormData({
                            slug: speaker.slug,
                            name: speaker.name,
                            title: speaker.title,
                            topic: speaker.topic,
                            bio: speaker.bio || '',
                            image_url: speaker.image_url,
                            thumbnail_url: speaker.thumbnail_url || '',
                            linkedin_url: speaker.linkedin_url || '',
                            instagram_url: speaker.instagram_url || '',
                            twitter_url: speaker.twitter_url || '',
                            website_url: speaker.website_url || '',
                            expertise: speaker.expertise || [],
                            status: speaker.status,
                            is_featured: speaker.is_featured,
                            display_order: speaker.display_order,
                        });
                    } else {
                        setError('Speaker not found');
                    }
                })
                .catch((err) => {
                    console.error('Failed to load speaker:', err);
                    setError('Failed to load speaker');
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditing]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEditing && formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name, isEditing]);

    const updateField = <K extends keyof DbSpeakerInput>(field: K, value: DbSpeakerInput[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            if (isEditing) {
                await updateSpeaker(id!, formData, adminUser?.id);
            } else {
                await createSpeaker(formData, adminUser?.id);
            }
            setSuccess(true);
            setTimeout(() => navigate('/admin/speakers'), 1000);
        } catch (err) {
            console.error('Failed to save speaker:', err);
            const message = err instanceof Error ? err.message : 'Failed to save speaker. Please check your input and try again.';
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this speaker? This action cannot be undone.')) {
            return;
        }

        setIsSaving(true);
        try {
            await deleteSpeaker(id!);
            navigate('/admin/speakers');
        } catch (err) {
            console.error('Failed to delete speaker:', err);
            setError('Failed to delete speaker');
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
                    onClick={() => navigate('/admin/speakers')}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">
                        {isEditing ? 'Edit Speaker' : 'Add New Speaker'}
                    </h1>
                    <p className="text-white/50">
                        {isEditing ? 'Update speaker details and content' : 'Create a new speaker profile'}
                    </p>
                </div>
                {isEditing && (
                    <a
                        href={`/speakers/${formData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </a>
                )}
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
                    <p className="text-green-400">Speaker saved successfully!</p>
                </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                    
                    <ImagePreview
                        url={formData.image_url}
                        onUrlChange={(url) => updateField('image_url', url)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={(v) => updateField('name', v)}
                            placeholder="Dr. Jane Smith"
                            required
                        />
                        <FormInput
                            label="URL Slug"
                            name="slug"
                            value={formData.slug}
                            onChange={(v) => updateField('slug', v)}
                            placeholder="jane-smith"
                            required
                            icon={LinkIcon}
                        />
                    </div>

                    <FormInput
                        label="Title / Position"
                        name="title"
                        value={formData.title}
                        onChange={(v) => updateField('title', v)}
                        placeholder="AI Research Scientist at TechCorp"
                        required
                    />

                    <FormInput
                        label="Talk Topic"
                        name="topic"
                        value={formData.topic}
                        onChange={(v) => updateField('topic', v)}
                        placeholder="The Future of AI in Healthcare"
                        required
                    />

                    <FormInput
                        label="Biography"
                        name="bio"
                        value={formData.bio || ''}
                        onChange={(v) => updateField('bio', v)}
                        type="textarea"
                        placeholder="Write a compelling biography..."
                        rows={6}
                    />

                    <TagsInput
                        label="Areas of Expertise"
                        tags={formData.expertise || []}
                        onChange={(tags) => updateField('expertise', tags)}
                    />
                </div>

                {/* Social Links */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Social Links</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="LinkedIn"
                            name="linkedin_url"
                            value={formData.linkedin_url || ''}
                            onChange={(v) => updateField('linkedin_url', v)}
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            icon={Linkedin}
                        />
                        <FormInput
                            label="Instagram"
                            name="instagram_url"
                            value={formData.instagram_url || ''}
                            onChange={(v) => updateField('instagram_url', v)}
                            type="url"
                            placeholder="https://instagram.com/..."
                            icon={Instagram}
                        />
                        <FormInput
                            label="Twitter / X"
                            name="twitter_url"
                            value={formData.twitter_url || ''}
                            onChange={(v) => updateField('twitter_url', v)}
                            type="url"
                            placeholder="https://twitter.com/..."
                            icon={Twitter}
                        />
                        <FormInput
                            label="Website"
                            name="website_url"
                            value={formData.website_url || ''}
                            onChange={(v) => updateField('website_url', v)}
                            type="url"
                            placeholder="https://..."
                            icon={Globe}
                        />
                    </div>
                </div>

                {/* Publishing Options */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Publishing</h2>
                    
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

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => updateField('is_featured', e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/[0.03] text-[#E62B1E] focus:ring-[#E62B1E] focus:ring-offset-0"
                        />
                        <span className="text-white">Featured Speaker</span>
                    </label>
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
                            Delete Speaker
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/speakers')}
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
                                    {isEditing ? 'Save Changes' : 'Create Speaker'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function AdminSpeakerForm() {
    return (
        <RequireAuth requiredPermission="manage_speakers">
            <SpeakerFormContent />
        </RequireAuth>
    );
}
