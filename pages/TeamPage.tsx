import React from 'react';
import { motion } from 'framer-motion';
import Team from '../components/Team';

const TeamPage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Team />
        </motion.div>
    );
};

export default TeamPage;
