/**
 * Admin Authentication Context
 * 
 * Provides authentication state and admin user info throughout the admin dashboard.
 * Handles session management, role-based access control, and logout.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, signInWithEmail, signOut, onAuthStateChange, isSupabaseConfigured } from '../lib/supabase-browser';
import { AdminUser, AdminRole, hasPermission, canManageContent, canManageAdmins } from '../types/admin';
import { isAllowedAdminEmail } from '../lib/validators';

// ============================================
// Types
// ============================================

interface AdminAuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    session: Session | null;
    user: User | null;
    adminUser: AdminUser | null;
    error: string | null;
}

interface AdminAuthContextType extends AdminAuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshAdminUser: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    canManageContent: () => boolean;
    canManageAdmins: () => boolean;
}

// ============================================
// Context
// ============================================

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface AdminAuthProviderProps {
    children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const [state, setState] = useState<AdminAuthState>({
        isLoading: true,
        isAuthenticated: false,
        session: null,
        user: null,
        adminUser: null,
        error: null,
    });

    // Fetch admin user data from database
    const fetchAdminUser = useCallback(async (userId: string): Promise<AdminUser | null> => {
        try {
            const supabase = getSupabase();
            if (!supabase) return null;

            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('[AdminAuth] Error fetching admin user:', error);
                return null;
            }

            return data as AdminUser;
        } catch (err) {
            console.error('[AdminAuth] Exception fetching admin user:', err);
            return null;
        }
    }, []);

    // Update last login timestamp
    const updateLastLogin = useCallback(async (adminUserId: string) => {
        try {
            const supabase = getSupabase();
            if (!supabase) return;

            // Update using user_id (matches auth.uid()) instead of id
            // This aligns with our RLS policy: USING (user_id = auth.uid())
            await supabase
                .from('admin_users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('user_id', adminUserId);
        } catch (err) {
            console.error('[AdminAuth] Error updating last login:', err);
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort('Connection timeout');
        }, 60000); // 60 second timeout

        const initAuth = async () => {
            // If Supabase is not configured, just mark as not authenticated
            if (!isSupabaseConfigured) {
                clearTimeout(timeoutId);
                setState({
                    isLoading: false,
                    isAuthenticated: false,
                    session: null,
                    user: null,
                    adminUser: null,
                    error: null, // Not an error, just not configured
                });
                return;
            }

            try {
                const supabase = getSupabase();
                if (!supabase) {
                    clearTimeout(timeoutId);
                    setState(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                // getSession is the first network call usually
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session?.user) {
                    // Recheck if aborted before proceeding
                    if (controller.signal.aborted) throw new Error('Initialization aborted');

                    const adminUser = await fetchAdminUser(session.user.id);
                    console.log('[AdminAuth] Auth User ID:', session.user.id);
                    console.log('[AdminAuth] Admin Record Found:', !!adminUser);
                    if (adminUser) {
                        console.log('[AdminAuth] Admin Role:', adminUser.role);
                        // Pass session.user.id (auth user ID), not adminUser.id (table ID)
                        updateLastLogin(session.user.id);
                    }

                    clearTimeout(timeoutId);
                    setState({
                        isLoading: false,
                        isAuthenticated: !!adminUser,
                        session,
                        user: session.user,
                        adminUser,
                        error: adminUser ? null : 'Not authorized as admin',
                    });
                } else {
                    console.log('[AdminAuth] No active session');
                    clearTimeout(timeoutId);
                    setState({
                        isLoading: false,
                        isAuthenticated: false,
                        session: null,
                        user: null,
                        adminUser: null,
                        error: null,
                    });
                }
            } catch (err: any) {
                clearTimeout(timeoutId);

                // Ignore explicit aborts (e.g., from React StrictMode unmounting)
                if (err === 'Initialization aborted' || err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                    return;
                }

                const isTimeout = err === 'Connection timeout';
                const errorMessage = isTimeout
                    ? 'Connection timeout. Please check your internet or Supabase status.'
                    : (err?.message || 'Failed to initialize authentication');

                console.error('[AdminAuth] Init error:', err);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
            }
        };

        initAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = onAuthStateChange(async (session) => {
            try {
                if (session?.user) {
                    const adminUser = await fetchAdminUser(session.user.id);
                    setState({
                        isLoading: false,
                        isAuthenticated: !!adminUser,
                        session,
                        user: session.user,
                        adminUser,
                        error: adminUser ? null : 'Not authorized as admin',
                    });
                } else {
                    setState({
                        isLoading: false,
                        isAuthenticated: false,
                        session: null,
                        user: null,
                        adminUser: null,
                        error: null,
                    });
                }
            } catch (err) {
                console.error('[AdminAuth] Error in auth state change:', err);
                // Don't transition to error state for background changes unless it's critical
            }
        });

        return () => {
            clearTimeout(timeoutId);
            controller.abort('Unmounted');
            subscription.unsubscribe();
        };
    }, [fetchAdminUser, updateLastLogin]);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if email is in the allowed admin whitelist
        if (!isAllowedAdminEmail(email)) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Access restricted. This email is not authorized for admin access.',
            }));
            return {
                success: false,
                error: 'Access restricted. This email is not authorized for admin access.'
            };
        }

        try {
            const { data, error } = await signInWithEmail(email, password);

            if (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message,
                }));
                return { success: false, error: error.message };
            }

            if (data.user) {
                const adminUser = await fetchAdminUser(data.user.id);

                if (!adminUser) {
                    await signOut();
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isAuthenticated: false,
                        error: 'Access denied. You are not registered as an admin.',
                    }));
                    return { success: false, error: 'Access denied. Not an admin user.' };
                }

                // Pass data.user.id (auth user ID), not adminUser.id (table ID)
                updateLastLogin(data.user.id);

                setState({
                    isLoading: false,
                    isAuthenticated: true,
                    session: data.session,
                    user: data.user,
                    adminUser,
                    error: null,
                });

                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, [fetchAdminUser, updateLastLogin]);

    // Logout function
    const logout = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        await signOut();
        setState({
            isLoading: false,
            isAuthenticated: false,
            session: null,
            user: null,
            adminUser: null,
            error: null,
        });
    }, []);

    // Refresh admin user data
    const refreshAdminUser = useCallback(async () => {
        if (state.user) {
            const adminUser = await fetchAdminUser(state.user.id);
            setState(prev => ({ ...prev, adminUser }));
        }
    }, [state.user, fetchAdminUser]);

    // Permission helpers
    const checkPermission = useCallback((permission: string): boolean => {
        if (!state.adminUser) return false;
        return hasPermission(state.adminUser.role, permission);
    }, [state.adminUser]);

    const checkCanManageContent = useCallback((): boolean => {
        if (!state.adminUser) return false;
        return canManageContent(state.adminUser.role);
    }, [state.adminUser]);

    const checkCanManageAdmins = useCallback((): boolean => {
        if (!state.adminUser) return false;
        return canManageAdmins(state.adminUser.role);
    }, [state.adminUser]);

    const value: AdminAuthContextType = {
        ...state,
        login,
        logout,
        refreshAdminUser,
        hasPermission: checkPermission,
        canManageContent: checkCanManageContent,
        canManageAdmins: checkCanManageAdmins,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access admin auth context
 * Returns null if used outside AdminAuthProvider (safe for public pages)
 */
