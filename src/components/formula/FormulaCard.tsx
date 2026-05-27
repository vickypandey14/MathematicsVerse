'use client';

import { type CSSProperties, useMemo, useSyncExternalStore } from 'react';
import { Bookmark, ArrowUpRight, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';
import MathRenderer from '../math/MathRenderer';
import { useUserStore } from '@/lib/store/useUserStore';
import { cn } from '@/lib/utils';

interface FormulaCardFormula {
  id: string;
  title: string;
  slug: string;
  latex: string;
  explanation?: string;
  difficulty: string;
  category: {
    name: string;
  };
}

interface FormulaCardProps {
  formula: FormulaCardFormula;
  onPreview?: (formula: FormulaCardFormula) => void;
}

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const categoryAccents: Record<string, string> = {
  algebra: '#6366f1',
  geometry: '#0891b2',
  calculus: '#7c3aed',
  statistics: '#0f766e',
  trigonometry: '#db2777',
};

function getSummary(explanation?: string) {
  if (!explanation) {
    return 'A concise reference with the key relationship and practical context.';
  }

  return explanation.replace(/\s+/g, ' ').trim();
}

export default function FormulaCard({ formula, onPreview }: FormulaCardProps) {
  const { toggleBookmark, isBookmarked } = useUserStore();
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );

  const bookmarked = hasHydrated ? isBookmarked(formula.id) : false;
  const accent = categoryAccents[formula.category.name.toLowerCase()] || '#6366f1';
  const summary = useMemo(() => getSummary(formula.explanation), [formula.explanation]);

  return (
    <div className="h-full">
      <article
        className="formula-card-shell group relative flex h-full overflow-hidden rounded-[34px] p-[1px] transition-all duration-500 ease-out"
        style={{ '--formula-accent': accent } as CSSProperties}
      >
        <div className="formula-card-surface relative z-10 flex h-full w-full flex-col overflow-hidden rounded-[33px] border p-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleBookmark(formula.id);
            }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Save formula'}
            className={cn(
              "absolute right-7 top-7 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/35",
              bookmarked
                ? "bg-primary text-white border-primary shadow-xl shadow-primary/25"
                : "bg-card/70 text-foreground/55 border-border/70 shadow-lg shadow-foreground/5 hover:text-primary hover:border-primary/35 hover:bg-primary/10"
            )}
          >
            <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
          </button>

          {onPreview && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPreview(formula);
              }}
              aria-label={`Preview ${formula.title}`}
              className="absolute right-20 top-7 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-card/70 text-foreground/55 shadow-lg shadow-foreground/5 backdrop-blur-xl transition-all duration-300 hover:border-accent/40 hover:bg-accent/10 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          <Link href={`/formula/${formula.slug}`} className="relative z-10 flex h-full flex-col rounded-[28px] focus:outline-none focus:ring-2 focus:ring-primary/35">
            <div className="formula-card-preview relative mb-6 flex min-h-[220px] items-center justify-center overflow-hidden rounded-[28px] border px-8 py-12">
              <div
                className="absolute left-6 top-6 rounded-2xl border border-white/40 bg-white/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-foreground/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
                style={{ color: accent }}
              >
                {formula.category.name}
              </div>
              <div className="absolute bottom-6 right-6 flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/45 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                Formula
              </div>
              <div className="relative z-10 max-w-full text-center text-foreground drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.04] [&_.katex]:text-[1.42em]">
                <MathRenderer latex={formula.latex} />
              </div>
            </div>

            <div className="flex flex-1 flex-col px-2 pb-2">
              <div className="mb-4 flex items-start justify-between gap-5">
                <h3 className="text-3xl font-heading font-black leading-[1.04] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {formula.title}
                </h3>
                <ArrowUpRight className="mt-1 h-6 w-6 shrink-0 text-foreground/28 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <p className="line-clamp-2 min-h-12 text-[15px] font-medium leading-6 text-foreground/58">
                {summary}
              </p>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-border/70 pt-5">
                <span className="formula-chip-muted rounded-2xl border border-border/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-foreground/58">
                  {formula.difficulty}
                </span>

                <span className="inline-flex items-center gap-2 rounded-2xl px-1 py-2 text-sm font-black text-primary">
                  <BookOpen className="h-4 w-4" />
                  Explore Lesson
                </span>
              </div>
            </div>
          </Link>
        </div>
      </article>
    </div>
  );
}
