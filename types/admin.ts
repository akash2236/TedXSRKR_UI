/**
 * Admin & Content Management Types
 * 
 * These types mirror the database schema for type-safe operations.
 * Used by both admin dashboard and API endpoints.
 */

// ============================================
// Enum Types
// ============================================

export type AdminRole = 'super_admin' | 'content_admin' | 'viewer';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type VideoPlatform = 'youtube' | 'vimeo' | 'custom';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

// ============================================
// Admin User Types
// ============================================

export interface AdminUser {
    id: string;
    user_id: string;
    email: string;
    name: string;
    role: AdminRole;
    avatar_url: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminUserInput {
    email: string;
    name?: string;
    role: AdminRole;
    avatar_url?: string;
}

// ============================================
// Database Speaker Types
// ============================================

export interface DbSpeaker {
    id: string;
    slug: string;
    name: string;
    title: string;
    topic: string;
    bio: string | null;
    image_url: string;
    thumbnail_url: string | null;
    linkedin_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    expertise: string[];
    status: ContentStatus;
    is_featured: boolean;
    display_order: number;
    created_by: string | null;
    updated_by: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbSpeakerInput {
    slug: string;
    name: string;
    title: string;
    topic: string;
    bio?: string;
    image_url: string;
    thumbnail_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    website_url?: string;
    expertise?: string[];
    status?: ContentStatus;
    is_featured?: boolean;
    display_order?: number;
}

// ============================================
// Database Talk Types
// ============================================

export interface DbTalk {
    id: string;
    slug: string;
    speaker_id: string;
    title: string;
    description: string | null;
    short_description: string | null;
    video_url: string | null;
    video_platform: VideoPlatform | null;
    video_embed_id: string | null;
    duration_seconds: number | null;
    thumbnail_url: string | null;
    tags: string[];
    is_public: boolean;
    requires_registration: boolean;
    status: ContentStatus;
    is_featured: boolean;
    display_order: number;
    view_count: number;
    created_by: string | null;
    updated_by: string | null;
    published_at: string | null;
    recorded_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbTalkInput {
    slug: string;
    speaker_id: string;
    title: string;
    description?: string;
    short_description?: string;
    video_url?: string;
    video_platform?: VideoPlatform;
    video_embed_id?: string;
    duration_seconds?: number;
    thumbnail_url?: string;
    tags?: string[];
    is_public?: boolean;
    requires_registration?: boolean;
    status?: ContentStatus;
    is_featured?: boolean;
    display_order?: number;
    recorded_at?: string;
}

// Talk with speaker info (joined)
export interface DbTalkWithSpeaker extends DbTalk {
    speaker: Pick<DbSpeaker, 'id' | 'slug' | 'name' | 'title' | 'image_url'>;
}

// ============================================
// Video Analytics Types
// ============================================

export interface VideoView {
    id: string;
    talk_id: string;
    session_id: string;
    user_email: string | null;
    watch_duration_seconds: number;
    completed: boolean;
    device_type: DeviceType | null;
    browser: string | null;
    country: string | null;
    region: string | null;
    started_at: string;
    last_updated_at: string;
}

export interface VideoViewInput {
    talk_id: string;
    session_id: string;
    user_email?: string;
    watch_duration_seconds?: number;
    completed?: boolean;
    device_type?: DeviceType;
    browser?: string;
    country?: string;
    region?: string;
}

// ============================================
// Audit Log Types
// ============================================

export type AuditEntityType = 'speaker' | 'talk' | 'registration';

export type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'archive' | 'restore';

export interface AuditLogEntry {
    id: string;
    admin_user_id: string | null;
    entity_type: AuditEntityType;
    entity_id: string;
    action: AuditAction;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// ============================================
// Analytics Dashboard Types
// ============================================

export interface RegistrationStats {
    date: string;
    count: number;
    standard_count: number;
    vip_count: number;
    student_count: number;
}

// Simplified registration stat for chart displays
export interface RegistrationStat {
    date: string;
    registrations: number;
    cumulative?: number;
}

export interface VideoViewStats {
    talk_id: string;
    talk_title: string;
    speaker_name: string;
    view_count: number;
    total_views: number;
    completed_views: number;
    avg_watch_duration: number;
    unique_viewers: number;
}

// Simplified video stat for chart displays
export interface VideoViewStat {
    talk_id?: string;
    talk_title?: string;
    speaker_name?: string;
    total_views: number;
    unique_viewers: number;
    avg_watch_time: number;
}

export interface DailyVideoStats {
    date: string;
    total_views: number;
    unique_viewers: number;
    completed_views: number;
}

export interface DashboardSummary {
    totalRegistrations: number;
    totalSpeakers: number;
    publishedSpeakers: number;
    totalTalks: number;
    publishedTalks: number;
    totalVideoViews: number;
    registrationsToday: number;
    viewsToday: number;
}

// ============================================
// API Request/Response Types
// ============================================

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface AdminAuthResponse {
    success: boolean;
    user: AdminUser | null;
    error?: string;
}

export interface ContentUpdateResponse {
    success: boolean;
    message: string;
    data?: DbSpeaker | DbTalk;
    error?: string;
}

export interface AnalyticsExportParams {
    startDate?: string;
    endDate?: string;
    speakerId?: string;
    format: 'csv' | 'json';
}

// ============================================
// Permission Helpers
// ============================================

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
    super_admin: [
        'manage_admins',
        'view_audit_log',
        'manage_speakers',
        'manage_talks',
        'publish_content',
        'archive_content',
        'view_analytics',
        'view_dashboard',
        'export_data',
    ],
    content_admin: [
        'manage_speakers',
        'manage_talks',
        'publish_content',
        'archive_content',
        'view_analytics',
        'view_dashboard',
        'export_data',
    ],
    viewer: [
        'view_analytics',
        'view_dashboard',
    ],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageContent(role: AdminRole): boolean {
    return role === 'super_admin' || role === 'content_admin';
}

export function canManageAdmins(role: AdminRole): boolean {
    return role === 'super_admin';
}
