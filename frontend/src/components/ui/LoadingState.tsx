'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingStateProps {
  messages?: string[];
  intervalMs?: number;
}

const DEFAULT_MESSAGES = [
  "AI is scanning for entrances...",
  "Detecting wheelchair ramps...",
  "Analyzing sidewalk conditions...",
  "Recalculating Accessibility Index...",
  "Checking verified community reviews...",
  "Mapping accessible pathways..."
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  messages = DEFAULT_MESSAGES,
  intervalMs = 3000,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [messages, intervalMs]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      {/* Flapping/Bouncing Butterfly Loader */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Glowing aura */}
        <motion.div
          className="absolute w-20 h-20 bg-brand-pink/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Animated butterfly SVG */}
        <motion.svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Left Wing */}
          <motion.path
            d="M50 50 C20 20, 10 40, 20 60 C30 80, 45 65, 50 50 Z"
            fill="url(#leftWingGradient)"
            style={{ originX: "50px", originY: "50px" }}
            animate={{
              rotateY: [0, 60, 0]
            }}
            transition={{
              duration: 0.25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          {/* Right Wing */}
          <motion.path
            d="M50 50 C80 20, 90 40, 80 60 C70 80, 55 65, 50 50 Z"
            fill="url(#rightWingGradient)"
            style={{ originX: "50px", originY: "50px" }}
            animate={{
              rotateY: [0, -60, 0]
            }}
            transition={{
              duration: 0.25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          {/* Body */}
          <rect x="47" y="30" width="6" height="40" rx="3" fill="#B388FF" />
          <line x1="48" y1="30" x2="42" y2="20" stroke="#B388FF" strokeWidth="2" />
          <line x1="52" y1="30" x2="58" y2="20" stroke="#B388FF" strokeWidth="2" />

          {/* Gradients */}
          <defs>
            <linearGradient id="leftWingGradient" x1="15" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6EC7" />
              <stop offset="100%" stopColor="#B388FF" />
            </linearGradient>
            <linearGradient id="rightWingGradient" x1="85" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6EC6FF" />
              <stop offset="100%" stopColor="#B388FF" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Cycling Text Messages with Smooth Fade */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-sm md:text-base text-slate-600 font-semibold tracking-wide"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      
      {/* Simulated progress indicator bar */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
        <motion.div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-brand-pink via-brand-lavender to-brand-sky"
          initial={{ left: "-100%", width: "100%" }}
          animate={{ left: "100%" }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};
