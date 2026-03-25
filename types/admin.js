/**
 * Admin & Content Management Types
 *
 * These types mirror the database schema for type-safe operations.
 * Used by both admin dashboard and API endpoints.
 */
// ============================================
// Permission Helpers
// ============================================
export const ROLE_PERMISSIONS = {
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
export function hasPermission(role, permission) {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
export function canManageContent(role) {
    return role === 'super_admin' || role === 'content_admin';
}
export function canManageAdmins(role) {
    return role === 'super_admin';
}
