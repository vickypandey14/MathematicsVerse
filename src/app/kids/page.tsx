'use client';

import MainLayout from '@/components/layout/MainLayout';
import { 
  Sparkles, 
  Grid, 
  Hash, 
  ArrowRight, 
  Star, 
  Zap, 
  RefreshCcw,
  Plus,
  Minus,
  Timer,
  Trophy
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import TimeChallenge from '@/components/math/TimeChallenge';
import TrophyRoom, { TrophyID } from '@/components/math/TrophyRoom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function KidsCorner() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    }>
      <KidsCornerContent />
    </Suspense>
  );
}

function KidsCornerContent() {
  const searchParams = useSearchParams();
  const [baseNumber, setBaseNumber] = useState<number>(7);
  const [inputValue, setInputValue] = useState<string>("7");
  const [activeView, setActiveView] = useState<'table' | 'visual' | 'challenge' | 'trophies'>('table');
  const [unlockedTrophies, setUnlockedTrophies] = useState<TrophyID[]>([]);

  useEffect(() => {
    // If we have a mission mode in the URL, jump straight to the game tab
    const mode = searchParams.get('mode');
    if (mode) {
      setActiveView('challenge');
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem('math-verse-trophies');
    if (saved) setUnlockedTrophies(JSON.parse(saved));
  }, [activeView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d{0,3}$/.test(val)) { // Limit to 3 digits for visual clarity
      setInputValue(val);
      if (val !== "") {
        setBaseNumber(parseInt(val));
      }
    }
  };

  const increment = () => {
    if (baseNumber < 999) {
      const newVal = baseNumber + 1;
      setBaseNumber(newVal);
      setInputValue(newVal.toString());
    }
  };

  const decrement = () => {
    if (baseNumber > 1) {
      const newVal = baseNumber - 1;
      setBaseNumber(newVal);
      setInputValue(newVal.toString());
    }
  };

  const tableValues = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Kids Hero - More Compact */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 bg-gradient-to-tr from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg"
            >
              <Sparkles className="text-white w-6 h-6" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter">
              Kids <span className="text-secondary">Corner</span>
            </h1>
          </div>
          <div className="hidden md:block">
              <div className="px-6 py-3 rounded-2xl bg-foreground/5 border border-border flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                 <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Active Learning Mode</span>
              </div>
          </div>
        </div>

        {/* The Interactive Workshop */}
        <section className="max-w-6xl mx-auto">
          <div className="p-8 md:p-12 rounded-[48px] bg-card/40 border border-border shadow-2xl backdrop-blur-md relative overflow-hidden min-h-[600px]">
             
             {/* Mode Selector - Scrollable on mobile */}
             <div className="flex justify-center mb-12">
                 <div className="w-full overflow-x-auto pb-2 hide-scrollbar flex justify-center">
                   <div className="bg-foreground/10 p-1.5 rounded-2xl border border-border flex items-center w-fit">
                     <button 
                      onClick={() => setActiveView('table')}
                      className={cn(
                        "px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        activeView === 'table' ? "bg-foreground text-background shadow-xl" : "text-foreground/50 hover:text-foreground"
                      )}
                     >
                       Table
                     </button>
                     <button 
                      onClick={() => setActiveView('visual')}
                      className={cn(
                        "px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        activeView === 'visual' ? "bg-foreground text-background shadow-xl" : "text-foreground/50 hover:text-foreground"
                      )}
                     >
                       Visuals
                     </button>
                     <button 
                      onClick={() => setActiveView('challenge')}
                      className={cn(
                        "px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center whitespace-nowrap",
                        activeView === 'challenge' ? "bg-foreground text-background shadow-xl" : "text-foreground/50 hover:text-foreground"
                      )}
                     >
                       <Timer className="w-3 h-3 mr-2" />
                       Game
                     </button>
                     <button 
                      onClick={() => setActiveView('trophies')}
                      className={cn(
                        "px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center whitespace-nowrap",
                        activeView === 'trophies' ? "bg-foreground text-background shadow-xl" : "text-foreground/50 hover:text-foreground"
                      )}
                     >
                       <Trophy className="w-3 h-3 mr-2" />
                       Trophies
                     </button>
                  </div>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Controls - Only show for Table and Visuals */}
                {(activeView === 'table' || activeView === 'visual') && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="lg:col-span-4 space-y-10"
                  >
                     <div className="space-y-6">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-[0.2em] flex items-center">
                          <Star className="text-secondary w-5 h-5 mr-3 fill-current" />
                          {activeView === 'table' ? 'Table Maker' : 'Visual Maker'}
                        </h2>
                        
                        <div className="flex items-center space-x-4">
                          <button onClick={decrement} className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center hover:bg-secondary/20 hover:text-foreground transition-all">
                             <Minus className="w-5 h-5" />
                          </button>
                          <div className="relative flex-grow">
                            <input 
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              className="w-full bg-foreground/10 border-2 border-border rounded-2xl py-6 text-center text-4xl font-heading font-black text-foreground focus:outline-none focus:border-secondary transition-all"
                            />
                          </div>
                          <button onClick={increment} className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center hover:bg-primary/20 hover:text-foreground transition-all">
                             <Plus className="w-5 h-5" />
                          </button>
                        </div>
                     </div>

                     <div className="p-8 rounded-[32px] bg-foreground/[0.03] border border-border space-y-4">
                        <div className="flex items-center space-x-3 text-secondary">
                          <Zap className="w-4 h-4 fill-current" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Math Tip</span>
                        </div>
                        <p className="text-foreground/60 text-sm font-medium leading-relaxed">
                          {baseNumber === 9 ? "The digits of 9 times table always add up to 9!" : 
                           baseNumber % 2 === 0 ? "Any number times an even number is ALWAYS even!" : 
                           "Try saying the numbers out loud as you read them!"}
                        </p>
                     </div>
                  </motion.div>
                )}

                {/* Right Side: Content Area - Expand if controls are hidden */}
                <div className={cn(
                  "bg-foreground/5 rounded-[40px] border border-border p-8 relative overflow-hidden min-h-[450px] flex flex-col transition-all duration-500",
                  (activeView === 'table' || activeView === 'visual') ? "lg:col-span-8" : "lg:col-span-12"
                )}>
                   <AnimatePresence mode="wait">
                      {activeView === 'table' ? (
                        <motion.div 
                          key="table"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                           {tableValues.map((num) => (
                             <div key={num} className="p-4 rounded-2xl bg-foreground/5 border border-border hover:border-secondary/30 transition-all flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">{baseNumber} × {num}</span>
                                <span className="text-2xl font-heading font-black text-foreground">{(baseNumber * num).toLocaleString()}</span>
                             </div>
                           ))}
                        </motion.div>
                      ) : activeView === 'visual' ? (
                        <motion.div 
                          key="visual"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="h-full flex flex-col"
                        >
                           <div className="flex items-center justify-between mb-8">
                              <h4 className="text-foreground font-black uppercase tracking-widest text-xs">Visual Area Model</h4>
                              <span className="text-secondary text-[10px] font-black">Showing {baseNumber} rows of {Math.min(baseNumber, 10)}</span>
                           </div>
                           
                           <div className="flex-grow flex justify-center p-8 bg-foreground/10 rounded-3xl overflow-auto max-h-[400px] scrollbar-hide">
                              <div className="grid gap-2 m-auto h-fit" style={{ 
                                gridTemplateColumns: `repeat(${Math.min(baseNumber, 10)}, minmax(0, 1fr))`,
                                width: 'fit-content'
                              }}>
                                 {Array.from({ length: Math.min(baseNumber * Math.min(baseNumber, 10), 100) }).map((_, i) => (
                                   <motion.div 
                                     key={i}
                                     initial={{ scale: 0 }}
                                     animate={{ scale: 1 }}
                                     transition={{ delay: i * 0.01 }}
                                     className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-secondary/10 border border-secondary/20 rounded-lg text-lg"
                                   >
                                      ⭐
                                   </motion.div>
                                 ))}
                                 {baseNumber > 10 && <div className="col-span-full text-center py-4 text-foreground/40 font-black uppercase text-[10px] tracking-widest">Showing first 100 stars...</div>}
                              </div>
                           </div>
                           
                           <p className="mt-8 text-foreground/50 text-center text-xs font-medium italic">
                             &ldquo;This is what multiplication looks like! It&rsquo;s just a grid of stars.&rdquo;
                           </p>
                        </motion.div>
                      ) : activeView === 'challenge' ? (
                        <motion.div 
                          key="challenge"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="h-full"
                        >
                           <TimeChallenge />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="trophies"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="h-full"
                        >
                           <TrophyRoom unlockedIds={unlockedTrophies} />
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
          </div>
        </section>

        {/* Fun Tips Footer - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
           <div className="p-8 rounded-[40px] bg-foreground/[0.02] border border-border flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                 <RefreshCcw className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-foreground font-black uppercase tracking-widest text-xs mb-1">Fast Addition</h4>
                <p className="text-foreground/50 text-sm font-medium">Multiplication is just adding the same number over and over!</p>
              </div>
           </div>
           <div className="p-8 rounded-[40px] bg-foreground/[0.02] border border-border flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                 <Star className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h4 className="text-foreground font-black uppercase tracking-widest text-xs mb-1">Number Magic</h4>
                <p className="text-foreground/50 text-sm font-medium">Every number has its own special patterns to discover!</p>
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
