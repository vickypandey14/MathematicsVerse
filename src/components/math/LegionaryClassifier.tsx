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
  const [formation, setFormation] = useState<'loose' | 'tight' | 'column'>('loose');
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
                  min="0"
                  max="1000000"
                  value={value}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsed = parseInt(val);
                    if (val === '') {
                      setValue('');
                    } else if (parsed >= 0 && parsed <= 1000000) {
                      setValue(val);
                    }
                  }}
                  placeholder="Enter soldier count..."
                  className="w-full bg-black/40 border border-white/10 rounded-[24px] py-6 pl-16 pr-8 text-2xl font-black text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-800"
                />
             </div>

             <div className="p-6 rounded-[24px] bg-primary/10 border border-primary/20 flex flex-col justify-center min-w-[160px]">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Your Rank</span>
                <span className="text-xl font-heading font-black text-white uppercase tracking-tighter">{insights.rank}</span>
             </div>
           </div>

           {num > 80000 && (
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-4"
             >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                   <Info className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-amber-500/80 text-[10px] font-bold uppercase tracking-wider">
                  Historian's Note: Very few Roman commanders ever led a force larger than 80,000 in a single field.
                </p>
             </motion.div>
           )}
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

      {/* Tactical Deployment (Battle Map) */}
      {num > 0 && (
        <section className="p-12 rounded-[48px] bg-black/40 border border-white/5 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_100%)]" />
          
          <div className="relative z-10 space-y-10">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-white font-black uppercase tracking-widest text-xs">Tactical Deployment</h4>
                  <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Visual Field Representation</p>
                </div>
                
                {/* Formation Toggle */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                   {[
                     { id: 'loose', label: 'Skirmish' },
                     { id: 'tight', label: 'Shield-Wall' },
                     { id: 'column', label: 'Marching' }
                   ].map((f) => (
                     <button
                       key={f.id}
                       onClick={() => setFormation(f.id as any)}
                       className={cn(
                         "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                         formation === f.id ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                       )}
                     >
                        {f.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="min-h-[240px] flex flex-wrap items-start justify-start transition-all duration-700"
                  style={{ 
                    gap: formation === 'loose' ? '12px' : formation === 'tight' ? '4px' : '2px',
                    flexDirection: formation === 'column' ? 'column' : 'row'
                  }}>
                {num > 10000 ? (
                  <div className="w-full space-y-6">
                     <div className="flex flex-wrap gap-4">
                        {Array.from({ length: Math.min(Math.floor(num / 5000), 20) }).map((_, i) => (
                          <div key={i} className="w-20 h-28 bg-red-500/20 border-2 border-red-500/40 rounded-xl flex flex-col items-center justify-center space-y-2 group hover:bg-red-500/30 transition-all cursor-help">
                             <Flag className="w-6 h-6 text-red-500" />
                             <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Legion</span>
                          </div>
                        ))}
                        {num > 100000 && <div className="text-slate-600 self-end pb-4 font-black">...and many more</div>}
                     </div>
                  </div>
                ) : num > 1000 ? (
                  <div className={cn(
                    "flex flex-wrap transition-all duration-700",
                    formation === 'loose' ? "gap-6" : formation === 'tight' ? "gap-2" : "gap-1 flex-col"
                  )}>
                     {Array.from({ length: Math.floor(num / 480) }).map((_, i) => (
                       <div key={i} className="w-16 h-20 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center group hover:scale-110 transition-transform">
                          <Shield className="w-5 h-5 text-primary" />
                       </div>
                     ))}
                     {Array.from({ length: Math.floor((num % 480) / 80) }).map((_, i) => (
                       <div key={i} className="w-10 h-10 bg-secondary/20 border border-secondary/40 rounded-md flex items-center justify-center opacity-60">
                          <Users className="w-4 h-4 text-secondary" />
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className={cn(
                    "flex flex-wrap transition-all duration-700 max-w-4xl",
                    formation === 'loose' ? "gap-2" : formation === 'tight' ? "gap-0.5" : "gap-0.5 flex-col h-64 overflow-hidden"
                  )}>
                     {Array.from({ length: Math.min(num, 1000) }).map((_, i) => (
                       <motion.div 
                         key={i} 
                         layout
                         className={cn(
                           "rounded-full transition-all duration-500",
                           formation === 'loose' ? "w-2 h-2 bg-primary/60" : "w-1.5 h-1.5 bg-primary/80",
                           formation === 'tight' && "rounded-sm"
                         )} 
                       />
                     ))}
                  </div>
                )}
             </div>

             <div className="pt-6 border-t border-white/5 flex flex-wrap gap-6 text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-primary/60" />
                   <span>= Individual Legionary</span>
                </div>
                <div className="flex items-center space-x-4 ml-auto italic opacity-50">
                   <Info className="w-3 h-3" />
                   <span>Toggle formations to see how Romans adjusted their spacing.</span>
                </div>
             </div>
          </div>
        </section>
      )}

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
