/**
 * Admin Login Page
 * 
 * Secure login page for admin dashboard access.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRequiredAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading: authLoading } = useRequiredAdminAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const from = (location.state as any)?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E62B1E]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            {/* Background effects */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(230, 43, 30, 0.1) 0%, transparent 50%)'
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E62B1E]/10 mb-4">
                            <Lock className="w-8 h-8 text-[#E62B1E]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
                        <p className="text-white/50 text-sm">
                            Sign in to access the TEDxSRKR dashboard
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@tedxsrkr.com"
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 focus:ring-2 focus:ring-[#E62B1E]/20 transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-white/70 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-12 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 focus:ring-2 focus:ring-[#E62B1E]/20 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#E62B1E] text-white font-semibold rounded-xl hover:bg-[#E62B1E]/90 focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-white/40 text-sm hover:text-white/60 transition-colors"
                        >
                            ← Back to website
                        </a>
                    </div>
                </div>

                {/* Branding */}
                <div className="text-center mt-6">
                    <p className="text-white/30 text-xs">
                        TEDxSRKR Admin Dashboard • 2026
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
