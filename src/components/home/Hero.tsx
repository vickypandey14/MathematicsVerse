'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathSymbolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const symbols = mathSymbolsRef.current?.children;
      if (symbols) {
        gsap.to(Array.from(symbols), {
          y: 'random(-40, 40)',
          x: 'random(-20, 20)',
          rotation: 'random(-45, 45)',
          duration: 'random(3, 5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: {
            amount: 2,
            from: 'random',
          },
        });
      }

      gsap.from('.hero-content > *', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />

      <div
        ref={mathSymbolsRef}
        className="absolute inset-0 pointer-events-none opacity-20 select-none hidden lg:block"
      >
        <span className="absolute top-[15%] left-[10%] text-6xl font-serif">∑</span>
        <span className="absolute top-[25%] right-[15%] text-7xl font-serif">∫</span>
        <span className="absolute bottom-[20%] left-[20%] text-5xl font-serif">π</span>
        <span className="absolute top-[40%] left-[30%] text-4xl font-serif">√</span>
        <span className="absolute bottom-[30%] right-[25%] text-6xl font-serif">∆</span>
        <span className="absolute top-[60%] right-[10%] text-5xl font-serif">∞</span>
        <span className="absolute bottom-[40%] left-[40%] text-4xl font-serif">θ</span>
      </div>

      <div className="container mx-auto px-4 z-10 text-center">
        <div className="hero-content max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-card/50 border border-border text-foreground/80 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Discover the elegance of math</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tight mb-6 leading-tight">
            Explore the <br />
            <span className="gradient-text">Mathematics</span>Verse
          </h1>

          <p className="text-xl md:text-2xl text-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            A premium interactive platform for exploring complex formulas with stunning visualizations and beginner-friendly explanations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/formulas"
              className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center space-x-2 overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span>Start Exploring</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/categories"
              className="px-8 py-4 bg-card text-foreground border border-border rounded-2xl font-bold transition-all hover:bg-card/80 hover:border-border/50 active:scale-95"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-xs text-foreground/40 mb-2 uppercase tracking-widest font-bold">Scroll to explore</span>
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
