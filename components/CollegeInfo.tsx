import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Award, Users, Calendar, Building2 } from 'lucide-react';

const CollegeInfo: React.FC = () => {
    return (
        <section className="py-20 md:py-28 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        About <span className="text-[#E62B1E]">SRKR Engineering College</span>
                    </h2>
                    <p className="text-gray-400 max-w-3xl mx-auto text-base md:text-lg">
                        A legacy of excellence in technical education since 1980
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
                    {/* College Description */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-[#111111] p-8 md:p-10 rounded-2xl border border-[#222222]"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="text-[#E62B1E]" size={32} />
                            <h3 className="text-2xl md:text-3xl font-bold text-white">Our Legacy</h3>
                        </div>

                        <p className="text-gray-300 leading-relaxed mb-6">
                            Sagi Rama Krishnam Raju Engineering College (SRKR) is one of the premier engineering institutions
                            in Andhra Pradesh, established in 1980. Located in Bhimavaram, the college is Permanently Affiliated to Jawaharlal Nehru Technological University Kakinada (JNTUK).
                        </p>

                        <p className="text-gray-300 leading-relaxed mb-6">
                            With over four decades of excellence in technical education, SRKR has been consistently producing
                            skilled engineers who contribute to society and industry. The college is known for its state-of-the-art
                            infrastructure, experienced faculty, and strong industry connections.
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                { icon: Calendar, label: 'Established', value: '1980' },
                                { icon: Award, label: 'NAAC Grade', value: 'A+' },
                                { icon: Users, label: 'Alumni', value: '10,000+' },
                                { icon: Building2, label: 'Departments', value: '8+' }
                            ].map((stat, index) => (
                                <div key={index} className="bg-[#0A0A0A] p-4 rounded-lg border border-[#222222]">
                                    <stat.icon className="text-[#E62B1E] mb-2" size={24} />
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Location & Contact */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Location Card */}
                        <div className="bg-[#111111] p-8 md:p-10 rounded-2xl border border-[#222222]">
                            <div className="flex items-center gap-3 mb-6">
                                <MapPin className="text-[#E62B1E]" size={28} />
                                <h3 className="text-xl md:text-2xl font-bold text-white">Location</h3>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-300 leading-relaxed">
                                    <strong className="text-white">Sagi Rama Krishnam Raju Engineering College</strong><br />
                                    (Autonomous)<br/>
                                    SRKR Marg, China Amiram<br />
                                    Bhimavaram, West Godavari District<br />
                                    Andhra Pradesh - 534204<br />
                                    India
                                </p>

                                {/* Embedded Map */}
                                <div className="rounded-lg overflow-hidden border border-[#222222] h-64">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.437220550003!2d81.49419201527806!3d16.544456688490985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35ee9892f43c61%3A0x561cb1e68f8ab0b9!2sSRKR%20Engineering%20College!5e0!3m2!1sen!2sin!4v1718399999999"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="SRKR Engineering College Location"
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="bg-[#111111] p-8 md:p-10 rounded-2xl border border-[#222222]">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Contact Information</h3>

                            <div className="space-y-4">
                                <a
                                    href="tel:+918688336822"
                                    className="flex items-center gap-3 text-gray-300 hover:text-[#E62B1E] transition-colors group"
                                >
                                    <Phone className="text-[#E62B1E] group-hover:scale-110 transition-transform" size={20} />
                                    <span>8688336822 - Preethi</span>
                                </a>

                                <a
                                    href="tel:+918143304194"
                                    className="flex items-center gap-3 text-gray-300 hover:text-[#E62B1E] transition-colors group"
                                >
                                    <Phone className="text-[#E62B1E] group-hover:scale-110 transition-transform" size={20} />
                                    <span>8143304194 - Hanidhar</span>
                                </a>

                                <a
                                    href="mailto:tedxsrkr@srkrec.ac.in"
                                    className="flex items-center gap-3 text-gray-300 hover:text-[#E62B1E] transition-colors group"
                                >
                                    <Mail className="text-[#E62B1E] group-hover:scale-110 transition-transform" size={20} />
                                    <span>tedxsrkr@srkrec.ac.in</span>
                                </a>

                                <a
                                    href="https://srkrec.edu.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-gray-300 hover:text-[#E62B1E] transition-colors group"
                                >
                                    <Globe className="text-[#E62B1E] group-hover:scale-110 transition-transform" size={20} />
                                    <span>www.srkrec.edu.in</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CollegeInfo;
