/**
 * Supabase Server Client
 * 
 * Why this file exists:
 * - Centralizes Supabase client initialization
 * - Uses SERVICE ROLE KEY for server-side operations (bypasses RLS)
 * - Never import this on the client side
 * 
 * Security decisions:
 * - Service Role Key has full database access - server only
 * - Client should use anon key with RLS for direct access
 * - This client is for API routes exclusively
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Singleton pattern - reuse across warm function invocations
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase admin client (uses Service Role Key)
 * 
 * @returns Supabase client with full database access
 * @throws If environment variables are not configured
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    supabaseInstance = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            // Disable realtime for serverless (not needed for API routes)
            realtime: {
                params: {
                    eventsPerSecond: 0,
                },
            },
        }
    );

    return supabaseInstance;
}

/**
 * Database table names - prevents typos
 */
export const Tables = {
    REGISTRATIONS: 'registrations',
    EMAIL_LOGS: 'email_logs',
    SCHEDULE_ITEMS: 'schedule_items',
} as const;