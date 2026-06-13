'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-10 h-10 rounded-full bg-foreground/5", className)} />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden",
        className
      )}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-5 h-5 text-accent" />
          ) : (
            <Sun className="w-5 h-5 text-primary" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle glow effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-full blur-md -z-10 ${
          isDark ? 'bg-accent/20' : 'bg-primary/20'
        }`}
      />
    </button>
  );
}
