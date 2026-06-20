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
  ChevronDown, 
  MapPin, 
  Eye, 
  Compass, 
  ShieldCheck, 
  ChevronRight, 
  X 
} from 'lucide-react';

// Dynamic imports with SSR disabled to prevent hydration mismatch and server-side errors
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
  const [activeTab, setActiveTab] = useState<'3d' | 'map' | 'cv'>('3d');
  const [selectedPlace, setSelectedPlace] = useState<'cafe' | 'park' | 'hospital' | null>(null);
  
  // Accessibility Passport calculations
  const { activeProfile, calculateScore } = usePassport();

  // Scroll listener
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setScrollProgress(latest);
    });
  }, [scrollYProgress]);

  // Handle R3F Pin Click
  const handlePinClick = (place: 'cafe' | 'park' | 'hospital') => {
    setSelectedPlace(place);
  };

  // Helper to get active narration opacity
  const getNarrationOpacity = (start: number, end: number) => {
    if (scrollProgress >= start && scrollProgress <= end) {
      // Fade in and fade out ranges
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

  // Skip visual story to go directly to product dashboard
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
    <div ref={containerRef} className="relative w-full h-[750vh]">
      {/* 3D Sticky Stage Canvas Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-slate-950 z-0">
        <ThreeHeroCanvas scrollProgress={scrollProgress} onPinClick={handlePinClick} />

        {/* Narrative Narration Overlays */}
        
        {/* Scene 1: Premium Product Hero */}
        <div
          style={{ opacity: getNarrationOpacity(0.0, 0.14) }}
          className="absolute inset-y-0 left-0 flex flex-col justify-center items-start px-8 md:px-24 max-w-4xl pointer-events-none select-none z-10 transition-opacity duration-300"
        >
          <span className="text-xs font-extrabold tracking-widest text-brand-pink uppercase mb-3 block">
            Accessible AI 🌈
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[1.02] mb-6">
            ACCESSIBILITY <br />
            CHANGES EVERYTHING
          </h1>
          <p className="text-sm md:text-lg text-slate-300 font-semibold leading-relaxed mb-8 max-w-xl">
            Discover accessible cafes, hospitals, colleges, parks, and public spaces before you visit.
            Find routes, accessibility scores, and AI-powered accessibility insights designed for everyone.
          </p>
          <div className="flex flex-wrap gap-4 pointer-events-auto">
            <Button
              colorTheme="pink"
              size="lg"
              onClick={() => {
                const element = document.getElementById('product-platform');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shadow-lg font-extrabold text-sm px-6 py-3 rounded-full"
            >
              Explore Accessible Places
            </Button>
            <Button
              colorTheme="lavender"
              variant="outline"
              size="lg"
              onClick={() => {
                if (containerRef.current) {
                  const targetScroll = containerRef.current.offsetHeight * 0.85;
                  window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                  });
                }
              }}
              className="font-extrabold text-sm px-6 py-3 rounded-full border-white/20 text-white hover:bg-white/10"
            >
              Watch The Story
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-2 text-xs font-extrabold text-slate-500 animate-bounce">
            <span>Scroll down to enter the fairytale city</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Scene 2: The Awakening */}
        <div
          style={{ opacity: getNarrationOpacity(0.16, 0.28) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-slate-950/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <span className="text-sm font-extrabold tracking-widest text-brand-pink uppercase mb-2 block">
              Scene 2 — The Catalyst
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              The Flapping Spark
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-semibold leading-relaxed">
              But freedom has a catalyst. A majestic, glowing butterfly emerges, carrying the spectrum of accessibility and change in its wings.
            </p>
          </div>
        </div>

        {/* Scene 3: Cafe Entry */}
        <div
          style={{ opacity: getNarrationOpacity(0.30, 0.48) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-slate-950/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <span className="text-sm font-extrabold tracking-widest text-brand-pink uppercase mb-2 block">
              Scene 3 — Restoring Independence
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Cafe Entrance Opened
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-semibold leading-relaxed">
              As the butterfly flutters near, a ramp smoothly scales up, allowing the wheelchair user to enter. Warm pastel pink and lavender bloom across the cafe.
            </p>
          </div>
        </div>

        {/* Scene 4: Inclusive Park */}
        <div
          style={{ opacity: getNarrationOpacity(0.50, 0.68) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-slate-950/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <span className="text-sm font-extrabold tracking-widest text-brand-mint uppercase mb-2 block">
              Scene 4 — Smooth Routes
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Paths Made Smooth
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-semibold leading-relaxed">
              Broken gravel is replaced by a glowing, accessible pathway. A parent pushes a stroller comfortably. Trees scale up and bloom with mint foliage.
            </p>
          </div>
        </div>

        {/* Scene 5: Elevated Care */}
        <div
          style={{ opacity: getNarrationOpacity(0.70, 0.85) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-xl bg-slate-950/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <span className="text-sm font-extrabold tracking-widest text-brand-sky uppercase mb-2 block">
              Scene 5 — Elevated Access
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Vertical Freedom Activated
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-semibold leading-relaxed">
              The hospital lights up, and a glass elevator cabin rises. An elder enters comfortably, bypassing the stairs. The environment is now fully colorful.
            </p>
          </div>
        </div>

        {/* Scene 6: Swarm & Final Reveal */}
        <div
          style={{ opacity: getNarrationOpacity(0.87, 0.95) }}
          className="absolute inset-0 flex flex-col justify-center items-center px-6 pointer-events-none select-none text-center z-10 transition-opacity duration-300"
        >
          <div className="max-w-2xl bg-slate-950/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-3">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              ACCESSIBILITY <br />
              <span className="bg-gradient-to-r from-brand-pink via-brand-lavender to-brand-sky bg-clip-text text-transparent">
                CHANGES EVERYTHING
              </span>
            </h2>
            <p className="text-base md:text-lg text-slate-300 font-bold max-w-lg mx-auto">
              One accessible place can change thousands of lives. Discover, map, and scan cities with computer vision.
            </p>
            <div className="pt-2 flex justify-center items-center gap-1.5 text-xs font-bold text-slate-500 animate-bounce">
              <span>Scroll down to launch the platform</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Skip button visible during story */}
        {scrollProgress < 0.94 && (
          <div className="absolute bottom-6 right-6 z-20">
            <Button
              colorTheme="lavender"
              variant="glass"
              size="sm"
              onClick={handleSkipStory}
              className="font-bold text-xs"
            >
              Skip Story <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Product Interface Transition Section (Scene 7) */}
      <div id="product-platform" className="relative w-full min-h-screen bg-slate-950 z-10 border-t border-white/5 flex flex-col items-center py-12 px-4 md:px-8">
        
        {/* Interactive Platform Header */}
        <div className="w-full max-w-6xl text-center mb-10 space-y-4">
          <Badge colorTheme="lavender" variant="solid" className="px-4 py-1 font-bold text-xs">
            ✨ Interactive Platform Active
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Explore Accessible AI
          </h2>
          <p className="text-slate-400 font-semibold max-w-xl mx-auto text-sm md:text-base">
            Swap views below to interact with our geospatial accessibility map, update your passport keys, or audit building access.
          </p>

          {/* Premium Control Deck Tabs */}
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === '3d'
                  ? 'bg-brand-pink text-slate-950 shadow-md scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Compass size={14} /> 3D City Blueprint
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-brand-lavender text-slate-950 shadow-md scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <MapPin size={14} /> Geospatial Map
            </button>
            <button
              onClick={() => setActiveTab('cv')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'cv'
                  ? 'bg-brand-sky text-slate-950 shadow-md scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Eye size={14} /> AI Vision Auditor
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
                <Card accent="lavender" className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="text-brand-lavender" /> 3D City Blueprint View
                  </h3>
                  <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
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
                <div className="w-full h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <AccessibilityMap />
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
                <Card accent="sky" className="p-6 text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">AI Entrance scanner</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                    Upload street photos to let our contour heuristics scan for step-free ramps, handle stairs, and assess score indexes automatically.
                  </p>
                </Card>
                <VisionScanner />
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
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPlace(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full relative shadow-2xl space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activePlaceDetails.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-black text-white">{activePlaceDetails.title}</h3>
                    <Badge colorTheme="lavender" className="mt-1">
                      ⭐ 3D Verified Place
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  {activePlaceDetails.description}
                </p>

                {/* Passport Score Recalculator */}
                <div className="p-5 rounded-2xl border bg-slate-950/50 border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>Active Profile Keys</span>
                    <span className="text-brand-pink uppercase tracking-widest text-[10px]">recalculated</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-slate-300 text-xs font-semibold">
                      Profile: {activeProfile === 'none' ? 'General Access' : activeProfile}
                    </div>
                    <div className="text-3xl font-black text-white">
                      {recalculatedScore.score}
                      <span className="text-xs font-bold text-slate-500">/100</span>
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
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>{review.author}</span>
                          <span className="text-brand-pink">{'★'.repeat(review.rating)}</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium">{review.text}</p>
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
        <div className="w-full max-w-6xl text-center pt-8 border-t border-white/5 text-xs font-bold text-slate-500 z-10">
          © 2026 Accessible AI 🌈 • Pixar-Style Narrative Coding Campaign
        </div>
      </div>
    </div>
  );
}
