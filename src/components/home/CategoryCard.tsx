'use client';

import { motion } from 'framer-motion';
import { Calculator, Binary, Box, Triangle, BarChart, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  SquareRoot: Calculator,
  Variable: Binary,
  Shapes: Box,
  Triangle: Triangle,
  BarChart: BarChart,
};

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    _count: {
      formulas: number;
    };
  };
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const Icon = iconMap[category.icon as keyof typeof iconMap] || Calculator;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/formulas?category=${category.slug}`}
        className="group block relative p-6 md:p-10 rounded-[32px] bg-card/40 border border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden backdrop-blur-md"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-colors duration-500" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
            <Icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-500" />
          </div>

          <h3 className="text-xl font-heading font-black mb-4 text-foreground tracking-tighter">
            {category.name}
          </h3>

          <div className="flex items-center justify-between mt-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 group-hover:text-primary transition-colors duration-500">
              {category._count.formulas} Units
            </span>
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
