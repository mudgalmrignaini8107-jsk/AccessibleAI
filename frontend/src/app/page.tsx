'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { PassportSelector } from '@/components/PassportSelector';
import { VisionScanner } from '@/components/VisionScanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePassport } from '@/context/PassportContext';
import { 
  Sparkles, 
  MapPin, 
  Eye, 
  Compass, 
  ShieldCheck, 
  ChevronRight, 
  X 
} from 'lucide-react';

// Dynamic imports with SSR disabled for three.js and Leaflet elements
const ThreeHeroCanvas = dynamic(
  () => import('@/components/ThreeHeroCanvas').then((m) => m.ThreeHeroCanvas),
  { ssr: false }
);

const AccessibilityMap = dynamic(
  () => import('@/components/AccessibilityMap').then((m) => m.AccessibilityMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[550px] w-full glass-panel flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-lavender" />
        <span className="text-xs font-bold text-slate-500">Initializing Leaflet Geospatial Tiles...</span>
      </div>
    ),
  }
);

// Counter utility for proof statistics
const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ 
  target, 
  suffix = '', 
  duration = 1500 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / 100), 15);
    const steps = totalMiliseconds / incrementTime;
    const stepValue = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

interface Review {
  author: string;
  text: string;
  rating: number;
}

interface PlaceDetails {
  title: string;
  emoji: string;
  description: string;
  has_ramp: boolean;
  has_elevator: boolean;
  has_handrail: boolean;
  has_accessible_washroom: boolean;
  has_step_free_entrance: boolean;
  stair_count: number;
  has_seating: boolean;
  has_parking: boolean;
  is_verified: boolean;
  reviews: Review[];
}

