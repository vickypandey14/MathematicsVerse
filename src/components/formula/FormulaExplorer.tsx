'use client';

import { useState, useMemo } from 'react';
import FormulaCard from '@/components/formula/FormulaCard';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';

interface FormulaExplorerProps {
  initialFormulas: any[];
  categories: any[];
}

export default function FormulaExplorer({ initialFormulas, categories }: FormulaExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const fuse = useMemo(() => new Fuse(initialFormulas, {
    keys: ['title', 'explanation', 'category.name'],
    threshold: 0.3,
  }), [initialFormulas]);

  const filteredFormulas = useMemo(() => {
    let results = searchQuery 
      ? fuse.search(searchQuery).map(r => r.item)
      : initialFormulas;

    if (selectedCategory) {
      results = results.filter(f => f.category.slug === selectedCategory);
    }

    if (selectedDifficulty) {
      results = results.filter(f => f.difficulty === selectedDifficulty);
    }

    return results;
  }, [searchQuery, selectedCategory, selectedDifficulty, initialFormulas, fuse]);

  return (
    <div className="space-y-12">
      <div className="sticky top-2 z-30 p-4 rounded-[32px] bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:bg-black/60 transition-all font-bold"
          />
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="flex-grow md:w-48 bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white text-sm font-bold focus:outline-none focus:border-primary focus:bg-black/60 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty || ''}
            onChange={(e) => setSelectedDifficulty(e.target.value || null)}
            className="flex-grow md:w-48 bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white text-sm font-bold focus:outline-none focus:border-primary focus:bg-black/60 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {(selectedCategory || selectedDifficulty || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedDifficulty(null);
              }}
              className="p-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition-all border border-primary/20"
              title="Clear filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-slate-500 px-6">
        <span className="text-[10px] font-black uppercase tracking-widest">
          Located {filteredFormulas.length} Subjects
        </span>
      </div>

      {filteredFormulas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFormulas.map((formula, index) => (
            <FormulaCard key={formula.id} formula={formula} index={index} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-slate-900/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <Search className="w-8 h-8 text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">No results</h3>
          <p className="text-slate-500 font-medium tracking-tight">Try different keywords or filters.</p>
        </div>
      )}
    </div>
  );
}
