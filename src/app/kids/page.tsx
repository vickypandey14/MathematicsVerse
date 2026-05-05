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
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function KidsCorner() {
  const [baseNumber, setBaseNumber] = useState<number>(7);
  const [inputValue, setInputValue] = useState<string>("7");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d{0,5}$/.test(val)) {
      setInputValue(val);
      if (val !== "") {
        setBaseNumber(parseInt(val));
      }
    }
  };

  const increment = () => {
    if (baseNumber < 99999) {
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

  const firstHalf = Array.from({ length: 10 }, (_, i) => i + 1);
  const secondHalf = Array.from({ length: 10 }, (_, i) => i + 11);

  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Kids Hero */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center space-x-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-gradient-to-tr from-secondary to-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-secondary/20"
            >
              <Sparkles className="text-white w-8 h-8" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white tracking-tighter">
              Kids <span className="text-secondary">Corner</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium text-xl">The fun way to master your multiplication tables!</p>
        </div>

        {/* Instant Table Generator */}
        <section className="max-w-6xl mx-auto">
          <div className="p-10 md:p-16 rounded-[56px] bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Grid className="w-64 h-64 text-white" />
             </div>

             <div className="relative z-10 space-y-16">
                <div className="flex flex-col items-center space-y-8">
                   <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] flex items-center">
                      <Star className="text-secondary w-6 h-6 mr-3 fill-current" />
                      Magic Table Maker
                   </h2>
                   
                   <div className="flex items-center space-x-6">
                      <button 
                        onClick={decrement}
                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-secondary/20 hover:border-secondary/40 transition-all text-slate-400 hover:text-white group"
                      >
                         <Minus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </button>

                      <div className="relative">
                        <input 
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          className="w-48 md:w-64 bg-black/40 border-4 border-white/5 rounded-[32px] py-8 text-center text-5xl font-heading font-black text-white focus:outline-none focus:border-secondary transition-all shadow-inner"
                        />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                           Enter Any Number
                        </div>
                      </div>

                      <button 
                        onClick={increment}
                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all text-slate-400 hover:text-white group"
                      >
                         <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </button>
                   </div>
                   
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating table for {baseNumber}</p>
                </div>

                {/* Table Sections */}
                <div className="space-y-16">
                  {/* First Half: Till 10 */}
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className="h-px flex-grow bg-white/5" />
                      <h3 className="text-xl font-heading font-black text-secondary tracking-[0.2em] uppercase">Till 10</h3>
                      <div className="h-px flex-grow bg-white/5" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                       <AnimatePresence mode="popLayout">
                          {firstHalf.map((num) => (
                            <motion.div
                              key={`${baseNumber}-${num}`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: (num-1) * 0.02 }}
                              className="p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-secondary/30 group transition-all"
                            >
                               <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1 text-center">
                                  {baseNumber} × {num}
                               </div>
                               <div className="text-3xl font-heading font-black text-white text-center group-hover:text-secondary transition-colors">
                                  {(baseNumber * num).toLocaleString()}
                               </div>
                            </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                  </div>

                  {/* Second Half: Till 20 */}
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className="h-px flex-grow bg-white/5" />
                      <h3 className="text-xl font-heading font-black text-primary tracking-[0.2em] uppercase">Till 20</h3>
                      <div className="h-px flex-grow bg-white/5" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                       <AnimatePresence mode="popLayout">
                          {secondHalf.map((num) => (
                            <motion.div
                              key={`${baseNumber}-${num}`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: (num-11) * 0.02 }}
                              className="p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-primary/30 group transition-all"
                            >
                               <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1 text-center">
                                  {baseNumber} × {num}
                               </div>
                               <div className="text-3xl font-heading font-black text-white text-center group-hover:text-primary transition-colors">
                                  {(baseNumber * num).toLocaleString()}
                               </div>
                            </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Fun Tips Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
           <div className="p-10 rounded-[48px] bg-gradient-to-br from-primary/20 to-transparent border border-white/5 backdrop-blur-md">
              <h3 className="text-2xl font-black text-white mb-4">Did You Know?</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                 Multiplication is just "fast addition"! If you have 3 bags with 4 apples each, you can do 4 + 4 + 4, or just remember that 3 × 4 is 12!
              </p>
           </div>
           <div className="p-10 rounded-[48px] bg-gradient-to-br from-secondary/20 to-transparent border border-white/5 backdrop-blur-md">
              <h3 className="text-2xl font-black text-white mb-4">The Magic of 9</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                 Did you know that in the 9 times table, the digits of the answer always add up to 9? Try it: 9 × 2 = 18 (1+8=9), 9 × 5 = 45 (4+5=9). Amazing!
              </p>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
