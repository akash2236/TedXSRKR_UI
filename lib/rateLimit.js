/**
 * Rate Limiting - In-Memory IP-Based Throttling
 *
 * Why this file exists:
 * - Prevents abuse and spam submissions
 * - Protects database from flood attacks
 * - Lightweight solution suitable for Vercel serverless
 *
 * Limitations (acceptable for MVP):
 * - Resets on cold starts (serverless limitation)
 * - Not shared across function instances
 * - For high-traffic, migrate to Redis (Upstash)
 *
 * Security decisions:
 * - Uses X-Forwarded-For header (Vercel provides this)
 * - Falls back to X-Real-IP or connection IP
 * - Configurable window and max requests
 *
 * NOTE: setInterval removed - cleanup happens on each request instead
 * (prevents memory leaks in serverless environment)
 */
// ============================================
// Configuration
// ============================================
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute
// Map of IP -> rate limit data
const rateLimitStore = new Map();
/**
 * Clean up expired entries (called on each request instead of setInterval)
 * This is safer for serverless environments
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(ip);
        }
    }
}
// ============================================
// Rate Limit Functions
// ============================================
/**
 * Extract client IP from request headers
 */
export function getClientIp(req) {
    // Vercel provides X-Forwarded-For
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return forwarded[0].split(',')[0].trim();
    }
    // Fallback to X-Real-IP
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
        return realIp;
    }
    // Last resort: socket address
    return req.socket?.remoteAddress || 'unknown';
}
/**
 * Check if request is within rate limits
 *
 * @param ip - Client IP address
 * @returns Rate limit result with remaining requests
 */
export function checkRateLimit(ip) {
    // Clean up on each request (safe for serverless)
    cleanupExpiredEntries();
    const now = Date.now();
    const entry = rateLimitStore.get(ip);
    // No previous requests or window expired
    if (!entry || entry.resetAt < now) {
        const newEntry = {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS,
        };
        rateLimitStore.set(ip, newEntry);
        return {
            allowed: true,
            remaining: MAX_REQUESTS_PER_WINDOW - 1,
            resetAt: newEntry.resetAt,
        };
    }
    // Within window - check count
    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }
    // Increment and allow
    entry.count++;
    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
        resetAt: entry.resetAt,
    };
}
/**
 * Add rate limit headers to response
 */
export function getRateLimitHeaders(result) {
    return {
        'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    };
}
