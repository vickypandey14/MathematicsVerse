import MainLayout from '@/components/layout/MainLayout';
import FormulaExplorer from '@/components/formula/FormulaExplorer';
import { getCategories } from '@/lib/data';
import prisma from '@/lib/prisma';

export default async function FormulasPage() {
  const categories = await getCategories();
  const formulas = await prisma.formula.findMany({
    include: { category: true },
  });

  return (
    <MainLayout>
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter mb-4">
          Library <span className="text-primary">Explorer</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Search, filter, and discover mathematical principles across all major domains.
        </p>
      </div>

      <FormulaExplorer initialFormulas={formulas} categories={categories} />
    </MainLayout>
  );
}
