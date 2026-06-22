'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ProfileType = 'wheelchair' | 'senior' | 'stroller' | 'injury' | 'mother' | 'none';

export interface ProfileDetails {
  id: ProfileType;
  name: string;
  emoji: string;
  description: string;
  colorTheme: 'sky' | 'lavender' | 'pink' | 'peach' | 'mint';
  priorityNeeds: string[];
  barriers: string[];
}

export const PASSPORT_PROFILES: ProfileDetails[] = [
  {
    id: 'wheelchair',
    name: 'Wheelchair User',
    emoji: '🧑‍🦽',
    description: 'Requires step-free entry, ramps, elevators, and wide corridors.',
    colorTheme: 'sky',
    priorityNeeds: ['Ramps', 'Elevators', 'Wide Doors', 'Accessible Washrooms'],
    barriers: ['Stairs', 'High Steps', 'Narrow Doors'],
  },
  {
    id: 'senior',
    name: 'Senior Citizen',
    emoji: '👵',
    description: 'Prioritizes support handrails, resting zones, elevators, and minimal steps.',
    colorTheme: 'lavender',
    priorityNeeds: ['Handrails', 'Elevators', 'Rest Areas', 'Ramps'],
    barriers: ['Steep Slopes', 'Long Stairs', 'No Seating'],
  },
  {
    id: 'stroller',
    name: 'Parent with Stroller',
    emoji: '👶',
    description: 'Needs wide entrances, elevator access, and baby changing areas.',
    colorTheme: 'pink',
    priorityNeeds: ['Elevators', 'Ramps', 'Baby Changing', 'Family Parking'],
    barriers: ['Stairs', 'Escalators Only', 'Turnstiles'],
  },
  {
    id: 'injury',
    name: 'Temporary Injury',
    emoji: '🩼',
    description: 'Requires handrails, elevators, resting seats, and short walking distances.',
    colorTheme: 'peach',
    priorityNeeds: ['Handrails', 'Elevators', 'Resting Seats', 'Short Routes'],
    barriers: ['Long Walkways', 'No Lifts', 'Slippery Floors'],
  },
  {
    id: 'mother',
    name: 'Breastfeeding Mother',
    emoji: '🤱',
    description: 'Requires clean nursing spaces, feeding rooms, and elevator access.',
    colorTheme: 'mint',
    priorityNeeds: ['Nursing Rooms', 'Quiet Areas', 'Elevators', 'Washrooms'],
    barriers: ['Multi-floor (no lift)', 'No Privacy', 'Poor Ventilation'],
  },
];

// Structure of place features used to recalculate scores dynamically
export interface PlaceFeatures {
  has_ramp: boolean;
  has_elevator: boolean;
  has_handrail: boolean;
  has_accessible_washroom: boolean;
  has_nursing_room: boolean;
  has_step_free_entrance: boolean;
  stair_count: number;
  has_seating: boolean;
  has_parking: boolean;
  is_verified: boolean;
}

interface PassportContextType {
  activeProfile: ProfileType;
  activeProfileDetails: ProfileDetails | null;
  setProfile: (profile: ProfileType) => void;
  calculateScore: (features: PlaceFeatures) => { score: number; grade: string; textClass: string; bgClass: string };
}

const PassportContext = createContext<PassportContextType | undefined>(undefined);

