/**
 * Admin Dashboard Layout
 * 
 * Main layout wrapper for all admin pages with sidebar navigation.
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Mic,
    Video,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Shield,
    ClipboardList,
    MessageSquare,
    Calendar,
    LucideIcon,
    QrCode,
} from 'lucide-react';
import { useRequiredAdminAuth, RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Navigation Items
// ============================================

interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
}

const navItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/speakers', label: 'Speakers', icon: Mic, permission: 'manage_speakers' },
    { path: '/admin/talks', label: 'Talks & Videos', icon: Video, permission: 'manage_talks' },
    { path: '/admin/schedule', label: 'Schedule', icon: Calendar, permission: 'manage_talks' },
    { path: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
    { path: '/admin/attendance', label: 'Attendance', icon: QrCode },
    { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/payment-settings', label: 'Payment Settings', icon: Settings },
    { path: '/admin/users', label: 'Admin Users', icon: Shield, permission: 'manage_admins' },
];

// ============================================
// Sidebar Component
// ============================================

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { adminUser, logout, hasPermission } = useRequiredAdminAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const filteredNavItems = navItems.filter(item =>
        !item.permission || hasPermission(item.permission)
    );

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 bg-[#0A0A0A] border-r border-white/[0.08]
                    transform transition-transform duration-300 z-50
                    lg:translate-x-0 lg:static lg:z-auto
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#E62B1E] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <div>
                                <h1 className="text-white font-bold">TEDxSRKR</h1>
                                <p className="text-white/40 text-xs">Admin Panel</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 text-white/60 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {filteredNavItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/admin'}
                                    onClick={() => onClose()}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                        ${isActive
                                            ? 'bg-[#E62B1E] text-white'
                                            : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                                        }
                                    `}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-white/[0.08]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {adminUser?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                    {adminUser?.name || 'Admin'}
                                </p>
                                <p className="text-white/40 text-xs capitalize">
                                    {adminUser?.role?.replace('_', ' ') || 'Unknown Role'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// ============================================
// Header Component
// ============================================

interface HeaderProps {
    onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/[0.08]">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/[0.05]"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex-1 lg:hidden" />

                {/* Breadcrumb placeholder */}
                <div className="hidden lg:flex items-center gap-2 text-white/40 text-sm">
                    <a href="/" className="hover:text-white transition-colors">Website</a>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">Admin</span>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-4">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                        View Site →
                    </a>
                </div>
            </div>
        </header>
    );
}

// ============================================
// Main Layout
// ============================================

function AdminLayoutContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-6 overflow-auto admin-panel">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// ============================================
// Export with Auth Protection
// ============================================

export default function AdminLayout() {
    return (
        <RequireAuth
            fallback={
                <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Access Required</h2>
                        <p className="text-white/60 mb-6">Please sign in to access the admin dashboard.</p>
                        <a
                            href="/admin/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                        >
                            Sign In
                        </a>
                    </div>
                </div>
            }
        >
            <AdminLayoutContent />
        </RequireAuth>
    );
}
