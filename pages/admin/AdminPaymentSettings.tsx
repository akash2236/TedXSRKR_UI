/**
 * Admin Payment Settings Page
 * 
 * Allows admins to update the UPI ID and QR code image URL
 * stored in Supabase event_settings, which is then displayed
 * live on the registration page.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Save, Loader2, CheckCircle, AlertTriangle, Image, RefreshCw } from 'lucide-react';
import { getSupabase } from '../../lib/supabase-browser';
import { RequireAuth } from '../../contexts/AdminAuthContext';

interface PaymentSettings {
    upi_id: string;
    qr_image_url: string;
    amount: number;
    payment_note: string;
}

const DEFAULT_SETTINGS: PaymentSettings = {
    upi_id: '8688336822-2@ybl',
    qr_image_url: '/preethi _qr_code.png',
    amount: 200,
    payment_note: 'TEDxSRKR 2026 Registration',
};

function PaymentSettingsContent() {
    const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Load current settings from Supabase
    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data } = await supabase
                .from('event_settings')
                .select('value')
                .eq('key', 'payment_settings')
                .single();
            if (data?.value) {
                setSettings({ ...DEFAULT_SETTINGS, ...data.value });
            }
        } catch {
            // use defaults
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadSettings(); }, []);

    // Save settings to Supabase
    const handleSave = async () => {
        if (!settings.upi_id.trim()) {
            setFeedback({ type: 'error', message: 'UPI ID cannot be empty.' });
            return;
        }
        if (!settings.qr_image_url.trim()) {
            setFeedback({ type: 'error', message: 'QR image URL cannot be empty.' });
            return;
        }
        setIsSaving(true);
        setFeedback(null);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Supabase not configured');

            const { error } = await supabase
                .from('event_settings')
                .upsert({
                    key: 'payment_settings',
                    value: settings,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            setFeedback({ type: 'success', message: '✅ Payment settings saved! The registration page will now show the updated QR code and UPI ID.' });
            setTimeout(() => setFeedback(null), 6000);
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err instanceof Error ? err.message : 'Failed to save settings. Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-7 h-7 text-[#E62B1E]" />
                        Payment Settings
                    </h1>
                    <p className="text-white/50 mt-1 text-sm">
                        Update the UPI ID and QR code shown on the registration page. Changes are live immediately.
                    </p>
                </div>
                <button
                    onClick={loadSettings}
                    disabled={isLoading}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Feedback Banner */}
            {feedback && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-start gap-3 ${feedback.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                        }`}
                >
                    {feedback.type === 'success'
                        ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        : <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                    <p className={`text-sm ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {feedback.message}
                    </p>
                </motion.div>
            )}

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-6"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E62B1E]" />
                    </div>
                ) : (
                    <>
                        {/* UPI ID */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                UPI ID <span className="text-[#E62B1E]">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.upi_id}
                                onChange={(e) => setSettings(prev => ({ ...prev, upi_id: e.target.value }))}
                                placeholder="e.g. 9999999999@ybl"
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                            <p className="text-white/40 text-xs mt-1.5">This UPI ID will be shown on the registration page for online payments.</p>
                        </div>

                        {/* QR Code Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                QR Code Image URL <span className="text-[#E62B1E]">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.qr_image_url}
                                onChange={(e) => setSettings(prev => ({ ...prev, qr_image_url: e.target.value }))}
                                placeholder="e.g. /payment-qr.png  or  https://..."
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                            <p className="text-white/40 text-xs mt-1.5">
                                Upload your QR image to the <code className="text-white/60">/public</code> folder and enter the path here (e.g. <code className="text-white/60">/my-qr.png</code>), or use a full HTTPS URL.
                            </p>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Registration Fee (₹)
                            </label>
                            <input
                                type="number"
                                value={settings.amount}
                                onChange={(e) => setSettings(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                min={0}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E62B1E]/50 transition-colors"
                            />
                        </div>

                        {/* Live Preview */}
                        {settings.qr_image_url && (
                            <div>
                                <p className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                                    <Image className="w-4 h-4" /> QR Code Preview
                                </p>
                                <div className="flex items-start gap-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                                    <div className="bg-white p-2 rounded-xl shrink-0">
                                        <img
                                            src={settings.qr_image_url}
                                            alt="QR Code Preview"
                                            className="w-28 h-28 object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white/50 text-xs">UPI ID (shown below QR):</p>
                                        <p className="text-white font-mono text-sm">{settings.upi_id}</p>
                                        <p className="text-white/50 text-xs mt-2">Amount:</p>
                                        <p className="text-[#E62B1E] font-bold text-lg">₹{settings.amount}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E62B1E] text-white font-semibold rounded-xl hover:bg-[#ff4436] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(230,43,30,0.3)]"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Payment Settings</>
                            )}
                        </button>
                    </>
                )}
            </motion.div>

            {/* Info box */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-blue-400/80 text-sm">
                    <strong>How to change the QR code:</strong><br />
                    1. Get the new QR image from your UPI app (PhonePe / GPay / Paytm → "My QR")<br />
                    2. Copy the image to the <code className="bg-white/10 px-1 rounded">public/</code> folder in your project<br />
                    3. Enter the filename here (e.g. <code className="bg-white/10 px-1 rounded">/new-qr.png</code>) and click Save<br />
                    4. The registration page will show the new QR code immediately — no code change needed!
                </p>
            </div>
        </div>
    );
}

export default function AdminPaymentSettings() {
    return (
        <RequireAuth requiredPermission="view_dashboard">
            <PaymentSettingsContent />
        </RequireAuth>
    );
}
