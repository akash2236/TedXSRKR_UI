import React from 'react';
import { motion } from 'framer-motion';
import Schedule from '../components/Schedule';

const SchedulePage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Schedule />
        </motion.div>
    );
};

export default SchedulePage;
