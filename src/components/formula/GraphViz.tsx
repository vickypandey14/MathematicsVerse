'use client';

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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="x"
              stroke="#475569"
              fontSize={10}
              fontWeight="900"
              tickLine={false}
              axisLine={false}
              dy={15}
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              fontWeight="900"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
              dx={-15}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0c14',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                fontSize: '12px',
                color: '#f1f5f9',
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
      </div>

      <div className="mt-10 flex items-center justify-center space-x-12 text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-3 shadow-lg shadow-primary/20" />
          <span>Real-time Telemetry</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-slate-800 mr-3" />
          <span>Vector Baseline</span>
        </div>
      </div>
    </div>
  );
}