const PLACE_DATABASE: Record<'cafe' | 'park' | 'hospital', PlaceDetails> = {
  cafe: {
    title: 'Sweet Pastel Cafe',
    emoji: '☕',
    description: 'A cozy neighborhood coffee house serving artisanal pastries and warm pastel lattes.',
    has_ramp: true,
    has_elevator: false,
    has_handrail: true,
    has_accessible_washroom: true,
    has_step_free_entrance: true,
    stair_count: 0,
    has_seating: true,
    has_parking: false,
    is_verified: true,
    reviews: [
      { author: 'Sarah (Wheelchair User)', text: 'The new ramp is amazing! It is wide and not steep at all. I can get in without help now.', rating: 5 },
      { author: 'David (Parent with Stroller)', text: 'Easy access with our double stroller. Staff was super welcoming.', rating: 5 }
    ]
  },
  park: {
    title: 'Inclusive Park Paths',
    emoji: '🌳',
    description: 'A peaceful community garden featuring smooth concrete pathways, sensory gardens, and accessible seating.',
    has_ramp: true,
    has_elevator: false,
    has_handrail: true,
    has_accessible_washroom: true,
    has_step_free_entrance: true,
    stair_count: 0,
    has_seating: true,
    has_parking: true,
    is_verified: true,
    reviews: [
      { author: 'Marcus (Senior Citizen)', text: 'Love the new smooth pavement. No more gravel trips. I can walk with my cane comfortably.', rating: 5 },
      { author: 'Elena (Stroller Runner)', text: 'Perfect paths for running with the stroller. Highly recommend.', rating: 5 }
    ]
  },
  hospital: {
    title: 'Hospital Care Hub',
    emoji: '🏥',
    description: 'A modern medical complex fully retrofitted with transparent glass elevators and step-free stairs.',
    has_ramp: true,
    has_elevator: true,
    has_handrail: true,
    has_accessible_washroom: true,
    has_step_free_entrance: true,
    stair_count: 0,
    has_seating: true,
    has_parking: true,
    is_verified: true,
    reviews: [
      { author: 'Arthur (Temporary Injury)', text: 'The elevator is fast and right by the entrance. Made my crutches journey a breeze.', rating: 5 },
      { author: 'Claire (Senior Care)', text: 'Extremely easy elevator access for seniors. Clean and clearly marked.', rating: 5 }
    ]
  }
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'3d' | 'map' | 'cv'>('cv');
  const [selectedPlace, setSelectedPlace] = useState<'cafe' | 'park' | 'hospital' | null>(null);
  
  // Interactive coordinates for R3F cursor parallax
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  // Graceful performance degradation flag
  const [isLowEnd, setIsLowEnd] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    verified_places: 5,
    total_places: 6,
    ai_scans: 0,
    contributors: 8,
    accuracy: 92.4
  });

  const { activeProfile, calculateScore } = usePassport();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Scroll timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    // Detect mobile screens or reduced-motion user preferences
    const isMobile = window.innerWidth < 768;
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || hasReducedMotion) {
      setIsLowEnd(true);
    }

    return scrollYProgress.on('change', (latest) => {
      setScrollProgress(latest);
    });
  }, [scrollYProgress]);

  useEffect(() => {
    async function loadStats() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/places/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            verified_places: data.verified_places,
            total_places: data.total_places,
            ai_scans: data.ai_scans,
            contributors: data.contributors,
            accuracy: data.accuracy
          });
        }
      } catch (err) {
        console.warn('Backend offline, using local cached stats.', err);
      }
    }
    loadStats();
  }, [refreshTrigger]);

  // Track mouse coordinates for R3F spring loops
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLowEnd) return; // disable interactive calculations on mobile/low-end
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMouseCoords({ x, y });
  };

  const handlePinClick = (place: 'cafe' | 'park' | 'hospital') => {
    setSelectedPlace(place);
  };

  const getNarrationOpacity = (start: number, end: number) => {
    if (scrollProgress >= start && scrollProgress <= end) {
      const fadeInRange = 0.03;
      const fadeOutRange = 0.03;

      if (scrollProgress - start < fadeInRange) {
        return (scrollProgress - start) / fadeInRange;
      }
      if (end - scrollProgress < fadeOutRange) {
        return (end - scrollProgress) / fadeOutRange;
      }
      return 1;
    }
    return 0;
  };

  const handleSkipStory = () => {
    if (containerRef.current) {
      window.scrollTo({
        top: containerRef.current.offsetHeight,
        behavior: 'smooth'
      });
    }
  };

  const activePlaceDetails = selectedPlace ? PLACE_DATABASE[selectedPlace] : null;
  const recalculatedScore = activePlaceDetails 
    ? calculateScore({
        has_ramp: activePlaceDetails.has_ramp,
        has_elevator: activePlaceDetails.has_elevator,
        has_handrail: activePlaceDetails.has_handrail,
        has_accessible_washroom: activePlaceDetails.has_accessible_washroom,
        has_nursing_room: false,
        has_step_free_entrance: activePlaceDetails.has_step_free_entrance,
        stair_count: activePlaceDetails.stair_count,
        has_seating: activePlaceDetails.has_seating,
        has_parking: activePlaceDetails.has_parking,
        is_verified: activePlaceDetails.is_verified
      })
    : null;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[750vh] overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Immersive 3D Stage Background */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-slate-50 z-0">
        <ThreeHeroCanvas 
          scrollProgress={scrollProgress} 
          onPinClick={handlePinClick} 
          mouseCoords={mouseCoords}
          isLowEnd={isLowEnd}
        />

        {/* Top Premium Navigation bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex justify-between items-center px-8 py-6 max-w-6xl mx-auto select-none pointer-events-auto">
          <span className="font-serif-lux text-2xl font-black bg-gradient-to-r from-brand-pink to-brand-sky bg-clip-text text-transparent">
            Accessible AI 🌈
          </span>
          <div className="hidden md:flex gap-8 text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            <span className="hover:text-brand-pink cursor-pointer transition-colors" onClick={handleSkipStory}>Scanner</span>
            <span className="hover:text-brand-lavender cursor-pointer transition-colors" onClick={handleSkipStory}>Geomap</span>
            <span className="hover:text-brand-sky cursor-pointer transition-colors" onClick={handleSkipStory}>Route planner</span>
          </div>
          <Button
            colorTheme="lavender"
            variant="glass"
            size="sm"
            onClick={handleSkipStory}
            className="font-extrabold text-xs"
          >
            Launch Platform
          </Button>
        </div>

        {/* Narration overlays (elegant serif styled) */}

        {/* Scene 1: Hero Section Landing */}
        <div
          style={{ opacity: getNarrationOpacity(0.0, 0.14) }}
          className="absolute inset-y-0 left-0 flex flex-col justify-center items-start px-8 md:px-24 max-w-3xl pointer-events-none select-none z-10 transition-opacity duration-300"
        >
          <span className="text-xs font-extrabold tracking-widest text-brand-pink uppercase mb-3 block">
            A World Without Barriers
          </span>
          <h1 className="font-serif-lux text-4xl md:text-7xl font-light text-slate-800 tracking-tight leading-[1.05] mb-6">
            A World <br />
            Without Barriers.
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed mb-8 max-w-xl">
            Discover accessible cafes, hospitals, colleges, parks, and public spaces before you visit. 
            Find routes, accessibility scores, and AI-powered accessibility insights designed for everyone.
          </p>
          
          <div className="flex flex-wrap gap-4 pointer-events-auto mb-10">
            <Button
              colorTheme="pink"
              size="lg"
              onClick={() => {
                const element = document.getElementById('product-platform');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shadow-md font-extrabold text-sm px-6 py-3.5 rounded-full hover:scale-105 transition-transform"
            >
              Explore Accessible Places
            </Button>
            <Button
              colorTheme="lavender"
              variant="outline"
              size="lg"
              onClick={() => {
                if (containerRef.current) {
                  const targetScroll = containerRef.current.offsetHeight * 0.82;
                  window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                  });
                }
              }}
              className="font-extrabold text-sm px-6 py-3.5 rounded-full border-slate-350 text-slate-700 hover:bg-slate-100"
            >
              See How It Works
            </Button>
          </div>

          {/* Floating accessibility proof metrics band (Awwwards-quality glassmorphism) */}
          <div className="pointer-events-auto flex gap-4 overflow-x-auto max-w-full pb-2 scrollbar-none">
            <div className="glass-panel px-4 py-2.5 flex flex-col justify-center border border-white/80 bg-white/40 shadow-sm min-w-28 text-center">
              <span className="font-serif-lux text-lg font-black text-slate-800 leading-none">
                <AnimatedCounter target={stats.verified_places} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">Verified Places</span>
            </div>
            <div className="glass-panel px-4 py-2.5 flex flex-col justify-center border border-white/80 bg-white/40 shadow-sm min-w-28 text-center">
              <span className="font-serif-lux text-lg font-black text-slate-800 leading-none">
                <AnimatedCounter target={stats.ai_scans} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">AI Scans Run</span>
            </div>
            <div className="glass-panel px-4 py-2.5 flex flex-col justify-center border border-white/80 bg-white/40 shadow-sm min-w-28 text-center">
              <span className="font-serif-lux text-lg font-black text-slate-800 leading-none">
                <AnimatedCounter target={stats.contributors} />
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">Contributors</span>
            </div>
            <div className="glass-panel px-4 py-2.5 flex flex-col justify-center border border-white/80 bg-white/40 shadow-sm min-w-28 text-center">
              <span className="font-serif-lux text-lg font-black text-slate-800 leading-none">
                <AnimatedCounter target={Math.round(stats.accuracy)} suffix="%" />
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">AI Accuracy</span>
            </div>
          </div>
        </div>

        {/* Section 1: AI Scanner */}
        <div
          style={{ opacity: getNarrationOpacity(0.15, 0.35) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-lg">
            <span className="text-xs font-extrabold tracking-widest text-brand-pink uppercase mb-2 block">
              Section 1 — AI Entrance scan
            </span>
            <h2 className="font-serif-lux text-3xl md:text-4xl font-light text-slate-800 mb-3">
              AI-Powered Audit
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              Verify accessibility instantly. The scanner processes entryways for step-free structures, generating real-time score indicators to remove uncertainty.
            </p>
          </div>
        </div>

        {/* Section 2: Living Accessibility Map */}
        <div
          style={{ opacity: getNarrationOpacity(0.36, 0.55) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-lg">
            <span className="text-xs font-extrabold tracking-widest text-brand-lavender uppercase mb-2 block">
              Section 2 — Living Map
            </span>
            <h2 className="font-serif-lux text-3xl md:text-4xl font-light text-slate-800 mb-3">
              Recalculating the City
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              Discover and select locations verified by the community. As the butterfly flies by, steps become ramps and monochrome turns into warm lavender pink.
            </p>
          </div>
        </div>

        {/* Section 3: Smart Route Planner */}
        <div
          style={{ opacity: getNarrationOpacity(0.56, 0.75) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-lg">
            <span className="text-xs font-extrabold tracking-widest text-brand-mint uppercase mb-2 block">
              Section 3 — Smart routing
            </span>
            <h2 className="font-serif-lux text-3xl md:text-4xl font-light text-slate-800 mb-3">
              Winding Smooth Paths
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              Gravel tracks smooth out in real-time. Watch glowing transit lines route through streets, ensuring a seamless journey for strollers and seniors.
            </p>
          </div>
        </div>

        {/* Section 4: Community Powered */}
        <div
          style={{ opacity: getNarrationOpacity(0.76, 0.90) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-lg">
            <span className="text-xs font-extrabold tracking-widest text-brand-sky uppercase mb-2 block">
              Section 4 — Community powered
            </span>
            <h2 className="font-serif-lux text-3xl md:text-4xl font-light text-slate-800 mb-3">
              Connected Networks
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              A shared effort of crowd-sourced verifications. Interconnected avatar nodes mesh together, validating local access details collaboratively.
            </p>
          </div>
        </div>

        {/* Section 5: Digital Twin Vision */}
        <div
          style={{ opacity: getNarrationOpacity(0.91, 0.97) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-lg">
            <span className="text-xs font-extrabold tracking-widest text-brand-pink uppercase mb-2 block">
              Section 5 — Digital Twin
            </span>
            <h2 className="font-serif-lux text-3xl md:text-4xl font-light text-slate-800 mb-3">
              Equal Access for Everyone
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              The entire miniature city lights up in full pastel color, and thousands of rising butterflies fill the sky. Accessibility changes everything.
            </p>
          </div>
        </div>

        {/* Skip button visible during story scroll */}
        {scrollProgress < 0.95 && (
          <div className="absolute bottom-6 right-6 z-20">
            <Button
              colorTheme="lavender"
              variant="glass"
              size="sm"
              onClick={handleSkipStory}
              className="font-bold text-xs shadow-sm"
            >
              Skip Story <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Product Interface Transition Section (Scene 7) */}
      <div 
        id="product-platform" 
        className="relative w-full min-h-screen bg-slate-50 z-10 border-t border-slate-200/50 flex flex-col items-center py-16 px-4 md:px-8 select-none"
      >
        
        {/* Interactive Platform Header */}
        <div className="w-full max-w-6xl text-center mb-12 space-y-4">
          <Badge colorTheme="lavender" variant="solid" className="px-4 py-1 font-bold text-[10px] uppercase tracking-wider">
            ✨ Interactive Platform Active
          </Badge>
          <h2 className="font-serif-lux text-3xl md:text-5xl font-light text-slate-850">
            Explore Accessible AI
          </h2>
          <p className="text-slate-500 font-semibold max-w-xl mx-auto text-sm">
            Interact with our active, working dashboard. Audit entryway scans with AI, update your passport, or check crowdsourced markers on the map.
          </p>

          {/* Premium Control Deck Tabs */}
          <div className="flex justify-center gap-2.5 pt-4">
            <button
              onClick={() => setActiveTab('cv')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'cv'
                  ? 'bg-brand-sky text-slate-900 shadow-sm scale-105'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <Eye size={14} /> AI Vision Auditor
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-brand-lavender text-slate-900 shadow-sm scale-105'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <MapPin size={14} /> Geospatial Map
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === '3d'
                  ? 'bg-brand-pink text-slate-900 shadow-sm scale-105'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/50 shadow-sm'
              }`}
            >
              <Compass size={14} /> 3D City Blueprint
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="w-full max-w-6xl z-10 min-h-[550px] mb-12">
          <AnimatePresence mode="wait">
            {activeTab === '3d' && (
              <motion.div
                key="3d-blueprint"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <Card accent="lavender" className="p-6 text-center bg-white/60 border-white/80 border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    <Sparkles className="text-brand-lavender" /> 3D Interactive Blueprint View
                  </h3>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    Scroll up slightly to view the 3D City and click the glowing interactive pins (Cafe, Park, Hospital) to retrieve real database reviews and passport compatibility.
                  </p>
                </Card>

                {/* Passport selector is embedded here to adjust profile values */}
                <PassportSelector />
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="w-full h-[550px] rounded-[2rem] overflow-hidden shadow-lg border border-slate-200/50 bg-white">
                  <AccessibilityMap refreshTrigger={refreshTrigger} />
                </div>
                <PassportSelector />
              </motion.div>
            )}

            {activeTab === 'cv' && (
              <motion.div
                key="cv-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card accent="sky" className="p-6 text-center bg-white/60 border-white/80 border shadow-sm space-y-1">
                  <h3 className="text-xl font-bold text-slate-800">AI Entrance scanner</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    Upload street photos to let our contour heuristics scan for step-free ramps, handle stairs, and assess score indexes automatically.
                  </p>
                </Card>
                <VisionScanner onScanComplete={handleRefresh} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Pin Detail Overlay Modal */}
        <AnimatePresence>
          {selectedPlace && activePlaceDetails && recalculatedScore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPlace(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white border border-white/80 rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full relative shadow-2xl space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activePlaceDetails.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{activePlaceDetails.title}</h3>
                    <Badge colorTheme="lavender" className="mt-1">
                      ⭐ Verified Accessible
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  {activePlaceDetails.description}
                </p>

                {/* Passport Score Recalculator */}
                <div className="p-5 rounded-2xl border bg-slate-50 border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>Active Profile Keys</span>
                    <span className="text-brand-pink tracking-widest text-[9px]">recalculated</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-slate-600 text-xs font-bold">
                      Profile: {activeProfile === 'none' ? 'General Access' : activeProfile}
                    </div>
                    <div className="text-3xl font-black text-slate-800">
                      {recalculatedScore.score}
                      <span className="text-xs font-bold text-slate-400">/100</span>
                    </div>
                  </div>
                  <div className={`text-xs font-extrabold flex items-center gap-1 ${recalculatedScore.textClass}`}>
                    <ShieldCheck size={13} /> Score Grade: {recalculatedScore.grade}
                  </div>
                </div>

                {/* Reviews */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crowdsourced Reviews</h4>
                  <div className="space-y-3 max-h-36 overflow-y-auto pr-2">
                    {activePlaceDetails.reviews.map((review, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-600">
                          <span>{review.author}</span>
                          <span className="text-brand-pink">{'★'.repeat(review.rating)}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-semibold">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    colorTheme="lavender"
                    fullWidth
                    onClick={() => {
                      setSelectedPlace(null);
                      setActiveTab('map');
                      // Scroll to tab section
                      setTimeout(() => {
                        window.scrollTo({
                          top: containerRef.current!.offsetHeight,
                          behavior: 'smooth'
                        });
                      }, 200);
                    }}
                  >
                    View on Map
                  </Button>
                  <Button
                    colorTheme="pink"
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setSelectedPlace(null);
                      setActiveTab('cv');
                      setTimeout(() => {
                        window.scrollTo({
                          top: containerRef.current!.offsetHeight,
                          behavior: 'smooth'
                        });
                      }, 200);
                    }}
                  >
                    Audit Entrance
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="w-full max-w-6xl text-center pt-8 border-t border-slate-200/50 text-xs font-bold text-slate-400 mt-16">
          © 2026 Accessible AI 🌈 • AWorldWithoutBarriers Interactive Campaign
        </div>
      </div>
    </div>
  );
}
