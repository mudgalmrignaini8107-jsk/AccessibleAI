'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { usePassport, PlaceFeatures } from '@/context/PassportContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, MapPin, Navigation, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface RouteDetails {
  name: string;
  distance: string;
  time: string;
  stairCount: number;
  hasRamps: boolean;
  hasElevators: boolean;
  steepness: 'flat' | 'moderate' | 'steep';
  path: [number, number][];
  barriers: string[];
}

export interface MapLocation {
  id: string;
  name: string;
  category: 'Cafe' | 'Hospital' | 'Park' | 'College' | 'Station' | 'Mall';
  address: string;
  lat: number;
  lng: number;
  features: PlaceFeatures;
  image: string;
  routes: {
    shortest: RouteDetails;
    accessible: RouteDetails;
  };
}

// User starting point in Manhattan (e.g. Flatiron District crossover)
const USER_START_LAT = 40.7418;
const USER_START_LNG = 73.9890; // Adjusting coordinate polarity

export const MOCK_LOCATIONS: MapLocation[] = [
  {
    id: '1',
    name: 'Sweet Pastel Cafe',
    category: 'Cafe',
    address: '220 E 23rd St, New York, NY 10010',
    lat: 40.7388,
    lng: -73.9822,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60',
    features: {
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
    },
    routes: {
      shortest: {
        name: 'Route A (Shortest)',
        distance: '450m',
        time: '5 mins',
        stairCount: 12,
        hasRamps: false,
        hasElevators: false,
        steepness: 'steep',
        path: [
          [40.7418, -73.9890],
          [40.7388, -73.9890],
          [40.7388, -73.9822]
        ],
        barriers: ['Subway construction barrier', '12 subway stairs']
      },
      accessible: {
        name: 'Route B (Most Accessible)',
        distance: '620m',
        time: '7 mins',
        stairCount: 0,
        hasRamps: true,
        hasElevators: false,
        steepness: 'flat',
        path: [
          [40.7418, -73.9890],
          [40.7418, -73.9822],
          [40.7388, -73.9822]
        ],
        barriers: []
      }
    }
  },
  {
    id: '2',
    name: 'Manhattan General Hospital',
    category: 'Hospital',
    address: '550 1st Ave, New York, NY 10016',
    lat: 40.7420,
    lng: -73.9738,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=500&auto=format&fit=crop&q=60',
    features: {
      has_ramp: true,
      has_elevator: true,
      has_handrail: true,
      has_accessible_washroom: true,
      has_nursing_room: true,
      has_step_free_entrance: true,
      stair_count: 0,
      has_seating: true,
      has_parking: true,
      is_verified: true,
    },
    routes: {
      shortest: {
        name: 'Route A (Shortest)',
        distance: '850m',
        time: '9 mins',
        stairCount: 6,
        hasRamps: false,
        hasElevators: false,
        steepness: 'moderate',
        path: [
          [40.7418, -73.9890],
          [40.7450, -73.9890],
          [40.7450, -73.9738],
          [40.7420, -73.9738]
        ],
        barriers: ['Curb drop-off broken ramp', '6 overhead walk stairs']
      },
      accessible: {
        name: 'Route B (Most Accessible)',
        distance: '1.1km',
        time: '12 mins',
        stairCount: 0,
        hasRamps: true,
        hasElevators: true,
        steepness: 'flat',
        path: [
          [40.7418, -73.9890],
          [40.7418, -73.9738],
          [40.7420, -73.9738]
        ],
        barriers: []
      }
    }
  },
  {
    id: '3',
    name: 'Greenwood Park Oasis',
    category: 'Park',
    address: 'Central Park West, New York, NY 10024',
    lat: 40.7812,
    lng: -73.9665,
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=500&auto=format&fit=crop&q=60',
    features: {
      has_ramp: true,
      has_elevator: false,
      has_handrail: true,
      has_accessible_washroom: false,
      has_nursing_room: false,
      has_step_free_entrance: true,
      stair_count: 2,
      has_seating: true,
      has_parking: false,
      is_verified: false,
    },
    routes: {
      shortest: {
        name: 'Route A (Shortest)',
        distance: '1.2km',
        time: '14 mins',
        stairCount: 8,
        hasRamps: false,
        hasElevators: false,
        steepness: 'steep',
        path: [
          [40.7418, -73.9890],
          [40.7600, -73.9890],
          [40.7812, -73.9665]
        ],
        barriers: ['Steep gravel path', '8 bridge stairs']
      },
      accessible: {
        name: 'Route B (Most Accessible)',
        distance: '1.5km',
        time: '18 mins',
        stairCount: 0,
        hasRamps: true,
        hasElevators: false,
        steepness: 'flat',
        path: [
          [40.7418, -73.9890],
          [40.7500, -73.9750],
          [40.7812, -73.9665]
        ],
        barriers: []
      }
    }
  },
  {
    id: '4',
    name: 'Downtown Arts College',
    category: 'College',
    address: '70 Washington Square S, New York, NY 10012',
    lat: 40.7308,
    lng: -73.9973,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&auto=format&fit=crop&q=60',
    features: {
      has_ramp: false,
      has_elevator: true,
      has_handrail: true,
      has_accessible_washroom: true,
      has_nursing_room: false,
      has_step_free_entrance: false,
      stair_count: 12,
      has_seating: true,
      has_parking: true,
      is_verified: true,
    },
    routes: {
      shortest: {
        name: 'Route A (Shortest)',
        distance: '680m',
        time: '8 mins',
        stairCount: 15,
        hasRamps: false,
        hasElevators: false,
        steepness: 'moderate',
        path: [
          [40.7418, -73.9890],
          [40.7308, -73.9890],
          [40.7308, -73.9973]
        ],
        barriers: ['15 entrance steps']
      },
      accessible: {
        name: 'Route B (Most Accessible)',
        distance: '820m',
        time: '10 mins',
        stairCount: 0,
        hasRamps: true,
        hasElevators: true,
        steepness: 'flat',
        path: [
          [40.7418, -73.9890],
          [40.7418, -73.9973],
          [40.7308, -73.9973]
        ],
        barriers: []
      }
    }
  },
  {
    id: '5',
    name: 'Grand Central Station Hub',
    category: 'Station',
    address: '89 E 42nd St, New York, NY 10017',
    lat: 40.7527,
    lng: -73.9772,
    image: 'https://images.unsplash.com/photo-1494587416117-f102a2ac0a8d?w=500&auto=format&fit=crop&q=60',
    features: {
      has_ramp: false,
      has_elevator: true,
      has_handrail: true,
      has_accessible_washroom: true,
      has_nursing_room: false,
      has_step_free_entrance: true,
      stair_count: 18,
      has_seating: true,
      has_parking: false,
      is_verified: true,
    },
    routes: {
      shortest: {
        name: 'Route A (Shortest)',
        distance: '950m',
        time: '11 mins',
        stairCount: 22,
        hasRamps: false,
        hasElevators: false,
        steepness: 'steep',
        path: [
          [40.7418, -73.9890],
          [40.7527, -73.9890],
          [40.7527, -73.9772]
        ],
        barriers: ['22 subway pedestrian stairs']
      },
      accessible: {
        name: 'Route B (Most Accessible)',
        distance: '1.2km',
        time: '15 mins',
        stairCount: 0,
        hasRamps: true,
        hasElevators: true,
        steepness: 'flat',
        path: [
          [40.7418, -73.9890],
          [40.7418, -73.9772],
          [40.7527, -73.9772]
        ],
        barriers: []
      }
    }
  },
  {
    id: '6',
    name: 'Broadway Shopping Mall',
    category: 'Mall',
    address: '502 Broadway, New York, NY 10012',
    lat: 40.7230,
    lng: -74.0030,
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&auto=format&fit=crop&q=60',
    features: {
      has_ramp: true,
      has_elevator: true,
      has_handrail: true,
      has_accessible_washroom: true,
      has_nursing_room: true,
      has_step_free_entrance: true,
      stair_count: 0,
      has_seating: true,
      has_parking: true,
      is_verified: true,
    },
    routes: {
      shortest: {
        name: 'Route A (Shortest)',
        distance: '1.4km',
        time: '16 mins',
        stairCount: 14,
        hasRamps: false,
        hasElevators: false,
        steepness: 'moderate',
        path: [
          [40.7418, -73.9890],
          [40.7300, -73.9890],
          [40.7230, -74.0030]
        ],
        barriers: ['14 subway street exit stairs']
      },
      accessible: {
        name: 'Route B (Most Accessible)',
        distance: '1.8km',
        time: '20 mins',
        stairCount: 0,
        hasRamps: true,
        hasElevators: true,
        steepness: 'flat',
        path: [
          [40.7418, -73.9890],
          [40.7418, -74.0030],
          [40.7230, -74.0030]
        ],
        barriers: []
      }
    }
  }
];

