'use client';

import { Hash, Info, History, GraduationCap, Compass } from 'lucide-react';
import ChronosCalculator from '@/components/math/ChronosCalculator';
import InscriptionGenerator from '@/components/math/InscriptionGenerator';
import RomanClock from '@/components/math/RomanClock';
import MainLayout from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const romanMap = [
  { value: 1000, symbol: 'M' },
  { value: 900, symbol: 'CM' },
  { value: 500, symbol: 'D' },
  { value: 400, symbol: 'CD' },
  { value: 100, symbol: 'C' },
  { value: 90, symbol: 'XC' },
  { value: 50, symbol: 'L' },
  { value: 40, symbol: 'XL' },
  { value: 10, symbol: 'X' },
  { value: 9, symbol: 'IX' },
  { value: 5, symbol: 'V' },
  { value: 4, symbol: 'IV' },
  { value: 1, symbol: 'I' },
];

function toRoman(num: number): string {
  let result = '';
  for (const { value, symbol } of romanMap) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

function RomanNumeralBlock({ n, r }: { n: number; r: string }) {
  return (
    <div className="perspective-1000 w-full h-24 group">
      <motion.div
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        whileHover={{ rotateY: 180 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Front Side (Roman + Small Decimal) */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 shadow-xl">
           <span className="text-[10px] font-black text-slate-600 mb-1">{n}</span>
           <span className="text-xl font-heading font-black text-white">{r}</span>
        </div>

        {/* Back Side (Large Decimal Only) */}
        <div 
          className="absolute inset-0 backface-hidden flex items-center justify-center p-4 rounded-2xl bg-primary/20 border border-primary/30 shadow-2xl shadow-primary/20"
          style={{ transform: 'rotateY(180deg)' }}
        >
           <span className="text-4xl font-heading font-black text-white">{n}</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function RomanNumeralsPage() {
  const basicNumerals = [
    { n: 1, r: 'I' },
    { n: 5, r: 'V' },
    { n: 10, r: 'X' },
    { n: 50, r: 'L' },
    { n: 100, r: 'C' },
    { n: 500, r: 'D' },
    { n: 1000, r: 'M' },
  ];

  const numbersTo100 = Array.from({ length: 100 }, (_, i) => i + 1);
  const [activeTab, setActiveTab] = useState<'guide' | 'tools' | 'clock'>('guide');
  const [activeTool, setActiveTool] = useState<'number' | 'sentence'>('number');
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-heading font-black text-white tracking-tighter mb-2">
              Roman <span className="gradient-text">Numerals</span>
            </h1>
            <p className="text-slate-500 font-medium">Quick reference and calculation tools.</p>
          </div>

          {/* Main Tabs */}
          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
             <button 
                onClick={() => setActiveTab('guide')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'guide' ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
             >
                Guide
             </button>
             <button 
                onClick={() => setActiveTab('tools')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'tools' ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
             >
                Calculators
             </button>
             <button 
                onClick={() => setActiveTab('clock')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'clock' ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
             >
                Clock
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'guide' ? (
            <motion.div 
              key="guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-20"
            >
              {/* 1. Key Symbols */}
              <section>
                <div className="flex items-center space-x-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Info className="text-secondary w-5 h-5" />
                   </div>
                   <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Key Symbols</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {basicNumerals.map((item) => (
                    <div key={item.n} className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center space-y-1 backdrop-blur-md">
                       <span className="text-3xl font-heading font-black text-secondary">{item.r}</span>
                       <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.n}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Numbers 1 to 100 */}
              <section>
                <div className="flex items-center space-x-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <History className="text-slate-400 w-5 h-5" />
                   </div>
                   <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Numbers 1 to 100</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
                   {numbersTo100.map(n => (
                     <RomanNumeralBlock key={n} n={n} r={toRoman(n)} />
                   ))}
                </div>
              </section>

              {/* 3. How to Read Them */}
              <section>
                 <div className="flex items-center space-x-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                     <Compass className="text-accent w-5 h-5" />
                   </div>
                   <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">How to Read Them</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { 
                        title: 'Addition Rule', 
                        desc: 'If a smaller number comes AFTER a larger one, add them together.',
                        example: 'VI = 5 + 1 = 6',
                        color: 'secondary'
                      },
                      { 
                        title: 'Subtraction Rule', 
                        desc: 'If a smaller number comes BEFORE a larger one, subtract it.',
                        example: 'IV = 5 - 1 = 4',
                        color: 'primary'
                      }
                    ].map((rule, i) => (
                      <div key={i} className="p-8 rounded-[32px] bg-slate-900/40 border border-white/5 relative overflow-hidden group">
                         <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-3">{rule.title}</h4>
                         <p className="text-slate-500 text-sm font-medium mb-6">{rule.desc}</p>
                         <div className={cn("p-4 rounded-xl bg-black/40 border border-white/5 inline-block", `text-${rule.color}`)}>
                            <span className="text-[10px] font-black uppercase tracking-widest mr-4 opacity-50">Example</span>
                            <span className="text-lg font-heading font-black text-white italic">{rule.example}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               </section>
            </motion.div>
          ) : activeTab === 'tools' ? (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Tool Selector (Segmented Control) */}
              <div className="flex justify-start mb-8">
                <div className="inline-flex bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-md">
                  <button 
                    onClick={() => setActiveTool('number')}
                    className={cn(
                      "px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      activeTool === 'number' ? "bg-white text-black shadow-xl scale-100" : "text-slate-400 hover:text-white scale-95 opacity-60 hover:opacity-100"
                    )}
                  >
                    Number Converter
                  </button>
                  <button 
                    onClick={() => setActiveTool('sentence')}
                    className={cn(
                      "px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      activeTool === 'sentence' ? "bg-white text-black shadow-xl scale-100" : "text-slate-400 hover:text-white scale-95 opacity-60 hover:opacity-100"
                    )}
                  >
                    Sentence Converter
                  </button>
                </div>
              </div>

              <div className="">
                {activeTool === 'number' ? (
                  <ChronosCalculator />
                ) : (
                  <InscriptionGenerator />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="clock"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RomanClock 
                soundEnabled={soundEnabled} 
                setSoundEnabled={setSoundEnabled} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
