'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calculator, Search, Bookmark, History, Menu, X, Waves } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Explore', href: '/formulas', icon: Search },
  { name: 'Wave Explorer', href: '/wave-explorer', icon: Waves },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Recently Viewed', href: '/recent', icon: History },
];

import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-border py-3'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Calculator className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight text-foreground">
              Mathematics<span className="gradient-text">Verse</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'relative text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1',
                    isActive ? 'text-primary' : 'text-foreground/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="pl-4 border-l border-border">
              <ThemeSwitcher />
            </div>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <ThemeSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground/60 hover:text-foreground"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1, height: 'auto', display: 'block' },
          closed: { opacity: 0, height: 0, transitionEnd: { display: 'none' } },
        }}
        className="md:hidden bg-background border-b border-border"
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
