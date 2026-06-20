'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  duration?: number;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  className,
  id,
  delay = 0,
  duration = 0.8,
}) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.8, 0.25, 1], // Smooth cubic-bezier
      }}
      className={cn('w-full py-12 md:py-20 relative', className)}
    >
      {children}
    </motion.section>
  );
};