export const PassportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<ProfileType>('none');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessible_ai_profile');
    if (saved && saved !== 'undefined') {
      setActiveProfile(saved as ProfileType);
    }
    setIsLoaded(true);
  }, []);

  // Save profile to localStorage on change
  const setProfile = (profile: ProfileType) => {
    setActiveProfile(profile);
    localStorage.setItem('accessible_ai_profile', profile);
  };

  const activeProfileDetails = PASSPORT_PROFILES.find(p => p.id === activeProfile) || null;

  // Recalculate accessibility scores dynamically based on the passport profile weights
  const calculateScore = (features: PlaceFeatures) => {
    let score = 75; // Baseline score for general access

    // If verified, award a general confidence boost
    if (features.is_verified) {
      score += 5;
    }

    if (activeProfile === 'none') {
      // General Accessibility Score Calculation
      if (features.has_ramp) score += 5;
      if (features.has_elevator) score += 5;
      if (features.has_handrail) score += 5;
      if (features.has_accessible_washroom) score += 5;
      if (features.has_step_free_entrance) score += 5;
      if (features.stair_count > 0) score -= Math.min(features.stair_count * 2, 15);
    } 
    else if (activeProfile === 'wheelchair') {
      // Wheelchair logic: Ramps and Elevators are critical. Stairs are severe barriers.
      let weightedPoints = 0;

      weightedPoints += features.has_ramp ? 30 : 0;
      weightedPoints += features.has_elevator ? 30 : 0;
      weightedPoints += features.has_step_free_entrance ? 20 : 0;
      weightedPoints += features.has_accessible_washroom ? 20 : 0;

      score = weightedPoints;

      // Penalize for stairs
      if (features.stair_count > 0 && !features.has_ramp) {
        score -= Math.min(features.stair_count * 8, 50);
      }
    } 
    else if (activeProfile === 'senior') {
      // Senior logic: Elevators, handrails, seating are key.
      let weightedPoints = 0;
      weightedPoints += features.has_handrail ? 30 : 0;
      weightedPoints += features.has_elevator ? 30 : 0;
      weightedPoints += features.has_seating ? 20 : 0;
      weightedPoints += features.has_ramp ? 20 : 0;

      score = weightedPoints;

      if (features.stair_count > 5) {
        score -= 20;
      }
    } 
    else if (activeProfile === 'stroller') {
      // Stroller logic: Elevators, Ramps, parking are key.
      let weightedPoints = 0;
      weightedPoints += features.has_elevator ? 35 : 0;
      weightedPoints += features.has_ramp ? 35 : 0;
      weightedPoints += features.has_step_free_entrance ? 15 : 0;
      weightedPoints += features.has_parking ? 15 : 0;

      score = weightedPoints;

      if (features.stair_count > 0 && !features.has_ramp) {
        score -= 30;
      }
    } 
    else if (activeProfile === 'injury') {
      // Injury logic: Handrails, Elevators, seating are key.
      let weightedPoints = 0;
      weightedPoints += features.has_handrail ? 35 : 0;
      weightedPoints += features.has_elevator ? 35 : 0;
      weightedPoints += features.has_seating ? 15 : 0;
      weightedPoints += features.has_ramp ? 15 : 0;

      score = weightedPoints;

      if (features.stair_count > 0) {
        score -= Math.min(features.stair_count * 5, 35);
      }
    } 
    else if (activeProfile === 'mother') {
      // Mother logic: Nursing room is primary.
      let weightedPoints = 0;
      weightedPoints += features.has_nursing_room ? 55 : 0;
      weightedPoints += features.has_elevator ? 25 : 0;
      weightedPoints += features.has_accessible_washroom ? 20 : 0;

      score = weightedPoints;
    }

    // Bind scores between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Assign grades and colors
    let grade = 'Needs Work';
    let textClass = 'text-amber-600';
    let bgClass = 'bg-amber-50 border-amber-200';

    if (score >= 85) {
      grade = 'Fully Accessible';
      textClass = 'text-brand-maroon font-black';
      bgClass = 'bg-brand-light-gold border-brand-gold/30';
    } else if (score >= 60) {
      grade = 'Partially Accessible';
      textClass = 'text-brand-charcoal';
      bgClass = 'bg-brand-cream border-brand-maroon/20';
    } else {
      grade = 'Inaccessible';
      textClass = 'text-brand-maroon font-bold';
      bgClass = 'bg-[#FFFDF9] border-brand-maroon/30';
    }

    return { score, grade, textClass, bgClass };
  };

  return (
    <PassportContext.Provider value={{ activeProfile, activeProfileDetails, setProfile, calculateScore }}>
      {isLoaded && children}
    </PassportContext.Provider>
  );
};

export const usePassport = () => {
  const context = useContext(PassportContext);
  if (context === undefined) {
    throw new Error('usePassport must be used within a PassportProvider');
  }
  return context;
};
