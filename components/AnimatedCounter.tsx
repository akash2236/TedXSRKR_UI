
import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const animation = animate(motionValue, value, {
        duration: 2,
        onUpdate(latest) {
          if (ref.current) {
            ref.current.textContent = Math.round(latest).toLocaleString();
          }
        }
      });
      return animation.stop;
    }
  }, [isInView, value, motionValue]);

  return <span ref={ref}>0</span>;
};

export default AnimatedCounter;
