/**
 * Admin API Service
 * 
 * Provides CRUD operations for content management.
 * All operations use the browser Supabase client with RLS.
 */

import { getSupabase } from './supabase-browser.js';
import {
    DbSpeaker,
    DbSpeakerInput,
    DbTalk,
    DbTalkInput,
    DbTalkWithSpeaker,
    ContentStatus,
    DashboardSummary,
    RegistrationStats,
    VideoViewStats,
    DailyVideoStats,
    PaginatedResponse,
    AdminUser,
    AuditLogEntry,
} from '../types/admin';

// ============================================
// Helper Functions
// ============================================

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ============================================
// Dashboard / Analytics
// ============================================

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const supabase = getSupabase();
    if (!supabase) {
        return {
            totalRegistrations: 0,
            totalSpeakers: 0,
            publishedSpeakers: 0,
            totalTalks: 0,
            publishedTalks: 0,
            totalVideoViews: 0,
            registrationsToday: 0,
            viewsToday: 0,
        };
    }

    const today = new Date().toISOString().split('T')[0];

    try {
        // Fetch registrations (table should exist from migration 001)
        const { count: totalRegistrations } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true });

        const { count: registrationsToday } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);

        // Try to fetch speakers (may not exist yet)
        let totalSpeakers = 0;
        let publishedSpeakers = 0;
        try {
            const { count: speakerCount } = await supabase
                .from('speakers')
                .select('*', { count: 'exact', head: true });
            totalSpeakers = speakerCount || 0;

            const { count: pubSpeakerCount } = await supabase
                .from('speakers')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'published');
            publishedSpeakers = pubSpeakerCount || 0;
        } catch {
            // Table doesn't exist yet
        }

        // Try to fetch talks (may not exist yet)
        let totalTalks = 0;
        let publishedTalks = 0;
        let totalVideoViews = 0;
        try {
            const { count: talkCount } = await supabase
                .from('talks')
                .select('*', { count: 'exact', head: true });
            totalTalks = talkCount || 0;

            const { count: pubTalkCount } = await supabase
                .from('talks')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'published');
            publishedTalks = pubTalkCount || 0;

            const { data: viewCountData } = await supabase
                .from('talks')
                .select('view_count');
            totalVideoViews = viewCountData?.reduce((sum, t) => sum + (t.view_count || 0), 0) || 0;
        } catch {
            // Table doesn't exist yet
        }

        // Try to fetch video views (may not exist yet)
        let viewsToday = 0;
        try {
            const { count } = await supabase
                .from('video_views')
                .select('*', { count: 'exact', head: true })
                .gte('started_at', today);
            viewsToday = count || 0;
        } catch {
            // Table doesn't exist yet
        }

        return {
            totalRegistrations: totalRegistrations || 0,
            totalSpeakers,
            publishedSpeakers,
            totalTalks,
            publishedTalks,
            totalVideoViews,
            registrationsToday: registrationsToday || 0,
            viewsToday,
        };
    } catch (err) {
        console.error('Dashboard summary error:', err);
        return {
            totalRegistrations: 0,
            totalSpeakers: 0,
            publishedSpeakers: 0,
            totalTalks: 0,
            publishedTalks: 0,
            totalVideoViews: 0,
            registrationsToday: 0,
            viewsToday: 0,
        };
    }
}

export async function getRegistrationStats(
    startDate?: string,
    endDate?: string
): Promise<RegistrationStats[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        let query = supabase
            .from('registrations')
            .select('created_at, ticket_type');

        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            // Append end of day to include final day results
            query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Registration stats error:', error);
            return [];
        }

        // Aggregate by date
        const statsByDate = new Map<string, RegistrationStats>();

        data?.forEach(reg => {
            if (!reg.created_at) return;
            const date = reg.created_at.split('T')[0];
            const existing = statsByDate.get(date) || {
                date,
                count: 0,
                standard_count: 0,
                vip_count: 0,
                student_count: 0,
            };

            const type = (reg.ticket_type || '').toLowerCase();
            existing.count++;
            if (type === 'standard') existing.standard_count++;
            else if (type === 'vip') existing.vip_count++;
            else if (type === 'student') existing.student_count++;

            statsByDate.set(date, existing);
        });

        return Array.from(statsByDate.values()).sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
        console.error('Registration stats error:', err);
        return [];
    }
}

