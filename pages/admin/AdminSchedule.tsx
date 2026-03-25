
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, Loader2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getSupabase } from '../../lib/supabase-browser';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import * as LucideIcons from 'lucide-react';

// Type describing the shape of a schedule item
interface ScheduleItem {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: string;
    order_index: number;
    is_live: boolean;
}

export default function AdminSchedule() {
    const { hasPermission } = useAdminAuth();
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<ScheduleItem>>({});

    // Fetch items on mount
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('schedule_items')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            setLoading(true);

            // Basic validation
            if (!currentItem.title || !currentItem.time) {
                throw new Error('Title and Time are required.');
            }

            const itemData = {
                title: currentItem.title,
                description: currentItem.description,
                time: currentItem.time,
                icon: currentItem.icon || 'Calendar',
                order_index: currentItem.order_index || 0,
                // is_live is handled separately
            };

            if (currentItem.id) {
                // Update
                const { error } = await supabase
                    .from('schedule_items')
                    .update(itemData)
                    .eq('id', currentItem.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('schedule_items')
                    .insert([itemData]);
                if (error) throw error;
            }

            setIsEditing(false);
            setCurrentItem({});
            fetchItems();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('schedule_items')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchItems();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleLive = async (id: string, currentStatus: boolean) => {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            // If turning ON, first turn all others OFF (to ensure only one is live)
            if (!currentStatus) {
                await supabase
                    .from('schedule_items')
                    .update({ is_live: false })
                    .neq('id', id); // Logic: set all to false, then set target to true
                // Actually better: set all false where is_live is true
                await supabase
                    .from('schedule_items')
                    .update({ is_live: false })
                    .eq('is_live', true);
            }

            // Toggle target
            const { error } = await supabase
                .from('schedule_items')
                .update({ is_live: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchItems();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Helper to render dynamic icon
    const renderIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Calendar;
        return <Icon size={18} />;
    };

    if (!hasPermission('manage_talks')) { // Reusing a permission or could use a new one
        // For now assuming if they can manage talks they can manage schedule
        return <div className="text-white">Access Denied</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Event Schedule</h1>
                    <p className="text-gray-400 mt-2">Manage the timeline and control live sessions.</p>
                </div>
                <button
                    onClick={() => { setCurrentItem({}); setIsEditing(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E62B1E] text-white rounded-lg hover:bg-[#E62B1E]/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Item</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-[#111] rounded-xl p-5 border transition-all ${item.is_live ? 'border-[#E62B1E] shadow-[0_0_15px_rgba(230,43,30,0.2)]' : 'border-[#222]'
                            }`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.is_live ? 'bg-[#E62B1E] text-white' : 'bg-[#222] text-gray-400'
                                    }`}>
                                    {renderIcon(item.icon)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-[#E62B1E]">{item.time}</span>
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                        {item.is_live && (
                                            <span className="px-2 py-0.5 bg-[#E62B1E] text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">
                                                Live Now
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleLive(item.id, item.is_live)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${item.is_live
                                        ? 'bg-[#E62B1E]/20 text-[#E62B1E] hover:bg-[#E62B1E]/30'
                                        : 'bg-[#222] text-gray-400 hover:bg-[#333]'
                                        }`}
                                >
                                    {item.is_live ? 'Stop Live' : 'Go Live'}
                                </button>
                                <button
                                    onClick={() => { setCurrentItem(item); setIsEditing(true); }}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-[#222] flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">
                                    {currentItem.id ? 'Edit Session' : 'Add Session'}
                                </h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 10:00 AM"
                                        value={currentItem.time || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, time: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-[#E62B1E] focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Session Title"
                                        value={currentItem.title || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-[#E62B1E] focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea
                                        placeholder="Session Description"
                                        value={currentItem.description || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-[#E62B1E] focus:outline-none h-24 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Icon Name (Lucide)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Mic, Coffee"
                                            value={currentItem.icon || ''}
                                            onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-[#E62B1E] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Order Index</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={currentItem.order_index || 0}
                                            onChange={(e) => setCurrentItem({ ...currentItem, order_index: parseInt(e.target.value) })}
                                            className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-[#E62B1E] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-[#E62B1E] text-white rounded-lg hover:bg-[#E62B1E]/90 transition-colors flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
