import React from 'react';
import { motion } from 'framer-motion';
import About from '../components/About';
import Stats from '../components/Stats';

const AboutPage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <About />
            <Stats />
        </motion.div>
    );
};

export default AboutPage;
