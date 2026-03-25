/**
 * Admin Talks Management
 * 
 * CRUD interface for managing talks and videos.
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
    Video,
    Play,
    Lock,
    Globe,
} from 'lucide-react';
import {
    getTalks,
    deleteTalk,
    publishTalk,
    archiveTalk,
    getSpeakers,
} from '../../lib/adminApi';
import { DbTalkWithSpeaker, DbSpeaker, ContentStatus } from '../../types/admin';
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
// Talk Row Component
// ============================================

interface TalkRowProps {
    talk: DbTalkWithSpeaker;
    onRefresh: () => void;
}

function TalkRow({ talk, onRefresh }: TalkRowProps) {
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
                    await publishTalk(talk.id, adminUser?.id);
                    break;
                case 'archive':
                    await archiveTalk(talk.id, adminUser?.id);
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this talk? This action cannot be undone.')) {
                        await deleteTalk(talk.id);
                    }
                    break;
            }
            onRefresh();
        } catch (err) {
            console.error(`Failed to ${action} talk:`, err);
            alert(`Failed to ${action} talk`);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:border-white/[0.15] transition-colors"
        >
            {/* Thumbnail */}
            <div className="relative w-20 h-14 rounded-lg bg-white/[0.03] overflow-hidden flex-shrink-0">
                {talk.thumbnail_url ? (
                    <img
                        src={talk.thumbnail_url}
                        alt={talk.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-white/20" />
                    </div>
                )}
                {talk.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{talk.title}</h3>
                    {talk.is_featured && (
                        <span className="px-2 py-0.5 bg-[#E62B1E]/20 text-[#E62B1E] text-xs rounded-full">
                            Featured
                        </span>
                    )}
                </div>
                <p className="text-white/50 text-sm truncate">
                    {talk.speaker?.name || 'Unknown Speaker'}
                </p>
            </div>

            {/* Duration */}
            <div className="hidden md:block text-white/50 text-sm">
                {formatDuration(talk.duration_seconds)}
            </div>

            {/* Access */}
            <div className="hidden md:flex items-center gap-1.5 text-white/50 text-sm">
                {talk.requires_registration ? (
                    <>
                        <Lock className="w-4 h-4" />
                        <span>Registered</span>
                    </>
                ) : (
                    <>
                        <Globe className="w-4 h-4" />
                        <span>Public</span>
                    </>
                )}
            </div>

            {/* Views */}
            <div className="hidden md:block text-white/50 text-sm">
                {talk.view_count} views
            </div>

            {/* Status */}
            <StatusBadge status={talk.status} />

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
                                    onClick={() => navigate(`/admin/talks/${talk.id}/edit`)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                {talk.video_url && (
                                    <a
                                        href={talk.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                    >
                                        <Play className="w-4 h-4" />
                                        Watch Video
                                    </a>
                                )}
                                <div className="border-t border-white/[0.08] my-2" />
                                {talk.status !== 'published' && (
                                    <button
                                        onClick={() => handleAction('publish')}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-green-400 hover:bg-green-400/10 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Publish
                                    </button>
                                )}
                                {talk.status !== 'archived' && (
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

function AdminTalksContent() {
    const [talks, setTalks] = useState<DbTalkWithSpeaker[]>([]);
    const [speakers, setSpeakers] = useState<DbSpeaker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
    const [speakerFilter, setSpeakerFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchTalks = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await getTalks({
                status: statusFilter || undefined,
                speakerId: speakerFilter || undefined,
                page,
                limit,
                search: search || undefined,
            });
            
            setTalks(result.data);
            setTotal(result.total);
        } catch (err) {
            console.error('Failed to fetch talks:', err);
            setError('Failed to load talks');
        } finally {
            setIsLoading(false);
        }
    };

    // Load speakers for filter
    useEffect(() => {
        getSpeakers({ limit: 100 })
            .then(result => setSpeakers(result.data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetchTalks();
    }, [page, statusFilter, speakerFilter]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchTalks();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Talks & Videos</h1>
                    <p className="text-white/50">Manage talk recordings and video content</p>
                </div>
                <Link
                    to="/admin/talks/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Talk
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search talks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                    />
                </div>

                {/* Speaker filter */}
                <select
                    value={speakerFilter}
                    onChange={(e) => {
                        setSpeakerFilter(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                >
                    <option value="">All Speakers</option>
                    {speakers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>

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
                    onClick={fetchTalks}
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
                        onClick={fetchTalks}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] text-white rounded-lg hover:bg-white/[0.1] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            ) : isLoading && talks.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
                </div>
            ) : talks.length === 0 ? (
                <div className="text-center py-12">
                    <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No talks found</h3>
                    <p className="text-white/50 mb-6">
                        {search || statusFilter || speakerFilter ? 'Try adjusting your filters' : 'Get started by adding your first talk'}
                    </p>
                    {!search && !statusFilter && !speakerFilter && (
                        <Link
                            to="/admin/talks/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Talk
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* List */}
                    <div className="space-y-3">
                        <AnimatePresence>
                            {talks.map((talk) => (
                                <TalkRow
                                    key={talk.id}
                                    talk={talk}
                                    onRefresh={fetchTalks}
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

export default function AdminTalks() {
    return (
        <RequireAuth requiredPermission="manage_talks">
            <AdminTalksContent />
        </RequireAuth>
    );
}
