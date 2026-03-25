import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Feedback } from '../types';

const FeedbackForm: React.FC = () => {
    const [formData, setFormData] = useState<Feedback>({
        name: '',
        email: '',
        phone: '',
        college: 'SRKR Engineering College',
        year_of_study: '',
        department: '',
        rating: 0,
        message: '',
        event_attended: 'TEDxSRKR2026'
    });

    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.rating || !formData.message) {
            setErrorMessage('Please fill in all required fields');
            setSubmitStatus('error');
            return;
        }

        if (formData.rating < 1 || formData.rating > 5) {
            setErrorMessage('Please select a rating');
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit feedback');
            }

            setSubmitStatus('success');
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                college: '',
                year_of_study: '',
                department: '',
                rating: 0,
                message: '',
                event_attended: ''
            });

            // Hide success message after 5 seconds
            setTimeout(() => {
                setSubmitStatus('idle');
            }, 5000);

        } catch (error) {
            console.error('Feedback submission error:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feedback');
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 md:py-28 bg-[#0A0A0A]">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Share Your <span className="text-[#E62B1E]">Feedback</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                        We value your thoughts and experiences. Help us improve by sharing your feedback.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <AnimatePresence mode="wait">
                        {submitStatus === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-12 text-center"
                            >
                                <CheckCircle className="mx-auto mb-6 text-green-500" size={64} />
                                <h3 className="text-3xl font-bold text-white mb-4">Thank You!</h3>
                                <p className="text-gray-300 text-lg mb-2">
                                    Your feedback has been successfully submitted.
                                </p>
                                <p className="text-gray-400">
                                    We appreciate you taking the time to share your thoughts with us.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="bg-[#111111] p-8 md:p-12 rounded-2xl border border-[#222222]"
                            >
                                {/* Error Message */}
                                {submitStatus === 'error' && (
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                                        <AlertCircle className="text-red-500" size={20} />
                                        <p className="text-red-400">{errorMessage}</p>
                                    </div>
                                )}

                                {/* Name and Email Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label htmlFor="name" className="block text-white font-semibold mb-2">
                                            Name <span className="text-[#E62B1E]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-white font-semibold mb-2">
                                            Email <span className="text-[#E62B1E]">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="mb-6">
                                    <label htmlFor="phone" className="block text-white font-semibold mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                        placeholder="+91 1234567890"
                                    />
                                </div>

                                {/* College, Year, Department Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label htmlFor="college" className="block text-white font-semibold mb-2">
                                            College
                                        </label>
                                        <input
                                            type="text"
                                            id="college"
                                            name="college"
                                            value={formData.college}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                            placeholder="SRKR"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="year_of_study" className="block text-white font-semibold mb-2">
                                            Year
                                        </label>
                                        <select
                                            id="year_of_study"
                                            name="year_of_study"
                                            value={formData.year_of_study}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="Alumni">Alumni</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="department" className="block text-white font-semibold mb-2">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            id="department"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                            placeholder="CSE, ECE, etc."
                                        />
                                    </div>
                                </div>

                                {/* Event Attended */}
                                <div className="mb-6">
                                    <label htmlFor="event_attended" className="block text-white font-semibold mb-2">
                                        Event Attended (if applicable)
                                    </label>
                                    <input
                                        type="text"
                                        id="event_attended"
                                        name="event_attended"
                                        value={formData.event_attended}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors"
                                        placeholder="TEDxSRKR 2026"
                                    />
                                </div>

                                {/* Rating */}
                                <div className="mb-6">
                                    <label className="block text-white font-semibold mb-3">
                                        Rating <span className="text-[#E62B1E]">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingClick(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={40}
                                                    className={`transition-colors ${star <= (hoveredRating || formData.rating)
                                                            ? 'fill-[#E62B1E] text-[#E62B1E]'
                                                            : 'text-gray-600'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="mb-8">
                                    <label htmlFor="message" className="block text-white font-semibold mb-2">
                                        Your Feedback <span className="text-[#E62B1E]">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#E62B1E] transition-colors resize-none"
                                        placeholder="Share your thoughts, suggestions, or experiences..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#E62B1E] hover:bg-[#c41f15] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Feedback</span>
                                            <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

export default FeedbackForm;
