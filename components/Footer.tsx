import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    const socialLinks = [
        { icon: Instagram, href: 'https://www.instagram.com/tedxsrkr/', label: 'Instagram' },
        { icon: Mail, href: 'mailto:tedxsrkr@srkrec.ac.in', label: 'Email' },
        { icon: Linkedin, href: 'https://www.linkedin.com/company/tedxrkr/', label: 'LinkedIn' },
        { icon: Youtube, href: 'http://www.youtube.com/@TEDXSRKR', label: 'YouTube' }
    ];

    return (
        <footer className="bg-[#0A0A0A] border-t border-[#1a1a1a] py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6 text-center">
                {/* Social Icons - Fixed: Larger with containers */}
                <div className="flex justify-center gap-4 md:gap-6 mb-8">
                    {socialLinks.map((social, i) => (
                        <motion.a
                            key={i}
                            href={social.href}
                            aria-label={social.label}
                            className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-[#E62B1E] hover:border-[#E62B1E]/50 hover:bg-[#E62B1E]/10 transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <social.icon size={20} />
                        </motion.a>
                    ))}
                </div>

                {/* Logo and Copyright */}
                <p className="text-gray-300 font-medium text-base">
                    © {new Date().getFullYear()}{' '}
                    <span className="text-white font-bold tracking-tight">
                        TED<span className="text-[#E62B1E]">x</span>SRKR
                    </span>
                </p>

                {/* License Text - Fixed: Smaller font */}
                <p className="text-gray-500 text-xs md:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                    This independent TEDx event is operated under license from TED.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
