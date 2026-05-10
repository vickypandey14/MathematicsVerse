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
    <div className="w-full max-w-6xl mx-auto">
      <div className="p-10 md:p-16 rounded-[64px] bg-card/60 border border-border shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
        <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Type className="text-secondary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-foreground tracking-tighter uppercase">Sentence Converter</h3>
            <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Change numbers in a sentence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-foreground/40 mb-4 uppercase tracking-[0.3em]">Type your sentence here</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-foreground/5 border border-border rounded-[32px] py-8 px-10 text-xl font-medium text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.08] transition-all min-h-[200px] shadow-2xl"
                placeholder="Example: I am 15 years old"
              />
            </div>
          </div>

          <div className="p-10 rounded-[40px] bg-foreground/5 border border-border relative group-hover:bg-foreground/[0.08] transition-all h-full min-h-[200px] flex flex-col justify-center">
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-6 block">Roman Style Result</span>
            <p className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tight leading-relaxed italic opacity-90">
              {processText(text)}
            </p>
            <div className="mt-8 flex items-center space-x-4">
              <div className="h-px bg-border flex-grow" />
              <div className="flex items-center space-x-2 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                <span>EST. MMXXIV</span>
              </div>
              <div className="h-px bg-border flex-grow" />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