export async function getVideoViewStats(
    startDate?: string,
    endDate?: string,
    speakerId?: string
): Promise<VideoViewStats[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    let query = supabase
        .from('talks')
        .select(`
            id,
            title,
            view_count,
            speaker:speakers!inner(name)
        `);

    if (speakerId) {
        query = query.eq('speaker_id', speakerId);
    }

    const { data: talks, error: talksError } = await query;
    if (talksError) throw talksError;

    // Get video views aggregation
    let viewsQuery = supabase
        .from('video_views')
        .select('talk_id, completed, watch_duration_seconds, session_id');

    if (startDate) {
        viewsQuery = viewsQuery.gte('started_at', startDate);
    }
    if (endDate) {
        viewsQuery = viewsQuery.lte('started_at', `${endDate}T23:59:59.999Z`);
    }

    let views: any[] = [];
    try {
        const { data, error: viewsError } = await viewsQuery;
        if (viewsError) {
            // Log but don't crash - video_views might not exist or be accessible
            console.warn('Video views tracking error:', viewsError.message || viewsError);
        } else {
            views = data || [];
        }
    } catch (err) {
        console.warn('Caught video views error:', err);
    }

    // Aggregate
    const viewsByTalk = new Map<string, { total: number; completed: number; duration: number[]; sessions: Set<string> }>();

    (views || []).forEach(v => {
        const existing = viewsByTalk.get(v.talk_id) || { total: 0, completed: 0, duration: [], sessions: new Set() };
        existing.total++;
        if (v.completed) existing.completed++;
        existing.duration.push(v.watch_duration_seconds || 0);
        existing.sessions.add(v.session_id);
        viewsByTalk.set(v.talk_id, existing);
    });

    return (talks || []).map(talk => {
        const viewData = viewsByTalk.get(talk.id);
        return {
            talk_id: talk.id,
            talk_title: talk.title,
            speaker_name: (talk.speaker as any)?.name || 'Unknown',
            view_count: talk.view_count,
            total_views: viewData?.total || 0,
            completed_views: viewData?.completed || 0,
            avg_watch_duration: viewData ? Math.round(viewData.duration.reduce((a, b) => a + b, 0) / viewData.duration.length) : 0,
            unique_viewers: viewData?.sessions.size || 0,
        };
    }).sort((a, b) => b.view_count - a.view_count);
}

