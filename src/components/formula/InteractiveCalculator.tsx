'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, RefreshCcw, Terminal } from 'lucide-react';

interface CalculatorProps {
  formula: {
    slug: string;
    title: string;
  };
}

export default function InteractiveCalculator({ formula }: CalculatorProps) {
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | string | null>(null);

  const getFields = () => {
    switch (formula.slug) {
      case 'quadratic-formula':
        return [
          { name: 'a', label: 'Coefficient [a]', placeholder: '1' },
          { name: 'b', label: 'Coefficient [b]', placeholder: '-5' },
          { name: 'c', label: 'Coefficient [c]', placeholder: '6' },
        ];
      case 'pythagorean-theorem':
        return [
          { name: 'a', label: 'Magnitude [a]', placeholder: '3' },
          { name: 'b', label: 'Magnitude [b]', placeholder: '4' },
        ];
      case 'area-circle':
        return [{ name: 'r', label: 'Radius [r]', placeholder: '5' }];
      default:
        return [{ name: 'x', label: 'Value [x]', placeholder: '10' }];
    }
  };

  const calculate = () => {
    const { a, b, c, r, x } = inputs;
    switch (formula.slug) {
      case 'quadratic-formula':
        if (a === 0) return 'SYNTAX ERROR: a=0';
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 'IMAGINARY OUTPUT';
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        return `x₁=${x1.toFixed(2)} | x₂=${x2.toFixed(2)}`;
      case 'pythagorean-theorem':
        return `MAGNITUDE=${Math.sqrt(a * a + b * b).toFixed(2)}`;
      case 'area-circle':
        return `AREA=${(Math.PI * r * r).toFixed(2)}`;
      default:
        return 'LOGIC NOT DEFINED';
    }
  };

  const fields = getFields();

  return (
    <div className="p-10 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center space-x-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Terminal className="text-primary w-6 h-6" />
        </div>
        <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">Processor</h3>
      </div>

      <div className="space-y-8 mb-10">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.3em]">
              {field.label}
            </label>
            <input
              type="number"
              placeholder={field.placeholder}
              onChange={(e) => setInputs({ ...inputs, [field.name]: parseFloat(e.target.value) })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary focus:bg-black/60 transition-all text-xl font-bold shadow-inner"
            />
          </div>
        ))}
      </div>

      <div className="bg-black/60 rounded-[32px] p-10 border border-white/5 mb-10 min-h-[140px] flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-30" />
        {inputs && Object.keys(inputs).length >= fields.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={calculate().toString()}
            className="relative z-10"
          >
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 block text-accent">Computed Output</span>
            <div className="text-3xl font-heading font-black text-white tracking-tighter">
              {calculate()}
            </div>
          </motion.div>
        ) : (
          <span className="text-slate-600 font-bold text-sm relative z-10 tracking-widest uppercase">Awaiting Data Streams...</span>
        )}
      </div>

      <button
        onClick={() => setInputs({})}
        className="w-full py-5 bg-white/5 text-slate-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center space-x-3 border border-white/5 shadow-lg"
      >
        <RefreshCcw className="w-4 h-4" />
        <span>Flush Memory</span>
      </button>
    </div>
  );
}
