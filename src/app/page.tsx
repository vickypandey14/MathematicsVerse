import MainLayout from '@/components/layout/MainLayout';
import CategoryCard from '@/components/home/CategoryCard';
import FormulaCard from '@/components/formula/FormulaCard';
import ArcadeWidget from '@/components/home/ArcadeWidget';
import DashboardStats from '@/components/home/DashboardStats';
import { getCategories, getFeaturedFormulas } from '@/lib/data';
import { Atom, Lightbulb, LayoutDashboard, Search, Bookmark, History, ArrowRight, Waves } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const categories = await getCategories();
  const featuredFormulas = await getFeaturedFormulas();

  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Simple & Logical Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-foreground tracking-tighter mb-2">
              Math <span className="gradient-text">Explorer</span>
            </h1>
            <p className="text-foreground/60 font-medium text-lg">Your interactive guide to understanding the world through mathematics.</p>
          </div>

        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {/* Primary Highlight: Arcade Hub */}
           <ArcadeWidget />

           {/* Right Column: Stats Stack */}
           <DashboardStats />
        </div>

        {/* Interactive Labs */}
        <section>
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-2xl font-heading font-black text-foreground tracking-tight uppercase">Interactive Labs</h2>
          </div>
          
          <div className="p-[2px] rounded-[40px] bg-gradient-to-r from-accent via-primary to-secondary shadow-xl group hover:scale-[1.005] transition-transform duration-300">
            <div className="bg-card rounded-[38px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="space-y-4 relative z-10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Interactive Audio-Visual Physics</span>
                </div>
                <h3 className="text-3xl font-heading font-black text-foreground tracking-tight uppercase leading-none">
                  Harmonic Wave Explorer
                </h3>
                <p className="text-foreground/60 font-medium text-sm md:text-base leading-relaxed">
                  Play with frequencies, blend waves together, and see how they combine to create different sounds.
                </p>
                <div className="pt-2">
                  <Link 
                    href="/wave-explorer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                    <span>Launch Wave Explorer</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Graphical representation overlay */}
              <div className="w-full md:w-1/3 h-24 md:h-auto flex items-center justify-center relative select-none pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent blur-2xl rounded-full" />
                <svg viewBox="0 0 100 40" className="w-full h-full text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M 0 20 Q 12.5 5 25 20 T 50 20 T 75 20 T 100 20" strokeDasharray="3 3" opacity="0.3" />
                  <path d="M 0 20 Q 12.5 10 25 20 T 50 20 T 75 20 T 100 20" strokeDasharray="2 2" opacity="0.5" />
                  <path d="M 0 20 Q 12.5 0 25 20 T 50 20 T 75 20 T 100 20" strokeWidth="2.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Simplified Categories */}
        <section>
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-2xl font-heading font-black text-foreground tracking-tight uppercase">Subjects</h2>
            <Link href="/formulas" className="text-[10px] font-black text-primary hover:text-foreground transition-colors uppercase tracking-[0.2em] border-b border-primary/30 pb-1">View All Subjects</Link>
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
            <h2 className="text-2xl font-heading font-black text-foreground tracking-tight uppercase">Featured Lessons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFormulas.map((formula) => (
              <FormulaCard key={formula.id} formula={formula} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
