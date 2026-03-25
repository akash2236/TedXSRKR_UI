/**
 * Admin Attendance Scanner Page
 *
 * Custom QR scanner using getUserMedia + jsQR.
 * No third-party library UI injection — full control over layout.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode, CheckCircle, XCircle, AlertTriangle,
    RefreshCw, User, Mail, Phone, GraduationCap,
    Building, Ticket, Clock, Camera, Settings, X, Save,
    BarChart3, Download, Search, Sun, Sunset, Users, type LucideIcon
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase-browser';
import { RequireAuth } from '../../contexts/AdminAuthContext';

// ============================================
// Types
// ============================================

interface PersonDetails {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    year: string | null;
    department: string | null;
    ticket_type: string;
    attended_at: string;
}

type ScanResult =
    | { status: 'success'; person: PersonDetails; session?: string }
    | { status: 'already_scanned'; person: PersonDetails; session?: string }
    | { status: 'not_registered' }
    | { status: 'not_approved'; person: { name: string; email: string; payment_status: string } }
    | { status: 'out_of_window'; message: string }
    | { status: 'error'; message: string };

// ============================================
// Detail Row Helper
// ============================================

function Row({ Icon, label, value, capitalize }: {
    Icon: any; label: string; value: string; capitalize?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
            <span className="text-white/50 text-sm w-24 flex-shrink-0">{label}</span>
            <span className={`text-white text-sm font-medium break-all ${capitalize ? 'capitalize' : ''}`}>{value}</span>
        </div>
    );
}

// ============================================
// Result Card
// ============================================

function ResultCard({ result, onReset }: { result: ScanResult; onReset: () => void }) {
    const config = {
        success: { border: 'border-green-500/40', iconBg: 'bg-green-500/20', iconColor: 'text-green-400', Icon: CheckCircle, title: 'Check-in Successful!', sub: 'Attendance has been marked.', titleColor: 'text-green-400' },
        already_scanned: { border: 'border-yellow-500/40', iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-400', Icon: AlertTriangle, title: 'Already Checked In', sub: 'This person was already marked as attended.', titleColor: 'text-yellow-400' },
        not_registered: { border: 'border-red-500/40', iconBg: 'bg-red-500/20', iconColor: 'text-red-400', Icon: XCircle, title: 'Person Not Registered', sub: 'This QR does not match any registration.', titleColor: 'text-red-400' },
        not_approved: { border: 'border-orange-500/40', iconBg: 'bg-orange-500/20', iconColor: 'text-orange-400', Icon: AlertTriangle, title: 'Payment Not Approved', sub: 'This registration has not been approved yet.', titleColor: 'text-orange-400' },
        out_of_window: { border: 'border-blue-500/40', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400', Icon: Clock, title: 'Outside Scanning Window', sub: '', titleColor: 'text-blue-400' },
        error: { border: 'border-red-500/40', iconBg: 'bg-red-500/20', iconColor: 'text-red-400', Icon: XCircle, title: 'Scan Error', sub: '', titleColor: 'text-red-400' },
    }[result.status];

    const person = (result.status === 'success' || result.status === 'already_scanned' || result.status === 'not_approved')
        ? result.person
        : null;

    if (!config) return null;

    const Icon = config.Icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`w-full bg-[#111] border ${config.border} rounded-2xl p-6 shadow-2xl`}
        >
            <div className="flex flex-col items-center mb-6 text-center">
                <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
                <h2 className={`text-xl font-bold ${config.titleColor}`}>{config.title}</h2>
                <div className="flex flex-col gap-1 mt-1">
                    <p className="text-white/50 text-sm">
                        {'session' in result && result.session && (
                            <span className="capitalize font-semibold text-white/70 block mb-1">
                                {result.session} Session
                            </span>
                        )}
                        {result.status === 'error' || result.status === 'out_of_window' ? (result as any).message : config.sub}
                    </p>
                </div>
            </div>

            {person && (
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-5 space-y-3">
                    {'name' in person && <Row Icon={User} label="Name" value={person.name} />}
                    {'email' in person && <Row Icon={Mail} label="Email" value={person.email} />}
                    {'phone' in person && (person as any).phone && <Row Icon={Phone} label="Phone" value={(person as any).phone} />}
                    {'college' in person && (person as any).college && <Row Icon={Building} label="College" value={(person as any).college} />}
                    {'year' in person && (person as any).year && <Row Icon={GraduationCap} label="Year" value={(person as any).year} />}
                    {'ticket_type' in person && <Row Icon={Ticket} label="Ticket" value={(person as any).ticket_type} capitalize />}
                    {'payment_status' in person && <Row Icon={AlertTriangle} label="Status" value={(person as any).payment_status} capitalize />}
                    {'attended_at' in person && (person as any).attended_at && (
                        <Row Icon={Clock}
                            label={result.status === 'already_scanned' ? 'Scan Time' : 'Checked In'}
                            value={new Date((person as any).attended_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        />
                    )}
                </div>
            )}

            <button
                onClick={onReset}
                className="w-full py-3 rounded-xl bg-[#E62B1E] hover:bg-[#E62B1E]/90 text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" /> Scan Another
            </button>
        </motion.div>
    );
}

// ============================================
// Custom QR Scanner (getUserMedia + jsQR)
// ============================================

function QrScanner({ onScan, isProcessing }: { onScan: (value: string) => void; isProcessing: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastScanRef = useRef<string | null>(null); // debounce duplicate scans
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    const scan = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(scan);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            const jsQR = (await import('jsqr')).default;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code && code.data && code.data !== lastScanRef.current) {
                lastScanRef.current = code.data;
                onScan(code.data.trim());
                return; // stop loop after scan, parent will remount
            }
        } catch (_) { /* ignore decode failures */ }

        rafRef.current = requestAnimationFrame(scan);
    }, [onScan]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                });
                if (!mounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current!.play();
                        setReady(true);
                        rafRef.current = requestAnimationFrame(scan);
                    };
                }
            } catch (err: any) {
                if (!mounted) return;
                setError(err?.message?.includes('Permission')
                    ? 'Camera permission denied. Please allow camera access.'
                    : 'Could not access camera. Make sure a camera is connected.');
            }
        })();

        return () => {
            mounted = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [scan]);

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
                <Camera className="w-12 h-12 text-white/20" />
                <p className="text-white/50 text-sm max-w-xs">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-xl overflow-hidden bg-black">
            {/* Hidden canvas for jsQR pixel analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Actual camera video */}
            <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-auto block"
                style={{ maxHeight: '380px', objectFit: 'cover' }}
            />

            {/* Loading overlay */}
            {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="w-8 h-8 border-2 border-[#E62B1E]/30 border-t-[#E62B1E] rounded-full animate-spin" />
                </div>
            )}

            {/* Scan box guide overlay (purely decorative) */}
            {ready && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-52 h-52">
                        {/* Corners */}
                        <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#E62B1E] rounded-tl-lg" />
                        <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#E62B1E] rounded-tr-lg" />
                        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#E62B1E] rounded-bl-lg" />
                        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#E62B1E] rounded-br-lg" />
                        {/* Scan line */}
                        <motion.span
                            className="absolute left-1 right-1 h-0.5 bg-[#E62B1E]/80 rounded"
                            initial={{ top: '4px' }}
                            animate={{ top: 'calc(100% - 4px)' }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
                        />
                    </div>
                </div>
            )}

            {/* Processing overlay */}
            {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-[#E62B1E]/30 border-t-[#E62B1E] rounded-full animate-spin" />
                        <span className="text-white text-sm font-medium">Verifying...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Attendance Report Component
// ============================================

interface AttendeeRecord {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    department: string | null;
    year: string | null;
    ticket_type: string;
    morning_attended: boolean;
    afternoon_attended: boolean;
    attended_at: string | null;
    morning_attended_at: string | null;
    afternoon_attended_at: string | null;
}

function AttendanceReport() {
    const [records, setRecords] = useState<AttendeeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Database not configured');
            const { data, error: dbErr } = await supabase
                .from('registrations')
                .select('id, name, email, phone, college, department, year, ticket_type, morning_attended, afternoon_attended, attended_at, morning_attended_at, afternoon_attended_at')
                .eq('payment_status', 'approved')
                .eq('attended', true)
                .order('attended_at', { ascending: false });
            if (dbErr) throw dbErr;
            setRecords(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load attendance data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, []);

    const filtered = records.filter(r =>
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        (r.college || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalMorning = records.filter(r => r.morning_attended).length;
    const totalAfternoon = records.filter(r => r.afternoon_attended).length;

    const exportCSV = () => {
        const header = 'Name,Email,Phone,College,Department,Year,Ticket,Morning,Afternoon,Check-in Time';
        const rows = filtered.map(r => [
            `"${r.name}"`,
            r.email,
            r.phone || '',
            `"${r.college || ''}"`,
            `"${r.department || ''}"`,
            r.year || '',
            r.ticket_type,
            r.morning_attended ? 'Yes' : 'No',
            r.afternoon_attended ? 'Yes' : 'No',
            r.attended_at ? new Date(r.attended_at).toLocaleString('en-IN') : ''
        ].join(','));
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#E62B1E]/30 border-t-[#E62B1E] rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={fetchReport} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10">
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 text-center">
                    <Users className="w-6 h-6 text-[#E62B1E] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{records.length}</p>
                    <p className="text-white/40 text-xs mt-1">Total Attended</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 text-center">
                    <Sun className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalMorning}</p>
                    <p className="text-white/40 text-xs mt-1">Morning Session</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 text-center">
                    <Sunset className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalAfternoon}</p>
                    <p className="text-white/40 text-xs mt-1">Afternoon Session</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, email or college..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 text-sm"
                    />
                </div>
                <button
                    onClick={exportCSV}
                    disabled={filtered.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E62B1E] hover:bg-[#E62B1E]/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
                <button onClick={fetchReport} className="p-2.5 bg-white/5 border border-white/10 text-white/50 hover:text-white rounded-xl transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40">{records.length === 0 ? 'No attendance recorded yet.' : 'No results match your search.'}</p>
                </div>
            ) : (
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Name', 'Email', 'College', 'Ticket', 'Morning', 'Afternoon', 'Check-in'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, i) => (
                                    <tr key={r.id} className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'} hover:bg-white/[0.03] transition-colors`}>
                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{r.name}</td>
                                        <td className="px-4 py-3 text-white/60 whitespace-nowrap">{r.email}</td>
                                        <td className="px-4 py-3 text-white/50 whitespace-nowrap">{r.college || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                r.ticket_type === 'vip' ? 'bg-[#E62B1E]/20 text-[#E62B1E]' : 'bg-white/[0.06] text-white/60'
                                            }`}>{r.ticket_type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {r.morning_attended
                                                ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                                : <span className="text-white/20 text-lg mx-auto block text-center">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {r.afternoon_attended
                                                ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                                : <span className="text-white/20 text-lg mx-auto block text-center">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                                            {r.attended_at ? new Date(r.attended_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-white/[0.06] text-white/30 text-xs">
                        Showing {filtered.length} of {records.length} attendees
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Main Page
// ============================================

function AttendanceContent() {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<'scanner' | 'report'>('scanner');
    const [timings, setTimings] = useState({
        morning_start: 9,
        morning_end: 12,
        afternoon_start: 12,
        afternoon_end: 20
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Fetch timings from settings table
        const fetchSettings = async () => {
            try {
                const supabase = getSupabase();
                if (!supabase) return;
                const { data } = await supabase
                    .from('event_settings')
                    .select('value')
                    .eq('key', 'attendance_timings')
                    .single();

                if (data?.value) {
                    setTimings(data.value);
                }
            } catch (err) {
                console.error('Failed to fetch timings:', err);
            }
        };
        fetchSettings();
    }, []);

    const hour = currentTime.getHours();
    const activeSession = hour >= timings.morning_start && hour < timings.morning_end
        ? 'morning'
        : (hour >= timings.afternoon_start && hour < timings.afternoon_end ? 'afternoon' : null);

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Database not configured');

            const { error } = await supabase
                .from('event_settings')
                .upsert({
                    key: 'attendance_timings',
                    value: timings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setIsSettingsOpen(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleScan = useCallback(async (registrationId: string) => {
        if (isProcessing || scanResult) return;
        setIsProcessing(true);

        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Database not configured');

            // 1. Fetch current timings
            const { data: settingsData } = await supabase
                .from('event_settings')
                .select('value')
                .eq('key', 'attendance_timings')
                .single();

            const currentTimings = settingsData?.value || timings;

            // 2. Determine session
            const now = new Date();
            const hour = now.getHours();

            let session: 'morning' | 'afternoon' | null = null;
            if (hour >= currentTimings.morning_start && hour < currentTimings.morning_end) {
                session = 'morning';
            } else if (hour >= currentTimings.afternoon_start && hour < currentTimings.afternoon_end) {
                session = 'afternoon';
            }

            if (!session) {
                setScanResult({
                    status: 'out_of_window',
                    message: `Scanning is only allowed during morning (${currentTimings.morning_start}:00 - ${currentTimings.morning_end}:00) and afternoon (${currentTimings.afternoon_start}:00 - ${currentTimings.afternoon_end}:00) sessions.`
                });
                setIsProcessing(false);
                return;
            }

            // 3. Fetch registration
            const { data: registration, error: fetchError } = await supabase
                .from('registrations')
                .select('id, name, email, phone, college, year, department, ticket_type, payment_status, attended, morning_attended, afternoon_attended, morning_attended_at, afternoon_attended_at, created_at, attended_at')
                .eq('id', registrationId.trim())
                .single();

            if (fetchError || !registration) {
                setScanResult({ status: 'not_registered' });
                setIsProcessing(false);
                return;
            }

            // 4. Validate registration
            if (registration.payment_status !== 'approved') {
                setScanResult({
                    status: 'not_approved',
                    person: {
                        name: registration.name,
                        email: registration.email,
                        payment_status: registration.payment_status
                    }
                });
                setIsProcessing(false);
                return;
            }

            // 5. Check if already attended for THIS session
            const alreadyAttended = session === 'morning' ? registration.morning_attended : registration.afternoon_attended;
            const sessionAttendedAt = session === 'morning' ? registration.morning_attended_at : registration.afternoon_attended_at;

            if (alreadyAttended) {
                setScanResult({
                    status: 'already_scanned',
                    person: {
                        id: registration.id,
                        name: registration.name,
                        email: registration.email,
                        phone: registration.phone,
                        college: registration.college,
                        year: registration.year,
                        department: registration.department,
                        ticket_type: registration.ticket_type,
                        attended_at: sessionAttendedAt,
                    },
                    session
                });
                setIsProcessing(false);
                return;
            }

            // 6. Mark Attendance
            const timestamp = new Date().toISOString();
            const updateData: any = {
                attended: true,
                attended_at: registration.attended_at || timestamp
            };

            if (session === 'morning') {
                updateData.morning_attended = true;
                updateData.morning_attended_at = timestamp;
            } else {
                updateData.afternoon_attended = true;
                updateData.afternoon_attended_at = timestamp;
            }

            const { error: updateError } = await supabase
                .from('registrations')
                .update(updateData)
                .eq('id', registrationId.trim());

            if (updateError) throw updateError;

            // 7. Success!
            setScanResult({
                status: 'success',
                person: {
                    id: registration.id,
                    name: registration.name,
                    email: registration.email,
                    phone: registration.phone,
                    college: registration.college,
                    year: registration.year,
                    department: registration.department,
                    ticket_type: registration.ticket_type,
                    attended_at: timestamp,
                },
                session
            });

        } catch (err) {
            setScanResult({ status: 'error', message: err instanceof Error ? err.message : 'Database error.' });
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, scanResult, timings]);

    const handleReset = () => {
        setScanResult(null);
        setScanKey(k => k + 1);
    };

    return (
        <div className="max-w-lg mx-auto space-y-5">
            {/* Header + Tabs */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <QrCode className="w-7 h-7 text-[#E62B1E]" />
                            Attendance
                        </h1>
                        <p className="text-white/50 mt-1 text-sm">Scan QR codes or view the attendance report</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                    <button
                        onClick={() => setActiveTab('scanner')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'scanner'
                                ? 'bg-[#E62B1E] text-white shadow'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <QrCode className="w-4 h-4" />
                        Scanner
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'report'
                                ? 'bg-[#E62B1E] text-white shadow'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Report
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'report' ? (
                <AttendanceReport />
            ) : (
                <>
                    {/* Settings Button - only in scanner tab */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title="Adjust Timings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Session Indicator */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${activeSession === 'morning' ? 'bg-orange-500/10 border-orange-500/20' :
                        activeSession === 'afternoon' ? 'bg-blue-500/10 border-blue-500/20' :
                            'bg-white/5 border-white/10 opacity-50'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeSession === 'morning' ? 'bg-orange-500/20 text-orange-400' :
                                activeSession === 'afternoon' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-white/10 text-white/40'
                                }`}>
                                {activeSession === 'morning' ? <Clock className="w-5 h-5" /> :
                                    activeSession === 'afternoon' ? <Clock className="w-5 h-5" /> :
                                        <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-white font-semibold capitalize">
                                    {activeSession ? `${activeSession} Session` : 'Scanning Closed'}
                                </p>
                                <p className="text-white/40 text-xs text-nowrap">
                                    {activeSession === 'morning' ? `${timings.morning_start}:00 AM - ${timings.morning_end > 12 ? timings.morning_end - 12 : timings.morning_end}:00 ${timings.morning_end >= 12 ? 'PM' : 'AM'}` :
                                        activeSession === 'afternoon' ? `${timings.afternoon_start > 12 ? timings.afternoon_start - 12 : timings.afternoon_start}:00 ${timings.afternoon_start >= 12 ? 'PM' : 'AM'} - ${timings.afternoon_end > 12 ? timings.afternoon_end - 12 : timings.afternoon_end}:00 ${timings.afternoon_end >= 12 ? 'PM' : 'AM'}` :
                                            'Only allowed during session hours'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-mono text-sm">
                                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                            <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${activeSession ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {scanResult ? (
                            <ResultCard key="result" result={scanResult} onReset={handleReset} />
                        ) : (
                            <motion.div
                                key={`scanner-${scanKey}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden"
                            >
                                <div className="p-4">
                                    <QrScanner key={scanKey} onScan={handleScan} isProcessing={isProcessing} />
                                </div>
                                <div className="px-4 pb-4 text-center">
                                    <p className="text-white/30 text-xs">Point camera at the TEDxSRKR QR code from the confirmation email</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Legend */}
                    {!scanResult && (
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { dot: 'bg-green-400', label: 'Valid', desc: 'Scan Accepted' },
                                { dot: 'bg-yellow-400', label: 'Duplicate', desc: 'Session Scan' },
                                { dot: 'bg-red-400', label: 'Unknown', desc: 'Not Found' },
                            ].map(({ dot, label, desc }) => (
                                <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full mb-1.5 ${dot}`} />
                                    <p className="text-white text-xs font-medium">{label}</p>
                                    <p className="text-white/40 text-xs">{desc}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Timings Settings Modal - always rendered (accessed via scanner tab) */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#E62B1E]" />
                                    Adjust Timings
                                </h3>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Morning Session */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Morning Session</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-white/40">Start Hour (0-23)</label>
                                            <input
                                                type="number"
                                                min="0" max="23"
                                                value={timings.morning_start}
                                                onChange={(e) => setTimings({ ...timings, morning_start: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E62B1E]/50 outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-white/40">End Hour (0-23)</label>
                                            <input
                                                type="number"
                                                min="0" max="23"
                                                value={timings.morning_end}
                                                onChange={(e) => setTimings({ ...timings, morning_end: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E62B1E]/50 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Afternoon Session */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Afternoon Session</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-white/40">Start Hour (0-23)</label>
                                            <input
                                                type="number"
                                                min="0" max="23"
                                                value={timings.afternoon_start}
                                                onChange={(e) => setTimings({ ...timings, afternoon_start: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E62B1E]/50 outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs text-white/40">End Hour (0-23)</label>
                                            <input
                                                type="number"
                                                min="0" max="23"
                                                value={timings.afternoon_end}
                                                onChange={(e) => setTimings({ ...timings, afternoon_end: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#E62B1E]/50 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/[0.02] border-t border-white/5">
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSavingSettings}
                                    className="w-full py-3 rounded-xl bg-[#E62B1E] hover:bg-[#E62B1E]/90 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingSettings ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Save Configuration</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminAttendance() {
    return (
        <RequireAuth requiredPermission="view_dashboard">
            <AttendanceContent />
        </RequireAuth>
    );
}
