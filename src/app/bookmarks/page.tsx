'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FormulaCard from '@/components/formula/FormulaCard';
import { useUserStore } from '@/lib/store/useUserStore';
import { Bookmark, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks } = useUserStore();
  const [formulas, setFormulas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const fetchBookmarks = async () => {
      if (bookmarks.length === 0) {
        setFormulas([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/formulas/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: bookmarks }),
        });
        const data = await response.json();
        setFormulas(data);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [bookmarks, hasHydrated]);

  if (!hasHydrated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Bookmark className="w-3 h-3" />
              <span>Saved Content</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-foreground tracking-tighter">
              My <span className="gradient-text">Bookmarks</span>
            </h1>
            <p className="text-foreground/50 font-medium text-lg max-w-2xl">
              Your personal collection of formulas and lessons for quick reference and deep study.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="text-foreground/40 font-black uppercase tracking-[0.2em] text-[10px]">Loading Collection...</p>
            </div>
          </div>
        ) : formulas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formulas.map((formula) => (
              <FormulaCard key={formula.id} formula={formula} />
            ))}
          </div>
        ) : (
          <div className="p-20 rounded-[48px] bg-card/40 border border-border border-dashed flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center border border-border shadow-2xl">
              <BookOpen className="w-10 h-10 text-foreground/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-black text-foreground uppercase tracking-tight">Your library is empty</h3>
              <p className="text-foreground/40 font-medium">Explore our library and bookmark formulas to see them here.</p>
            </div>
            <Link 
              href="/formulas" 
              className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all"
            >
              Browse Library
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
