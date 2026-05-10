'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Calculator, History, Info, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function toRoman(num: number): { result: string; steps: { symbol: string; value: number }[] } {
  if (num <= 0 || num > 3999) return { result: 'N/A', steps: [] };
  let result = '';
  const steps: { symbol: string; value: number }[] = [];
  let remaining = num;
  for (const { value, symbol } of romanMap) {
    while (remaining >= value) {
      result += symbol;
      steps.push({ symbol, value });
      remaining -= value;
    }
  }
  return { result, steps };
}

function fromRoman(roman: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prevValue = 0;
  const upperRoman = roman.toUpperCase().replace(/[^IVXLCDM]/g, '');
  
  for (let i = upperRoman.length - 1; i >= 0; i--) {
    const char = upperRoman[i];
    const value = map[char];
    if (value >= prevValue) {
      total += value;
    } else {
      total -= value;
    }
    prevValue = value;
  }
  return total;
}

export default function ChronosCalculator() {
  const [mode, setMode] = useState<'decimal' | 'roman'>('decimal');
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState<{ result: string; val: number; steps: any[] }>({ result: '', val: 0, steps: [] });

  useEffect(() => {
    if (!inputValue) {
      setOutput({ result: '', val: 0, steps: [] });
      return;
    }

    if (mode === 'decimal') {
      const num = parseInt(inputValue);
      if (!isNaN(num)) {
        const { result, steps } = toRoman(num);
        setOutput({ result, val: num, steps });
      }
    } else {
      const val = fromRoman(inputValue);
      const { result, steps } = toRoman(val);
      setOutput({ result, val, steps });
    }
  }, [inputValue, mode]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="p-10 md:p-16 rounded-[64px] bg-card/60 border border-border shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Calculator className="text-primary w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-black text-foreground tracking-tighter uppercase">Number Converter</h3>
                <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Ancient Math Tool</p>
              </div>
            </div>

            <div className="flex bg-foreground/5 p-1.5 rounded-2xl border border-border backdrop-blur-md">
              <button 
                onClick={() => { setMode('decimal'); setInputValue(''); }}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  mode === 'decimal' ? "bg-foreground text-background shadow-xl" : "text-foreground/40 hover:text-foreground"
                )}
              >
                Numbers
              </button>
              <button 
                onClick={() => { setMode('roman'); setInputValue(''); }}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  mode === 'roman' ? "bg-foreground text-background shadow-xl" : "text-foreground/40 hover:text-foreground"
                )}
              >
                Roman Numerals
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Input Side */}
            <div className="space-y-8">
              <div className="relative group">
                <label className="block text-[10px] font-black text-foreground/40 mb-4 uppercase tracking-[0.3em]">
                  {mode === 'decimal' ? 'Type a Number' : 'Type a Roman Numeral'}
                </label>
                <div className="relative">
                  <input 
                    type={mode === 'decimal' ? 'number' : 'text'}
                    placeholder={mode === 'decimal' ? 'e.g. 2024' : 'e.g. MMXXIV'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    className="w-full bg-foreground/5 border border-border rounded-[32px] py-10 px-10 text-5xl font-heading font-black text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.08] transition-all shadow-2xl uppercase"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={() => setInputValue('')}
                      className="p-3 hover:bg-foreground/5 rounded-xl text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Symbol Quick Toggles (Only in Roman Mode) */}
              {mode === 'roman' && (
                <div className="flex flex-wrap gap-2">
                  {['I', 'V', 'X', 'L', 'C', 'D', 'M'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setInputValue(prev => prev + s)}
                      className="w-12 h-12 rounded-xl bg-foreground/5 border border-border text-sm font-black text-foreground/40 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Output Side */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {inputValue ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="p-10 rounded-[40px] bg-gradient-to-br from-foreground/5 to-transparent border border-border shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                       <Hash className="w-16 h-16 text-primary" />
                    </div>

                    <div className="mb-8">
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-4 block">Answer</span>
                      <div className="text-6xl md:text-7xl font-heading font-black text-foreground tracking-tighter break-all">
                        {mode === 'decimal' ? output.result : output.val}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] block">How it works</span>
                      <div className="flex flex-wrap gap-2">
                        {output.steps.map((step, i) => (
                          <div key={i} className="flex items-center space-x-2 px-4 py-2 bg-foreground/5 border border-border rounded-xl">
                            <span className="text-sm font-black text-foreground">{step.symbol}</span>
                            <span className="text-[10px] font-medium text-foreground/40">({step.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-border rounded-[40px]">
                    <div className="w-16 h-16 rounded-3xl bg-foreground/5 flex items-center justify-center mb-6">
                      <Info className="text-foreground/20 w-8 h-8" />
                    </div>
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs leading-relaxed">
                      Awaiting Numerical Input...<br/>
                      <span className="opacity-50 text-[10px]">Enter values above to activate the engine</span>
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Instructional Overlay */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Subtractive Rule', desc: 'When a smaller numeral is placed before a larger one, subtract it (e.g. IV = 4)', icon: Layers },
          { title: 'Additive Rule', desc: 'When a smaller numeral is placed after a larger one, add it (e.g. VI = 6)', icon: ChevronRight },
          { title: 'Limit of Three', desc: 'The same numeral is rarely used more than three times in a row.', icon: History },
        ].map((rule, i) => (
          <div key={i} className="p-8 rounded-[32px] bg-card/40 border border-border hover:border-primary/20 transition-all group">
             <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-all">
                <rule.icon className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
             </div>
             <h4 className="text-foreground font-black uppercase tracking-wider text-xs mb-2">{rule.title}</h4>
             <p className="text-foreground/50 text-xs font-medium leading-relaxed">{rule.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
