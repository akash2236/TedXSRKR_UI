import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { SCHEDULE } from '../constants'; // Deprecated
import { CalendarPlus, Clock, Loader2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase-browser';
import * as LucideIcons from 'lucide-react';

/**
 * Schedule Component - Production-Ready Event Timeline
 */

interface ScheduleItem {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: string;
    order_index: number;
    is_live: boolean;
}

const Schedule: React.FC = () => {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [isRevealed, setIsRevealed] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchSchedule(),
                checkVisibility()
            ]);
        };
        init();

        // Real-time subscription for "Live" updates and visibility
        const supabase = getSupabase();
        if (!supabase) return;

        const scheduleChannel = supabase
            .channel('public:schedule_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_items' }, () => {
                fetchSchedule();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.schedule_revealed' }, () => {
                checkVisibility();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(scheduleChannel);
        };
    }, []);

    const checkVisibility = async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'schedule_revealed')
                .single();
            setIsRevealed(data?.value === 'true');
        } catch (err) {
            console.error('Error checking schedule visibility:', err);
            setIsRevealed(false);
        }
    };

    const fetchSchedule = async () => {
        const supabase = getSupabase();
        if (!supabase) {
            setError('Supabase is not configured.');
            setLoading(false);
            return;
        }

        try {
            const { data, error: fetchError } = await supabase
                .from('schedule_items')
                .select('*')
                .order('order_index', { ascending: true });

            if (fetchError) throw fetchError;
            setItems(data || []);
        } catch (err: any) {
            console.error('Error fetching schedule:', err);
            const isNetworkError = err?.message?.includes('fetch') || err?.name === 'AbortError' || err?.message?.includes('aborted');
            setError(isNetworkError
                ? 'Network connection failed.'
                : 'Failed to load schedule items.');
        } finally {
            if (isRevealed !== null) setLoading(false);
        }
    };

    // Ensure loading stops after reveals is checked
    useEffect(() => {
        if (isRevealed !== null) setLoading(false);
    }, [isRevealed]);

    // Add to calendar function
    const addToCalendar = (title: string, time: string) => {
        const eventDate = new Date('2026-03-26'); 
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        eventDate.setHours(hours, minutes || 0);

        const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); 

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('TEDxSRKR: ' + title)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent('TEDxSRKR 2026 Event Session')}&location=${encodeURIComponent('SRKR Engineering College')}`;

        window.open(googleCalendarUrl, '_blank');
    };

    // Helper to render dynamic icon
    const renderIcon = (iconName: string, className: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Calendar;
        return <Icon className={className} />;
    };

    if (loading) {
        return (
            <section id="schedule" className="py-20 bg-[#0A0A0A] flex justify-center">
                <Loader2 className="animate-spin text-[#E62B1E]" size={40} />
            </section>
        );
    }

    if (isRevealed === false) {
        return (
            <section id="schedule" className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#E62B1E]/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
                            <LucideIcons.Lock className="w-4 h-4 text-[#E62B1E]" />
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Schedule Locked</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tighter">
                            Revealing <span className="text-[#E62B1E]">Soon</span>
                        </h2>
                        
                        <p className="text-lg md:text-xl text-white/40 leading-relaxed mb-10">
                            The timeline of inspiration is undergoing its final polish. 
                            Check back soon to see the full lineup of extraordinary talks.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            {[
                                { icon: 'Mic', label: '10+ Speakers' },
                                { icon: 'Timer', label: 'Full Day Event' },
                                { icon: 'Zap', label: 'Interactive Sessions' }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                                >
                                    {renderIcon(stat.icon, "w-6 h-6 text-[#E62B1E] mx-auto mb-3")}
                                    <span className="text-sm font-medium text-white/60">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="schedule" className="py-20 md:py-32 bg-[#0A0A0A]">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16 md:mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-sm font-bold text-[#E62B1E] uppercase tracking-[0.2em]">
                        Event Day
                    </span>
                    <h2 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                        The Schedule
                    </h2>
                    <div className="mt-4 w-20 h-1 bg-[#E62B1E] mx-auto rounded-full" />
                    <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-base md:text-lg leading-relaxed">
                        A day packed with inspiring talks, meaningful connections, and transformative ideas.
                    </p>
                </motion.div>

                {/* Timeline Container */}
                <div className="max-w-5xl mx-auto">
                    <div className="relative">
                        {/* Vertical Timeline Line - Positioned differently on mobile vs desktop */}
                        <motion.div
                            className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-[#E62B1E]/30 via-[#333] to-[#E62B1E]/30"
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ transformOrigin: 'top' }}
                        />

                        {/* Schedule Items */}
                        {items.map((item, index) => {
                            const isLeft = index % 2 === 0;
                            const isLive = item.is_live;

                            return (
                                <div
                                    key={item.id}
                                    className="relative flex items-center mb-12 md:mb-16 last:mb-0"
                                >
                                    {/* Left Side Content (Time for left-aligned cards on desktop, hidden on mobile) */}
                                    <motion.div
                                        className={`hidden md:block md:w-[calc(50%-1.5rem)] ${isLeft ? 'pr-6 md:pr-10' : 'order-3 pl-6 md:pl-10'}`}
                                        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    >
                                        {isLeft && (
                                            <div className="flex items-center gap-2 justify-end">
                                                <Clock size={14} className="text-gray-500" />
                                                <span className="text-sm font-semibold text-gray-300 tracking-wide">
                                                    {item.time}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Center Timeline Dot - Left aligned on mobile, center on desktop */}
                                    <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 z-10 order-2">
                                        <motion.div
                                            className={`relative w-4 h-4 rounded-full border-2 transition-all duration-300 ${isLive
                                                ? 'bg-[#E62B1E] border-[#E62B1E] shadow-[0_0_12px_rgba(230,43,30,0.6)]'
                                                : 'bg-[#1a1a1a] border-[#444] hover:border-[#E62B1E]/70'
                                                }`}
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true, amount: 0.5 }}
                                            transition={{ duration: 0.4, delay: 0.2 }}
                                            whileHover={{ scale: 1.2 }}
                                        >
                                            {/* Live Pulse */}
                                            {isLive && (
                                                <div className="absolute inset-[-4px] rounded-full bg-[#E62B1E]/40 animate-ping" />
                                            )}
                                        </motion.div>
                                    </div>

                                    {/* Card Content - Full width on mobile, half width alternating on desktop */}
                                    <motion.div
                                        className={`w-full pl-16 md:w-[calc(50%-1.5rem)] md:pl-0 ${isLeft ? 'md:order-3 md:pl-6 md:md:pl-10' : 'md:pr-6 md:md:pr-10'}`}
                                        initial={{ opacity: 0, x: isLeft ? 30 : -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <motion.div
                                            className={`group relative bg-[#111111] rounded-xl border transition-all duration-300 overflow-hidden ${isLive
                                                ? 'border-[#E62B1E]/40 shadow-[0_0_24px_rgba(230,43,30,0.12)]'
                                                : 'border-[#1f1f1f] hover:border-[#333] hover:shadow-lg'
                                                }`}
                                            whileHover={{ y: -2 }}
                                        >
                                            {/* Live Badge - Integrated at top */}
                                            {isLive && (
                                                <div className="bg-[#E62B1E] px-4 py-2 flex items-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                                    </span>
                                                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                                                        Live Now
                                                    </span>
                                                </div>
                                            )}

                                            {/* Card Body */}
                                            <div className="p-4 md:p-5 lg:p-6">
                                                {/* Time - Always shown on mobile, shown for right-side cards on desktop */}
                                                <div className={`flex items-center gap-2 mb-3 ${isLeft ? 'md:hidden' : ''}`}>
                                                    <Clock size={14} className="text-gray-500" />
                                                    <span className="text-sm font-semibold text-gray-300 tracking-wide">
                                                        {item.time}
                                                    </span>
                                                </div>

                                                {/* Icon + Title Row */}
                                                <div className="flex items-start gap-3 md:gap-4">
                                                    {/* Icon Container */}
                                                    <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center ${isLive ? 'bg-[#E62B1E]/10 border-[#E62B1E]/30' : ''
                                                        }`}>
                                                        {renderIcon(item.icon, `w-4 h-4 md:w-5 md:h-5 ${isLive ? 'text-[#E62B1E]' : 'text-gray-400'}`)}
                                                    </div>

                                                    {/* Title + Description */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm md:text-base lg:text-lg font-bold text-white leading-snug group-hover:text-[#E62B1E] transition-colors duration-200">
                                                            {item.title}
                                                        </h4>
                                                        <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-gray-400 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#1f1f1f]">
                                                    <button
                                                        onClick={() => addToCalendar(item.title, item.time)}
                                                        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#E62B1E] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#E62B1E]/50 focus:ring-offset-2 focus:ring-offset-[#111111] rounded px-2 py-1 -ml-2"
                                                        aria-label={`Add ${item.title} to calendar`}
                                                    >
                                                        <CalendarPlus size={14} />
                                                        <span>Add to Calendar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