export async function getDailyVideoStats(
    startDate?: string,
    endDate?: string
): Promise<DailyVideoStats[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        let query = supabase
            .from('video_views')
            .select('started_at, completed, session_id');

        if (startDate) {
            query = query.gte('started_at', startDate);
        }
        if (endDate) {
            query = query.lte('started_at', `${endDate}T23:59:59.999Z`);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Daily video stats error:', error);
            return [];
        }

        // Aggregate by date
        const statsByDate = new Map<string, DailyVideoStats & { sessions: Set<string> }>();

        data?.forEach(v => {
            const date = v.started_at.split('T')[0];
            const existing = statsByDate.get(date) || {
                date,
                total_views: 0,
                unique_viewers: 0,
                completed_views: 0,
                sessions: new Set<string>(),
            };

            existing.total_views++;
            if (v.completed) existing.completed_views++;
            existing.sessions.add(v.session_id);

            statsByDate.set(date, existing);
        });

        return Array.from(statsByDate.values())
            .map(s => ({
                date: s.date,
                total_views: s.total_views,
                unique_viewers: s.sessions.size,
                completed_views: s.completed_views,
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
        console.error('Daily video stats error:', err);
        return [];
    }
}

// ============================================
// Speakers CRUD
// ============================================

export async function getSpeakers(
    options: {
        status?: ContentStatus;
        page?: number;
        limit?: number;
        search?: string;
    } = {}
): Promise<PaginatedResponse<DbSpeaker>> {
    const { status, page = 1, limit = 20, search } = options;
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    if (!supabase) {
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    try {
        let query = supabase
            .from('speakers')
            .select('*', { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,topic.ilike.%${search}%`);
        }

        const { data, count, error } = await query
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.warn('Error fetching speakers:', error.message);
            return { data: [], total: 0, page, limit, hasMore: false };
        }

        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            hasMore: (count || 0) > offset + limit,
        };
    } catch (err) {
        console.warn('Failed to fetch speakers:', err);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

export async function getSpeakerById(id: string): Promise<DbSpeaker | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('speakers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.warn('Error fetching speaker by id:', error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn('Failed to fetch speaker by id:', err);
        return null;
    }
}

export async function getSpeakerBySlug(slug: string): Promise<DbSpeaker | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('speakers')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.warn('Error fetching speaker by slug:', error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn('Failed to fetch speaker by slug:', err);
        return null;
    }
}

export async function createSpeaker(input: DbSpeakerInput, adminUserId?: string): Promise<DbSpeaker | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const speakerData = {
            ...input,
            slug: input.slug || generateSlug(input.name),
            expertise: input.expertise || [],
            created_by: adminUserId,
            updated_by: adminUserId,
        };

        const { data, error } = await supabase
            .from('speakers')
            .insert(speakerData)
            .select()
            .single();

        if (error) {
            console.error('Error creating speaker:', error.message || error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('Failed to create speaker:', err);
        throw err;
    }
}

export async function updateSpeaker(
    id: string,
    input: Partial<DbSpeakerInput>,
    adminUserId?: string
): Promise<DbSpeaker | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const updateData = {
            ...input,
            updated_by: adminUserId,
        };

        const { data, error } = await supabase
            .from('speakers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating speaker:', error.message || error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('Failed to update speaker:', err);
        throw err;
    }
}

export async function deleteSpeaker(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error, data } = await supabase
            .from('speakers')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Permission denied or record not found. You might not have delete permissions.');
            }
            console.error('Error deleting speaker:', error.message || error);
            throw error;
        }
        return true;
    } catch (err) {
        console.error('Failed to delete speaker:', err);
        throw err;
    }
}

export async function publishSpeaker(id: string, adminUserId?: string): Promise<DbSpeaker | null> {
    return updateSpeaker(id, { status: 'published' }, adminUserId);
}

export async function archiveSpeaker(id: string, adminUserId?: string): Promise<DbSpeaker | null> {
    return updateSpeaker(id, { status: 'archived' }, adminUserId);
}

// ============================================
// Talks CRUD
// ============================================

export async function getTalks(
    options: {
        status?: ContentStatus;
        speakerId?: string;
        page?: number;
        limit?: number;
        search?: string;
    } = {}
): Promise<PaginatedResponse<DbTalkWithSpeaker>> {
    const { status, speakerId, page = 1, limit = 20, search } = options;
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    if (!supabase) {
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    try {
        let query = supabase
            .from('talks')
            .select(`
                *,
                speaker:speakers!inner(id, slug, name, title, image_url)
            `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }
        if (speakerId) {
            query = query.eq('speaker_id', speakerId);
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, count, error } = await query
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.warn('Error fetching talks:', error.message);
            return { data: [], total: 0, page, limit, hasMore: false };
        }

        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            hasMore: (count || 0) > offset + limit,
        };
    } catch (err) {
        console.warn('Failed to fetch talks:', err);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

export async function getTalkById(id: string): Promise<DbTalkWithSpeaker | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('talks')
            .select(`
                *,
                speaker:speakers!inner(id, slug, name, title, image_url)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.warn('Error fetching talk by id:', error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn('Failed to fetch talk by id:', err);
        return null;
    }
}

export async function getTalkBySlug(slug: string): Promise<DbTalkWithSpeaker | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('talks')
            .select(`
                *,
                speaker:speakers!inner(id, slug, name, title, image_url)
            `)
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.warn('Error fetching talk by slug:', error.message);
            return null;
        }

        return data;
    } catch (err) {
        console.warn('Failed to fetch talk by slug:', err);
        return null;
    }
}

export async function getTalksBySpeaker(speakerId: string): Promise<DbTalk[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('talks')
            .select('*')
            .eq('speaker_id', speakerId)
            .eq('status', 'published')
            .order('display_order', { ascending: true });

        if (error) {
            console.warn('Error fetching talks by speaker:', error.message);
            return [];
        }
        return data || [];
    } catch (err) {
        console.warn('Failed to fetch talks by speaker:', err);
        return [];
    }
}

export async function createTalk(input: DbTalkInput, adminUserId?: string): Promise<DbTalk | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const talkData = {
            ...input,
            slug: input.slug || generateSlug(input.title),
            tags: input.tags || [],
            created_by: adminUserId,
            updated_by: adminUserId,
        };

        const { data, error } = await supabase
            .from('talks')
            .insert(talkData)
            .select()
            .single();

        if (error) {
            console.error('Error creating talk:', error.message || error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('Failed to create talk:', err);
        throw err;
    }
}

export async function updateTalk(
    id: string,
    input: Partial<DbTalkInput>,
    adminUserId?: string
): Promise<DbTalk | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const updateData = {
            ...input,
            updated_by: adminUserId,
        };

        const { data, error } = await supabase
            .from('talks')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating talk:', error.message || error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('Failed to update talk:', err);
        throw err;
    }
}

