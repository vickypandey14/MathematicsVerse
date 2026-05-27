import MainLayout from '@/components/layout/MainLayout';
import FormulaExplorer from '@/components/formula/FormulaExplorer';
import { getCategories } from '@/lib/data';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import { BookOpen, Layers, Sparkles } from 'lucide-react';

export default async function FormulasPage() {
  const categories = await getCategories();
  const formulas = await prisma.formula.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      latex: true,
      explanation: true,
      useCase: true,
      example: true,
      history: true,
      difficulty: true,
      featured: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { title: 'asc' },
    ],
  });

  return (
    <MainLayout>
      <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-foreground/55 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primary" />
            Formula Atlas
          </div>
          <h1 className="mb-4 text-5xl font-heading font-black tracking-tighter text-foreground md:text-6xl">
            Library <span className="gradient-text">Explorer</span>
          </h1>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-foreground/55">
            Search, filter, and discover mathematical principles across every major domain.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card/45 px-5 py-4 backdrop-blur-md">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-heading font-black leading-none text-foreground">{formulas.length}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/45">Formulas</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card/45 px-5 py-4 backdrop-blur-md">
            <Layers className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xl font-heading font-black leading-none text-foreground">{categories.length}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/45">Subjects</p>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-card/40 rounded-[40px]" />}>
        <FormulaExplorer initialFormulas={formulas} categories={categories} />
      </Suspense>
    </MainLayout>
  );
}
