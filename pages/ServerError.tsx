import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServerError: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                w-[600px] h-[600px] bg-[#E62B1E]/8 rounded-full blur-[200px]" />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* Error Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="mb-8"
                >
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-[#E62B1E]/10 border border-[#E62B1E]/20
                                    flex items-center justify-center mb-6">
                        <AlertTriangle size={56} className="text-[#E62B1E]" />
                    </div>

                    <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text 
                                   bg-gradient-to-r from-[#E62B1E] to-[#ff6b5e]">
                        500
                    </h1>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Server Error
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                        Something went wrong on our end. Our team has been notified and we're working on a fix.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <motion.button
                        onClick={() => window.location.reload()}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-[#E62B1E] text-white 
                                   font-bold rounded-full shadow-[0_8px_30px_rgba(230,43,30,0.4)]
                                   hover:shadow-[0_12px_40px_rgba(230,43,30,0.5)] transition-shadow"
                    >
                        <RefreshCw size={20} />
                        Try Again
                    </motion.button>

                    <Link to="/">
                        <button className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white/20 
                                           text-white font-bold rounded-full hover:border-white/40 
                                           hover:bg-white/5 transition-all">
                            <Home size={20} />
                            Go Home
                        </button>
                    </Link>
                </motion.div>

                {/* Help text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="mt-12 text-gray-500 text-sm"
                >
                    If this issue persists, please contact{' '}
                    <a href="mailto:support@tedxsrkr.com" className="text-[#E62B1E] hover:underline">
                        support@tedxsrkr.com
                    </a>
                </motion.p>
            </div>
        </div>
    );
};

export default ServerError;
