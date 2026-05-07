import { getFormulaBySlug } from '@/lib/data';

import MainLayout from '@/components/layout/MainLayout';
import MathRenderer from '@/components/math/MathRenderer';
import MermaidDiagram from '@/components/math/MermaidDiagram';
import InteractiveCalculator from '@/components/formula/InteractiveCalculator';
import GraphViz from '@/components/formula/GraphViz';
import { notFound } from 'next/navigation';
import { 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  ChevronLeft,
  Info,
  Layers,
  Sparkles,
  History as HistoryIcon,
  ScrollText,
  Clock,
  Zap,
  Activity,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const formulas = await prisma.formula.findMany({
    select: { slug: true },
  });
  return formulas.map((formula) => ({
    slug: formula.slug,
  }));
}

const getMermaidChart = (slug: string) => {
  switch (slug) {
    case 'pythagorean-theorem':
      return `graph TD
        A[a²] --- C[c²]
        B[b²] --- C
        style C fill:#6366f1,stroke:#06b6d4,stroke-width:4px
        style A fill:#d946ef,stroke:#fff
        style B fill:#d946ef,stroke:#fff`;
    case 'quadratic-formula':
      return `graph LR
        A[ax² + bx + c = 0] --> B{Analyze Δ}
        B -->|Δ > 0| C[2 Real Roots]
        B -->|Δ = 0| D[1 Real Root]
        B -->|Δ < 0| E[Complex Roots]
        style A fill:#6366f1,color:#fff
        style B fill:#d946ef,color:#fff`;
    default:
      return `graph TD
        F[Formula] --> E[Logical Explanation]
        F --> C[Calculation]
        F --> V[Visual Representation]
        style F fill:#6366f1,color:#fff`;
  }
};

export default async function FormulaDetail({ params }: PageProps) {
  const { slug } = await params;
  const formula = await getFormulaBySlug(slug);

  if (!formula) {
    notFound();
  }

  const chart = formula.diagram || getMermaidChart(slug);

  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Navigation & Topic Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/formulas" 
            className="inline-flex items-center space-x-3 text-slate-500 hover:text-white group transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Back to Library</span>
          </Link>
          <div className="flex items-center space-x-4">
             <span className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
               Difficulty: {formula.difficulty}
             </span>
             <span className="px-5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
               Category: {formula.category.name}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {/* Title & Formula Display */}
            <section>
              <h1 className="text-6xl md:text-8xl font-heading font-black text-white tracking-tighter mb-10 leading-none">
                {formula.title}
              </h1>
              
              <div className="p-20 rounded-[56px] bg-slate-900/40 border border-white/5 flex items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden group backdrop-blur-md">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <div className="scale-150 md:scale-[2]">
                    <MathRenderer latex={formula.latex} block />
                 </div>
              </div>
            </section>

            {/* Logical Concept Diagram */}
            <section>
               <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <Layers className="text-secondary w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Conceptual Flow</h3>
               </div>
               <div className="p-12 rounded-[40px] bg-black/40 border border-white/5 shadow-inner backdrop-blur-xl">
                  <MermaidDiagram chart={chart} />
               </div>
            </section>

            {/* Simple Logic & Use Case Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-10 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl backdrop-blur-md">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Lightbulb className="text-accent w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-white tracking-tight uppercase">The Core Idea</h3>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium text-lg">
                  {formula.explanation}
                </p>
              </div>

              <div className="p-10 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl backdrop-blur-md">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Real World Use</h3>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium text-lg">
                  {formula.useCase}
                </p>
              </div>
            </section>

            {/* Interactive Graph Visualization */}
            <section>
               <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Activity className="text-accent w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Visual Analysis</h3>
               </div>
               <div className="p-12 rounded-[40px] bg-slate-900/40 border border-white/5 shadow-xl backdrop-blur-md">
                  <GraphViz formula={formula} />
               </div>
            </section>

              {/* Step-by-Step Example */}
              <section className="p-16 rounded-[56px] bg-slate-900/40 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-10 text-primary opacity-5">
                   <Zap className="w-48 h-48" />
                </div>
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <BookOpen className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Step-by-Step Guide</h3>
                </div>
                <div className="prose prose-invert max-w-none text-slate-400 font-medium text-xl leading-relaxed">
                   <p>{formula.example}</p>
                </div>
              </section>

              {/* Historical Context Section */}
              {formula.history && (
                <section className="p-16 rounded-[56px] bg-gradient-to-br from-black/40 to-slate-900/20 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-[-10%] right-[-5%] p-10 text-secondary opacity-5">
                     <ScrollText className="w-64 h-64 rotate-12" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                        <HistoryIcon className="text-secondary w-6 h-6" />
                      </div>
                      <h3 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">Historical Record</h3>
                    </div>
                    <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline: Ancient to Modern</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-secondary/50 via-secondary/10 to-transparent ml-2" />
                    <div className="pl-12 space-y-8">
                       <div className="relative">
                          <div className="absolute left-[-45px] top-2 w-4 h-4 rounded-full bg-[#0a0c14] border-2 border-secondary shadow-lg shadow-secondary/20" />
                          <p className="text-slate-300 font-medium text-xl leading-relaxed italic border-l-4 border-secondary/20 pl-6 py-2 bg-secondary/5 rounded-r-2xl">
                            "{formula.history}"
                          </p>
                       </div>
                       <div className="flex items-center space-x-6">
                          <div className="flex -space-x-3">
                             {[1,2,3].map(i => (
                               <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0c14] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                 {i}
                               </div>
                             ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validated Historical Sources</span>
                       </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

          <div className="lg:col-span-4 space-y-10">
            <InteractiveCalculator formula={formula} />

            <div className="p-12 rounded-[48px] bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 relative overflow-hidden group shadow-2xl backdrop-blur-md">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="w-10 h-10 text-secondary" />
              </div>
              <h4 className="text-2xl font-heading font-black text-white mb-6 uppercase tracking-widest">Learning Tip</h4>
              <p className="text-slate-300 font-medium text-lg leading-relaxed mb-10">
                Mathematics is about patterns. Mastering this formula will help you solve complex problems with ease.
              </p>
              <button className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:scale-[1.02] transition-all shadow-xl shadow-white/5">
                Download Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
