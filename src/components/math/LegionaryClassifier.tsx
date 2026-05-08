'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Users, Flag, Landmark, Info, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const UNITS = [
  { name: 'Consular Army', size: 10000, icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { name: 'Legion', size: 5000, icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { name: 'Cohort', size: 480, icon: Shield, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  { name: 'Century', size: 80, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  { name: 'Contubernium', size: 8, icon: Sword, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
];

export default function LegionaryClassifier() {
  const [value, setValue] = useState<string>('5432');
  const num = parseInt(value) || 0;

  const calculateBreakdown = (total: number) => {
    let remaining = total;
    const breakdown = UNITS.map(unit => {
      const count = Math.floor(remaining / unit.size);
      remaining %= unit.size;
      return { ...unit, count };
    });
    return { breakdown, remaining };
  };

  const { breakdown, remaining } = calculateBreakdown(num);

  const getStrategicInsights = (count: number) => {
    let rank = "Legionary";
    let historical = "A small detachment for scouting or guard duty.";
    
    if (count >= 10000) { rank = "Consul"; historical = "A massive force capable of conquering entire kingdoms."; }
    else if (count >= 5000) { rank = "Legatus Legionis"; historical = "A full Legion, the backbone of the Roman Empire."; }
    else if (count >= 480) { rank = "Tribune"; historical = "A significant force, enough to hold a strategic fort."; }
    else if (count >= 80) { rank = "Centurion"; historical = "The classic unit of the Roman line."; }
    else if (count >= 300 && count < 400) { historical = "Reminiscent of the legendary 300 at Thermopylae."; }

    return {
      rank,
      historical,
      grain: (count * 2).toLocaleString(),
      length: (count * 0.8 / 1000).toFixed(1)
    };
  };

  const insights = getStrategicInsights(num);

  return (
    <div className="space-y-12">
      {/* Input Header */}
      <div className="p-10 rounded-[40px] bg-slate-900/40 border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield className="w-32 h-32" />
        </div>
        
        <div className="relative z-10 space-y-8">
           <div className="space-y-2">
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Military Scale</h3>
              <p className="text-slate-500 font-medium">How many Roman soldiers are you commanding?</p>
           </div>

           <div className="flex flex-col md:flex-row gap-6">
             <div className="relative group max-w-md flex-grow">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                   <Users className="w-6 h-6 text-primary group-focus-within:scale-110 transition-transform" />
                </div>
                <input 
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter soldier count..."
                  className="w-full bg-black/40 border border-white/10 rounded-[24px] py-6 pl-16 pr-8 text-2xl font-black text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-800"
                />
             </div>

             <div className="p-6 rounded-[24px] bg-primary/10 border border-primary/20 flex flex-col justify-center">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Your Rank</span>
                <span className="text-xl font-heading font-black text-white uppercase tracking-tighter">{insights.rank}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Commander's Briefing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 rounded-[32px] bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center space-x-3 text-secondary">
               <History className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">History</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">{insights.historical}</p>
         </div>

         <div className="p-8 rounded-[32px] bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
               <Landmark className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Logistics</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Requires <strong className="text-white">{insights.grain} lbs</strong> of grain per day to stay combat-ready.
            </p>
         </div>

         <div className="p-8 rounded-[32px] bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center space-x-3 text-primary">
               <Flag className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Formations</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              When marching in column, your line stretches for <strong className="text-white">{insights.length} km</strong>.
            </p>
         </div>
      </div>

      {/* Visual Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {breakdown.map((unit, idx) => (
            unit.count > 0 && (
              <motion.div
                key={unit.name}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-8 rounded-[32px] border backdrop-blur-md relative overflow-hidden group",
                  unit.bg, unit.border
                )}
              >
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <unit.icon className={cn("w-32 h-32", unit.color)} />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg", unit.bg, unit.border)}>
                    <unit.icon className={cn("w-6 h-6", unit.color)} />
                  </div>
                  
                  <div>
                    <p className="text-4xl font-heading font-black text-white tracking-tighter">
                      {unit.count.toLocaleString()}
                    </p>
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", unit.color)}>
                      {unit.count === 1 ? unit.name : `${unit.name}s`}
                    </p>
                  </div>

                  <p className="text-slate-500 text-xs font-medium">
                    Equivalent to { (unit.count * unit.size).toLocaleString() } men.
                  </p>
                </div>
              </motion.div>
            )
          ))}
          
          {remaining > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-md flex flex-col justify-center"
            >
               <p className="text-4xl font-heading font-black text-white tracking-tighter">{remaining}</p>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Individual Legionaries</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Educational Footer */}
      <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center gap-10">
         <div className="w-20 h-20 shrink-0 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center shadow-2xl">
            <Info className="w-8 h-8 text-primary" />
         </div>
         <div className="space-y-4">
            <h4 className="text-white font-black uppercase tracking-widest text-sm">Did you know?</h4>
            <p className="text-slate-500 font-medium leading-relaxed">
              The Roman military was organized for extreme efficiency. A <strong>Contubernium</strong> shared a single tent, while a <strong>Legion</strong> was a self-sufficient army with its own engineers, doctors, and artillery.
            </p>
         </div>
      </div>
    </div>
  );
}
