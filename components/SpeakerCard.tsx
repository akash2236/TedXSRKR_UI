
import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Speaker } from '../types';
import { GlowingEffect } from './ui/glowing-effect';

const SpeakerCard: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
            }}
            className="bg-dark-charcoal p-6 rounded-2xl border border-gray-800 text-center relative overflow-hidden group"
        >
            <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
            />
            <div style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}>
                <div className="aspect-square bg-[#1a1a1a] rounded-lg mb-6 overflow-hidden relative border-2 border-gray-700">
                    <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{speaker.name}</h3>
                <p className="text-gray-400">{speaker.title}</p>
                <p className="mt-2 text-ted-red font-semibold">{speaker.topic}</p>
            </div>
        </motion.div>
    );
};

export default SpeakerCard;
