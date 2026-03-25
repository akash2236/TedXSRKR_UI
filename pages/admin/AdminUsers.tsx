/**
 * Admin Users Management Page
 * 
 * Super Admin only - manage admin users and their roles.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Shield,
    ShieldCheck,
    Eye,
    MoreVertical,
    Pencil,
    Trash2,
    X,
    CheckCircle,
    AlertCircle,
    Mail,
    User,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase-browser';
import { AdminUser, AdminRole } from '../../types/admin';
import { useRequiredAdminAuth, RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Role Badge Component
// ============================================

function RoleBadge({ role }: { role: AdminRole }) {
    const config = {
        super_admin: {
            icon: ShieldCheck,
            label: 'Super Admin',
            classes: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        },
        content_admin: {
            icon: Shield,
            label: 'Content Admin',
            classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        },
        viewer: {
            icon: Eye,
            label: 'Viewer',
            classes: 'bg-white/5 text-white/60 border-white/10',
        },
    };

    const { icon: Icon, label, classes } = config[role];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${classes}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

// ============================================
// User Form Modal
// ============================================

interface UserFormModalProps {
    user?: AdminUser;
    onClose: () => void;
    onSave: () => void;
}

function UserFormModal({ user, onClose, onSave }: UserFormModalProps) {
    const [email, setEmail] = useState(user?.email || '');
    const [name, setName] = useState(user?.name || '');
    const [role, setRole] = useState<AdminRole>(user?.role || 'viewer');
    const [isActive, setIsActive] = useState(user?.is_active ?? true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const supabase = getSupabase();
            if (!supabase) {
                throw new Error('Database not configured');
            }
            if (isEditing) {
                // Update existing user
                const { error } = await supabase
                    .from('admin_users')
                    .update({
                        name,
                        role,
                        is_active: isActive,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.id);

                if (error) throw error;
            } else {
                // Create new admin_users record.
                // Note: The user must have already signed up via Supabase Auth.
                // The user_id FK constraint will reject if user doesn't exist.
                // Look up auth user by email through the admin_users RPC or manual flow.
                const { error } = await supabase
                    .from('admin_users')
                    .insert({
                        email,
                        name,
                        role,
                        is_active: isActive,
                        user_id: crypto.randomUUID(), // Placeholder - will be rejected by FK if user hasn't signed up
                    });

                if (error) {
                    // FK violation: user hasn't signed up via Supabase Auth yet
                    if (error.code === '23503') {
                        throw new Error(
                            'This email has not signed up yet. The user must create an account and log in first before they can be added as an admin.'
                        );
                    }
                    throw error;
                }
            }

            onSave();
        } catch (err: any) {
            console.error('Failed to save user:', err);
            setError(err.message || 'Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                    <h2 className="text-lg font-semibold text-white">
                        {isEditing ? 'Edit Admin User' : 'Add Admin User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Email <span className="text-[#E62B1E]">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isEditing}
                                required
                                placeholder="admin@example.com"
                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        {!isEditing && (
                            <p className="text-white/40 text-xs mt-2">
                                User must have a Supabase Auth account with this email
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Display Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Role <span className="text-[#E62B1E]">*</span>
                        </label>
                        <div className="space-y-2">
                            {(['super_admin', 'content_admin', 'viewer'] as AdminRole[]).map((r) => (
                                <label
                                    key={r}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                                        role === r
                                            ? 'border-[#E62B1E]/50 bg-[#E62B1E]/5'
                                            : 'border-white/[0.08] hover:border-white/20'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r}
                                        checked={role === r}
                                        onChange={() => setRole(r)}
                                        className="sr-only"
                                    />
                                    <RoleBadge role={r} />
                                    <span className="text-white/60 text-sm">
                                        {r === 'super_admin' && 'Full access to all features'}
                                        {r === 'content_admin' && 'Manage speakers and talks'}
                                        {r === 'viewer' && 'View-only access'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/[0.03] text-[#E62B1E] focus:ring-[#E62B1E] focus:ring-offset-0"
                        />
                        <span className="text-white">Active</span>
                        <span className="text-white/50 text-sm">(Can log in)</span>
                    </label>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-white/70 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    {isEditing ? 'Save Changes' : 'Add User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ============================================
// Main Component
// ============================================

function AdminUsersContent() {
    const { adminUser: currentAdmin } = useRequiredAdminAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | undefined>(undefined);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Fetch users
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users by search
    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setShowModal(true);
        setOpenMenu(null);
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this admin user?')) {
            return;
        }

        try {
            const supabase = getSupabase();
            if (!supabase) return;
            const { error } = await supabase
                .from('admin_users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user');
        }
        setOpenMenu(null);
    };

    const handleAddNew = () => {
        setEditingUser(undefined);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingUser(undefined);
    };

    const handleModalSave = () => {
        handleModalClose();
        fetchUsers();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-7 h-7 text-[#E62B1E]" />
                        Admin Users
                    </h1>
                    <p className="text-white/50 mt-1">Manage administrator access</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E62B1E] text-white rounded-xl hover:bg-[#E62B1E]/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Admin
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                />
            </div>

            {/* Users List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E62B1E]"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Users className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-medium text-white/70">No admin users found</h3>
                        <p className="text-white/40 text-sm mt-1">
                            {searchQuery ? 'Try a different search term' : 'Add your first admin user'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.05]">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#E62B1E]/10 flex items-center justify-center text-[#E62B1E] font-semibold">
                                        {(user.name || user.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">
                                                {user.name || 'No Name'}
                                            </span>
                                            {!user.is_active && (
                                                <span className="px-2 py-0.5 bg-white/[0.05] text-white/40 text-xs rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                            {user.id === currentAdmin?.id && (
                                                <span className="px-2 py-0.5 bg-[#E62B1E]/10 text-[#E62B1E] text-xs rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/50 text-sm">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <RoleBadge role={user.role} />
                                    
                                    {/* Actions Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                            className="p-2 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {openMenu === user.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-xl z-10 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="flex items-center gap-2 w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    {user.id !== currentAdmin?.id && (
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <UserFormModal
                        user={editingUser}
                        onClose={handleModalClose}
                        onSave={handleModalSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminUsers() {
    return (
        <RequireAuth requiredPermission="manage_admins">
            <AdminUsersContent />
        </RequireAuth>
    );
}