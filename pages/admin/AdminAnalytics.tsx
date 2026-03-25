/**
 * Admin Analytics Dashboard
 * 
 * Comprehensive analytics with registration stats, video views, and CSV export.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Eye,
    Users,
    Download,
    Calendar,
    Play,
    RefreshCw,
    ChevronDown,
} from 'lucide-react';
import {
    getRegistrationStats,
    getVideoViewStats,
    getSpeakers,
    downloadCSV,
    generateCSV,
} from '../../lib/adminApi';
import { DbSpeaker, RegistrationStats, VideoViewStats } from '../../types/admin';
import { RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: 'red' | 'blue' | 'green' | 'purple';
}

function StatCard({ title, value, change, icon, color = 'red' }: StatCardProps) {
    const colorClasses = {
        red: 'bg-[#E62B1E]/10 text-[#E62B1E]',
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-green-500/10 text-green-400',
        purple: 'bg-purple-500/10 text-purple-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/50 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
                    {change !== undefined && (
                        <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <TrendingUp className={`w-4 h-4 inline mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last week
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================
// Simple Bar Chart Component
// ============================================

interface BarChartProps {
    data: { label: string; value: number }[];
    maxValue?: number;
    color?: string;
}

function SimpleBarChart({ data, maxValue, color = '#E62B1E' }: BarChartProps) {
    const max = maxValue || Math.max(...data.map(d => d.value), 1);

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-20 text-white/60 text-sm truncate">{item.label}</div>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-6 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / max) * 100}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="h-full rounded-full flex items-center justify-end px-2"
                            style={{ backgroundColor: color }}
                        >
                            <span className="text-xs text-white font-medium">{item.value}</span>
                        </motion.div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ============================================
// Date Range Picker Component
// ============================================

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}

function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const presets = [
        { label: 'Last 7 days', days: 7 },
        { label: 'Last 30 days', days: 30 },
        { label: 'Last 90 days', days: 90 },
    ];

    const setPreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        onChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onChange(e.target.value, endDate)}
                    className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-[#E62B1E]/50"
                />
                <span className="text-white/40">to</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onChange(startDate, e.target.value)}
                    className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-[#E62B1E]/50"
                />
            </div>
            <div className="flex items-center gap-2">
                {presets.map(preset => (
                    <button
                        key={preset.days}
                        onClick={() => setPreset(preset.days)}
                        className="px-3 py-1.5 text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-lg transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Main Analytics Component
// ============================================

function AnalyticsContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Date range
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Data
    const [registrationStats, setRegistrationStats] = useState<RegistrationStats[]>([]);
    const [videoStats, setVideoStats] = useState<VideoViewStats[]>([]);
    const [speakers, setSpeakers] = useState<DbSpeaker[]>([]);
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');

    // Fetch data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [regStats, vidStats, speakerList] = await Promise.all([
                getRegistrationStats(startDate, endDate),
                getVideoViewStats(startDate, endDate, selectedSpeaker || undefined),
                getSpeakers({ limit: 100 }),
            ]);
            setRegistrationStats(regStats);
            setVideoStats(vidStats);
            setSpeakers(speakerList.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, selectedSpeaker]);

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        const totalRegistrations = registrationStats.reduce((sum, s) => sum + (s.count || 0), 0);
        const totalViews = videoStats.reduce((sum, s) => sum + (s.total_views || 0), 0);
        const uniqueViewers = videoStats.reduce((sum, s) => sum + (s.unique_viewers || 0), 0);
        
        // Calculate average watch time safely
        const totalDuration = videoStats.reduce((sum, s) => sum + (s.avg_watch_duration || 0) * (s.total_views || 0), 0);
        const avgWatchTime = totalViews > 0 ? totalDuration / totalViews : 0;

        return {
            totalRegistrations,
            totalViews,
            uniqueViewers,
            avgWatchTime: Math.round(avgWatchTime),
        };
    }, [registrationStats, videoStats]);

    // Chart data
    const registrationChartData = useMemo(() => {
        // Show up to 14 days of recent data from the stats
        return [...registrationStats].slice(0, 14).reverse().map(s => ({
            label: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            value: s.count,
        }));
    }, [registrationStats]);

    const videoChartData = useMemo(() => {
        // Filter out zero views for the chart if many talks exist
        const activeTalks = videoStats.filter(s => s.total_views > 0 || videoStats.length < 5);
        return activeTalks.slice(0, 10).map(s => ({
            label: (s.talk_title?.length > 20 ? s.talk_title.slice(0, 17) + '...' : s.talk_title) || 'Unknown',
            value: s.total_views,
        }));
    }, [videoStats]);


    // Export handlers
    const handleExportRegistrations = async () => {
        setIsExporting(true);
        try {
            const csv = generateCSV(registrationStats, ['date', 'count', 'standard_count', 'vip_count', 'student_count']);
            downloadCSV(csv, `registrations_${startDate}_to_${endDate}.csv`);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportVideoStats = async () => {
        setIsExporting(true);
        try {
            const csv = generateCSV(videoStats, ['talk_title', 'speaker_name', 'total_views', 'unique_viewers', 'avg_watch_duration']);
            downloadCSV(csv, `video_stats_${startDate}_to_${endDate}.csv`);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-[#E62B1E]" />
                        Analytics
                    </h1>
                    <p className="text-white/50 mt-1">Monitor registrations and video engagement</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Date Range */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Registrations"
                    value={summaryMetrics.totalRegistrations}
                    icon={<Users className="w-6 h-6" />}
                    color="red"
                />
                <StatCard
                    title="Total Video Views"
                    value={summaryMetrics.totalViews}
                    icon={<Eye className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    title="Unique Viewers"
                    value={summaryMetrics.uniqueViewers}
                    icon={<Users className="w-6 h-6" />}
                    color="green"
                />
                <StatCard
                    title="Avg. Watch Time"
                    value={`${Math.floor(summaryMetrics.avgWatchTime / 60)}m ${summaryMetrics.avgWatchTime % 60}s`}
                    icon={<Play className="w-6 h-6" />}
                    color="purple"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registration Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Registration Trend</h2>
                        <button
                            onClick={handleExportRegistrations}
                            disabled={isExporting}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E62B1E]"></div>
                        </div>
                    ) : registrationChartData.length > 0 ? (
                        <SimpleBarChart data={registrationChartData} color="#E62B1E" />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-white/40">
                            No registration data for this period
                        </div>
                    )}
                </motion.div>

                {/* Video Views by Talk */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Top Talks by Views</h2>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={selectedSpeaker}
                                    onChange={(e) => setSelectedSpeaker(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none cursor-pointer admin-select"
                                >
                                    <option value="">All Speakers</option>
                                    {speakers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            </div>
                            <button
                                onClick={handleExportVideoStats}
                                disabled={isExporting}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E62B1E]"></div>
                        </div>
                    ) : videoChartData.length > 0 ? (
                        <SimpleBarChart data={videoChartData} color="#3B82F6" />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-white/40">
                            No video view data for this period
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 gap-6">
                {/* Registration Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6">Daily Registration Details</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-white/50 text-sm border-b border-white/[0.08]">
                                    <th className="pb-3 pr-4">Date</th>
                                    <th className="pb-3 pr-4">Registrations</th>
                                    <th className="pb-3 pr-4">Standard</th>
                                    <th className="pb-3 pr-4">VIP</th>
                                    <th className="pb-3">Student</th>
                                </tr>
                            </thead>
                            <tbody className="text-white/70">
                                {registrationStats.map((stat, index) => (
                                    <tr
                                        key={stat.date}
                                        className="border-b border-white/[0.05] last:border-0"
                                    >
                                        <td className="py-3 pr-4">
                                            {new Date(stat.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center gap-2">
                                                {stat.count}
                                                {index === 0 && stat.count > 0 && (
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                                                        New
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">{stat.standard_count}</td>
                                        <td className="py-3 pr-4">{stat.vip_count}</td>
                                        <td className="py-3">{stat.student_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function AdminAnalytics() {
    return (
        <RequireAuth requiredPermission="view_dashboard">
            <AnalyticsContent />
        </RequireAuth>
    );
}
