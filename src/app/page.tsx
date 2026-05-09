import MainLayout from '@/components/layout/MainLayout';
import CategoryCard from '@/components/home/CategoryCard';
import FormulaCard from '@/components/formula/FormulaCard';
import ArcadeWidget from '@/components/home/ArcadeWidget';
import { getCategories, getFeaturedFormulas } from '@/lib/data';
import { Atom, Lightbulb, LayoutDashboard, Search, Bookmark, History, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const categories = await getCategories();
  const featuredFormulas = await getFeaturedFormulas();

  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Simple & Logical Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-white tracking-tighter mb-2">
              Math <span className="gradient-text">Explorer</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Your interactive guide to understanding the world through mathematics.</p>
          </div>

        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {/* Primary Highlight: Arcade Hub */}
           <ArcadeWidget />

           {/* Right Column: Stats Stack */}
           <div className="flex flex-col gap-6 h-full">
             <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl flex flex-col justify-between group hover:border-secondary/30 transition-all duration-500 backdrop-blur-md flex-grow">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20">
                   <Bookmark className="text-secondary w-7 h-7" />
                </div>
                <div>
                  <p className="text-4xl font-heading font-black text-white tracking-tighter">24</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Saved for Later</p>
                </div>
             </div>

             <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent/30 transition-all duration-500 backdrop-blur-md flex-grow">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                   <History className="text-accent w-7 h-7" />
                </div>
                <div>
                  <p className="text-4xl font-heading font-black text-white tracking-tighter">128</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Formulas Explored</p>
                </div>
             </div>
           </div>
        </div>

        {/* Simplified Categories */}
        <section>
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Subjects</h2>
            <Link href="/formulas" className="text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-[0.2em] border-b border-primary/30 pb-1">View All Subjects</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </section>

        {/* Featured Content */}
        <section>
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Featured Lessons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFormulas.map((formula, index) => (
              <FormulaCard key={formula.id} formula={formula} index={index} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
