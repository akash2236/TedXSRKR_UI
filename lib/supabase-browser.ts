/**
 * Supabase Browser Client
 * 
 * Client-side Supabase instance using the anon key.
 * This is safe to use in the browser as it respects RLS policies.
 */

/// <reference types="vite/client" />

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Environment variables (exposed to client via Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Validate environment
if (!isSupabaseConfigured) {
    console.warn(
        '[Supabase] Missing environment variables. ' +
        'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local file.'
    );
}

// Singleton pattern for browser client
let supabaseClient: SupabaseClient | null = null;

/**
 * Custom fetch wrapper with timeout
 */
const fetchWithTimeout = (timeout = 60000) => {
    return async (url: string | URL | Request, options?: RequestInit) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    };
};

/**
 * Get the Supabase browser client
 * Uses anon key - respects Row Level Security
 * Returns null if Supabase is not configured
 */
export function getSupabase(): SupabaseClient | null {
    if (!isSupabaseConfigured) {
        return null;
    }

    if (supabaseClient) {
        return supabaseClient;
    }

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
            fetch: fetchWithTimeout(60000), // 60s global timeout
        },
    });

    return supabaseClient;
}

// ============================================
// Auth Helpers
// ============================================

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    const supabase = getSupabase();
    if (!supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }
    return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign out the current user
 */
export async function signOut() {
    const supabase = getSupabase();
    if (!supabase) {
        return { error: null };
    }
    return supabase.auth.signOut();
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Subscribe to auth state changes
 * Returns a no-op subscription if Supabase is not configured
 */
export function onAuthStateChange(callback: (session: Session | null) => void) {
    const supabase = getSupabase();
    if (!supabase) {
        // Return a no-op subscription
        return { data: { subscription: { unsubscribe: () => { } } } };
    }
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session);
    });
}

// ============================================
// Session ID for anonymous tracking
// ============================================

const SESSION_ID_KEY = 'tedx_session_id';

/**
 * Get or create a session ID for anonymous video view tracking
 */
export function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
        return 'server';
    }

    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
}

// Export a convenience alias for direct Supabase access
export const supabaseBrowser = {
    from: (table: string) => getSupabase()?.from(table) ?? null,
    auth: () => getSupabase()?.auth ?? null,
};