export function useAdminAuth(): AdminAuthContextType | null {
    const context = useContext(AdminAuthContext);
    // Return null instead of throwing - allows use in public components like Header
    return context ?? null;
}

/**
 * Hook that requires admin auth context (throws if not available)
 * Use this in admin-only components
 */
export function useRequiredAdminAuth(): AdminAuthContextType {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useRequiredAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}

// ============================================
// HOC for Protected Routes
// ============================================

interface RequireAuthProps {
    children: ReactNode;
    requiredRole?: AdminRole;
    requiredPermission?: string;
    fallback?: ReactNode;
}

export function RequireAuth({
    children,
    requiredRole,
    requiredPermission,
    fallback
}: RequireAuthProps) {
    const { isLoading, isAuthenticated, adminUser, hasPermission: checkPerm } = useRequiredAdminAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
            </div>
        );
    }

    if (!isAuthenticated || !adminUser) {
        return fallback ? <>{fallback}</> : null;
    }

    // Check role requirement
    if (requiredRole) {
        const roleHierarchy: Record<AdminRole, number> = {
            super_admin: 3,
            content_admin: 2,
            viewer: 1,
        };

        if (roleHierarchy[adminUser.role] < roleHierarchy[requiredRole]) {
            return fallback ? <>{fallback}</> : (
                <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                        <p className="text-white/60">You don't have permission to access this page.</p>
                    </div>
                </div>
            );
        }
    }

    // Check permission requirement
    if (requiredPermission && !checkPerm(requiredPermission)) {
        return fallback ? <>{fallback}</> : (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-white/60">You don't have the required permission.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
