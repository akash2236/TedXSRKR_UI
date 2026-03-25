/**
 * Environment Variable Validation
 *
 * Why this file exists:
 * - Fail-fast on missing configuration (don't wait for runtime errors)
 * - Type-safe access to environment variables
 * - Single source of truth for required env vars
 *
 * Security decision:
 * - Validates at module load time, not per-request
 * - Throws immediately if secrets are missing
 */
function getEnvVar(name, required = true) {
    const value = process.env[name];
    if (required && !value) {
        throw new Error(`[ENV] Missing required environment variable: ${name}. ` +
            `Ensure it is set in your .env.local or Vercel dashboard.`);
    }
    return value || '';
}
/**
 * Validated environment configuration.
 * Accessing this will throw if required vars are missing.
 */
export const env = {
    get SUPABASE_URL() { return getEnvVar('SUPABASE_URL'); },
    get SUPABASE_SERVICE_ROLE_KEY() { return getEnvVar('SUPABASE_SERVICE_ROLE_KEY'); },
    get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
    get GMAIL_SMTP_USER() { return getEnvVar('GMAIL_SMTP_USER', false); },
    get GMAIL_SMTP_APP_PASSWORD() { return getEnvVar('GMAIL_SMTP_APP_PASSWORD', false); },
    get ADMIN_NOTIFICATION_EMAILS() { return getEnvVar('ADMIN_NOTIFICATION_EMAILS', false); },
    get CRON_SECRET() { return getEnvVar('CRON_SECRET', false); },
    get EMAIL_FROM_NAME() { return getEnvVar('EMAIL_FROM_NAME', false); },
    get EMAIL_FROM_ADDRESS() { return getEnvVar('EMAIL_FROM_ADDRESS', false); },
};
/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';
