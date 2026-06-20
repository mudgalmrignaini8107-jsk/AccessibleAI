'use client';

import React from 'react';
import { usePassport, PASSPORT_PROFILES, PlaceFeatures } from '@/context/PassportContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';

// Example Location to showcase dynamic passport score recalculation in the simulator
const DEMO_PLACE_FEATURES: PlaceFeatures = {
  has_ramp: true,
  has_elevator: false,
  has_handrail: true,
  has_accessible_washroom: true,
  has_nursing_room: false,
  has_step_free_entrance: true,
  stair_count: 3,
  has_seating: true,
  has_parking: true,
  is_verified: true,
};

export const PassportSelector: React.FC = () => {
  const { activeProfile, setProfile, calculateScore } = usePassport();

  // Compute recalculated score for the demo card
  const demoScoreData = calculateScore(DEMO_PLACE_FEATURES);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left side: Profiles Selection */}
      <div className="lg:col-span-2 space-y-4">
        <div className="mb-4">
          <h3 className="text-2xl font-black text-slate-800 mb-1">
            Activate Your Accessibility Passport
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            Select a profile to dynamically recalculate safety, routes, and map pins across the city.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PASSPORT_PROFILES.map((profile) => {
            const isActive = activeProfile === profile.id;
            
            return (
              <motion.div
                key={profile.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setProfile(profile.id)}
                className={`cursor-pointer rounded-3xl transition-all duration-300 relative border-2 ${
                  isActive 
                    ? 'border-brand-lavender bg-white/70 shadow-md ring-2 ring-brand-lavender/10'
                    : 'border-slate-200 bg-white/35 hover:bg-white/55 hover:border-slate-300'
                }`}
              >
                <div className="p-5 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl" role="img" aria-label={profile.name}>
                      {profile.emoji}
                    </span>
                    {isActive ? (
                      <Badge colorTheme="lavender" variant="solid" className="px-2.5 py-0.5">
                        <Check size={11} className="mr-0.5" /> Active
                      </Badge>
                    ) : (
                      <Badge colorTheme="sky" variant="glass" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">{profile.name}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                      {profile.description}
                    </p>
                  </div>

                  {/* Priority Indicators */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {profile.priorityNeeds.slice(0, 2).map((need, idx) => (
                      <span key={idx} className="text-[10px] font-extrabold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full">
                        Need: {need}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Clear Passport Button */}
        {activeProfile !== 'none' && (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              colorTheme="lavender"
              size="sm"
              onClick={() => setProfile('none')}
              className="text-xs font-bold"
            >
              Reset to General Access Mode
            </Button>
          </div>
        )}
      </div>

      {/* Right side: Recalculation Simulator Card */}
      <Card accent="lavender" className="w-full flex flex-col justify-between">
        <div>
          <Badge colorTheme="lavender" className="mb-3">
            Recalculation Simulator
          </Badge>
          <h4 className="text-lg font-black text-slate-800 mb-1">
            Dynamic Score Behavior
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
            Witness how a single place&apos;s parameters modify instantly depending on your active passport keys.
          </p>

          {/* Place Stats Details */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                📍 Location
              </span>
              <span className="text-xs font-extrabold text-slate-800">Sweet Pastel Cafe</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Step-free Entrance</span>
                <span className="text-emerald-600">Yes</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Wheelchair Ramps</span>
                <span className="text-emerald-600">Yes</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Elevator available</span>
                <span className="text-rose-500">No</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Stair steps count</span>
                <span className="text-amber-600">3 stairs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recalculated Score display */}
        <div className={`p-5 rounded-2xl border ${demoScoreData.bgClass} text-center space-y-2 transition-all duration-500`}>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {activeProfile === 'none' ? 'General Access Score' : 'Profile Recalculation'}
          </div>
          <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-800">
            {demoScoreData.score}
            <span className="text-lg font-bold text-slate-400">/100</span>
          </div>
          <div className={`text-sm font-bold flex items-center justify-center gap-1 ${demoScoreData.textClass}`}>
            <ShieldCheck size={14} /> {demoScoreData.grade}
          </div>
        </div>
      </Card>
    </div>
  );
};
