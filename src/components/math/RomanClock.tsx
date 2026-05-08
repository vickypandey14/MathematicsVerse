'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Info, History, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RomanClock({ 
  soundEnabled, 
  setSoundEnabled 
}: { 
  soundEnabled: boolean; 
  setSoundEnabled: (v: boolean) => void 
}) {
  const [time, setTime] = useState(new Date());
  const [useWatchmakerFour, setUseWatchmakerFour] = useState(true);

  const playTick = () => {
    if (!soundEnabled) return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
    
    setTimeout(() => audioCtx.close(), 200);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      playTick();
    }, 1000);
    return () => clearInterval(timer);
  }, [soundEnabled]);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const getRoman = (num: number) => {
    const standard = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    const watchmaker = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    const list = useWatchmakerFour ? watchmaker : standard;
    return list[num % 12];
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-16 overflow-hidden">
      <div className="p-6 md:p-12 lg:p-20 rounded-[48px] md:rounded-[64px] bg-white/[0.02] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden flex flex-col xl:flex-row items-center gap-12 xl:gap-20">
        
        {/* The Clock Hub */}
        <div className="relative group shrink-0">
          {/* Outer Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
          
          {/* Main Clock Face */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[440px] lg:h-[440px] rounded-full p-1.5 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl border border-white/20">
            <div className="w-full h-full rounded-full bg-[#050505] relative overflow-hidden shadow-inner">
              
              {/* Radial Texture / Brushed Metal Effect */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" 
                   style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%, rgba(255,255,255,0.1))' }} 
              />

              {/* Minute Ticks */}
              {[...Array(60)].map((_, i) => {
                const isHour = i % 5 === 0;
                return (
                  <div 
                    key={i} 
                    className="absolute inset-0 flex flex-col items-center pt-2"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                  >
                    <div 
                      className={cn(
                        isHour ? "w-1 h-5 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "w-0.5 h-2 bg-white/10"
                      )}
                    />
                  </div>
                );
              })}

              {/* Numbers */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30);
                return (
                  <div 
                    key={i} 
                    className="absolute inset-0 flex flex-col items-center pt-10"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <span 
                      className="text-2xl md:text-3xl font-heading font-black text-white/80 select-none tracking-tighter"
                      style={{ transform: `rotate(-${angle}deg)` }}
                    >
                      {getRoman(i)}
                    </span>
                  </div>
                );
              })}

              {/* Branding */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none mt-32">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">MathematicsVerse</span>
                 <span className="text-[8px] font-medium uppercase tracking-[0.3em]">Imperial Edition</span>
              </div>

              {/* Hands */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Hour Hand */}
                <motion.div 
                  className="absolute w-2.5 h-[28%] bg-white rounded-full origin-bottom shadow-2xl z-10"
                  style={{ 
                    bottom: '50%',
                    rotate: (hours * 30) + (minutes * 0.5)
                  }}
                  transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                />
                
                {/* Minute Hand */}
                <motion.div 
                  className="absolute w-1.5 h-[40%] bg-gradient-to-t from-primary to-primary/50 rounded-full origin-bottom shadow-[0_0_20px_rgba(99,102,241,0.4)] z-20"
                  style={{ 
                    bottom: '50%',
                    rotate: minutes * 6 
                  }}
                />

                {/* Second Hand (Sweeping) */}
                <motion.div 
                  className="absolute w-0.5 h-[46%] bg-secondary rounded-full origin-bottom z-30 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                  style={{ 
                    bottom: '50%',
                    rotate: seconds * 6 
                  }}
                  animate={{ rotate: seconds * 6 }}
                  transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
                />

                {/* Center Assembly */}
                <div className="relative z-40">
                  <div className="w-5 h-5 bg-black rounded-full border-2 border-white/20 shadow-2xl" />
                  <div className="absolute inset-1 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-grow space-y-10 max-w-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              <span>Real-Time Horologium</span>
            </div>
            <h3 className="text-xl sm:text-3xl md:text-4xl xl:text-5xl font-heading font-black text-white tracking-tighter uppercase leading-none whitespace-nowrap">
              Classical <span className="gradient-text">Timekeeping</span>
            </h3>
            <p className="text-slate-500 font-medium text-lg italic">"Tempus fugit" — Time flies.</p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-8">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block">Dial Layout</span>
                <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-md w-fit">
                  <button 
                    onClick={() => setUseWatchmakerFour(true)}
                    className={cn(
                      "px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      useWatchmakerFour ? "bg-white text-black shadow-2xl scale-105" : "text-slate-500 hover:text-white"
                    )}
                  >
                    Watchmaker
                  </button>
                  <button 
                    onClick={() => setUseWatchmakerFour(false)}
                    className={cn(
                      "px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      !useWatchmakerFour ? "bg-white text-black shadow-2xl scale-105" : "text-slate-500 hover:text-white"
                    )}
                  >
                    Standard
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block">Tick Sound</span>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    "p-4 rounded-[24px] border transition-all duration-300 flex items-center space-x-3",
                    soundEnabled 
                      ? "bg-secondary/20 border-secondary text-secondary shadow-[0_0_20px_rgba(217,70,239,0.2)]" 
                      : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                  )}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span className="text-[10px] font-black uppercase tracking-widest px-2">
                    {soundEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-10 rounded-[48px] bg-white/[0.03] border border-white/10 relative overflow-hidden group/card shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:scale-110 transition-transform duration-700">
                <History className="w-24 h-24 text-secondary" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                   <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Info className="text-secondary w-4 h-4" />
                   </div>
                   <h4 className="text-white font-black uppercase tracking-widest text-xs">The Mystery of the Four</h4>
                </div>
                
                <p className="text-slate-400 text-base leading-relaxed font-medium mb-6">
                  {useWatchmakerFour 
                    ? "In watchmaking, 'IIII' is preferred for its 'Golden Balance'. It creates a perfect symmetry with the 'VIII' on the opposite side. Interestingly, King Louis XIV of France reportedly preferred 'IIII' so strongly that it became the industry standard."
                    : "The 'IV' symbol is mathematically correct according to the subtractive rule. However, on a round clock face, 'IV' can look very similar to 'VI' when viewed at an angle. Choosing this mode reflects modern mathematical precision over classical aesthetics."}
                </p>

                <div className="flex items-center space-x-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                   <ShieldCheck className="w-4 h-4" />
                   <span>Authentic Roman Logic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
