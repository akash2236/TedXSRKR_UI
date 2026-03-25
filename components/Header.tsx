import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const location = useLocation();
    const activeSection = location.pathname === '/' ? 'home' : location.pathname.substring(1);

    // Get admin auth state (safely handles when context is not available)
    const adminAuth = useAdminAuth();
    const isAdminLoggedIn = adminAuth?.isAuthenticated ?? false;
    const adminUser = adminAuth?.adminUser;
    const handleLogout = adminAuth?.logout;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
            const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setAdminDropdownOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Speakers', path: '/speakers' },
        { name: 'Watch', path: '/talks' },
        { name: 'Schedule', path: '/schedule' },
        { name: 'Team', path: '/team' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'About', path: '/about' }
    ];

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10'
                    : 'py-4 md:py-5 bg-transparent'
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Scroll Progress Bar */}
                <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#E62B1E] to-[#ff4d4d] origin-left"
                    style={{
                        scaleX: scrollProgress,
                        width: '100%'
                    }}
                />

                <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                    {/* TEDx Logo - Official TEDxSRKR Typography */}
                    <Link
                        to="/"
                        className="z-10 group flex flex-col"
                        aria-label="TEDxSRKR - Home"
                    >
                        <div className="flex items-baseline leading-none">
                            <span className="text-[#E62B1E] font-black text-2xl md:text-[28px] tracking-tight" style={{ letterSpacing: '-1.5px' }}>
                                TED
                            </span>
                            <span className="text-[#E62B1E] font-bold text-sm md:text-base" style={{ position: 'relative', top: '-6px', marginLeft: '1px' }}>
                                x
                            </span>
                            <span className="text-white font-black text-2xl md:text-[28px] tracking-tight" style={{ letterSpacing: '-1px', marginLeft: '2px' }}>
                                SRKR
                            </span>
                        </div>
                        <span className="text-[11px] md:text-[12.5px] text-white/60 italic tracking-tight mt-0.5" style={{ letterSpacing: '0.3px' }}>
                            <span className="text-[#E62B1E] not-italic font-bold">x</span>= independently organized TED event
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        {navLinks.map((link) => {
                            const isActive = activeSection === (link.path === '/' ? 'home' : link.path.substring(1));
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-semibold tracking-wide transition-all duration-300 relative pb-2 ${isActive ? 'text-[#E62B1E]' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E62B1E]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Admin Login/Dashboard Button */}
                        {isAdminLoggedIn ? (
                            <div className="relative">
                                <motion.button
                                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                                    className="inline-flex items-center justify-center gap-2 h-10 px-4 border border-white/20 text-white/80 font-medium text-sm rounded-full transition-all duration-300 hover:border-white/40 hover:text-white hover:bg-white/5"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    aria-label="Admin menu"
                                    aria-expanded={adminDropdownOpen}
                                >
                                    <LayoutDashboard size={16} />
                                    <span className="hidden lg:inline">{adminUser?.name || 'Admin'}</span>
                                </motion.button>

                                {/* Admin Dropdown */}
                                <AnimatePresence>
                                    {adminDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-white/10">
                                                <p className="text-sm font-medium text-white truncate">{adminUser?.name}</p>
                                                <p className="text-xs text-white/50 capitalize">{adminUser?.role}</p>
                                            </div>
                                            <Link
                                                to="/admin"
                                                onClick={() => setAdminDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setAdminDropdownOpen(false);
                                                    handleLogout?.();
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    to="/admin/login"
                                    className="inline-flex items-center justify-center gap-2 h-10 px-4 border border-white/20 text-white/70 font-medium text-sm rounded-full transition-all duration-300 hover:border-white/40 hover:text-white hover:bg-white/5"
                                    aria-label="Admin login"
                                >
                                    <Shield size={16} />
                                    <span className="hidden lg:inline">Admin</span>
                                </Link>
                            </motion.div>
                        )}

                        {/* Get Tickets Button */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 h-10 px-6 bg-[#E62B1E] text-white font-bold text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(230,43,30,0.5)] hover:bg-[#cc2020]"
                            >
                                Get Tickets
                            </Link>
                        </motion.div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-white p-2 hover:text-[#E62B1E] transition-colors z-10"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.nav
                            className="absolute top-0 right-0 h-full w-[280px] bg-[#0A0A0A] border-l border-white/10 pt-20 px-6"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="flex flex-col space-y-2">
                                {navLinks.map((link, index) => {
                                    const isActive = activeSection === (link.path === '/' ? 'home' : link.path.substring(1));
                                    return (
                                        <motion.div
                                            key={link.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={link.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`block py-3 px-4 rounded-lg text-lg font-medium transition-colors ${isActive
                                                    ? 'text-[#E62B1E] bg-[#E62B1E]/10'
                                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {link.name}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Mobile CTA */}
                            <motion.div
                                className="mt-8 space-y-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center py-4 bg-[#E62B1E] text-white font-bold rounded-xl transition-all hover:bg-[#cc2020]"
                                >
                                    Get Tickets
                                </Link>

                                {/* Admin Button in Mobile */}
                                {isAdminLoggedIn ? (
                                    <>
                                        <Link
                                            to="/admin"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 text-white/80 font-medium rounded-xl transition-all hover:border-white/40 hover:bg-white/5"
                                        >
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                handleLogout?.();
                                            }}
                                            className="flex items-center justify-center gap-2 w-full py-3 border border-red-500/30 text-red-400 font-medium rounded-xl transition-all hover:border-red-500/50 hover:bg-red-500/10"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/admin/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 text-white/70 font-medium rounded-xl transition-all hover:border-white/40 hover:bg-white/5"
                                    >
                                        <Shield size={18} />
                                        Admin Login
                                    </Link>
                                )}
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;