export async function deleteTalk(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error, data } = await supabase
            .from('talks')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Permission denied or record not found. You might not have delete permissions.');
            }
            console.error('Error deleting talk:', error.message || error);
            throw error;
        }
        return true;
    } catch (err) {
        console.error('Failed to delete talk:', err);
        throw err;
    }
}

export async function publishTalk(id: string, adminUserId?: string): Promise<DbTalk | null> {
    return updateTalk(id, { status: 'published' }, adminUserId);
}

export async function archiveTalk(id: string, adminUserId?: string): Promise<DbTalk | null> {
    return updateTalk(id, { status: 'archived' }, adminUserId);
}

// ============================================
// Video Views (Public API)
// ============================================

// Generate or retrieve a session ID for anonymous view tracking
function getSessionId(): string {
    const key = 'tedx_session_id';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
}

// Detect device type from user agent
function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

export async function trackVideoView(talkId: string, userEmail?: string): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const sessionId = getSessionId();
        const deviceType = detectDeviceType();
        const browser = navigator.userAgent.split('/')[0];

        const { data, error } = await supabase
            .from('video_views')
            .insert({
                talk_id: talkId,
                session_id: sessionId,
                user_email: userEmail,
                device_type: deviceType,
                browser,
            })
            .select('id')
            .single();

        if (error) {
            console.warn('Error tracking video view:', error.message);
            return null;
        }
        return data.id;
    } catch (err) {
        console.warn('Failed to track video view:', err);
        return null;
    }
}

export async function updateVideoViewProgress(
    viewId: string,
    watchDuration: number,
    completed: boolean = false
): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('video_views')
            .update({
                watch_duration_seconds: watchDuration,
                completed,
                last_updated_at: new Date().toISOString(),
            })
            .eq('id', viewId);

        if (error) {
            console.warn('Error updating video view progress:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Failed to update video view progress:', err);
        return false;
    }
}

// ============================================
// Registrations (Read-only for admin)
// ============================================

export async function getRegistrations(
    options: {
        page?: number;
        limit?: number;
        search?: string;
        ticketType?: string;
        startDate?: string;
        endDate?: string;
    } = {}
): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, ticketType, startDate, endDate } = options;
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    if (!supabase) {
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    try {
        let query = supabase
            .from('registrations')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        if (ticketType) {
            query = query.eq('ticket_type', ticketType);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.warn('Error fetching registrations:', error.message);
            return { data: [], total: 0, page, limit, hasMore: false };
        }

        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            hasMore: (count || 0) > offset + limit,
        };
    } catch (err) {
        console.warn('Failed to fetch registrations:', err);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

// ============================================
// CSV Export
// ============================================

export function generateCSV(
    data: any[],
    columns: string[] | { key: string; label: string }[]
): string {
    // Normalize columns to key/label format
    const normalizedColumns = columns.map((col) => {
        if (typeof col === 'string') {
            return { key: col, label: col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) };
        }
        return col;
    });

    const headers = normalizedColumns.map((c) => c.label).join(',');
    const rows = data.map((item) =>
        normalizedColumns
            .map((c) => {
                const value = item[c.key];
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                // Escape quotes and wrap in quotes if contains comma
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            })
            .join(',')
    );

    return [headers, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// Audit Log
// ============================================

export async function getAuditLog(
    options: {
        page?: number;
        limit?: number;
        entityType?: string;
        adminUserId?: string;
    } = {}
): Promise<PaginatedResponse<AuditLogEntry>> {
    const { page = 1, limit = 50, entityType, adminUserId } = options;
    const supabase = getSupabase();
    const offset = (page - 1) * limit;

    if (!supabase) {
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    try {
        let query = supabase
            .from('content_audit_log')
            .select('*', { count: 'exact' });

        if (entityType) {
            query = query.eq('entity_type', entityType);
        }
        if (adminUserId) {
            query = query.eq('admin_user_id', adminUserId);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.warn('Error fetching audit log:', error.message);
            return { data: [], total: 0, page, limit, hasMore: false };
        }

        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            hasMore: (count || 0) > offset + limit,
        };
    } catch (err) {
        console.warn('Failed to fetch audit log:', err);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

// ============================================
// Admin Users Management
// ============================================

export async function getAdminUsers(): Promise<AdminUser[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Error fetching admin users:', error.message);
            return [];
        }
        return data || [];
    } catch (err) {
        console.warn('Failed to fetch admin users:', err);
        return [];
    }
}

export async function updateAdminUser(
    id: string,
    updates: { role?: string; is_active?: boolean }
): Promise<AdminUser | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('admin_users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.warn('Error updating admin user:', error.message);
            throw error;
        }
        return data;
    } catch (err) {
        console.warn('Failed to update admin user:', err);
        throw err;
    }
}

