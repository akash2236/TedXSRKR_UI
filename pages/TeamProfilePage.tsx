/**
 * TeamProfilePage - Individual Team Member Profile
 * 
 * Layout: Editorial, content-first, minimal
 * Sections: Hero, About, Responsibilities, Contact
 */

import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Linkedin, Instagram, Mail } from 'lucide-react';
import { TEAM_CATEGORIES } from '../constants';
import { TeamMember } from '../types';

// ============================================
// Helper: Find member by slug (id)
// ============================================

function findMemberBySlug(slug: string): { member: TeamMember; categoryName: string } | null {
    for (const category of TEAM_CATEGORIES) {
        const member = category.members.find((m) => m.id === slug);
        if (member) {
            return { member, categoryName: category.name };
        }
    }
    return null;
}

// ============================================
// Component
// ============================================

const TeamProfilePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    // Handle invalid slug
    if (!slug) {
        return <Navigate to="/team" replace />;
    }

    const result = findMemberBySlug(slug);

    // Member not found
    if (!result) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Member Not Found</h1>
                    <p className="text-gray-500 mb-8">The team member you're looking for doesn't exist.</p>
                    <Link
                        to="/team"
                        className="inline-flex items-center gap-2 text-[#E62B1E] hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Team
                    </Link>
                </div>
            </div>
        );
    }

    const { member, categoryName } = result;

    return (
        <main className="min-h-screen bg-[#0A0A0A]">
            {/* Back Navigation */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        to="/team"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Team
                    </Link>
                </motion.div>
            </div>

            {/* Hero Section */}
            <section className="container mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Portrait */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 overflow-hidden rounded-lg group">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover object-top"
                            />
                            {/* TEDxSRKR Label */}
                            <div className="absolute top-4 left-4 flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-20 pointer-events-none border border-white/10">
                                <span className="text-[#E62B1E] font-extrabold text-sm tracking-tighter">TEDx</span>
                                <span className="text-white font-bold text-sm tracking-wide">SRKR</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:pt-8"
                    >
                        {/* Category Badge */}
                        <p className="text-[#E62B1E] text-sm font-medium uppercase tracking-wider mb-4">
                            {categoryName}
                        </p>

                        {/* Name */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-3">
                            {member.name}
                        </h1>

                        {/* Role */}
                        <p className="text-xl md:text-2xl text-gray-400 mb-8">
                            {member.role}
                        </p>

                        {/* Red Accent Line */}
                        <div className="w-16 h-1 bg-[#E62B1E] mb-8" />

                        {/* Quote (if available) */}
                        {member.quote && (
                            <blockquote className="text-gray-400 text-lg italic border-l-2 border-[#333] pl-6 mb-8">
                                "{member.quote}"
                            </blockquote>
                        )}

                        {/* Contact Links */}
                        <div className="flex flex-wrap gap-4">
                            {member.linkedin && (
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                    aria-label={`${member.name} on LinkedIn`}
                                >
                                    <Linkedin size={18} />
                                    LinkedIn
                                </a>
                            )}
                            {member.instagram && (
                                <a
                                    href={member.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                    aria-label={`${member.name} on Instagram`}
                                >
                                    <Instagram size={18} />
                                    Instagram
                                </a>
                            )}
                            {member.email && (
                                <a
                                    href={`mailto:${member.email}`}
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                    aria-label={`Email ${member.name}`}
                                >
                                    <Mail size={18} />
                                    {member.email}
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            {member.bio && (
                <section className="container mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            About
                        </h2>
                        <div className="w-10 h-[3px] bg-[#E62B1E] mb-6" />
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {member.bio}
                        </p>
                    </motion.div>
                </section>
            )}

            {/* Responsibilities Section */}
            {member.responsibilities && member.responsibilities.length > 0 && (
                <section className="container mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Responsibilities
                        </h2>
                        <div className="w-10 h-[3px] bg-[#E62B1E] mb-6" />
                        <ul className="space-y-3">
                            {member.responsibilities.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3 text-gray-400"
                                >
                                    <span className="text-[#E62B1E] mt-1.5">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </section>
            )}

            {/* Bottom Spacer */}
            <div className="h-16 md:h-24" />
        </main>
    );
};

export default TeamProfilePage;
