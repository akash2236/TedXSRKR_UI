
import React from 'react';
import { motion } from 'framer-motion';
import { STATS } from '../constants';
import AnimatedCounter from './AnimatedCounter';

const Stats: React.FC = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section id="stats" className="py-20 md:py-32">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="bg-dark-charcoal border border-gray-800 rounded-2xl p-8 md:p-12"
                >
                    <div className="text-center mb-12">
                        <p className="text-sm font-bold text-ted-red uppercase tracking-widest">Our Institution</p>
                        <h2 className="font-heading mt-2 text-3xl md:text-5xl font-extrabold tracking-tighter">SRKR Engineering College</h2>
                        <p className="mt-6 max-w-3xl mx-auto text-gray-400">
                            Established in 1980, SRKR Engineering College stands as a beacon of technical excellence. Our commitment to holistic education, cutting-edge research, and fostering creativity makes SRKR the perfect host for TEDx — where ideas meet action, and innovation meets inspiration.
                        </p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {STATS.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-ted-red/50 hover:shadow-[0_0_20px_rgba(235,0,40,0.1)]"
                                variants={itemVariants}
                                whileHover={{ y: -10, scale: 1.02 }}
                            >
                                <h3 className="font-heading text-5xl font-extrabold text-ted-red tracking-tighter">
                                    {stat.value === 1 ? stat.suffix : <><AnimatedCounter value={stat.value} />{stat.suffix}</>}
                                </h3>
                                <p className="mt-2 text-gray-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Stats;
