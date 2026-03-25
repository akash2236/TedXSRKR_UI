/**
 * Admin Registrations Page
 * 
 * View registrations, filter by payment status, approve/reject offline payments.
 * Sends email to applicant on approval/rejection.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Mail,
    Phone,
    GraduationCap,
    Filter,
    X,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    Wallet,
    AlertTriangle,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase-browser';
import { downloadCSV, generateCSV } from '../../lib/adminApi';
import { RequireAuth, useRequiredAdminAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Types
// ============================================

interface Registration {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    year: string | null;
    department: string | null;
    ticket_type: string;
    payment_method: 'online' | 'offline';
    payment_status: 'pending' | 'approved' | 'rejected';
    payee_name: string | null;
    transaction_id: string | null;
    rejection_reason: string | null;
    approved_by: string | null;
    approved_at: string | null;
    created_at: string;
}

// ============================================
// Status Badge Component
// ============================================

function PaymentStatusBadge({ status }: { status: string }) {
    const config = {
        approved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle, label: 'Approved' },
        pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock, label: 'Pending' },
        rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle, label: 'Rejected' },
    }[status] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', icon: Clock, label: status };

    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}

function PaymentMethodBadge({ method }: { method: string }) {
    if (method === 'offline') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Wallet className="w-3 h-3" /> Offline
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CreditCard className="w-3 h-3" /> Online
        </span>
    );
}

// ============================================
// Approve/Reject Modal
// ============================================

interface ActionModalProps {
    registration: Registration | null;
    action: 'approve' | 'reject' | null;
    onClose: () => void;
    onConfirm: (registrationId: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
    isProcessing: boolean;
}

function ActionModal({ registration, action, onClose, onConfirm, isProcessing }: ActionModalProps) {
    const [reason, setReason] = useState('');

    if (!registration || !action) return null;

    const isReject = action === 'reject';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#1a1a1a] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isReject ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                        {isReject ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{isReject ? 'Reject' : 'Approve'} Registration</h3>
                        <p className="text-sm text-white/50">{registration.name} ({registration.email})</p>
                    </div>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-4 mb-4 border border-white/[0.05]">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-white/50">Ticket:</p>
                        <p className="text-white capitalize">{registration.ticket_type}</p>
                        <p className="text-white/50">Payment:</p>
                        <p className="text-white capitalize">{registration.payment_method}</p>
                        {registration.payee_name && (
                            <>
                                <p className="text-white/50">Payee:</p>
                                <p className="text-white">{registration.payee_name}</p>
                            </>
                        )}
                    </div>
                </div>

                {isReject && (
                    <div className="mb-4">
                        <label className="block text-sm text-white/70 mb-2">Reason for rejection <span className="text-red-400">*</span></label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Payment not received, Invalid transaction..."
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 resize-none h-24"
                        />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 rounded-xl border border-white/[0.1] text-white/70 hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(registration.id, action, reason)}
                        disabled={isProcessing || (isReject && !reason.trim())}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isReject
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            isReject ? 'Reject & Send Email' : 'Approve & Send Email'
                        )}
                    </button>
                </div>

                <p className="text-xs text-white/40 text-center mt-3">
                    {isReject
                        ? 'The applicant will receive a rejection email with the reason.'
                        : 'The applicant will receive a confirmation email.'}
                </p>
            </motion.div>
        </div>
    );
}

// ============================================
// Main Component
// ============================================

function RegistrationsContent() {
    const { adminUser } = useRequiredAdminAuth();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Action modal state
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Fetch registrations
    const fetchRegistrations = useCallback(async () => {
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) return;

            let query = supabase
                .from('registrations')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
            }
            if (yearFilter) query = query.eq('year', yearFilter);
            if (paymentStatusFilter) query = query.eq('payment_status', paymentStatusFilter);
            if (paymentMethodFilter) query = query.eq('payment_method', paymentMethodFilter);

            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;

            setRegistrations(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Failed to fetch registrations:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, yearFilter, paymentStatusFilter, paymentMethodFilter]);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, yearFilter, paymentStatusFilter, paymentMethodFilter]);

    // Handle approve/reject
    // NOTE: Uses Supabase directly (bypasses /api/admin/approve-registration which
    // is not available on the static hosted site). Email is sent via API best-effort.
    const handleAction = async (registrationId: string, action: 'approve' | 'reject', reason?: string) => {
        setIsProcessing(true);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Supabase not configured');

            // ── Step 1: Update payment_status directly in Supabase ──────────────
            const updateData: Record<string, unknown> = {
                payment_status: action === 'approve' ? 'approved' : 'rejected',
                approved_by: adminUser?.name || 'Admin',
                approved_at: new Date().toISOString(),
            };
            if (action === 'reject' && reason) {
                updateData.rejection_reason = reason;
            }

            const { error: updateError } = await supabase
                .from('registrations')
                .update(updateData)
                .eq('id', registrationId);

            if (updateError) {
                throw new Error(updateError.message || 'Failed to update registration in database.');
            }

            let emailSent = false;
            // ── Step 2: Try to send email via API (best-effort) ──
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData?.session?.access_token;

                const API_BASE = import.meta.env.VITE_API_URL || '';
                const emailRes = await fetch(`${API_BASE}/api/admin/approve-registration`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || ''}`,
                    },
                    body: JSON.stringify({
                        registrationId,
                        action,
                        rejectionReason: reason,
                        approvedBy: adminUser?.name || 'Admin',
                        emailOnly: true, // hint to skip DB update if API handles it
                    }),
                });

                // Check if it's JSON and a successful response
                const contentType = emailRes.headers.get('content-type') || '';
                if (emailRes.ok && contentType.includes('application/json')) {
                    await emailRes.json();
                    emailSent = true;
                }
            } catch {
                // Email API unavailable or network error
                console.warn('[Admin] Email API not available, skipping email send.');
            }

            if (emailSent) {
                setActionFeedback({
                    type: 'success',
                    message: `Registration ${action === 'approve' ? 'approved ✅' : 'rejected'} successfully. Email notification sent.`,
                });
            } else {
                setActionFeedback({
                    type: 'error',
                    message: `Registration ${action === 'approve' ? 'approved' : 'rejected'}, but email notification failed (API unavailable).`,
                });
            }

            // Close modal and refresh list
            setSelectedRegistration(null);
            setModalAction(null);
            fetchRegistrations();

            // Auto-clear feedback after 5 seconds
            setTimeout(() => setActionFeedback(null), 5000);

        } catch (err) {
            setActionFeedback({
                type: 'error',
                message: err instanceof Error ? err.message : 'Action failed. Please try again.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Export
    const handleExport = async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            const csv = generateCSV(data || [], [
                'name', 'email', 'phone', 'college', 'year', 'department',
                'ticket_type', 'payment_method', 'payment_status', 'payee_name', 'created_at',
            ]);
            downloadCSV(csv, `registrations_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export registrations');
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Faculty', 'Other'];
    const hasActiveFilters = searchQuery || yearFilter || paymentStatusFilter || paymentMethodFilter;

    const clearFilters = () => {
        setSearchQuery('');
        setYearFilter('');
        setPaymentStatusFilter('');
        setPaymentMethodFilter('');
        setShowFilters(false);
    };

    // Count by status for quick stats
    const pendingCount = registrations.filter(r => r.payment_status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-7 h-7 text-[#E62B1E]" />
                        Registrations
                    </h1>
                    <p className="text-white/50 mt-1">
                        {totalCount} total registrations
                        {pendingCount > 0 && (
                            <span className="ml-2 text-yellow-400">({pendingCount} pending approval)</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchRegistrations}
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

            {/* Feedback Banner */}
            <AnimatePresence>
                {actionFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${
                            actionFeedback.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-red-500/10 border border-red-500/30'
                        }`}
                    >
                        {actionFeedback.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${actionFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {actionFeedback.message}
                        </p>
                        <button onClick={() => setActionFeedback(null)} className="ml-auto text-white/40 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                            showFilters || hasActiveFilters
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
                                    <label className="block text-white/50 text-xs mb-1">Year</label>
                                    <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
                                        className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none cursor-pointer">
                                        <option value="">All Years</option>
                                        {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/50 text-xs mb-1">Payment Status</label>
                                    <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                        className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none cursor-pointer">
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/50 text-xs mb-1">Payment Method</label>
                                    <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none cursor-pointer">
                                        <option value="">All Methods</option>
                                        <option value="online">Online</option>
                                        <option value="offline">Offline</option>
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

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E62B1E]"></div>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Users className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-medium text-white/70">No registrations found</h3>
                        <p className="text-white/40 text-sm mt-1">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Registrations will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/[0.02]">
                                <tr className="text-left text-white/50 text-sm">
                                    <th className="px-4 py-4 font-medium">Name</th>
                                    <th className="px-4 py-4 font-medium">Email</th>
                                    <th className="px-4 py-4 font-medium">Phone</th>
                                    <th className="px-4 py-4 font-medium">Year</th>
                                    <th className="px-4 py-4 font-medium">Payment</th>
                                    <th className="px-4 py-4 font-medium">Status</th>
                                    <th className="px-4 py-4 font-medium">Registered</th>
                                    <th className="px-4 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {registrations.map((reg, index) => (
                                    <motion.tr
                                        key={reg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="text-white/70 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <div>
                                                <span className="text-white font-medium">{reg.name}</span>
                                                <span className="block text-xs text-white/40 capitalize">{reg.ticket_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <a href={`mailto:${reg.email}`}
                                                className="inline-flex items-center gap-1.5 text-white/60 hover:text-[#E62B1E] transition-colors text-sm">
                                                <Mail className="w-3.5 h-3.5" />
                                                {reg.email}
                                            </a>
                                        </td>
                                        <td className="px-4 py-4">
                                            {reg.phone ? (
                                                <a href={`tel:${reg.phone}`}
                                                    className="inline-flex items-center gap-1.5 text-white/60 hover:text-[#E62B1E] transition-colors text-sm">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {reg.phone}
                                                </a>
                                            ) : <span className="text-white/30 text-sm">—</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            {reg.year ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/[0.05] rounded-lg text-xs">
                                                    <GraduationCap className="w-3 h-3" />
                                                    {reg.year}
                                                </span>
                                            ) : <span className="text-white/30 text-sm">—</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <PaymentMethodBadge method={reg.payment_method} />
                                                {reg.payee_name && (
                                                    <p className="text-xs text-white/40">Payee: {reg.payee_name}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <PaymentStatusBadge status={reg.payment_status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-white/50 text-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(reg.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {reg.payment_status === 'pending' ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => { setSelectedRegistration(reg); setModalAction('approve'); }}
                                                        className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedRegistration(reg); setModalAction('reject'); }}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-white/30">
                                                    {reg.approved_by ? `by ${reg.approved_by}` : '—'}
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08]">
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
            </motion.div>

            {/* Action Modal */}
            <AnimatePresence>
                {selectedRegistration && modalAction && (
                    <ActionModal
                        registration={selectedRegistration}
                        action={modalAction}
                        onClose={() => { setSelectedRegistration(null); setModalAction(null); }}
                        onConfirm={handleAction}
                        isProcessing={isProcessing}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminRegistrations() {
    return (
        <RequireAuth requiredPermission="view_dashboard">
            <RegistrationsContent />
        </RequireAuth>
    );
}