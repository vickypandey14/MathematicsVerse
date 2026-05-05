'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  latex: string;
  block?: boolean;
}

export default function MathRenderer({ latex, block = false }: MathRendererProps) {
  if (block) {
    return (
      <div className="my-4 overflow-x-auto overflow-y-hidden">
        <BlockMath math={latex} />
      </div>
    );
  }
  return <InlineMath math={latex} />;
}
