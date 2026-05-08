import MainLayout from '@/components/layout/MainLayout';
import CategoryCard from '@/components/home/CategoryCard';
import FormulaCard from '@/components/formula/FormulaCard';
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
           <div className="col-span-1 md:col-span-2 p-10 rounded-[40px] bg-slate-900/40 border border-white/5 relative overflow-hidden group shadow-2xl backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-6">
                   <Lightbulb className="text-secondary w-5 h-5" />
                   <h2 className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Formula of the Day</h2>
                </div>
                <h3 className="text-4xl font-heading font-black text-white mb-6">Euler's Identity</h3>
                <div className="p-8 rounded-2xl bg-black/40 border border-white/5 mb-8 backdrop-blur-xl">
                   <p className="text-slate-300 text-lg font-medium leading-relaxed">Considered the most elegant equation in mathematics, it connects five fundamental constants in a single statement.</p>
                </div>
                <Link href="/formula/eulers-identity" className="inline-flex items-center space-x-3 text-white font-black uppercase tracking-widest text-xs group py-4 px-8 bg-primary rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all">
                   <span>Learn This Formula</span>
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] text-white/5 group-hover:text-white/10 transition-colors">
                 <Atom className="w-64 h-64" />
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl flex flex-col justify-between group hover:border-secondary/30 transition-all duration-500 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20">
                 <Bookmark className="text-secondary w-7 h-7" />
              </div>
              <div>
                <p className="text-4xl font-heading font-black text-white tracking-tighter">24</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Saved for Later</p>
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent/30 transition-all duration-500 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                 <History className="text-accent w-7 h-7" />
              </div>
              <div>
                <p className="text-4xl font-heading font-black text-white tracking-tighter">128</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Formulas Explored</p>
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
