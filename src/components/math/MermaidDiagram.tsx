'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

import { useTheme } from 'next-themes';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const isDark = theme === 'dark';
    
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? 'dark' : 'neutral',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#6366f1',
        secondaryColor: '#06b6d4',
        tertiaryColor: isDark ? '#1e293b' : '#f1f5f9',
        mainBkg: isDark ? '#0f172a' : '#ffffff',
        nodeBorder: isDark ? '#334155' : '#e2e8f0',
        textColor: isDark ? '#f8fafc' : '#0f172a',
        lineColor: isDark ? '#475569' : '#94a3b8',
      },
    });
    
    if (ref.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  if (!hasHydrated) {
    return (
      <div className="p-8 rounded-[32px] bg-card/40 border border-border flex items-center justify-center min-h-[200px] animate-pulse">
        <div className="text-foreground/20 font-black uppercase tracking-[0.3em] text-[10px]">Assembling Neural Logic...</div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-[32px] bg-card/40 border border-border flex items-center justify-center overflow-hidden">
      <div className="mermaid w-full flex justify-center" ref={ref}>
        {chart}
      </div>
    </div>
  );
}
