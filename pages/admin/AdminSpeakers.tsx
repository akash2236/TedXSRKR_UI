/**
 * Admin Speakers Management
 * 
 * CRUD interface for managing speakers.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Archive,
    Send,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Mic,
} from 'lucide-react';
import {
    getSpeakers,
    deleteSpeaker,
    publishSpeaker,
    archiveSpeaker,
} from '../../lib/adminApi';
import { DbSpeaker, ContentStatus } from '../../types/admin';
import { useRequiredAdminAuth, RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
    status: ContentStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        draft: { icon: Clock, color: 'text-yellow-400 bg-yellow-400/10', label: 'Draft' },
        published: { icon: CheckCircle, color: 'text-green-400 bg-green-400/10', label: 'Published' },
        archived: { icon: Archive, color: 'text-gray-400 bg-gray-400/10', label: 'Archived' },
    };

    const { icon: Icon, color, label } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

// ============================================
// Speaker Row Component
// ============================================

interface SpeakerRowProps {
    speaker: DbSpeaker;
    onRefresh: () => void;
}

function SpeakerRow({ speaker, onRefresh }: SpeakerRowProps) {
    const { adminUser } = useRequiredAdminAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'publish' | 'archive' | 'delete') => {
        setIsLoading(true);
        setShowMenu(false);

        try {
            switch (action) {
                case 'publish':
                    await publishSpeaker(speaker.id, adminUser?.id);
                    break;
                case 'archive':
                    await archiveSpeaker(speaker.id, adminUser?.id);
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this speaker? This action cannot be undone.')) {
                        await deleteSpeaker(speaker.id);
                    }
                    break;
            }
            onRefresh();
        } catch (err) {
            console.error(`Failed to ${action} speaker:`, err);
            alert(`Failed to ${action} speaker`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:border-white/[0.15] transition-colors"
        >
            {/* Image */}
            <img
                src={speaker.image_url}
                alt={speaker.name}
                className="w-12 h-12 rounded-lg object-cover"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{speaker.name}</h3>
                    {speaker.is_featured && (
                        <span className="px-2 py-0.5 bg-[#E62B1E]/20 text-[#E62B1E] text-xs rounded-full">
                            Featured
                        </span>
                    )}
                </div>
                <p className="text-white/50 text-sm truncate">{speaker.title}</p>
            </div>

            {/* Topic */}
            <div className="hidden md:block flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#E62B1E]" />
                    <span className="text-white/70 text-sm truncate">{speaker.topic}</span>
                </div>
            </div>

            {/* Status */}
            <StatusBadge status={speaker.status} />

            {/* Actions */}
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isLoading}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <MoreVertical className="w-5 h-5" />
                    )}
                </button>

                <AnimatePresence>
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-xl z-20 py-2"
                            >
                                <button
                                    onClick={() => navigate(`/admin/speakers/${speaker.id}/edit`)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <a
                                    href={`/speakers/${speaker.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    View on site
                                </a>
                                <div className="border-t border-white/[0.08] my-2" />
                                {speaker.status !== 'published' && (
                                    <button
                                        onClick={() => handleAction('publish')}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-green-400 hover:bg-green-400/10 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Publish
                                    </button>
                                )}
                                {speaker.status !== 'archived' && (
                                    <button
                                        onClick={() => handleAction('archive')}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                                    >
                                        <Archive className="w-4 h-4" />
                                        Archive
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction('delete')}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ============================================
// Main Component
// ============================================

function AdminSpeakersContent() {
    const [speakers, setSpeakers] = useState<DbSpeaker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchSpeakers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getSpeakers({
                status: statusFilter || undefined,
                page,
                limit,
                search: search || undefined,
            });

            setSpeakers(result.data);
            setTotal(result.total);
        } catch (err) {
            console.error('Failed to fetch speakers:', err);
            setError('Failed to load speakers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSpeakers();
    }, [page, statusFilter]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchSpeakers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Speakers</h1>
                    <p className="text-white/50">Manage speaker profiles and content</p>
                </div>
                <Link
                    to="/admin/speakers/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Speaker
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search speakers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                    />
                </div>

                {/* Status filter */}
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as ContentStatus | '');
                            setPage(1);
                        }}
                        className="pl-12 pr-8 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Refresh */}
                <button
                    onClick={fetchSpeakers}
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Content */}
            {error ? (
                <div className="text-center py-12">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchSpeakers}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] text-white rounded-lg hover:bg-white/[0.1] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            ) : isLoading && speakers.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
                </div>
            ) : speakers.length === 0 ? (
                <div className="text-center py-12">
                    <Mic className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No speakers found</h3>
                    <p className="text-white/50 mb-6">
                        {search || statusFilter ? 'Try adjusting your filters' : 'Get started by adding your first speaker'}
                    </p>
                    {!search && !statusFilter && (
                        <Link
                            to="/admin/speakers/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Speaker
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* List */}
                    <div className="space-y-3">
                        <AnimatePresence>
                            {speakers.map((speaker) => (
                                <SpeakerRow
                                    key={speaker.id}
                                    speaker={speaker}
                                    onRefresh={fetchSpeakers}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-white/50 text-sm">
                                Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-white/50 text-sm px-2">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function AdminSpeakers() {
    return (
        <RequireAuth requiredPermission="manage_speakers">
            <AdminSpeakersContent />
        </RequireAuth>
    );
}
