import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, AlertTriangle, CreditCard, Wallet, Clock } from 'lucide-react';
import { getSupabase } from '../lib/supabase-browser';

// ============================================
// Offline Payees - Team members who can collect payments
// ============================================
const OFFLINE_PAYEES = [
    { name: 'A. Preethi', phone: '+91 XXXXX XXXXX', role: 'Organizer' },
    { name: 'K. Hanidhar', phone: '+91 XXXXX XXXXX', role: 'Co-Organizer' },
    { name: 'V.Akash', phone: '+91 XXXXX XXXXX', role: 'Tech Lead' },
];

interface FormData {
    name: string;
    email: string;
    phone: string;
    college: string;
    year: string;
    department: string;
    paymentMethod: 'online' | 'offline';
    payeeName: string;
    transactionId: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    college?: string;
    year?: string;
    department?: string;
    payeeName?: string;
    transactionId?: string;
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        college: 'SRKR Engineering College',
        year: '',
        department: '',
        paymentMethod: 'online',
        payeeName: '',
        transactionId: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Payment settings fetched from Supabase (admin-configurable)
    const [paymentSettings, setPaymentSettings] = useState({
        upi_id: '8688336822-2@ybl',
        qr_image_url: '/payment.jpeg',
        amount: 200,
    });

    useEffect(() => {
        (async () => {
            try {
                const supabase = getSupabase();
                if (!supabase) return;
                const { data } = await supabase
                    .from('event_settings')
                    .select('value')
                    .eq('key', 'payment_settings')
                    .single();
                if (data?.value) {
                    setPaymentSettings(prev => ({ ...prev, ...data.value }));
                }
            } catch {
                // use defaults on error
            }
        })();
    }, []);

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.length < 2) return 'Name must be at least 2 characters';
                if (value.length > 100) return 'Name cannot exceed 100 characters';
                if (!/^[a-zA-Z\s.'"-]+$/.test(value)) return 'Name contains invalid characters';
                return undefined;
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
                if (value.length > 254) return 'Email address too long';
                return undefined;
            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                if (!/^[+]?[\d\s()-]*\d[\d\s()-]*$/.test(value)) return 'Please enter a valid phone number';
                if (value.length > 20) return 'Phone number too long';
                return undefined;
            case 'payeeName':
                if (formData.paymentMethod === 'offline' && !value.trim()) {
                    return 'Please select a payee for offline payment';
                }
                return undefined;
            default:
                return undefined;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        const requiredFields: (keyof FormData)[] = ['name', 'email', 'phone'];
        requiredFields.forEach((key) => {
            const error = validateField(key, formData[key] as string);
            if (error) {
                newErrors[key as keyof FormErrors] = error;
                isValid = false;
            }
        });

        if (formData.paymentMethod === 'offline') {
            const payeeError = validateField('payeeName', formData.payeeName);
            if (payeeError) {
                newErrors.payeeName = payeeError;
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setSubmitError(null);
        if (touched[id]) {
            const error = validateField(id, value);
            setErrors(prev => ({ ...prev, [id]: error }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setTouched(prev => ({ ...prev, [id]: true }));
        const error = validateField(id, value);
        setErrors(prev => ({ ...prev, [id]: error }));
    };

    const isFormEmpty = !formData.name.trim() || !formData.email.trim() || !formData.phone.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const allTouched: Record<string, boolean> = {};
        Object.keys(formData).forEach(key => { allTouched[key] = true; });
        setTouched(allTouched);

        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
            firstErrorField?.focus();
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Connection error. Please try again.');

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone?.trim() || null,
                college: formData.college?.trim() || null,
                year: formData.year || null,
                department: formData.department?.trim() || null,
                ticket_type: 'standard',
                payment_method: formData.paymentMethod,
                payment_status: 'pending',
                payee_name: formData.paymentMethod === 'offline' ? formData.payeeName : null,
                transaction_id: formData.paymentMethod === 'online' ? formData.transactionId?.trim() || null : null,
            };

            // ── Step 1: Insert directly into Supabase (always works, even on static host) ──
            const { data: insertedRow, error } = await supabase
                .from('registrations')
                .insert(payload)
                .select('id')
                .single();

            if (error) {
                if (error.code === '23505') throw new Error('This email is already registered.');
                throw new Error('Registration failed. Please try again.');
            }

            setRegistrationId(insertedRow.id);
            setIsSuccess(true);

            // ── Step 2: Fire /api/register for email sending (best-effort, silent fail on static host) ──
            const API_BASE = import.meta.env.VITE_API_URL || '';
            fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    paymentMethod: formData.paymentMethod,
                    payeeName: payload.payee_name,
                    transactionId: payload.transaction_id,
                    _registrationId: insertedRow.id,
                    _emailOnly: true,
                }),
            }).catch(() => {
                console.log('[Register] Email API not available — email skipped.');
            });

        } catch (err) {
            console.error('Registration error:', err);
            setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = (fieldName: keyof FormErrors) => `
        w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white 
        placeholder:text-gray-500 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:border-transparent
        ${errors[fieldName] && touched[fieldName]
            ? 'border-red-500 bg-red-500/5'
            : 'border-gray-700 hover:border-gray-600'
        }
    `;

    const getTicketPrice = () => '₹200';

    // ============================================
    // Success State
    // ============================================
    if (isSuccess) {
        const isOffline = formData.paymentMethod === 'offline';
        return (
            <section id="register" className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#E62B1E]/10 rounded-full blur-[150px]" />
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="max-w-xl mx-auto text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center border ${isOffline
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-green-500/10 border-green-500/30'
                                }`}
                        >
                            {isOffline ? (
                                <Clock size={48} className="text-yellow-500" />
                            ) : (
                                <CheckCircle2 size={48} className="text-green-500" />
                            )}
                        </motion.div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Registration Pending!
                        </h2>
                        <p className="text-gray-400 text-lg mb-4">
                            Your registration is pending payment verification. Once our team confirms your payment (UPI or Cash), you'll receive a confirmation email.
                        </p>
                        {registrationId && (
                            <p className="text-gray-500 text-sm mb-8">
                                Registration ID: <code className="text-[#E62B1E]">{registrationId}</code>
                            </p>
                        )}

                        <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-gray-800 mb-8">
                            <h3 className="text-lg font-semibold text-white mb-3">
                                {isOffline ? 'Next Steps for Offline Payment' : "What's Next?"}
                            </h3>
                            <ul className="text-gray-400 text-sm text-left space-y-2">
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">1.</span>
                                        {isOffline ? (
                                            <>Pay <strong className="text-white">{getTicketPrice()}</strong> to <strong className="text-white">{formData.payeeName}</strong></>
                                        ) : (
                                            <>Complete the UPI payment of <strong className="text-white">{getTicketPrice()}</strong></>
                                        )}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">2.</span>
                                        Our team will verify your transaction/payment in the system
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">3.</span>
                                        You'll receive a confirmation email at <strong className="text-white">{formData.email}</strong>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500">4.</span>
                                        Save your registration ID for check-in
                                    </li>
                                </>
                            </ul>
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-8 py-4 bg-[#E62B1E] text-white font-bold rounded-full 
                                       hover:bg-[#ff4436] transition-all shadow-[0_8px_30px_rgba(230,43,30,0.4)]"
                        >
                            Back to Home
                        </button>
                    </motion.div>
                </div>
            </section>
        );
    }

    // ============================================
    // Registration Form
    // ============================================
    return (
        <section id="register" className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E62B1E]/8 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E62B1E]/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-4 py-2 mb-6 text-xs font-bold uppercase tracking-[0.2em]
                                     text-[#E62B1E] bg-[#E62B1E]/10 rounded-full border border-[#E62B1E]/20">
                        Join Us
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        Secure Your <span className="text-[#E62B1E]">Spot</span>
                    </h2>
                    <p className="max-w-xl mx-auto text-gray-400 text-lg">
                        Be part of TEDxSRKR 2026. Limited seats available for an unforgettable experience.
                    </p>
                </motion.div>

                <motion.div
                    className="mt-12 max-w-2xl mx-auto rounded-3xl overflow-hidden"
                    style={{
                        background: 'rgba(18, 18, 18, 0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="p-8 md:p-12">
                        {/* Submit Error Banner */}
                        <AnimatePresence>
                            {submitError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                                >
                                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-left">
                                        <p className="text-red-400 text-sm font-medium">Registration Failed</p>
                                        <p className="text-red-300/80 text-sm mt-1">{submitError}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left" noValidate>
                            {/* ---- Personal Details ---- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                                        Full Name <span className="text-[#E62B1E]">*</span>
                                    </label>
                                    <input
                                        type="text" id="name" placeholder="John Doe"
                                        value={formData.name} onChange={handleChange} onBlur={handleBlur}
                                        className={inputClasses('name')}
                                        aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                                    />
                                    <AnimatePresence>
                                        {errors.name && touched.name && (
                                            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle size={12} />{errors.name}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                                        Email Address <span className="text-[#E62B1E]">*</span>
                                    </label>
                                    <input
                                        type="email" id="email" placeholder="john@example.com"
                                        value={formData.email} onChange={handleChange} onBlur={handleBlur}
                                        className={inputClasses('email')}
                                        aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                                    />
                                    <AnimatePresence>
                                        {errors.email && touched.email && (
                                            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle size={12} />{errors.email}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                                        Phone Number <span className="text-[#E62B1E]">*</span>
                                    </label>
                                    <input
                                        type="tel" id="phone" placeholder="+91 98765 43210"
                                        value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                                        className={inputClasses('phone')}
                                    />
                                    <AnimatePresence>
                                        {errors.phone && touched.phone && (
                                            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle size={12} />{errors.phone}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* College (fixed) */}
                                <div>
                                    <label htmlFor="college" className="block text-sm font-medium text-gray-400 mb-2">
                                        College / Institution
                                    </label>
                                    <input
                                        type="text" id="college" value="SRKR Engineering College"
                                        readOnly disabled
                                        className="w-full bg-[#1a1a1a]/50 border border-gray-700 rounded-xl px-4 py-3.5 text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Year */}
                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                                    <select id="year" value={formData.year} onChange={handleChange} onBlur={handleBlur}
                                        className={`${inputClasses('year')} appearance-none cursor-pointer`}>
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Department */}
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-400 mb-2">Branch</label>
                                    <select id="department" value={formData.department} onChange={handleChange} onBlur={handleBlur}
                                        className={`${inputClasses('department')} appearance-none cursor-pointer`}>
                                        <option value="">Select Branch</option>
                                        <option value="CSE">CSE - Computer Science & Engineering</option>
                                        <option value="AIDS">AIDS - AI & Data Science</option>
                                        <option value="AIML">AIML - AI & Machine Learning</option>
                                        <option value="CSIT">CSIT - CS & Information Technology</option>
                                        <option value="CSBS">CSBS - CS & Business Systems</option>
                                        <option value="CSD">CSD - CS & Design</option>
                                        <option value="IT">IT - Information Technology</option>
                                        <option value="CIC">CIC - Computer Science (Cyber Security)</option>
                                        <option value="MECH">MECH - Mechanical Engineering</option>
                                        <option value="CIVIL">CIVIL - Civil Engineering</option>
                                        <option value="EEE">EEE - Electrical & Electronics</option>
                                        <option value="ECE">ECE - Electronics & Communication</option>
                                        <option value="BBA">BBA - Business Administration</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* ---- Registration Fee ---- */}
                            <div className="p-4 rounded-xl bg-[#E62B1E]/10 border border-[#E62B1E]/30 text-center">
                                <p className="text-sm text-gray-400">Registration Fee</p>
                                <p className="text-3xl font-bold text-[#E62B1E] mt-1">₹200</p>
                            </div>

                            {/* ---- Payment Method ---- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">
                                    Payment Method <span className="text-[#E62B1E]">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Online */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'online', payeeName: '' }))}
                                        className={`p-5 rounded-xl border transition-all duration-200 text-left ${formData.paymentMethod === 'online'
                                            ? 'bg-[#E62B1E]/10 border-[#E62B1E] text-white'
                                            : 'bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <CreditCard size={20} className={formData.paymentMethod === 'online' ? 'text-[#E62B1E]' : 'text-gray-500'} />
                                            <span className="font-semibold">Online Payment</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Pay via UPI. Requires manual verification of Transaction ID.
                                        </p>
                                    </button>

                                    {/* Offline */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'offline', transactionId: '' }))}
                                        className={`p-5 rounded-xl border transition-all duration-200 text-left ${formData.paymentMethod === 'offline'
                                            ? 'bg-yellow-500/10 border-yellow-500 text-white'
                                            : 'bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Wallet size={20} className={formData.paymentMethod === 'offline' ? 'text-yellow-500' : 'text-gray-500'} />
                                            <span className="font-semibold">Offline Payment</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Pay cash to a team member. Requires manual approval.
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* ---- Online Payment Details ---- */}
                            <AnimatePresence>
                                {formData.paymentMethod === 'online' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 rounded-xl bg-[#1a1a1a] border border-gray-700">
                                            <p className="text-sm text-gray-300 mb-3">
                                                Pay <strong className="text-[#E62B1E]">{getTicketPrice()}</strong> via UPI — scan the QR code or use the UPI ID below:
                                            </p>

                                            {/* QR Code */}
                                            <div className="flex flex-col items-center mb-4">
                                                <div className="bg-white p-3 rounded-2xl shadow-lg inline-block">
                                                    <img
                                                        src="/payment.jpeg"
                                                        alt="Scan to pay via UPI"
                                                        className="w-44 h-44 object-contain"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <span>📷</span> Scan with any UPI app to pay
                                                </p>

                                                {/* Mobile UPI Intent Button */}
                                                <a
                                                    href={`upi://pay?pa=${paymentSettings.upi_id}&pn=TEDxSRKR&am=${paymentSettings.amount}&cu=INR&tn=TEDxSRKR Registration`}
                                                    className="mt-4 md:hidden flex items-center justify-center gap-2 w-full max-w-[220px] bg-gradient-to-r from-[#E62B1E] to-[#ff4436] text-white px-6 py-3 rounded-full font-semibold shadow-[0_8px_30px_rgba(230,43,30,0.3)] hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Pay with UPI App
                                                </a>
                                            </div>

                                            {/* UPI ID */}
                                            <p className="text-xs text-gray-500 mb-1 text-center">Or pay manually to UPI ID:</p>
                                            <div className="bg-[#0A0A0A] rounded-lg p-3 mb-3 font-mono text-sm text-white text-center select-all border border-gray-700">
                                                {paymentSettings.upi_id}
                                            </div>

                                            <p className="text-xs text-gray-500 mb-3">
                                                After payment, enter the UPI Transaction ID below (optional but recommended)
                                            </p>
                                            <input
                                                type="text" id="transactionId"
                                                placeholder="e.g. TXN123456789"
                                                value={formData.transactionId}
                                                onChange={handleChange}
                                                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-xl px-4 py-3 text-white 
                                                           placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:border-transparent"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ---- Offline Payee Selection ---- */}
                            <AnimatePresence>
                                {formData.paymentMethod === 'offline' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 rounded-xl bg-[#1a1a1a] border border-yellow-500/30">
                                            <p className="text-sm text-gray-300 mb-3">
                                                Select who you'll pay <strong className="text-yellow-500">{getTicketPrice()}</strong> to:
                                            </p>
                                            <div className="space-y-2">
                                                {OFFLINE_PAYEES.map((payee) => (
                                                    <button
                                                        key={payee.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, payeeName: payee.name }));
                                                            setErrors(prev => ({ ...prev, payeeName: undefined }));
                                                        }}
                                                        className={`w-full p-3 rounded-lg border text-left transition-all ${formData.payeeName === payee.name
                                                            ? 'bg-yellow-500/10 border-yellow-500 text-white'
                                                            : 'bg-[#0A0A0A] border-gray-700 text-gray-400 hover:border-gray-500'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="font-medium text-sm">{payee.name}</span>
                                                                <span className="text-xs text-gray-500 ml-2">({payee.role})</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{payee.phone}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <AnimatePresence>
                                                {errors.payeeName && touched.payeeName && (
                                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle size={12} />{errors.payeeName}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                            <div className="mt-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                                <p className="text-xs text-yellow-400/80">
                                                    <strong>Note:</strong> After registering, pay the amount to the selected team member.
                                                    They will verify your payment and you'll receive a confirmation email once approved.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ---- Submit Button ---- */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting || isFormEmpty}
                                whileHover={{ scale: (isSubmitting || isFormEmpty) ? 1 : 1.02 }}
                                whileTap={{ scale: (isSubmitting || isFormEmpty) ? 1 : 0.98 }}
                                className={`w-full font-bold py-4 px-6 rounded-xl text-lg mt-8
                                           transition-all duration-300 flex items-center justify-center gap-3
                                           ${(isSubmitting || isFormEmpty)
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#E62B1E] text-white hover:bg-[#ff4436] shadow-[0_8px_30px_rgba(230,43,30,0.4)]'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : isFormEmpty ? (
                                    'Fill in required fields to register'
                                ) : (
                                    `Register for TEDxSRKR 2026 — ${getTicketPrice()}`
                                )}
                            </motion.button>

                            <p className="text-center text-xs text-gray-500 pt-2">
                                By registering, you agree to our{' '}
                                <a href="#" className="text-[#E62B1E] hover:underline">terms and conditions</a>.
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Register;