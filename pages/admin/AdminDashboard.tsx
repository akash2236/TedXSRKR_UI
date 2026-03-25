/**
 * Admin Dashboard Home
 * 
 * Overview page with key metrics and quick actions.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase-browser';
import { motion } from 'framer-motion';
import {
    Users,
    Mic,
    Video,
    Eye,
    TrendingUp,
    Plus,
    ArrowRight,
    Calendar,
    RefreshCw,
    Mail,
    Send,
    CheckCircle,
    AlertCircle,
    LucideIcon,
    ToggleLeft,
    ToggleRight,
    Lock,
    Unlock,
    XCircle,
} from 'lucide-react';
import {
    getDashboardSummary,
    getRegistrationStats,
    getDailyVideoStats,
    getRegistrationStatus,
    setRegistrationStatus,
    RegistrationStatus,
    getScheduleVisibility,
    setScheduleVisibility
} from '../../lib/adminApi';
import { DashboardSummary, RegistrationStats, DailyVideoStats } from '../../types/admin';
import { useRequiredAdminAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: number;
    color?: 'red' | 'blue' | 'green' | 'purple';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'red' }: StatCardProps) {
    const colorClasses = {
        red: 'bg-[#E62B1E]/10 text-[#E62B1E]',
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-green-500/10 text-green-400',
        purple: 'bg-purple-500/10 text-purple-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-white/40 text-sm">{title}</p>
            {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
        </motion.div>
    );
}

// ============================================
// Quick Action Card
// ============================================

interface QuickActionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color?: string;
}

function QuickAction({ title, description, icon: Icon, href, color = '#E62B1E' }: QuickActionProps) {
    return (
        <Link
            to={href}
            className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:border-white/[0.15] hover:bg-white/[0.03] transition-all"
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
            >
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1">
                <h4 className="text-white font-medium">{title}</h4>
                <p className="text-white/40 text-sm">{description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}

// ============================================
// Main Dashboard Component
// ============================================

export default function AdminDashboard() {
    const { adminUser, session, canManageContent } = useRequiredAdminAuth();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [recentRegistrations, setRecentRegistrations] = useState<RegistrationStats[]>([]);
    const [recentViews, setRecentViews] = useState<DailyVideoStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Registration control state ────────────────────────────────
    const [regStatus, setRegStatus] = useState<RegistrationStatus | null>(null);
    const [regToggling, setRegToggling] = useState(false);
    const [regToggleError, setRegToggleError] = useState<string | null>(null);
    const [regToggleSuccess, setRegToggleSuccess] = useState(false);

    // ── Reminder state ───────────────────────────────────────────
    type ReminderStatus = 'idle' | 'previewing' | 'preview_done' | 'sending' | 'done' | 'error';
    const [reminderStatus, setReminderStatus] = useState<ReminderStatus>('idle');
    const [reminderPreview, setReminderPreview] = useState<{ total: number; emails: string[]; ids?: string[] } | null>(null);
    const [reminderResult, setReminderResult] = useState<{ sent: number; failed: number; errors?: string[] } | null>(null);
    const [reminderError, setReminderError] = useState<string | null>(null);
    const [forceResend, setForceResend] = useState(false);
    const [reminderProgress, setReminderProgress] = useState<{ current: number; total: number } | null>(null);

    // ── Schedule visibility state ────────────────────────────────
    const [isScheduleRevealed, setIsScheduleRevealed] = useState(false);
    const [scheduleToggling, setScheduleToggling] = useState(false);
    const [scheduleToggleSuccess, setScheduleToggleSuccess] = useState(false);

    // Local API route (compatible with Vercel/Netlify functions)
    const REMINDER_API_URL = '/api/send-reminder';

    /**
     * Get a fresh access token — refreshes the session if it's about to expire.
     * Returns the token string, or throws if the session is invalid.
     */
    const getFreshToken = async (): Promise<string> => {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase client not available');

        // getSession returns the cached session; if it's expired, Supabase
        // auto-refreshes it behind the scenes (autoRefreshToken: true).
        const { data: sessionData, error } = await supabase.auth.getSession();

        if (error || !sessionData?.session?.access_token) {
            throw new Error('Your session has expired. Please log in again.');
        }

        return sessionData.session.access_token;
    };

    /**
     * Safely call the reminder API and parse the JSON response.
     * Throws a typed error on 401 so callers can distinguish auth failures.
     */
    const callReminderApi = async (token: string, body: Record<string, unknown>) => {
        const res = await fetch(REMINDER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(
                res.ok
                    ? 'Received invalid data from server'
                    : `Server error: ${text.substring(0, 80)}...`
            );
        }

        if (res.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }

        if (!res.ok) {
            console.error('[API] Error response:', data);
            const error: any = new Error(data.message || data.error || `Request failed (HTTP ${res.status})`);
            error.details = data.details || data.stack;
            throw error;
        }
        return data;
    };

    /** Step 1 — dry run: shows how many will receive the email */
    const previewReminders = async () => {
        setReminderStatus('previewing');
        setReminderError(null);
        try {
            const token = await getFreshToken();
            const data = await callReminderApi(token, { dryRun: true, force: forceResend });

            if (data.eventPassed) {
                setReminderPreview({ total: 0, emails: [], ids: [] });
                setReminderError('The event date has passed. Reminders are no longer being sent.');
                setReminderStatus('error');
                return;
            }

            if (data.totalRecipients === 0) {
                setReminderPreview({ total: 0, emails: [], ids: [] });
            } else {
                setReminderPreview({
                    total: data.totalRecipients,
                    emails: data.recipients || [],
                    ids: data.ids || [],
                });
            }
            setReminderStatus('preview_done');
        } catch (err: any) {
            setReminderError(err.message || 'Failed to preview');
            if (err.details) {
                setReminderResult({ sent: 0, failed: 0, errors: [err.details] });
            }
            setReminderStatus('error');
        }
    };

    /** Step 2 — actually send, batching 10 IDs at a time from the client */
    const sendReminders = async () => {
        if (!reminderPreview || reminderPreview.total === 0) return;

        setReminderStatus('sending');
        setReminderError(null);
        setReminderProgress({ current: 0, total: reminderPreview.total });

        let totalSent = 0;
        let totalFailed = 0;
        let allErrors: string[] = [];

        try {
            const allIds = reminderPreview.ids || [];
            const BATCH_SIZE = 5; // Matches MAX_PER_INVOCATION on the API

            for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
                const batchIds = allIds.slice(i, i + BATCH_SIZE);

                // Refresh token for every batch to avoid mid-batch 401
                const token = await getFreshToken();
                const data = await callReminderApi(token, {
                    force: forceResend,
                    ids: batchIds,
                });

                totalSent += data.sent || 0;
                totalFailed += data.failed || 0;
                if (data.errors) {
                    allErrors = [...allErrors, ...data.errors];
                }

                setReminderProgress({
                    current: Math.min(i + BATCH_SIZE, reminderPreview.total),
                    total: reminderPreview.total,
                });

                // Brief pause between batches to avoid Gmail rate-limiting
                if (i + BATCH_SIZE < allIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            setReminderResult({
                sent: totalSent,
                failed: totalFailed,
                errors: allErrors.length > 0 ? allErrors : undefined,
            });
            setReminderStatus('done');
            setReminderProgress(null);
        } catch (err: any) {
            // Preserve partial results so the admin sees what succeeded
            const errors = [...allErrors];
            if (err.details) errors.push(err.details);

            setReminderResult({
                sent: totalSent,
                failed: totalFailed,
                errors: errors.length > 0 ? errors : undefined,
            });
            setReminderError(err.message || 'Failed to send reminders');
            setReminderStatus('error');
            setReminderProgress(null);
        }
    };

    const fetchRegistrationStatus = async () => {
        try {
            const status = await getRegistrationStatus();
            setRegStatus(status);
        } catch (err) {
            console.error('Failed to fetch registration status:', err);
        }
    };

    const handleToggleRegistration = async () => {
        if (!regStatus) return;
        setRegToggling(true);
        setRegToggleError(null);
        setRegToggleSuccess(false);
        const newValue = !regStatus.isOpen;
        const success = await setRegistrationStatus(newValue, adminUser?.email);
        if (success) {
            setRegStatus(prev => prev ? { ...prev, isOpen: newValue } : prev);
            setRegToggleSuccess(true);
            setTimeout(() => setRegToggleSuccess(false), 3000);
        } else {
            setRegToggleError('Failed to update registration status. Please try again.');
        }
        setRegToggling(false);
    };

    const fetchScheduleVisibilityStatus = async () => {
        try {
            const revealed = await getScheduleVisibility();
            setIsScheduleRevealed(revealed);
        } catch (err) {
            console.error('Failed to fetch schedule visibility:', err);
        }
    };

    const handleToggleSchedule = async () => {
        setScheduleToggling(true);
        setScheduleToggleSuccess(false);
        const newValue = !isScheduleRevealed;
        const success = await setScheduleVisibility(newValue, adminUser?.email);
        if (success) {
            setIsScheduleRevealed(newValue);
            setScheduleToggleSuccess(true);
            setTimeout(() => setScheduleToggleSuccess(false), 3000);
        }
        setScheduleToggling(false);
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            // Use Promise.allSettled to handle partial failures
            const results = await Promise.allSettled([
                getDashboardSummary(),
                getRegistrationStats(),
                getDailyVideoStats(),
            ]);

            clearTimeout(timeoutId);

            const [summaryRes, regRes, viewRes] = results;

            if (summaryRes.status === 'fulfilled') {
                setSummary(summaryRes.value);
            } else {
                console.error('Summary fetch failed:', summaryRes.reason);
            }

            if (regRes.status === 'fulfilled') {
                setRecentRegistrations(regRes.value.slice(0, 7));
            } else {
                console.error('Registration stats fetch failed:', regRes.reason);
            }

            if (viewRes.status === 'fulfilled') {
                setRecentViews(viewRes.value.slice(0, 7));
            } else {
                console.error('Video stats fetch failed:', viewRes.reason);
            }

            // If everything failed, show a general error
            if (results.every(r => r.status === 'rejected')) {
                setError('Unable to connect to database. Please check your connection.');
            }
        } catch (err: any) {
            clearTimeout(timeoutId);
            const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');
            setError(isTimeout ? 'Request timed out. The database is taking too long to respond.' : 'Failed to load dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchRegistrationStatus();
        fetchScheduleVisibilityStatus();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] text-white rounded-lg hover:bg-white/[0.1] transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {adminUser?.name?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className="text-white/50">
                        Here's what's happening with TEDxSRKR 2026
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] text-white/70 rounded-lg hover:bg-white/[0.1] hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Registrations"
                    value={summary?.totalRegistrations || 0}
                    subtitle={`+${summary?.registrationsToday || 0} today`}
                    icon={Users}
                    color="red"
                />
                <StatCard
                    title="Published Speakers"
                    value={summary?.publishedSpeakers || 0}
                    subtitle={`${summary?.totalSpeakers || 0} total`}
                    icon={Mic}
                    color="blue"
                />
                <StatCard
                    title="Published Talks"
                    value={summary?.publishedTalks || 0}
                    subtitle={`${summary?.totalTalks || 0} total`}
                    icon={Video}
                    color="green"
                />
                <StatCard
                    title="Video Views"
                    value={summary?.totalVideoViews || 0}
                    subtitle={`+${summary?.viewsToday || 0} today`}
                    icon={Eye}
                    color="purple"
                />
            </div>

            {/* ── Registration Control Panel ── */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${regStatus?.isPastEvent
                            ? 'bg-gray-500/10'
                            : regStatus?.isOpen
                                ? 'bg-green-500/10'
                                : 'bg-yellow-500/10'
                            }`}>
                            {regStatus?.isPastEvent ? (
                                <XCircle className="w-5 h-5 text-gray-400" />
                            ) : regStatus?.isOpen ? (
                                <Unlock className="w-5 h-5 text-green-400" />
                            ) : (
                                <Lock className="w-5 h-5 text-yellow-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-white font-semibold">Registration Control</h2>
                            <p className="text-white/40 text-sm">
                                {regStatus?.isPastEvent
                                    ? `Event date (${regStatus.eventDate}) has passed — registrations auto-closed.`
                                    : regStatus?.isOpen
                                        ? 'Registration is currently OPEN to the public.'
                                        : 'Registration is currently CLOSED. Toggle to open it.'}
                            </p>
                        </div>
                    </div>

                    {/* Toggle button — only show before event date */}
                    {regStatus && !regStatus.isPastEvent && (
                        <button
                            onClick={handleToggleRegistration}
                            disabled={regToggling}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all ${regToggling
                                ? 'opacity-50 cursor-not-allowed bg-white/[0.05] text-white/40'
                                : regStatus.isOpen
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                                }`}
                        >
                            {regToggling ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-current" />
                            ) : regStatus.isOpen ? (
                                <ToggleRight className="w-5 h-5" />
                            ) : (
                                <ToggleLeft className="w-5 h-5" />
                            )}
                            {regToggling ? 'Updating...' : regStatus.isOpen ? 'Close Registration' : 'Open Registration'}
                        </button>
                    )}
                </div>

                {/* Status badge */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${regStatus?.isPastEvent
                        ? 'bg-gray-500/15 text-gray-400'
                        : regStatus?.isOpen
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-yellow-500/15 text-yellow-400'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${regStatus?.isPastEvent ? 'bg-gray-400' : regStatus?.isOpen ? 'bg-green-400' : 'bg-yellow-400'
                            }`} />
                        {regStatus?.isPastEvent ? 'Registrations Closed (Event Ended)' : regStatus?.isOpen ? 'Registrations Open' : 'Registrations Not Opened Yet'}
                    </span>
                    {regStatus?.eventDate && (
                        <span className="text-white/30 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Event Date: {regStatus.eventDate}
                        </span>
                    )}
                </div>

                {/* Success / Error feedback */}
                {regToggleSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Registration status updated successfully!
                    </div>
                )}
                {regToggleError && (
                    <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {regToggleError}
                    </div>
                )}
            </div>

            {/* ── Schedule Visibility Control Panel ── */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isScheduleRevealed
                            ? 'bg-purple-500/10'
                            : 'bg-gray-500/10'
                            }`}>
                            {isScheduleRevealed ? (
                                <Eye className="w-5 h-5 text-purple-400" />
                            ) : (
                                <Eye className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-white font-semibold">Schedule Visibility</h2>
                            <p className="text-white/40 text-sm">
                                {isScheduleRevealed
                                    ? 'The event schedule is currently VISIBLE to the public.'
                                    : 'The event schedule is currently HIDDEN. Visitors see a "Revealing Soon" teaser.'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleSchedule}
                        disabled={scheduleToggling}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all ${scheduleToggling
                            ? 'opacity-50 cursor-not-allowed bg-white/[0.05] text-white/40'
                            : isScheduleRevealed
                                ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30'
                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                            }`}
                    >
                        {scheduleToggling ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-current" />
                        ) : isScheduleRevealed ? (
                            <ToggleRight className="w-5 h-5" />
                        ) : (
                            <ToggleLeft className="w-5 h-5" />
                        )}
                        {scheduleToggling ? 'Updating...' : isScheduleRevealed ? 'Hide Schedule' : 'Reveal Schedule'}
                    </button>
                </div>

                {/* Status indicator */}
                <div className="mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isScheduleRevealed
                        ? 'bg-purple-500/15 text-purple-400'
                        : 'bg-gray-500/15 text-gray-400'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isScheduleRevealed ? 'bg-purple-400' : 'bg-gray-400'
                            }`} />
                        {isScheduleRevealed ? 'Schedule Publicly Revealed' : 'Schedule Hidden'}
                    </span>
                </div>

                {/* Feedback */}
                {scheduleToggleSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Schedule visibility updated successfully!
                    </div>
                )}
            </div>


            {/* ── Send Reminder Emails Panel ── */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E62B1E]/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-[#E62B1E]" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold">Send Event Reminder Emails</h2>
                            <p className="text-white/40 text-sm">Notify all registered attendees who haven't received a reminder yet.</p>
                        </div>
                    </div>

                    {/* Idle / Preview button */}
                    {(reminderStatus === 'idle' || reminderStatus === 'error') && (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <label className="flex items-center gap-2 text-white/60 hover:text-white/80 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={forceResend}
                                    onChange={(e) => setForceResend(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#E62B1E] focus:ring-[#E62B1E]"
                                />
                                <span className="text-sm">Resend to everyone (ignore "already sent" flag)</span>
                            </label>
                            <button
                                onClick={previewReminders}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E62B1E] hover:bg-[#c4241a] text-white font-semibold rounded-xl transition-colors w-full sm:w-auto"
                            >
                                <Mail className="w-4 h-4" />
                                Preview Recipients
                            </button>
                        </div>
                    )}

                    {/* Send button after preview */}
                    {reminderStatus === 'preview_done' && reminderPreview && reminderPreview.total > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setReminderStatus('idle')}
                                className="px-4 py-2 text-white/50 hover:text-white text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendReminders}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E62B1E] hover:bg-[#c4241a] text-white font-semibold rounded-xl transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                Send to {reminderPreview.total} Recipients
                            </button>
                        </div>
                    )}
                </div>

                {/* Previewing spinner */}
                {reminderStatus === 'previewing' && (
                    <div className="mt-4 flex items-center gap-2 text-white/50">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#E62B1E]" />
                        Checking pending recipients...
                    </div>
                )}

                {/* Preview result */}
                {reminderStatus === 'preview_done' && reminderPreview && (
                    <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                        {reminderPreview.total === 0 ? (
                            <p className="text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                All registered attendees have already received a reminder!
                            </p>
                        ) : (
                            <>
                                <p className="text-white/70 text-sm mb-2">
                                    <span className="text-white font-semibold">{reminderPreview.total} attendee{reminderPreview.total !== 1 ? 's' : ''}</span> will receive the reminder email.
                                </p>
                                {reminderPreview.emails.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {reminderPreview.emails.slice(0, 6).map(e => (
                                            <span key={e} className="text-xs bg-white/[0.06] text-white/50 px-2 py-1 rounded-full">{e}</span>
                                        ))}
                                        {reminderPreview.emails.length > 6 && (
                                            <span className="text-xs text-white/30">+{reminderPreview.emails.length - 6} more</span>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Sending progress */}
                {reminderStatus === 'sending' && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-white/50">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#E62B1E]" />
                            Sending reminder emails in batches...
                            {reminderProgress && (
                                <span className="ml-2 font-mono text-sm text-[#E62B1E]">
                                    {reminderProgress.current} / {reminderProgress.total}
                                    {' '}({Math.round((reminderProgress.current / reminderProgress.total) * 100)}%)
                                </span>
                            )}
                        </div>
                        {reminderProgress && (
                            <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-[#E62B1E] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.round((reminderProgress.current / reminderProgress.total) * 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Done result */}
                {reminderStatus === 'done' && reminderResult && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                            <CheckCircle className="w-4 h-4" />
                            Reminders sent successfully!
                        </div>
                        <p className="text-white/50 text-sm">
                            ✅ {reminderResult.sent} sent
                            {reminderResult.failed > 0 && <span className="text-red-400 ml-3">❌ {reminderResult.failed} failed</span>}
                        </p>
                        {reminderResult.errors && reminderResult.errors.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {reminderResult.errors.map((e, i) => (
                                    <p key={i} className="text-red-400/70 text-xs">{e}</p>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => { setReminderStatus('idle'); setReminderResult(null); }}
                            className="mt-3 text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {/* Error */}
                {reminderStatus === 'error' && reminderError && (
                    <div className="mt-4 space-y-3">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-400 text-sm font-semibold">{reminderError}</p>
                                {/* Advanced error details for debugging */}
                                {reminderResult?.errors && reminderResult.errors.length > 0 && (
                                    <div className="mt-2 p-2 bg-black/20 rounded text-[10px] font-mono text-red-300/60 max-h-32 overflow-auto">
                                        <p className="font-bold mb-1">Stack Trace / Details:</p>
                                        {reminderResult.errors.map((e, i) => (
                                            <div key={i} className="mb-1 whitespace-pre-wrap">{e}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Show partial results if some emails were sent before the error */}
                        {reminderResult && (reminderResult.sent > 0 || reminderResult.failed > 0) && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-yellow-400 text-sm font-semibold mb-1">Partial results before error:</p>
                                <p className="text-white/50 text-sm">
                                    {reminderResult.sent} sent, {reminderResult.failed} failed
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {canManageContent() && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <QuickAction
                            title="Add Speaker"
                            description="Create a new speaker profile"
                            icon={Plus}
                            href="/admin/speakers/new"
                            color="#E62B1E"
                        />
                        <QuickAction
                            title="Add Talk"
                            description="Upload a new talk or video"
                            icon={Video}
                            href="/admin/talks/new"
                            color="#10B981"
                        />
                        <QuickAction
                            title="View Analytics"
                            description="Detailed metrics and reports"
                            icon={TrendingUp}
                            href="/admin/analytics"
                            color="#8B5CF6"
                        />
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Registrations */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Recent Registrations</h2>
                        <Link to="/admin/registrations" className="text-[#E62B1E] text-sm hover:underline">
                            View all →
                        </Link>
                    </div>
                    {recentRegistrations.length > 0 ? (
                        <div className="space-y-3">
                            {recentRegistrations.map((stat) => (
                                <div
                                    key={stat.date}
                                    className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-white/40" />
                                        <span className="text-white/70 text-sm">
                                            {new Date(stat.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-white font-medium">{stat.count}</span>
                                        <div className="flex gap-2 text-xs">
                                            {stat.standard_count > 0 && (
                                                <span className="px-2 py-0.5 bg-white/[0.05] rounded text-white/50">
                                                    {stat.standard_count} std
                                                </span>
                                            )}
                                            {stat.vip_count > 0 && (
                                                <span className="px-2 py-0.5 bg-[#E62B1E]/20 rounded text-[#E62B1E]">
                                                    {stat.vip_count} VIP
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/40 text-center py-8">No registrations yet</p>
                    )}
                </div>

                {/* Video Views */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Video Views</h2>
                        <Link to="/admin/analytics" className="text-[#E62B1E] text-sm hover:underline">
                            View analytics →
                        </Link>
                    </div>
                    {recentViews.length > 0 ? (
                        <div className="space-y-3">
                            {recentViews.map((stat) => (
                                <div
                                    key={stat.date}
                                    className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-white/40" />
                                        <span className="text-white/70 text-sm">
                                            {new Date(stat.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-white font-medium">{stat.total_views} views</span>
                                        <span className="text-white/40 text-sm">{stat.unique_viewers} unique</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/40 text-center py-8">No video views yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
