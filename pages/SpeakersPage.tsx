import React from 'react';
import { motion } from 'framer-motion';
import Speakers from '../components/Speakers';

const SpeakersPage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Speakers />
        </motion.div>
    );
};

export default SpeakersPage;
