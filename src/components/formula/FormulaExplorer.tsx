'use client';

import { useState, useMemo, useDeferredValue } from 'react';
import FormulaCard from '@/components/formula/FormulaCard';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FormulaListItem {
  id: string;
  title: string;
  slug: string;
  latex: string;
  explanation: string;
  difficulty: string;
  featured: boolean;
  category: {
    name: string;
    slug: string;
  };
}

interface FormulaCategory {
  id: string;
  name: string;
  slug: string;
}

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const difficultyRank: Record<string, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

type SortMode = 'recommended' | 'az' | 'difficulty' | 'subject';
type ScopeMode = 'all' | 'featured';

interface FormulaExplorerProps {
  initialFormulas: FormulaListItem[];
  categories: FormulaCategory[];
}

export default function FormulaExplorer({ initialFormulas, categories }: FormulaExplorerProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <FormulaExplorerContent
      key={query}
      initialFormulas={initialFormulas}
      categories={categories}
      initialQuery={query}
    />
  );
}

function FormulaExplorerContent({
  initialFormulas,
  categories,
  initialQuery,
}: FormulaExplorerProps & { initialQuery: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [scope, setScope] = useState<ScopeMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    initialFormulas.forEach((formula) => {
      counts.set(formula.category.slug, (counts.get(formula.category.slug) || 0) + 1);
    });
    return counts;
  }, [initialFormulas]);

  const fuse = useMemo(() => new Fuse(initialFormulas, {
    keys: ['title', 'explanation', 'category.name'],
    threshold: 0.3,
  }), [initialFormulas]);

  const filteredFormulas = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim();
    let results = normalizedQuery
      ? fuse.search(normalizedQuery).map(r => r.item)
      : initialFormulas;

    if (selectedCategory) {
      results = results.filter(f => f.category.slug === selectedCategory);
    }

    if (selectedDifficulty) {
      results = results.filter(f => f.difficulty === selectedDifficulty);
    }

    if (scope === 'featured') {
      results = results.filter(f => f.featured);
    }

    results = [...results].sort((a, b) => {
      switch (sortMode) {
        case 'az':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          return (difficultyRank[a.difficulty] ?? 99) - (difficultyRank[b.difficulty] ?? 99)
            || a.title.localeCompare(b.title);
        case 'subject':
          return a.category.name.localeCompare(b.category.name)
            || a.title.localeCompare(b.title);
        case 'recommended':
        default:
          return Number(b.featured) - Number(a.featured)
            || a.title.localeCompare(b.title);
      }
    });

    return results;
  }, [
    deferredSearchQuery,
    selectedCategory,
    selectedDifficulty,
    scope,
    sortMode,
    initialFormulas,
    fuse,
  ]);

  const hasActiveFilters = selectedCategory || selectedDifficulty || searchQuery || scope !== 'all' || sortMode !== 'recommended';

  return (
    <div className="space-y-12">
      <div className="sticky top-2 z-30 rounded-[32px] border border-border bg-card/45 p-4 shadow-2xl shadow-foreground/5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-grow">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
            <input
              type="text"
              placeholder="Search formulas, subjects, ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-foreground/5 py-4 pl-12 pr-4 font-bold text-foreground transition-all placeholder:text-foreground/30 focus:border-primary focus:bg-foreground/10 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-2xl border border-border bg-foreground/5 p-1">
              {(['all', 'featured'] as ScopeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setScope(mode)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                    scope === mode
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-foreground/50 hover:text-foreground'
                  )}
                >
                  {mode === 'featured' && <Sparkles className="h-3.5 w-3.5" />}
                  {mode}
                </button>
              ))}
            </div>

            <label className="relative inline-flex items-center">
              <SlidersHorizontal className="pointer-events-none absolute left-4 h-4 w-4 text-foreground/45" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="h-12 min-w-44 cursor-pointer appearance-none rounded-2xl border border-border bg-foreground/5 pl-11 pr-10 text-xs font-black uppercase tracking-[0.14em] text-foreground/70 transition-all focus:border-primary focus:bg-foreground/10 focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="az">A-Z</option>
                <option value="difficulty">Difficulty</option>
                <option value="subject">Subject</option>
              </select>
            </label>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedDifficulty(null);
                  setScope('all');
                  setSortMode('recommended');
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-all hover:bg-primary/20"
                title="Clear filters"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'shrink-0 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
              selectedCategory === null
                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                : 'border-border bg-foreground/5 text-foreground/55 hover:text-foreground'
            )}
          >
            All
            <span className="ml-2 opacity-70">{initialFormulas.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={cn(
                'shrink-0 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                selectedCategory === category.slug
                  ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                  : 'border-border bg-foreground/5 text-foreground/55 hover:text-foreground'
              )}
            >
              {category.name}
              <span className="ml-2 opacity-70">{categoryCounts.get(category.slug) || 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(null)}
            className={cn(
              'rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
              selectedDifficulty === null
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-foreground/5 text-foreground/45 hover:text-foreground'
            )}
          >
            All Levels
          </button>
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={cn(
                'rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                selectedDifficulty === difficulty
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border bg-foreground/5 text-foreground/45 hover:text-foreground'
              )}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-foreground/50 px-6">
        <span className="text-[10px] font-black uppercase tracking-widest">
          Located {filteredFormulas.length} Formulas
        </span>
      </div>

      {filteredFormulas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFormulas.map((formula) => (
            <FormulaCard key={formula.id} formula={formula} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-card/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
            <Search className="w-8 h-8 text-foreground/20" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-2">No results</h3>
          <p className="text-foreground/50 font-medium tracking-tight">Try different keywords or filters.</p>
        </div>
      )}
    </div>
  );
}
