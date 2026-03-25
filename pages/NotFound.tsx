import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#E62B1E]/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#E62B1E]/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* Large 404 Text */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                >
                    <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tight
                                   text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[150px] md:text-[200px] font-black leading-none tracking-tight
                                        text-transparent bg-clip-text bg-gradient-to-r from-[#E62B1E] to-[#ff6b5e]
                                        opacity-30 blur-sm">
                            404
                        </span>
                    </div>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[#E62B1E] text-white 
                                       font-bold rounded-full shadow-[0_8px_30px_rgba(230,43,30,0.4)]
                                       hover:shadow-[0_12px_40px_rgba(230,43,30,0.5)] transition-shadow"
                        >
                            <Home size={20} />
                            Go Home
                        </motion.button>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white/20 
                                   text-white font-bold rounded-full hover:border-white/40 
                                   hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="mt-16 pt-8 border-t border-white/10"
                >
                    <p className="text-gray-500 text-sm mb-4">Popular pages:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Speakers', 'Schedule', 'Team', 'Register'].map((page) => (
                            <Link
                                key={page}
                                to={`/${page.toLowerCase()}`}
                                className="text-gray-400 hover:text-[#E62B1E] transition-colors text-sm"
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
