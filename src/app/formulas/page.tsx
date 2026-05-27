import MainLayout from '@/components/layout/MainLayout';
import FormulaExplorer from '@/components/formula/FormulaExplorer';
import { getCategories } from '@/lib/data';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

export default async function FormulasPage() {
  const categories = await getCategories();
  const formulas = await prisma.formula.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      latex: true,
      explanation: true,
      difficulty: true,
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
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter mb-4">
          Library <span className="text-primary">Explorer</span>
        </h1>
        <p className="text-foreground/50 font-medium max-w-2xl">
          Search, filter, and discover mathematical principles across all major domains.
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-card/40 rounded-[40px]" />}>
        <FormulaExplorer initialFormulas={formulas} categories={categories} />
      </Suspense>
    </MainLayout>
  );
}
