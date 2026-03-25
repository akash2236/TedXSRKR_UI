import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import CinematicHero from '../components/CinematicHero';
import Countdown from '../components/Countdown';
import CollegeInfo from '../components/CollegeInfo';
import FeedbackForm from '../components/FeedbackForm';
import TicketSection from '../components/TicketSection';

const Home: React.FC = () => {
    return (
        <div className="bg-[#0A0A0A] min-h-screen">
            <CinematicHero />

            {/* Countdown Section - Fixed: More vertical spacing */}
            <div className="pt-24 md:pt-32">
                <Countdown />
            </div>

            {/* Quick Links Section - Fixed: Enhanced cards */}
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
                            Explore <span className="text-[#E62B1E]">TEDxSRKR</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                            Discover our speakers, schedule, and team behind this incredible event.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                        {[
                            { title: 'Our Speakers', desc: 'Meet the visionaries sharing ideas worth spreading', link: '/speakers' },
                            { title: 'Event Schedule', desc: 'Plan your day with our detailed program', link: '/schedule' },
                            { title: 'About TEDx', desc: 'Learn the story behind our independently organized event', link: '/about' }
                        ].map((item, i) => (
                            <Link
                                key={i}
                                to={item.link}
                            >
                                <motion.div
                                    className="group relative bg-[#111111] p-8 md:p-10 rounded-2xl border border-[#222222] hover:border-[#E62B1E]/60 transition-all duration-500 cursor-pointer h-full"
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    style={{
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                                    }}
                                >
                                    {/* Subtle gradient overlay on hover */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E62B1E]/0 to-[#E62B1E]/0 group-hover:from-[#E62B1E]/5 group-hover:to-transparent transition-all duration-500" />

                                    <div className="relative z-10">
                                        <h3 className="font-sans text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#E62B1E] transition-colors duration-300">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                                            {item.desc}
                                        </p>
                                        <div className="flex items-center text-[#E62B1E] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span>Learn more</span>
                                            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ticket Section */}
            <TicketSection />

            {/* College Information Section */}
            <CollegeInfo />

            {/* Feedback Form Section */}
            <FeedbackForm />
        </div>
    );
};

export default Home;
