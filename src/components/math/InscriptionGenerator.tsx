'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Type, Share2, History } from 'lucide-react';

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
  if (num <= 0 || num > 3999) return num.toString();
  let result = '';
  let remaining = num;
  for (const { value, symbol } of romanMap) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export default function InscriptionGenerator() {
  const [text, setText] = useState('I was born in 1995 and built this in 2024');

  const processText = (input: string) => {
    return input.replace(/\b\d+\b/g, (match) => {
      const num = parseInt(match);
      return toRoman(num);
    });
  };

  return (
    <div className="p-12 rounded-[56px] bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-[-20%] right-[-10%] p-10 text-secondary opacity-5 group-hover:rotate-12 transition-transform duration-700">
         <Scroll className="w-80 h-80" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Type className="text-secondary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">Sentence Converter</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Change numbers in a sentence</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.3em]">Type your sentence here</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-3xl py-6 px-8 text-white placeholder:text-slate-800 focus:outline-none focus:border-secondary transition-all min-h-[120px] font-medium"
              placeholder="Example: I am 15 years old"
            />
          </div>

          <div className="p-10 rounded-[32px] bg-white/5 border border-white/5 relative group-hover:bg-white/10 transition-colors">
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-6 block">Roman Style Result</span>
            <p className="text-2xl md:text-3xl font-heading font-black text-white tracking-tight leading-relaxed italic opacity-90">
              {processText(text)}
            </p>
            <div className="mt-8 flex items-center space-x-4">
              <div className="h-px bg-white/10 flex-grow" />
              <div className="flex items-center space-x-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                <span>EST. MMXXIV</span>
              </div>
              <div className="h-px bg-white/10 flex-grow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
