import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, XCircle, Clock } from 'lucide-react';
import Register from '../components/Register';
import { getRegistrationStatus, RegistrationStatus } from '../lib/adminApi';

const RegisterPage: React.FC = () => {
    const [status, setStatus] = useState<RegistrationStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRegistrationStatus()
            .then(setStatus)
            .finally(() => setLoading(false));
    }, []);

    // ── Loading ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E62B1E]" />
            </div>
        );
    }

    // ── Past event — Registrations are CLOSED ───────────────────
    if (status?.isPastEvent) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <section className="min-h-[70vh] flex items-center justify-center py-20 bg-[#0A0A0A] relative overflow-hidden">
                    {/* Glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-[150px]" />
                    </div>
                    <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-500/10 border border-gray-500/30 flex items-center justify-center"
                        >
                            <XCircle size={48} className="text-gray-400" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Registrations Closed
                        </h1>
                        <p className="text-gray-400 text-lg mb-6">
                            The event date has passed. Registrations for <span className="text-white font-semibold">TEDxSRKR 2026</span> are now closed.
                        </p>
                        <p className="text-gray-500 text-sm">
                            Thank you to everyone who registered. We look forward to seeing you at the event!
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-8 px-8 py-3 bg-white/[0.06] border border-white/[0.12] text-white font-semibold rounded-full hover:bg-white/[0.1] transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </section>
            </motion.div>
        );
    }

    // ── Not yet opened ─────────────────────────────────────────
    if (!status?.isOpen) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <section className="min-h-[70vh] flex items-center justify-center py-20 bg-[#0A0A0A] relative overflow-hidden">
                    {/* Glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#E62B1E]/8 rounded-full blur-[180px]" />
                        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#E62B1E]/5 rounded-full blur-[120px]" />
                    </div>
                    <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#E62B1E]/10 border border-[#E62B1E]/30 flex items-center justify-center"
                        >
                            <Lock size={48} className="text-[#E62B1E]" />
                        </motion.div>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-block px-4 py-2 mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#E62B1E] bg-[#E62B1E]/10 rounded-full border border-[#E62B1E]/20"
                        >
                            Coming Soon
                        </motion.span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Registrations Not{' '}
                            <span className="text-[#E62B1E]">Opened Yet</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-6">
                            Registration for <span className="text-white font-semibold">TEDxSRKR 2026</span> hasn't opened yet. Stay tuned — we'll announce it soon!
                        </p>
                        {status?.eventDate && (
                            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm">
                                <Clock size={16} className="text-[#E62B1E]" />
                                Event Date: <span className="text-white font-medium">{status.eventDate}</span>
                            </div>
                        )}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-8 py-3 bg-white/[0.06] border border-white/[0.12] text-white font-semibold rounded-full hover:bg-white/[0.1] transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </section>
            </motion.div>
        );
    }

    // ── Registration is OPEN ────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Register />
        </motion.div>
    );
};

export default RegisterPage;
