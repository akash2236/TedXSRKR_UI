
import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Globe, Zap } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';
import { cn } from '../lib/utils';

const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
        },
    },
};

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <motion.li 
        className={cn("min-h-[14rem] list-none", area)}
        variants={cardVariants}
    >
      <div className="relative h-full rounded-[1.25rem] border border-gray-800 p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={1}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-[#1a1a1a] p-6 shadow-sm md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-700 bg-dark-charcoal p-2 text-ted-red">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl font-bold text-white">
                {title}
              </h3>
              <p className="font-sans text-sm text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
};


const About: React.FC = () => {
    const infoCards = [
        { icon: <Lightbulb/>, title: 'Ideas Worth Spreading', text: 'TED is a nonprofit devoted to spreading ideas through powerful talks.' },
        { icon: <Users/>, title: 'Community Driven', text: 'TEDx events bring together thinkers and doers in local communities.' },
        { icon: <Globe/>, title: 'Global Impact', text: 'Over 3,000 TEDx events are held annually across 170+ countries.' },
        { icon: <Zap/>, title: 'Inspire Change', text: 'Each talk is a catalyst for innovation, creativity, and action.' },
    ];

    return (
        <section id="about" className="py-20 md:py-32 bg-dark-charcoal">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tighter">
                        What is <span className="text-white bg-ted-red px-2">TEDx</span>?
                    </h2>
                </motion.div>

                <div className="relative max-w-4xl mx-auto">
                     <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={128}
                        inactiveZone={0.1}
                        borderWidth={1}
                        className="rounded-xl"
                    />
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative bg-[#1a1a1a] rounded-xl p-8 md:p-12 border border-gray-800"
                    >
                        <p className="text-gray-300 text-lg leading-relaxed">
                            In the spirit of "ideas worth spreading," TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. At a TEDx event, TED Talks video and live speakers combine to spark deep discussion and connection.
                        </p>
                        <p className="mt-4 text-gray-300 text-lg leading-relaxed">
                            The "x" in TEDx stands for independently organized TED event, licensed by TED.
                        </p>
                    </motion.div>
                </div>
                
                <motion.ul 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-6xl mx-auto"
                    variants={cardContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                     <GridItem
                        area="md:col-span-1 lg:col-span-2"
                        icon={<Lightbulb className="h-6 w-6" />}
                        title="Ideas Worth Spreading"
                        description="TED is a nonprofit devoted to spreading ideas through powerful talks."
                      />
                      <GridItem
                        area="md:col-span-1 lg:col-span-2"
                        icon={<Users className="h-6 w-6" />}
                        title="Community Driven"
                        description="TEDx events bring together thinkers and doers in local communities."
                      />
                      <GridItem
                        area="md:col-span-1 lg:col-span-2"
                        icon={<Globe className="h-6 w-6" />}
                        title="Global Impact"
                        description="Over 3,000 TEDx events are held annually across 170+ countries."
                      />
                      <GridItem
                        area="md:col-span-1 lg:col-span-2"
                        icon={<Zap className="h-6 w-6" />}
                        title="Inspire Change"
                        description="Each talk is a catalyst for innovation, creativity, and action."
                      />
                </motion.ul>
            </div>
        </section>
    );
};

export default About;
