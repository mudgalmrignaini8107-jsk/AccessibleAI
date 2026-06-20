'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const FloatingClouds: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Cloud 1 - Pink Glow */}
      <motion.div
        className="absolute w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-brand-pink/15 blur-[80px] md:blur-[120px]"
        initial={{ x: '-20%', y: '10%' }}
        animate={{
          x: ['-20%', '10%', '-20%'],
          y: ['10%', '25%', '10%'],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Cloud 2 - Lavender Mist */}
      <motion.div
        className="absolute w-[400px] md:w-[700px] h-[400px] md:h-[700px] rounded-full bg-brand-lavender/15 blur-[90px] md:blur-[140px]"
        initial={{ x: '60%', y: '30%' }}
        animate={{
          x: ['60%', '40%', '60%'],
          y: ['30%', '50%', '30%'],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Cloud 3 - Soft Aqua */}
      <motion.div
        className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-sec-aqua/20 blur-[70px] md:blur-[110px]"
        initial={{ x: '10%', y: '70%' }}
        animate={{
          x: ['10%', '30%', '10%'],
          y: ['70%', '60%', '70%'],
          scale: [0.95, 1.1, 0.95],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Cloud 4 - Peach Glow */}
      <motion.div
        className="absolute w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-sec-peach/15 blur-[80px] md:blur-[120px]"
        initial={{ x: '40%', y: '-10%' }}
        animate={{
          x: ['40%', '20%', '40%'],
          y: ['-10%', '10%', '-10%'],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Particles Overlay */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(15)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const delay = Math.random() * 10;
          const duration = Math.random() * 15 + 10;
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{
                width: size,
                height: size,
                left: left,
                top: top,
              }}
              animate={{
                y: [0, -60, 0],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
