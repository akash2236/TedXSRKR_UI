import React from 'react';
import { motion } from 'framer-motion';
import Talks from '../components/Talks';
import { Video } from 'lucide-react';

const TalksPage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="pt-24 md:pt-32 bg-[#0A0A0A] min-h-screen"
        >
            <div className="container mx-auto px-6 mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6"
                >
                    <Video className="w-4 h-4 text-[#E62B1E]" />
                    <span className="text-white/60 text-sm font-medium tracking-wide">Watch the Ideas</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Explore <span className="text-[#E62B1E]">Talks</span></h1>
                <p className="text-white/50 max-w-2xl mx-auto">
                    Dive into our collection of talks from visionary minds. Each video captures an idea worth spreading, delivered live at TEDxSRKR.
                </p>
            </div>
            
            <Talks />
            
            {/* Background blobs for visual depth */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E62B1E]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
            </div>
        </motion.div>
    );
};

export default TalksPage;
