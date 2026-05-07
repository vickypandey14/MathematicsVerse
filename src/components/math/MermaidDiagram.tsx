'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#6366f1',
        secondaryColor: '#06b6d4',
        tertiaryColor: '#1e293b',
        mainBkg: '#0f172a',
        nodeBorder: '#334155',
        textColor: '#f8fafc',
        lineColor: '#475569',
      },
    });
    
    if (ref.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  if (!hasHydrated) {
    return (
      <div className="p-8 rounded-[32px] bg-slate-900/50 border border-white/5 flex items-center justify-center min-h-[200px] animate-pulse">
        <div className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Assembling Neural Logic...</div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-[32px] bg-slate-900/50 border border-white/5 flex items-center justify-center overflow-hidden">
      <div className="mermaid w-full flex justify-center" ref={ref}>
        {chart}
      </div>
    </div>
  );
}
