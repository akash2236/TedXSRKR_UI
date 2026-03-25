/**
 * Admin Feedback Page
 * 
 * View student feedback with ratings and messages.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Mail,
    Phone,
    Star,
    Filter,
    X,
    GraduationCap,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase-browser';
import { downloadCSV, generateCSV } from '../../lib/adminApi';
import { RequireAuth, useRequiredAdminAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Types
// ============================================

interface Feedback {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    year_of_study: string | null;
    department: string | null;
    rating: number;
    message: string;
    event_attended: string | null;
    status: 'pending' | 'reviewed' | 'archived';
    created_at: string;
}

// ============================================
// Rating Display Component
// ============================================

function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/20'
                        }`}
                />
            ))}
            <span className="ml-1 text-sm text-white/60">({rating}/5)</span>
        </div>
    );
}

// ============================================
// Feedback Card Component
// ============================================

interface FeedbackCardProps {
    feedback: Feedback;
    onStatusChange: (id: string, status: 'pending' | 'reviewed' | 'archived') => void;
}

function FeedbackCard({ feedback, onStatusChange }: FeedbackCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.04] transition-colors"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{feedback.name}</h3>
                        <RatingStars rating={feedback.rating} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                        <a
                            href={`mailto:${feedback.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-[#E62B1E] transition-colors"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            {feedback.email}
                        </a>
                        {feedback.phone && (
                            <a
                                href={`tel:${feedback.phone}`}
                                className="inline-flex items-center gap-1.5 hover:text-[#E62B1E] transition-colors"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                {feedback.phone}
                            </a>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                </div>
                <select
                    value={feedback.status}
                    onChange={(e) => onStatusChange(feedback.id, e.target.value as any)}
                    className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm focus:outline-none cursor-pointer"
                >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Details */}
            {(feedback.college || feedback.year_of_study || feedback.department || feedback.event_attended) && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {feedback.college && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] rounded-lg text-xs text-white/60">
                            <GraduationCap className="w-3 h-3" />
                            {feedback.college}
                        </span>
                    )}
                    {feedback.year_of_study && (
                        <span className="px-2.5 py-1 bg-white/[0.05] rounded-lg text-xs text-white/60">
                            {feedback.year_of_study}
                        </span>
                    )}
                    {feedback.department && (
                        <span className="px-2.5 py-1 bg-white/[0.05] rounded-lg text-xs text-white/60">
                            {feedback.department}
                        </span>
                    )}
                    {feedback.event_attended && (
                        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                            Event: {feedback.event_attended}
                        </span>
                    )}
                </div>
            )}

            {/* Message */}
            <div className="relative">
                <div
                    className={`text-white/80 text-sm leading-relaxed ${!isExpanded && feedback.message.length > 200 ? 'line-clamp-3' : ''
                        }`}
                >
                    {feedback.message}
                </div>
                {feedback.message.length > 200 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[#E62B1E] text-sm mt-2 hover:underline"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ============================================
// Main Component
// ============================================

function FeedbackContent() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Fetch feedbacks
    const fetchFeedbacks = useCallback(async () => {
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) return;

            let query = supabase
                .from('feedbacks')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`);
            }
            if (ratingFilter) query = query.eq('rating', parseInt(ratingFilter));
            if (statusFilter) query = query.eq('status', statusFilter);

            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;

            setFeedbacks(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Failed to fetch feedbacks:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, ratingFilter, statusFilter]);

    useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, ratingFilter, statusFilter]);

    // Handle status change
    const handleStatusChange = async (id: string, status: 'pending' | 'reviewed' | 'archived') => {
        try {
            const supabase = getSupabase();
            if (!supabase) return;

            const { error } = await supabase
                .from('feedbacks')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    // Export
    const handleExport = async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data, error } = await supabase
                .from('feedbacks')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            const csv = generateCSV(data || [], [
                'name', 'email', 'phone', 'college', 'year_of_study', 'department',
                'rating', 'message', 'event_attended', 'status', 'created_at',
            ]);
            downloadCSV(csv, `feedback_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export feedback');
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasActiveFilters = searchQuery || ratingFilter || statusFilter;

    const clearFilters = () => {
        setSearchQuery('');
        setRatingFilter('');
        setStatusFilter('');
        setShowFilters(false);
    };

    // Calculate average rating
    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-[#E62B1E]" />
                        Student Feedback
                    </h1>
                    <p className="text-white/50 mt-1">
                        {totalCount} total feedback submissions
                        {feedbacks.length > 0 && (
                            <span className="ml-2 text-yellow-400">
                                (Avg: {averageRating} ⭐)
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchFeedbacks}
                        disabled={isLoading}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or message..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${showFilters || hasActiveFilters
                                ? 'bg-[#E62B1E]/10 text-[#E62B1E] border border-[#E62B1E]/30'
                                : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:text-white'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-[#E62B1E] rounded-full" />}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-4">
                                <div>
                                    <label className="block text-white/50 text-xs mb-1">Rating</label>
                                    <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
                                        className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none cursor-pointer">
                                        <option value="">All Ratings</option>
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/50 text-xs mb-1">Status</label>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none cursor-pointer">
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
                                        <X className="w-4 h-4" /> Clear filters
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E62B1E]"></div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center bg-white/[0.02] border border-white/[0.08] rounded-2xl">
                        <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-medium text-white/70">No feedback found</h3>
                        <p className="text-white/40 text-sm mt-1">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Feedback will appear here'}
                        </p>
                    </div>
                ) : (
                    feedbacks.map((feedback) => (
                        <FeedbackCard
                            key={feedback.id}
                            feedback={feedback}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                    <p className="text-white/50 text-sm">
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white/60 text-sm">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminFeedback() {
    return (
        <RequireAuth requiredPermission="view_dashboard">
            <FeedbackContent />
        </RequireAuth>
    );
}