const MapFlyController: React.FC<{ selectedLoc: MapLocation | null }> = ({ selectedLoc }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedLoc) {
      // Fit map to include both start user location and selected place coordinates
      const bounds = L.latLngBounds([
        [USER_START_LAT, USER_START_LNG],
        [selectedLoc.lat, selectedLoc.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedLoc, map]);
  return null;
};

interface AccessibilityMapProps {
  refreshTrigger?: number;
}

export const AccessibilityMap: React.FC<AccessibilityMapProps> = ({ refreshTrigger = 0 }) => {
  const { calculateScore, activeProfile } = usePassport();
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<MapLocation[]>(MOCK_LOCATIONS);
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>(MOCK_LOCATIONS);
  const [activeRouteTab, setActiveRouteTab] = useState<'shortest' | 'accessible'>('accessible');

  useEffect(() => {
    async function loadPlaces() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/places/`);
        if (res.ok) {
          const dbPlaces = await res.json();
          // Merge database features with our mock locations images/routes
          const merged = MOCK_LOCATIONS.map(mock => {
            const dbMatch = dbPlaces.find((p: any) => p.name.toLowerCase() === mock.name.toLowerCase());
            if (dbMatch) {
              return {
                ...mock,
                id: dbMatch.id.toString(),
                features: {
                  has_ramp: dbMatch.has_ramp,
                  has_elevator: dbMatch.has_elevator,
                  has_handrail: dbMatch.has_handrail,
                  has_accessible_washroom: dbMatch.has_accessible_washroom,
                  has_nursing_room: dbMatch.has_nursing_room,
                  has_step_free_entrance: dbMatch.has_step_free_entrance,
                  stair_count: dbMatch.stair_count,
                  has_seating: dbMatch.has_seating,
                  has_parking: dbMatch.has_parking,
                  is_verified: dbMatch.is_verified,
                }
              };
            }
            return mock;
          });
          setLocations(merged);
          
          // Re-apply search filter or set all
          const query = searchQuery.toLowerCase().trim();
          if (query === '') {
            setFilteredLocations(merged);
          } else {
            const filtered = merged.filter(
              loc =>
                loc.name.toLowerCase().includes(query) ||
                loc.category.toLowerCase().includes(query) ||
                loc.address.toLowerCase().includes(query)
            );
            setFilteredLocations(filtered);
          }
          
          // Sync selected location details
          setSelectedLoc(prevSelected => {
            if (prevSelected) {
              const updated = merged.find(l => l.id === prevSelected.id);
              return updated || merged[0];
            }
            return merged[0];
          });
        }
      } catch (err) {
        console.warn('Backend offline, using local mock locations.', err);
      }
    }
    loadPlaces();
  }, [refreshTrigger, calculateScore]);

  // Filter locations on search query
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (query === '') {
      setFilteredLocations(locations);
      return;
    }

    const filtered = locations.filter(
      loc =>
        loc.name.toLowerCase().includes(query) ||
        loc.category.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query)
    );

    setFilteredLocations(filtered);
    if (filtered.length > 0) {
      setSelectedLoc(filtered[0]);
    }
  };

  const getCustomMarkerIcon = (score: number) => {
    let pinColor = '#B388FF'; // Lavender
    if (score >= 85) pinColor = '#7EF2C6'; // Mint green
    if (score >= 60 && score < 85) pinColor = '#6EC6FF'; // Sky Blue
    if (score < 60) pinColor = '#FF6EC7'; // Pink

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-white shadow-md transform hover:scale-110 transition-transform cursor-pointer" style="background: ${pinColor}">
          <span class="text-[10px] font-black text-slate-800">${score}</span>
          <div class="absolute -bottom-1 w-2.5 h-2.5 rotate-45 border-r border-b border-white" style="background: ${pinColor}"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  // Helper to formulate AI route recommendations dynamically
  const getAIRouteRecommendation = (loc: MapLocation) => {
    if (activeProfile === 'none') {
      return {
        route: 'shortest',
        text: 'Since no accessibility passport profile is selected, Route A (Shortest) is recommended to minimize walking distance.'
      };
    }

    const needsRamps = ['wheelchair', 'senior', 'stroller', 'injury'].includes(activeProfile);
    const shortestStairs = loc.routes.shortest.stairCount;

    if (needsRamps && shortestStairs > 0) {
      return {
        route: 'accessible',
        text: `We highly advise taking Route B (Most Accessible). Although it is slightly longer, it avoids ${shortestStairs} stairs and steep gradients which represent severe barriers for your active profile.`
      };
    }

    return {
      route: 'shortest',
      text: 'No critical barriers detected on Route A. You can safely take the shortest path.'
    };
  };

  const recommendation = selectedLoc ? getAIRouteRecommendation(selectedLoc) : null;

  return (
    <Card className="w-full p-4 md:p-6 overflow-hidden bg-white/40 border border-white/60">
      {/* Search Header Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search cafe, hospital, park, NYU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-lavender/40 transition-all"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Suggestions badge cluster */}
        <div className="flex flex-wrap gap-2.5 self-start md:self-auto">
          {['Cafe', 'Hospital', 'Park', 'Mall'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearchQuery(cat);
                const filtered = locations.filter(loc => loc.category === cat);
                setFilteredLocations(filtered);
                if (filtered.length > 0) setSelectedLoc(filtered[0]);
              }}
              className="px-3.5 py-1 text-xs font-extrabold rounded-full bg-white/80 border border-slate-200 text-slate-600 hover:bg-brand-lavender/10 hover:border-brand-lavender/30 transition-all cursor-pointer"
            >
              #{cat}s
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (width 4/12): Places List & Route Details */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* List of filtered locations */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 border-b border-slate-200/50 pb-4">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Nearby Locations</h4>
            {filteredLocations.length === 0 ? (
              <div className="text-center py-6 text-slate-500 font-medium">
                No places found.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const { score, textClass } = calculateScore(loc.features);
                const isSelected = selectedLoc?.id === loc.id;
                
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLoc(loc)}
                    className={`p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex gap-3.5 items-center ${
                      isSelected
                        ? 'border-brand-lavender bg-white shadow-sm'
                        : 'border-slate-200/60 bg-white/40 hover:bg-white/70'
                    }`}
                  >
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h5 className="text-xs font-black text-slate-800 truncate">{loc.name}</h5>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${textClass} bg-slate-100`}>
                          {score}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{loc.category} &bull; {loc.routes.shortest.distance}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Route Comparison Panel */}
          {selectedLoc && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} className="text-brand-lavender" /> Route Options
                </h4>
                
                {/* Route Switcher Tab */}
                <div className="flex bg-slate-100/80 p-0.5 rounded-full border border-slate-200/50">
                  <button
                    onClick={() => setActiveRouteTab('shortest')}
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                      activeRouteTab === 'shortest' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Fastest
                  </button>
                  <button
                    onClick={() => setActiveRouteTab('accessible')}
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                      activeRouteTab === 'accessible' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Safe Route
                  </button>
                </div>
              </div>

              {/* Active Route Details Card */}
              {(() => {
                const route = selectedLoc.routes[activeRouteTab];
                const isShortest = activeRouteTab === 'shortest';
                const hasBarriers = route.stairCount > 0 || route.barriers.length > 0;

                return (
                  <div className="bg-white/60 border border-slate-200/50 rounded-2xl p-4 space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-800 leading-tight">{route.name}</h5>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{route.distance} &bull; {route.time}</p>
                      </div>
                      <Badge colorTheme={isShortest ? 'pink' : 'mint'} variant="glass" className="text-[9px]">
                        {route.steepness === 'flat' ? 'Flat Path' : `${route.steepness} slope`}
                      </Badge>
                    </div>

                    {/* Specifications List */}
                    <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span>Stairs steps count:</span>
                        <span className={route.stairCount > 0 ? 'text-rose-500 font-bold' : 'text-emerald-600 font-bold'}>
                          {route.stairCount > 0 ? `${route.stairCount} stairs` : '✓ Step-free'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wheelchair ramps:</span>
                        <span className="font-bold">{route.hasRamps ? '✅ Available' : '❌ Missing'}</span>
                      </div>
                    </div>

                    {/* Active Barriers Warning */}
                    {hasBarriers && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-[10px] text-rose-700 font-medium">
                          <strong>Detected Barriers:</strong> {route.barriers.join(', ') || `${route.stairCount} stairs`}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* AI Recommendation Panel */}
              {recommendation && (
                <div className={`p-4 rounded-2xl border flex gap-3 ${
                  recommendation.route === 'accessible'
                    ? 'bg-emerald-50/70 border-emerald-200/60'
                    : 'bg-slate-50 border-slate-200/60'
                }`}>
                  <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${recommendation.route === 'accessible' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <div className="space-y-1">
                    <h6 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">AI Routing Advice</h6>
                    <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                      {recommendation.text}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Col (width 8/12): Map Canvas */}
        <div className="lg:col-span-8 h-[500px] rounded-3xl border border-slate-200 overflow-hidden relative shadow-inner">
          <MapContainer
            center={[40.7388, -73.9822]}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full pastel-map"
          >
            {/* Styled OpenStreetMap Tiles with Custom CSS Pastel Filter (applied in globals.css) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render User Starting Point Marker */}
            <Marker
              position={[USER_START_LAT, USER_START_LNG]}
              icon={L.divIcon({
                className: 'user-start-pin',
                html: `
                  <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-sky border-2 border-white shadow-md animate-pulse">
                    <div class="w-3.5 h-3.5 rounded-full bg-white"></div>
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            >
              <Popup>
                <div className="text-xs font-bold text-slate-800">Your starting location</div>
              </Popup>
            </Marker>
            
            {/* Render markers with recalculated scores */}
            {filteredLocations.map((loc) => {
              const { score } = calculateScore(loc.features);
              
              return (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={getCustomMarkerIcon(score)}
                  eventHandlers={{
                    click: () => setSelectedLoc(loc)
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans space-y-1 max-w-[200px]">
                      <h5 className="text-sm font-bold text-slate-800 leading-tight">{loc.name}</h5>
                      <p className="text-[10px] text-slate-500">{loc.address}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Render Route Polylines when a location is active */}
            {selectedLoc && (
              <>
                {/* Shortest Route (Route A): Dashed Pink */}
                <Polyline
                  positions={selectedLoc.routes.shortest.path}
                  color="#FF6EC7"
                  dashArray="6, 8"
                  weight={activeRouteTab === 'shortest' ? 5 : 2}
                  opacity={activeRouteTab === 'shortest' ? 0.9 : 0.4}
                />
                
                {/* Accessible Route (Route B): Solid Mint Green */}
                <Polyline
                  positions={selectedLoc.routes.accessible.path}
                  color="#7EF2C6"
                  weight={activeRouteTab === 'accessible' ? 6 : 2.5}
                  opacity={activeRouteTab === 'accessible' ? 0.95 : 0.45}
                />
              </>
            )}

            {/* Custom map controllers to pan/zoom */}
            <MapFlyController selectedLoc={selectedLoc} />
          </MapContainer>

          {/* Quick Info Box overlayed on the map */}
          {selectedLoc && (
            <div className="absolute bottom-4 left-4 right-4 z-[999] bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#8C52FF] bg-[#8C52FF]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Active Place Profile
                </span>
                <h5 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                  <MapPin className="text-brand-pink h-4 w-4" /> {selectedLoc.name}
                </h5>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  colorTheme="lavender"
                  size="sm"
                  onClick={() => alert(`Directions to ${selectedLoc.name} requested.`)}
                  className="flex-1 md:flex-none text-xs"
                >
                  <Navigation size={12} className="mr-1" /> Get Directions
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
export default AccessibilityMap;
