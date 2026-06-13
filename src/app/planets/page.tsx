'use client';

import MainLayout from '@/components/layout/MainLayout';
import PlanetCanvas from '@/components/math/PlanetCanvas';
import { 
  Info, 
  Orbit, 
  Settings, 
  Compass, 
  Layers, 
  Play, 
  Pause, 
  Scale, 
  Moon, 
  Calendar,
  Thermometer,
  ShieldAlert,
  ArrowRightLeft,
  Sun as SunIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Planet {
  id: string;
  name: string;
  type: string;
  distance: string;
  mass: string;
  diameter: string;
  dayLength: string;
  yearLength: string;
  temp: string;
  moons: string;
  colorTheme: string;
  gradient: string;
  composition: Record<string, number>;
  facts: string[];
}

const PLANETS: Planet[] = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'Yellow Dwarf Star',
    distance: '0 AU',
    mass: '333,000 Earths',
    diameter: '1,392,700 km',
    dayLength: '25-35 Earth Days',
    yearLength: 'N/A',
    temp: '5,500 °C (Surface)',
    moons: '0',
    colorTheme: 'text-amber-500 bg-amber-500 border-amber-500/30',
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    composition: { Hydrogen: 73.4, Helium: 25.0, Oxygen: 0.77, Other: 0.83 },
    facts: [
      'Holds 99.86% of all mass in the entire solar system.',
      'Core pressure fuses 600 million tons of hydrogen into helium every second.',
      'Generates a solar wind that forms the heliosphere, protecting us from cosmic rays.'
    ]
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    distance: '0.39 AU',
    mass: '0.055 Earths',
    diameter: '4,879 km',
    dayLength: '58.6 Earth Days',
    yearLength: '88 Earth Days',
    temp: '-173 to 427 °C',
    moons: '0',
    colorTheme: 'text-slate-400 bg-slate-400 border-slate-400/30',
    gradient: 'from-slate-300 via-slate-500 to-slate-700',
    composition: { Iron: 70.0, Nickel: 5.0, Silicates: 25.0 },
    facts: [
      'Closest planet to the Sun and the smallest in the solar system.',
      'Has the largest temperature swings, going from ice-cold nights to lead-melting days.',
      'Its massive iron core occupies roughly 85% of the planet\'s total radius.'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    distance: '0.72 AU',
    mass: '0.815 Earths',
    diameter: '12,104 km',
    dayLength: '243 Earth Days',
    yearLength: '224.7 Earth Days',
    temp: '462 °C',
    moons: '0',
    colorTheme: 'text-yellow-600 bg-yellow-600 border-yellow-600/30',
    gradient: 'from-yellow-400 via-orange-600 to-amber-800',
    composition: { 'Carbon Dioxide': 96.5, Nitrogen: 3.5 },
    facts: [
      'Hottest planet in the solar system due to a runaway greenhouse effect.',
      'Spins in the opposite direction (retrograde rotation) of most other planets.',
      'Atmospheric pressure is 92 times that of Earth—equivalent to being 1 km deep in the ocean.'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet',
    distance: '1.00 AU',
    mass: '1.00 Earths',
    diameter: '12,742 km',
    dayLength: '24 Hours',
    yearLength: '365.25 Days',
    temp: '15 °C (Avg)',
    moons: '1',
    colorTheme: 'text-blue-500 bg-blue-500 border-blue-500/30',
    gradient: 'from-blue-400 via-teal-500 to-indigo-700',
    composition: { Nitrogen: 78.1, Oxygen: 20.9, Argon: 0.9, Other: 0.1 },
    facts: [
      'The only known planet in the universe to support organic life.',
      'Liquid water covers 70.8% of the surface, creating a perfect biosphere.',
      'Its liquid iron outer core generates a strong magnetic field shielding us from solar radiation.'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    distance: '1.52 AU',
    mass: '0.107 Earths',
    diameter: '6,779 km',
    dayLength: '24.6 Hours',
    yearLength: '687 Earth Days',
    temp: '-62 °C',
    moons: '2',
    colorTheme: 'text-red-500 bg-red-500 border-red-500/30',
    gradient: 'from-red-400 via-orange-600 to-red-800',
    composition: { 'Carbon Dioxide': 95.3, Nitrogen: 2.7, Argon: 1.6, Other: 0.4 },
    facts: [
      'Known as the Red Planet due to iron oxide rust covering its surface.',
      'Home to Olympus Mons, the largest volcano in the solar system, three times taller than Mt. Everest.',
      'Contains frozen ice sheets under its carbon dioxide polar ice caps.'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    distance: '5.20 AU',
    mass: '317.8 Earths',
    diameter: '139,820 km',
    dayLength: '9.9 Hours',
    yearLength: '11.86 Earth Years',
    temp: '-108 °C',
    moons: '95',
    colorTheme: 'text-orange-400 bg-orange-400 border-orange-400/30',
    gradient: 'from-orange-300 via-amber-500 to-orange-800',
    composition: { Hydrogen: 89.8, Helium: 10.2 },
    facts: [
      'Largest planet in the solar system—more than twice as massive as all other planets combined.',
      'Its Great Red Spot is a giant anti-cyclonic storm wider than Earth that has raged for centuries.',
      'Spins faster than any other planet, creating deep atmospheric winds and strong magnetic bands.'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant',
    distance: '9.58 AU',
    mass: '95.2 Earths',
    diameter: '116,460 km',
    dayLength: '10.7 Hours',
    yearLength: '29.45 Earth Years',
    temp: '-139 °C',
    moons: '146',
    colorTheme: 'text-yellow-400 bg-yellow-400 border-yellow-400/30',
    gradient: 'from-yellow-200 via-amber-400 to-yellow-600',
    composition: { Hydrogen: 96.3, Helium: 3.2, Methane: 0.5 },
    facts: [
      'Famous for its spectacular concentric rings composed of billions of ice particles and rock dust.',
      'Least dense planet in the solar system—it has a density lower than water and could float in a ocean.',
      'Its largest moon Titan features thick clouds and lakes of liquid ethane and methane.'
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    distance: '19.22 AU',
    mass: '14.5 Earths',
    diameter: '50,724 km',
    dayLength: '17.2 Hours',
    yearLength: '84 Earth Years',
    temp: '-197 °C',
    moons: '28',
    colorTheme: 'text-cyan-400 bg-cyan-400 border-cyan-400/30',
    gradient: 'from-cyan-300 via-teal-400 to-blue-600',
    composition: { Hydrogen: 82.5, Helium: 15.2, Methane: 2.3 },
    facts: [
      'Spins on its side with an axial tilt of 98 degrees, rolling around the Sun like a ball.',
      'Its atmosphere is the coldest of all planetary atmospheres, hitting lows of -224 °C.',
      'Methane gas in its atmosphere absorbs red light, giving it a soft cyan-blue appearance.'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    distance: '30.05 AU',
    mass: '17.1 Earths',
    diameter: '49,244 km',
    dayLength: '16.1 Hours',
    yearLength: '164.8 Earth Years',
    temp: '-201 °C',
    moons: '16',
    colorTheme: 'text-blue-600 bg-blue-600 border-blue-600/30',
    gradient: 'from-blue-400 via-indigo-600 to-blue-800',
    composition: { Hydrogen: 80.0, Helium: 19.0, Methane: 1.5, Other: 0.5 },
    facts: [
      'The most distant planet from the Sun in our solar system.',
      'Has the strongest winds recorded, blowing frozen clouds of methane up to 2,100 km/h.',
      'Discovered mathematically through gravitational calculations before ever being observed.'
    ]
  }
];

export default function SolarSystemPage() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(PLANETS[3]); // Earth default
  const [comparePlanet, setComparePlanet] = useState<Planet>(PLANETS[4]); // Mars default
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Auto-switch compared planet when selecting same planet
  const handleSelectPlanet = (p: Planet) => {
    setSelectedPlanet(p);
    if (comparePlanet.id === p.id) {
      setComparePlanet(PLANETS.find(x => x.id !== p.id) || PLANETS[0]);
    }
  };

  // Extract relative sizes for scale simulation
  const getScaleFactor = (pId: string): number => {
    // Relative diameters mapping for simulation
    const sizes: Record<string, number> = {
      sun: 2.5,
      mercury: 0.38,
      venus: 0.95,
      earth: 1.0,
      mars: 0.53,
      jupiter: 2.1, // scaled down slightly for UI bounds
      saturn: 1.8,
      uranus: 1.25,
      neptune: 1.22
    };
    return sizes[pId] || 1;
  };

  return (
    <MainLayout>
      <div className="space-y-12 pb-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Orbit className="w-3 h-3" />
              <span>Astrophysical Telemetry</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-foreground tracking-tighter">
              Solar <span className="gradient-text">System</span>
            </h1>
            <p className="text-foreground/55 font-medium text-lg max-w-2xl">
              Explore three-dimensional planetary orbits, composition ratios, and visual telemetry computed directly in real-time.
            </p>
          </div>
        </header>

        {/* Planet Selection Grid Bar */}
        <div className="p-4 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max p-1">
            {PLANETS.map((p) => {
              const active = selectedPlanet.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlanet(p)}
                  className={cn(
                    "px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 border hover:scale-[1.02] active:scale-[0.98]",
                    active 
                      ? "bg-foreground text-background border-foreground shadow-lg" 
                      : "bg-foreground/[0.02] border-border/50 text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                  )}
                >
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    active ? "bg-primary animate-pulse" : p.colorTheme.split(' ')[1]
                  )} />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Holographic 3D Viewport Deck */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-[40px] bg-slate-950 border border-border/60 shadow-2xl relative overflow-hidden flex flex-col justify-center items-center p-8 min-h-[480px]">
              
              {/* Starfield overlay background */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_0%,rgba(10,12,20,1)_85%)] z-0 pointer-events-none" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMC41IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuOCIvPgo8L3N2Zz4=')] opacity-25 z-0 pointer-events-none" />
              
              {/* Radar circular markings */}
              <div className="absolute w-[340px] h-[340px] border border-white/5 rounded-full z-0 pointer-events-none flex items-center justify-center">
                <div className="w-[280px] h-[280px] border border-white/5 rounded-full flex items-center justify-center">
                  <div className="w-[200px] h-[200px] border border-dashed border-white/5 rounded-full" />
                </div>
              </div>

              {/* Planet procedural visualizer */}
              <div className="relative z-10 w-full flex items-center justify-center">
                <PlanetCanvas 
                  planetId={selectedPlanet.id}
                  size={320}
                  isPlaying={isPlaying}
                  rotationSpeed={rotationSpeed}
                />
              </div>

              {/* Viewport Compass readout */}
              <div className="absolute top-6 left-6 z-20 font-black text-[9px] tracking-widest text-white/30 uppercase flex flex-col gap-1">
                <span>Viewport: 3D Observational Deck</span>
                <span>Axial Tilt: {selectedPlanet.id === 'uranus' ? '97.8°' : selectedPlanet.id === 'saturn' ? '26.7°' : '23.4°'}</span>
              </div>

              <div className="absolute top-6 right-6 z-20 font-black text-[9px] tracking-widest text-white/30 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                <span>Sim Engine: Active</span>
              </div>

              {/* Simulation Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-900/80 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md shadow-2xl">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer",
                    isPlaying ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-green-500/20 text-green-500 border border-green-500/30"
                  )}
                  title={isPlaying ? "Pause Rotation" : "Resume Rotation"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="h-6 w-[1px] bg-white/10" />
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Speed</span>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Scale Comparison Simulation Sandbox */}
            <div className="p-6 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
                  <Scale className="text-primary w-4 h-4" />
                  Scale Comparison Sandbox
                </h3>
                <button
                  onClick={() => setIsComparing(!isComparing)}
                  className="px-3.5 py-1.5 rounded-xl bg-foreground/5 border border-border text-[9px] font-black uppercase tracking-wider hover:bg-foreground/10 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isComparing ? 'Close Simulation' : 'Launch Simulator'}</span>
                </button>
              </div>

              <AnimatePresence>
                {isComparing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 overflow-hidden pt-2"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">Planet A</label>
                        <select
                          value={selectedPlanet.id}
                          onChange={(e) => setSelectedPlanet(PLANETS.find(x => x.id === e.target.value) || PLANETS[3])}
                          className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-border text-xs font-bold focus:outline-none focus:border-primary text-foreground"
                        >
                          {PLANETS.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Right Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">Planet B</label>
                        <select
                          value={comparePlanet.id}
                          onChange={(e) => setComparePlanet(PLANETS.find(x => x.id === e.target.value) || PLANETS[4])}
                          className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-border text-xs font-bold focus:outline-none focus:border-primary text-foreground"
                        >
                          {PLANETS.filter(x => x.id !== selectedPlanet.id).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Scale simulation canvas drawing */}
                    <div className="relative h-44 rounded-2xl bg-slate-950/65 border border-border/50 flex items-center justify-around p-4 overflow-hidden">
                      {/* Space grid background */}
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                      
                      {/* Planet A */}
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="h-28 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: getScaleFactor(selectedPlanet.id) }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className={cn(
                              "rounded-full bg-gradient-to-tr filter blur-[0.5px] shadow-2xl shadow-white/5",
                              selectedPlanet.gradient
                            )}
                            style={{ 
                              width: '40px', 
                              height: '40px',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/55">{selectedPlanet.name} ({selectedPlanet.diameter})</span>
                      </div>

                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 relative z-10">vs</div>

                      {/* Planet B */}
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="h-28 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: getScaleFactor(comparePlanet.id) }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className={cn(
                              "rounded-full bg-gradient-to-tr filter blur-[0.5px] shadow-2xl shadow-white/5",
                              comparePlanet.gradient
                            )}
                            style={{ 
                              width: '40px', 
                              height: '40px',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/55">{comparePlanet.name} ({comparePlanet.diameter})</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Telemetry Profiles & Planetary Data */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Metrics Grid */}
            <div className="p-6 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">{selectedPlanet.type}</span>
                  <h3 className="text-2xl font-heading font-black text-foreground tracking-tight uppercase mt-1">
                    {selectedPlanet.name}
                  </h3>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-foreground/5 border border-border text-[9px] font-black uppercase tracking-wider text-foreground/50">
                  {selectedPlanet.distance}
                </div>
              </div>

              {/* Data Blocks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-border/40 flex items-start gap-3">
                  <SunIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-black text-foreground/45 tracking-wider">Distance</span>
                    <p className="font-heading font-black text-foreground text-sm">{selectedPlanet.distance}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-border/40 flex items-start gap-3">
                  <Scale className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-black text-foreground/45 tracking-wider">Mass</span>
                    <p className="font-heading font-black text-foreground text-sm">{selectedPlanet.mass}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-border/40 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-black text-foreground/45 tracking-wider">Orbit Year</span>
                    <p className="font-heading font-black text-foreground text-sm">{selectedPlanet.yearLength}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-border/40 flex items-start gap-3">
                  <Moon className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-black text-foreground/45 tracking-wider">Natural Moons</span>
                    <p className="font-heading font-black text-foreground text-sm">{selectedPlanet.moons}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Atmosphere & Composition Gauges */}
            <div className="p-6 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
                <Layers className="text-secondary w-4 h-4" />
                Chemical Composition Profile
              </h3>
              
              <div className="space-y-4">
                {Object.entries(selectedPlanet.composition).map(([element, percentage]) => (
                  <div key={element} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground/80">{element}</span>
                      <span className="font-black text-primary">{percentage}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          selectedPlanet.gradient
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fact Logs */}
            <div className="p-6 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
                <Info className="text-primary w-4 h-4" />
                Planetary Fact logs
              </h3>

              <div className="space-y-3.5">
                {selectedPlanet.facts.map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-foreground/[0.02] border border-border/40 text-xs text-foreground/75 leading-relaxed">
                    <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
