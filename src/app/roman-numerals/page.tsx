import MainLayout from '@/components/layout/MainLayout';
import { Hash, Info } from 'lucide-react';

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

  return (
    <MainLayout>
      <div className="space-y-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-white tracking-tighter mb-2">
              Roman <span className="gradient-text">Numerals</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">A quick reference guide to the ancient Roman numbering system.</p>
          </div>
        </div>

        {/* Basic Symbols */}
        <section>
          <div className="flex items-center space-x-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="text-primary w-5 h-5" />
             </div>
             <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Basic Symbols</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {basicNumerals.map((item) => (
              <div key={item.n} className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center space-y-2 backdrop-blur-md">
                 <span className="text-4xl font-heading font-black text-secondary">{item.r}</span>
                 <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{item.n}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 1 to 100 Grid */}
        <section>
          <div className="flex items-center space-x-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Hash className="text-secondary w-5 h-5" />
             </div>
             <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Numbers 1 to 100</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
             {numbersTo100.map(n => (
               <div key={n} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center group hover:bg-primary/10 hover:border-primary/20 transition-all">
                  <span className="text-xs font-black text-slate-500 group-hover:text-primary transition-colors">{n}</span>
                  <span className="text-lg font-heading font-black text-white">{toRoman(n)}</span>
               </div>
             ))}
          </div>
        </section>

        {/* How to Read Section */}
        <section className="p-12 rounded-[48px] bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md">
           <h2 className="text-3xl font-heading font-black text-white mb-6 uppercase tracking-tight">How to Read Them</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 font-medium leading-relaxed">
              <div className="space-y-4">
                 <p className="text-white font-bold">1. Addition Rule</p>
                 <p>When a smaller symbol is placed after a larger one, you add them together. For example: <span className="text-secondary font-bold">VI</span> is 5 + 1 = 6.</p>
              </div>
              <div className="space-y-4">
                 <p className="text-white font-bold">2. Subtraction Rule</p>
                 <p>When a smaller symbol is placed before a larger one, you subtract it. For example: <span className="text-primary font-bold">IV</span> is 5 - 1 = 4.</p>
              </div>
           </div>
        </section>
      </div>
    </MainLayout>
  );
}
