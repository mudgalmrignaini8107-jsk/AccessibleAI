'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Sparkles, Building2, Trees, Activity } from 'lucide-react';

export const HeroCinematic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up scroll listener for the 500vh scroll distance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Apply spring physics to smooth out mouse wheel ticks
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001
  });

  // Butterfly X and Y coordinates mapping across the screen
  const butterflyX = useTransform(
    smoothProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ['15%', '45%', '25%', '75%', '50%', '50%']
  );
  const butterflyY = useTransform(
    smoothProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ['60%', '65%', '45%', '55%', '40%', '35%']
  );
  
  // Butterfly rotation to face the direction of flight
  const butterflyRotate = useTransform(
    smoothProgress,
    [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1],
    [15, 45, -20, -45, 30, 45, -30, 0, 0, 720] // Spinstar loop on final burst
  );

  // Butterfly scale
  const butterflyScale = useTransform(
    smoothProgress,
    [0, 0.1, 0.8, 0.9, 1],
    [1, 1.4, 1.4, 2.5, 0] // Grows during flight, bursts, then vanishes
  );

  // Background monochrome filter control
  const grayscaleFilter = useTransform(
    smoothProgress,
    [0, 0.8, 1],
    ['grayscale(100%) saturate(10%)', 'grayscale(40%) saturate(60%)', 'grayscale(0%) saturate(140%)']
  );

  // Individual element triggers (Scene opacities and translations)
  const scene1TextOpacity = useTransform(smoothProgress, [0, 0.15, 0.22], [1, 1, 0]);
  const scene2TextOpacity = useTransform(smoothProgress, [0.18, 0.25, 0.38, 0.42], [0, 1, 1, 0]);
  const scene3TextOpacity = useTransform(smoothProgress, [0.38, 0.45, 0.58, 0.62], [0, 1, 1, 0]);
  const scene4TextOpacity = useTransform(smoothProgress, [0.58, 0.65, 0.78, 0.82], [0, 1, 1, 0]);
  const scene5TextOpacity = useTransform(smoothProgress, [0.82, 0.9], [0, 1]);

  // Scene 2 Cafe Ramp slide-in and color highlight
  const cafeColor = useTransform(smoothProgress, [0.15, 0.3], ['rgba(203, 213, 225, 0.3)', 'rgba(255, 110, 199, 0.3)']);
  const rampWidth = useTransform(smoothProgress, [0.2, 0.3], ['0px', '70px']);
  const rampOpacity = useTransform(smoothProgress, [0.2, 0.28], [0, 1]);

  // Scene 3 Park color blooming
  const parkColor = useTransform(smoothProgress, [0.35, 0.5], ['rgba(203, 213, 225, 0.3)', 'rgba(126, 242, 198, 0.35)']);
  const treeScale = useTransform(smoothProgress, [0.4, 0.5], [0.8, 1.15]);

  // Scene 4 Hospital highlight and Score meter
  const hospitalColor = useTransform(smoothProgress, [0.55, 0.7], ['rgba(203, 213, 225, 0.3)', 'rgba(110, 198, 255, 0.35)']);
  const scoreValue = useTransform(smoothProgress, [0.6, 0.75], [0, 92]);
  const scoreRingOffset = useTransform(smoothProgress, [0.6, 0.75], [251, 251 - (251 * 0.92)]);

  // Final Background shift to full pastel rainbow burst
  const rainbowBackground = useTransform(
    smoothProgress,
    [0.8, 0.95],
    [
      'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
      'linear-gradient(135deg, #FFD6A5 0%, #FF9A8B 30%, #DCC6FF 65%, #B8FFF9 100%)'
    ]
  );

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-slate-900">
      {/* Sticky Frame holding the visual stage */}
      <motion.div
        style={{ background: rainbowBackground, filter: grayscaleFilter }}
        className="sticky top-0 left-0 right-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none"
      >
        {/* Sky / Floating Cloud Particles (from CSS) */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-10 left-10 w-24 h-12 bg-white/40 blur-md rounded-full animate-pulse-slow" />
          <div className="absolute top-36 right-20 w-36 h-16 bg-white/40 blur-lg rounded-full animate-float" />
        </div>

        {/* Top Header - Platform Title */}
        <div className="w-full max-w-6xl mx-auto px-6 pt-6 z-10 flex justify-between items-center">
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-brand-pink to-brand-sky bg-clip-text text-transparent">
            ACCESSIBLE AI 🌈
          </span>
          <Badge colorTheme="lavender" variant="glass" className="font-bold">
            Interactive 3D Scroll Story
          </Badge>
        </div>

        {/* Main Stage: Vector City Layout */}
        <div className="relative w-full max-w-6xl h-[55vh] mx-auto px-6 flex items-end justify-between border-b-2 border-slate-300/40 pb-2 mb-10 z-0">
          
          {/* Cafe Building Block (Left) */}
          <motion.div
            style={{ backgroundColor: cafeColor }}
            className="w-[28%] h-[60%] border-2 border-slate-400/60 rounded-t-3xl relative flex flex-col justify-end p-4 transition-all duration-300 glass-panel"
          >
            <div className="absolute top-4 left-4 flex items-center gap-1.5">
              <Building2 className="text-brand-pink h-5 w-5" />
              <span className="text-xs font-bold text-slate-700">CAFE ACCESS</span>
            </div>
            
            {/* Sliding RAMP access */}
            <div className="absolute -right-2 bottom-0 h-4 flex items-end">
              <motion.div
                style={{ width: rampWidth, opacity: rampOpacity }}
                className="h-2 bg-brand-pink rounded-tl-full shadow-sm flex justify-center items-center relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-brand-pink">RAMP</div>
              </motion.div>
            </div>
            <div className="h-6 w-12 border-2 border-slate-400/50 rounded-t-lg mx-auto" />
          </motion.div>

          {/* Park Section (Center-Left) */}
          <motion.div
            style={{ backgroundColor: parkColor }}
            className="w-[22%] h-[40%] border-2 border-slate-400/60 rounded-t-2xl relative flex items-center justify-center transition-all duration-300 glass-panel"
          >
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <Trees className="text-brand-mint h-5 w-5" />
              <span className="text-xs font-bold text-slate-700">PARK PATHS</span>
            </div>

            {/* Tree Blooming */}
            <motion.div
              style={{ scale: treeScale }}
              className="w-16 h-16 rounded-full bg-brand-mint/60 border-2 border-brand-mint flex items-center justify-center shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-300/50" />
            </motion.div>
          </motion.div>

          {/* Hospital Building Block (Right) */}
          <motion.div
            style={{ backgroundColor: hospitalColor }}
            className="w-[32%] h-[75%] border-2 border-slate-400/60 rounded-t-[2.5rem] relative flex flex-col justify-between p-6 transition-all duration-300 glass-panel"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="text-brand-sky h-5 w-5" />
                <span className="text-xs font-bold text-slate-700">HOSPITAL HUB</span>
              </div>
              
              {/* Circular Score Gauge */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="20" stroke="#CBD5E1" strokeWidth="4" fill="transparent" />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="20"
                    stroke="#6EC6FF"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="251"
                    style={{ strokeDashoffset: scoreRingOffset }}
                  />
                </svg>
                <div className="absolute text-[10px] font-extrabold text-slate-800">
                  <motion.span>
                    {scoreValue}
                  </motion.span>%
                </div>
              </div>
            </div>

            <div className="w-full h-16 border-2 border-dashed border-slate-400/40 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500">
              ELEVATOR ACTIVE
            </div>
          </motion.div>

          {/* The Magical Glowing Butterfly */}
          <motion.div
            style={{
              x: butterflyX,
              y: butterflyY,
              rotate: butterflyRotate,
              scale: butterflyScale,
            }}
            className="absolute w-12 h-12 pointer-events-none z-30"
          >
            <svg
              className="w-full h-full drop-shadow-[0_0_12px_rgba(179,136,255,0.9)] animate-butterfly-flap"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Wing */}
              <path
                d="M50 50 C20 10, 5 30, 15 65 C25 85, 45 70, 50 50 Z"
                fill="url(#flyLeftGrad)"
              />
              {/* Right Wing */}
              <path
                d="M50 50 C80 10, 95 30, 85 65 C75 85, 55 70, 50 50 Z"
                fill="url(#flyRightGrad)"
              />
              {/* Body */}
              <rect x="47" y="35" width="6" height="35" rx="3" fill="#DCC6FF" />
              <circle cx="50" cy="32" r="3" fill="#DCC6FF" />
              <line x1="48" y1="32" x2="40" y2="20" stroke="#DCC6FF" strokeWidth="2" />
              <line x1="52" y1="32" x2="60" y2="20" stroke="#DCC6FF" strokeWidth="2" />

              <defs>
                <linearGradient id="flyLeftGrad" x1="10" y1="20" x2="50" y2="70">
                  <stop offset="0%" stopColor="#FF6EC7" />
                  <stop offset="100%" stopColor="#B388FF" />
                </linearGradient>
                <linearGradient id="flyRightGrad" x1="90" y1="20" x2="50" y2="70">
                  <stop offset="0%" stopColor="#6EC6FF" />
                  <stop offset="100%" stopColor="#B388FF" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Butterfly Particle Sparkle Aura */}
            <div className="absolute inset-0 rounded-full bg-brand-pink/20 blur-md animate-pulse -z-10" />
          </motion.div>
        </div>

        {/* Text Story Overlay Center */}
        <div className="w-full max-w-4xl mx-auto px-6 h-[25vh] relative flex justify-center items-start text-center z-10 pb-8">
          
          {/* Scene 1 Story */}
          <motion.div style={{ opacity: scene1TextOpacity }} className="absolute inset-x-0 top-0">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
              A World out of Reach
            </h2>
            <p className="text-base text-slate-600 font-semibold max-w-xl mx-auto leading-relaxed">
              Quiet, grey, and filled with barriers. For many, navigating public spaces is an uncertain journey of stairs, missing ramps, and obstacles.
            </p>
            <div className="mt-4 flex justify-center items-center gap-1.5 text-xs font-bold text-slate-500 animate-bounce">
              <span>Scroll to start the flight</span>
              <ChevronDown size={14} />
            </div>
          </motion.div>

          {/* Scene 2 Story */}
          <motion.div style={{ opacity: scene2TextOpacity }} className="absolute inset-x-0 top-0">
            <Badge colorTheme="pink" variant="solid" className="mb-2">
              Scene 2 — The Ramped Cafe
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
              Independence Restored
            </h2>
            <p className="text-base text-slate-600 font-semibold max-w-xl mx-auto leading-relaxed">
              As the butterfly flutters near, a ramp appears, and shades of pastel pink and lavender bloom. Ramps aren&apos;t features—they are freedom.
            </p>
          </motion.div>

          {/* Scene 3 Story */}
          <motion.div style={{ opacity: scene3TextOpacity }} className="absolute inset-x-0 top-0">
            <Badge colorTheme="mint" variant="solid" className="mb-2">
              Scene 3 — The Inclusive Park
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
              Pathways Smooth Out
            </h2>
            <p className="text-base text-slate-600 font-semibold max-w-xl mx-auto leading-relaxed">
              In the local park, rough gravel paths transform into smooth routes. Trees bloom with mint green, making leisure inclusive for strollers and seniors.
            </p>
          </motion.div>

          {/* Scene 4 Story */}
          <motion.div style={{ opacity: scene4TextOpacity }} className="absolute inset-x-0 top-0">
            <Badge colorTheme="sky" variant="solid" className="mb-2">
              Scene 4 — Elevated Care
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
              Accessibility Index Rises
            </h2>
            <p className="text-base text-slate-600 font-semibold max-w-xl mx-auto leading-relaxed">
              The hospital lights up, showing automated lifts and elevators active. The Accessibility Index climbs to 92/100, providing assurance before you arrive.
            </p>
          </motion.div>

          {/* Scene 5 Story / Final Reveal */}
          <motion.div style={{ opacity: scene5TextOpacity }} className="absolute inset-x-0 top-0 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 drop-shadow-sm leading-tight">
              Accessibility Changes Everything.
            </h2>
            <p className="text-lg md:text-xl text-slate-800 font-bold max-w-2xl mx-auto mb-6 leading-relaxed">
              One accessible place can impact thousands of lives. Discover and map locations using Vision AI and crowdsourced verify points.
            </p>
            <div className="flex gap-4 justify-center items-center">
              <Button colorTheme="lavender" size="lg" className="shadow-md">
                Launch Map Platform <Sparkles size={16} className="ml-2" />
              </Button>
              <Button colorTheme="pink" variant="outline" size="lg">
                Upload Street View
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
