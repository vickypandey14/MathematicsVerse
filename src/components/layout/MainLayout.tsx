'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Search, 
  Bookmark, 
  History, 
  LayoutDashboard, 
  ChevronRight,
  Menu,
  X,
  Compass,
  Layers,
  GraduationCap,
  Hash,
  Telescope
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/useUserStore';

interface MainLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Library', href: '/formulas', icon: Compass },
  { name: 'Kids Corner', href: '/kids', icon: GraduationCap },
  { name: 'Roman Numerals', href: '/roman-numerals', icon: Hash },
  { name: 'Units & Measures', href: '/units', icon: Layers },
  { name: 'My Saved', href: '/bookmarks', icon: Bookmark },
  { name: 'Recent', href: '/recent', icon: History },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/formulas?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-border bg-background/80 backdrop-blur-3xl",
          mounted ? (isSidebarOpen ? "w-72" : "w-24") : "w-72"
        )}
      >
        <div className={cn("p-8 flex items-center", isSidebarOpen ? "justify-between" : "justify-center")}>
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Calculator className="text-white w-6 h-6" />
            </div>
            {mounted && isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-heading font-black tracking-tighter text-foreground"
              >
                MATH<span className="text-primary">VERSE</span>
              </motion.span>
            )}
          </Link>
        </div>

        <div className={cn("px-6 py-4", !isSidebarOpen && "flex justify-center px-0")}>
           <form onSubmit={handleSearch} className="relative">
              <Search 
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 cursor-pointer z-10 transition-all",
                  isSidebarOpen ? "left-4" : "left-1/2 -translate-x-1/2"
                )} 
                onClick={() => {
                  if (!isSidebarOpen) setIsSidebarOpen(true);
                }}
              />
              <input 
                type="text"
                placeholder={mounted && isSidebarOpen ? "Search formulas..." : ""}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => {
                  if (!isSidebarOpen) setIsSidebarOpen(true);
                }}
                className={cn(
                  "bg-foreground/5 border border-border rounded-2xl py-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer",
                  isSidebarOpen ? "w-full pl-10 pr-4" : "w-12 h-12 p-0 flex items-center justify-center text-transparent placeholder:text-transparent"
                )}
              />
           </form>
        </div>

        <nav className="flex-grow px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center py-4 rounded-2xl transition-all duration-300 group relative",
                  isSidebarOpen ? "px-4 space-x-4" : "justify-center",
                  isActive 
                    ? "bg-foreground/5 text-foreground" 
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <Icon className={cn("w-6 h-6 shrink-0", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
                {mounted && isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold text-sm tracking-wide"
                  >
                    {link.name}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className={cn("p-6 flex items-center gap-2", !isSidebarOpen && "flex-col p-4")}>
          <ThemeSwitcher />
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "flex items-center justify-center rounded-2xl bg-foreground/5 border border-border hover:bg-foreground/10 transition-all group",
              isSidebarOpen ? "flex-grow p-4" : "w-12 h-12"
            )}
          >
            {mounted && isSidebarOpen ? <X className="w-5 h-5 text-foreground/40 group-hover:text-foreground" /> : <Menu className="w-5 h-5 text-foreground/40 group-hover:text-foreground" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-grow transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-x-hidden",
          mounted ? (isSidebarOpen ? "ml-72" : "ml-24") : "ml-72"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-7xl mx-auto p-12"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
    </div>
  );
}
