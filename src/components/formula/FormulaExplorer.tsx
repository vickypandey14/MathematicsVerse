'use client';

import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import FormulaCard from '@/components/formula/FormulaCard';
import { ArrowRight, BookOpen, Lightbulb, Search, SlidersHorizontal, Sparkles, Target, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import MathRenderer from '@/components/math/MathRenderer';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

interface FormulaListItem {
  id: string;
  title: string;
  slug: string;
  latex: string;
  explanation: string;
  useCase: string;
  example: string;
  history?: string | null;
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
  const [previewFormula, setPreviewFormula] = useState<FormulaListItem | null>(null);

  useEffect(() => {
    if (!previewFormula) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewFormula(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewFormula]);

  useEffect(() => {
    if (!previewFormula) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [previewFormula]);

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
            <FormulaCard
              key={formula.id}
              formula={formula}
              onPreview={() => setPreviewFormula(formula)}
            />
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

      <AnimatePresence>
        {previewFormula && (
          <FormulaPreviewPanel
            formula={previewFormula}
            onClose={() => setPreviewFormula(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FormulaPreviewPanel({
  formula,
  onClose,
}: {
  formula: FormulaListItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90]">
      <motion.button
        aria-label="Close preview"
        className="absolute inset-0 cursor-default bg-background/55 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.aside
        className="absolute bottom-0 right-0 top-0 flex w-full max-w-2xl flex-col border-l border-border bg-background/92 shadow-2xl backdrop-blur-3xl md:rounded-l-[40px]"
        initial={{ x: '100%', opacity: 0.85, scale: 0.985 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: '100%', opacity: 0.8, scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 360, damping: 36, mass: 0.9 }}
      >
        <div className="relative overflow-hidden border-b border-border p-6 md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-[90px]" />
          <div className="absolute -bottom-28 left-12 h-72 w-72 rounded-full bg-accent/10 blur-[90px]" />

          <motion.div
            className="relative z-10 flex items-start justify-between gap-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/55">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Preview
              </div>
              <h2 className="text-4xl font-heading font-black leading-none tracking-tight text-foreground md:text-5xl">
                {formula.title}
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  {formula.category.name}
                </span>
                <span className="rounded-full border border-border bg-foreground/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-foreground/55">
                  {formula.difficulty}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card/60 text-foreground/50 transition-all hover:border-primary/30 hover:text-foreground"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            className="formula-card-preview relative mb-8 flex min-h-[220px] items-center justify-center overflow-hidden rounded-[32px] border px-8 py-12"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ delay: 0.13, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative z-10 max-w-full text-center text-foreground [&_.katex]:text-[1.55em]">
              <MathRenderer latex={formula.latex} />
            </div>
          </motion.div>

          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  delayChildren: 0.18,
                  staggerChildren: 0.055,
                },
              },
            }}
          >
            <PreviewSection
              icon={BookOpen}
              label="Core Idea"
              content={formula.explanation}
            />
            <PreviewSection
              icon={Target}
              label="Where It Is Used"
              content={formula.useCase}
            />
            <PreviewSection
              icon={Lightbulb}
              label="Example"
              content={formula.example}
            />
            {formula.history && (
              <PreviewSection
                icon={Sparkles}
                label="Historical Note"
                content={formula.history}
              />
            )}
          </motion.div>
        </div>

        <motion.div
          className="border-t border-border p-6 md:p-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.24, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={`/formula/${formula.slug}`}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Open Full Lesson
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.aside>
    </div>
  );
}

function PreviewSection({
  icon: Icon,
  label,
  content,
}: {
  icon: typeof BookOpen;
  label: string;
  content: string;
}) {
  return (
    <motion.section
      className="rounded-[28px] border border-border bg-card/45 p-6 shadow-lg shadow-foreground/5 backdrop-blur-md"
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.985 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/45">
          {label}
        </h3>
      </div>
      <p className="text-base font-medium leading-7 text-foreground/68">
        {content}
      </p>
    </motion.section>
  );
}
