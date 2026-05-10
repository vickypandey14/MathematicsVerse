'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { LineChart as ChartIcon } from 'lucide-react';

interface GraphVizProps {
  formula: {
    slug: string;
    title: string;
  };
}

export default function GraphViz({ formula }: GraphVizProps) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const generateData = () => {
    const data = [];
    switch (formula.slug) {
      case 'quadratic-formula':
        for (let x = -5; x <= 5; x += 0.5) {
          data.push({ x, y: x * x - 5 * x + 6 });
        }
        break;
      case 'area-circle':
        for (let r = 0; r <= 10; r += 1) {
          data.push({ x: r, y: Math.PI * r * r });
        }
        break;
      case 'eulers-identity':
        for (let t = 0; t <= Math.PI * 2; t += 0.2) {
          data.push({ x: Math.cos(t), y: Math.sin(t) });
        }
        break;
      default:
        for (let x = 0; x <= 10; x += 1) {
          data.push({ x, y: Math.sin(x) });
        }
    }
    return data;
  };

  const data = generateData();

  return (
    <div className="w-full">
      <div className="h-[350px] w-full">
        {hasHydrated ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="x"
              stroke="currentColor"
              className="text-foreground/40"
              fontSize={10}
              fontWeight="900"
              tickLine={false}
              axisLine={false}
              dy={15}
            />
            <YAxis
              stroke="currentColor"
              className="text-foreground/40"
              fontSize={10}
              fontWeight="900"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
              dx={-15}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                fontSize: '12px',
                color: 'var(--foreground)',
                fontWeight: '700',
              }}
              itemStyle={{ color: '#06b6d4' }}
              cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#6366f1"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorY)"
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-[350px] bg-foreground/5 rounded-[40px] animate-pulse flex items-center justify-center border border-border">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}
    </div>

      <div className="mt-10 flex items-center justify-center space-x-12 text-[10px] text-foreground/50 font-black uppercase tracking-[0.4em]">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-3 shadow-lg shadow-primary/20" />
          <span>Real-time Telemetry</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-foreground/20 mr-3" />
          <span>Vector Baseline</span>
        </div>
      </div>
    </div>
  );
}
