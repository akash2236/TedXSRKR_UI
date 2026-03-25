/**
 * TeamMemberCard - Fixed to prevent nested <a> tags
 * Social links are now buttons that programmatically navigate
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Instagram } from 'lucide-react';

// ============================================
// Types
// ============================================

interface TeamMemberCardProps {
    id: string;
    name: string;
    role: string;
    image: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    isOpenPosition?: boolean;
}

// ============================================
// Component
// ============================================

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
    id,
    name,
    role,
    image,
    linkedinUrl,
    instagramUrl,
    isOpenPosition = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const hasSocialLinks = linkedinUrl || instagramUrl;

    // Handle social link click without nesting anchors
    const handleSocialClick = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Open position placeholder
    if (isOpenPosition) {
        return (
            <div className="text-center">
                <div className="aspect-[3/4] w-full bg-[#1a1a1a] rounded-lg mb-5 flex items-center justify-center border-2 border-dashed border-[#333]">
                    <span className="text-5xl text-[#E62B1E]/40">+</span>
                </div>
                <h3 className="text-lg font-bold text-[#E62B1E] uppercase tracking-wide">
                    {role}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Open Position</p>
            </div>
        );
    }

    return (
        <motion.div
            className="text-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Image Container - Clickable */}
            <Link to={`/team/${id}`} className="block group">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg mb-5 cursor-pointer">
                    {/* Photo */}
                    <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top grayscale hover:grayscale-0 group-hover:grayscale-0 transition-all duration-500 ease-out"
                    />

                    {/* Social Icons - Using buttons instead of anchor tags */}
                    <AnimatePresence>
                        {isHovered && hasSocialLinks && (
                            <motion.div
                                className="absolute top-3 right-3 flex flex-col gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {linkedinUrl && (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2, delay: 0.05 }}
                                        onClick={(e) => handleSocialClick(e, linkedinUrl)}
                                        className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        aria-label={`${name} on LinkedIn`}
                                    >
                                        <Linkedin size={16} strokeWidth={1.5} />
                                    </motion.button>
                                )}
                                {instagramUrl && (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2, delay: 0.12 }}
                                        onClick={(e) => handleSocialClick(e, instagramUrl)}
                                        className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        aria-label={`${name} on Instagram`}
                                    >
                                        <Instagram size={16} strokeWidth={1.5} />
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TEDxSRKR Label */}
                    <div className="absolute top-0 left-0 bg-[#E62B1E] text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">
                        TEDxSRKR
                    </div>
                </div>
            </Link>

            {/* Name - Clickable */}
            <Link to={`/team/${id}`}>
                <h3 className="text-lg font-bold text-[#E62B1E] uppercase tracking-wide hover:text-white transition-colors">
                    {name}
                </h3>
            </Link>

            {/* Role */}
            <p className="text-sm text-gray-500 mt-1">{role}</p>
        </motion.div>
    );
};

export default TeamMemberCard;