// ============================================
// Registration Status Control
// ============================================

export interface RegistrationStatus {
    isOpen: boolean;
    eventDate: string;      // ISO date string e.g. "2026-04-15"
    isPastEvent: boolean;   // true if today > eventDate
}

/**
 * Fetch current registration status.
 * Works for both admins (authenticated) and public (anon) visitors.
 */
export async function getRegistrationStatus(): Promise<RegistrationStatus> {
    const supabase = getSupabase();
    const defaultStatus: RegistrationStatus = {
        isOpen: false,
        eventDate: '2026-03-26',
        isPastEvent: false,
    };

    if (!supabase) return defaultStatus;

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['registration_open', 'event_date']);

        if (error) {
            console.warn('Error fetching registration status:', error.message);
            return defaultStatus;
        }

        const settings: Record<string, string> = {};
        (data || []).forEach(row => { settings[row.key] = row.value; });

        const isOpen = settings['registration_open'] === 'true';
        const eventDate = settings['event_date'] || '2026-03-26';
        const isPastEvent = new Date() > new Date(eventDate + 'T23:59:59');

        return { isOpen, eventDate, isPastEvent };
    } catch (err) {
        console.warn('Failed to fetch registration status:', err);
        return defaultStatus;
    }
}

/**
 * Toggle registration open/closed. Admin-only (requires authenticated session).
 */
export async function setRegistrationStatus(open: boolean, adminEmail?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert(
                { key: 'registration_open', value: open ? 'true' : 'false', updated_at: new Date().toISOString(), updated_by: adminEmail },
                { onConflict: 'key' }
            );

        if (error) {
            console.warn('Error setting registration status:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Failed to set registration status:', err);
        return false;
    }
}

/**
 * Update the event date. Admin-only.
 */
export async function setEventDate(date: string, adminEmail?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert(
                { key: 'event_date', value: date, updated_at: new Date().toISOString(), updated_by: adminEmail },
                { onConflict: 'key' }
            );

        if (error) {
            console.warn('Error setting event date:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Failed to set event date:', err);
        return false;
    }
}

/**
 * Check if the schedule is revealed to the public.
 */
export async function getScheduleVisibility(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'schedule_revealed')
            .single();

        if (error) {
            console.warn('Error fetching schedule visibility:', error.message);
            return false;
        }

        return data?.value === 'true';
    } catch (err) {
        console.warn('Failed to fetch schedule visibility:', err);
        return false;
    }
}

/**
 * Toggle schedule visibility. Admin-only.
 */
export async function setScheduleVisibility(revealed: boolean, adminEmail?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert(
                { key: 'schedule_revealed', value: revealed ? 'true' : 'false', updated_at: new Date().toISOString(), updated_by: adminEmail },
                { onConflict: 'key' }
            );

        if (error) {
            console.warn('Error setting schedule visibility:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Failed to set schedule visibility:', err);
        return false;
    }
}