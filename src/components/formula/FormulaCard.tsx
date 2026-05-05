'use client';

import { motion } from 'framer-motion';
import { Bookmark, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import MathRenderer from '../math/MathRenderer';
import { useUserStore } from '@/lib/store/useUserStore';
import { cn } from '@/lib/utils';

interface FormulaCardProps {
  formula: {
    id: string;
    title: string;
    slug: string;
    latex: string;
    difficulty: string;
    category: {
      name: string;
    };
  };
  index: number;
}

export default function FormulaCard({ formula, index }: FormulaCardProps) {
  const { toggleBookmark, isBookmarked } = useUserStore();
  const bookmarked = isBookmarked(formula.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="relative p-10 rounded-[48px] bg-slate-900/40 border border-white/5 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] transition-all duration-500 h-full flex flex-col group backdrop-blur-md shadow-2xl">
        {/* Bookmark Button */}
        <div className="absolute top-8 right-8 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleBookmark(formula.id);
            }}
            className={cn(
              "p-3 rounded-2xl border transition-all duration-500",
              bookmarked 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-black/40 text-slate-500 border-white/5 hover:text-white hover:border-primary/30"
            )}
          >
            <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
          </button>
        </div>

        {/* Category & Difficulty */}
        <div className="flex items-center space-x-3 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
            {formula.category.name}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            {formula.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-3xl font-heading font-black mb-10 text-white tracking-tighter group-hover:text-primary transition-colors duration-500 leading-tight">
          {formula.title}
        </h3>

        {/* LaTeX Preview */}
        <div className="bg-black/40 rounded-[32px] p-12 mb-10 flex items-center justify-center min-h-[180px] border border-white/5 group-hover:border-primary/20 transition-all duration-500 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="scale-110 relative z-10">
             <MathRenderer latex={formula.latex} />
          </div>
        </div>

        {/* Improved Action Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          <Link
            href={`/formula/${formula.slug}`}
            className="flex items-center space-x-3 group/btn"
          >
            <div className="px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 transition-all duration-500 shadow-lg shadow-primary/20 group-hover/btn:scale-[1.05] group-hover/btn:shadow-primary/40 active:scale-95">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
          
          <div className="flex items-center space-x-2 text-slate-500 group-hover:text-slate-300 transition-colors">
            <Eye className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Insights</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
