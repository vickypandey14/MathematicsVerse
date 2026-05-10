'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Plus, Minus, Hash, ArrowRight, Star, Target, Gamepad2, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ArcadeWidget() {
  const [stats, setStats] = useState({
    highScore: 0,
    lifetimeCorrect: 0,
  });

  useEffect(() => {
    const highScore = parseInt(localStorage.getItem('math-verse-high-score') || '0');
    const lifetimeCorrect = parseInt(localStorage.getItem('math-verse-lifetime-correct') || '0');
    setStats({ highScore, lifetimeCorrect });
  }, []);

  const quickMissions = [
    { id: 'multiply', name: 'Table Master', icon: X, color: 'text-primary', glow: 'shadow-primary/40' },
    { id: 'add', name: 'Sum Striker', icon: Plus, color: 'text-green-500', glow: 'shadow-green-500/40' },
    { id: 'subtract', name: 'Minus Medic', icon: Minus, color: 'text-blue-500', glow: 'shadow-blue-500/40' },
    { id: 'roman', name: 'Roman Raider', icon: Hash, color: 'text-secondary', glow: 'shadow-secondary/40' },
  ];

  return (
    <div className="col-span-1 md:col-span-3 p-[2px] rounded-[48px] bg-gradient-to-r from-primary via-secondary to-accent shadow-2xl relative group overflow-hidden transition-all hover:scale-[1.01]">
      <div className="bg-card rounded-[46px] p-6 md:p-10 h-full relative z-10 overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.1, 0.3, 0.1]
             }}
             transition={{ duration: 8, repeat: Infinity }}
             className="absolute -left-20 -top-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px]"
           />
           <motion.div 
             animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1]
             }}
             transition={{ duration: 10, repeat: Infinity, delay: 1 }}
             className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/30 rounded-full blur-[100px]"
           />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
           {/* Left: Branding & Core Info */}
           <div className="space-y-8 flex-grow">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-primary shadow-xl">
                    <Gamepad2 className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.4em] text-foreground/50">Your Math Arcade</span>
              </div>

              <div className="space-y-2">
                 <h2 className="text-5xl md:text-6xl font-heading font-black text-foreground tracking-tighter leading-none">
                    READY TO <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">PLAY?</span>
                 </h2>
                 <p className="text-slate-500 font-medium text-lg max-w-md">
                    You've solved <span className="text-foreground font-black">{stats.lifetimeCorrect}</span> problems so far. Can you beat your high score today?
                 </p>
              </div>

              <div className="flex items-center">
                 <Link 
                    href="/kids"
                    className="group relative px-10 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/40 flex items-center justify-center space-x-3 overflow-hidden min-w-[220px]"
                 >
                    <span className="relative z-10">Start Playing</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>

           {/* Right: Holographic Stats & Quick Links */}
           <div className="flex flex-col items-center md:items-end space-y-10 w-full md:w-auto">
              {/* Stat Chips */}
              <div className="flex flex-col space-y-4 w-full sm:w-64">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group/stat">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                       <Star className="w-8 h-8 text-secondary fill-current" />
                       <div className="text-right">
                          <p className="text-3xl font-heading font-black text-foreground tracking-tighter leading-none">{stats.highScore}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mt-1">Personal Best</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group/stat">
                    <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                       <Target className="w-8 h-8 text-primary" />
                       <div className="text-right">
                          <p className="text-3xl font-heading font-black text-foreground tracking-tighter leading-none">{stats.lifetimeCorrect}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mt-1">Lifetime Rank</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Game Icons: The Kinetic Orbs */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="flex items-center space-x-5 pt-2"
              >
                 {quickMissions.map((m, i) => (
                   <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, scale: 0, y: 20 },
                      visible: { opacity: 1, scale: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.1, y: -8 }}
                    whileTap={{ scale: 0.9 }}
                   >
                     <Link 
                      href={`/kids?mode=${m.id}`} 
                      className={cn(
                        "w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center transition-all hover:bg-card/80 hover:border-border/50 shadow-xl group/btn overflow-hidden relative",
                        m.color
                      )}
                     >
                       {/* The Glow Effect */}
                       <div className={cn("absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity bg-current", m.glow.replace('shadow-', 'bg-'))} />
                       
                       {/* Rotating Light Streak */}
                       <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className={cn("absolute -inset-2 opacity-0 group-hover/btn:opacity-30 blur-xl transition-opacity bg-gradient-to-r from-transparent via-current to-transparent", m.color)}
                       />
                       
                       <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                       >
                         <m.icon className="w-7 h-7 relative z-10 group-hover/btn:rotate-[360deg] transition-transform duration-700" />
                       </motion.div>
                     </Link>
                   </motion.div>
                 ))}
              </motion.div>
           </div>
        </div>
      </div>

      {/* Extreme Decorative BG */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.02]">
         <div className="grid grid-cols-12 gap-4 h-full w-full rotate-12 scale-150">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="h-full border-r border-white/20" />
            ))}
         </div>
      </div>
    </div>
  );
}
