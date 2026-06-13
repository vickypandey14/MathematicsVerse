'use client';

import { useUserStore } from '@/lib/store/useUserStore';
import { Bookmark, History, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DashboardStats() {
  const { bookmarks, recentlyViewed } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by showing a skeleton or base state until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const bookmarkCount = mounted ? bookmarks.length : 0;
  const exploredCount = mounted ? recentlyViewed.length : 0;

  return (
    <div className="flex flex-col gap-6 h-full justify-between">
      {/* Saved for Later Card */}
      <Link href="/bookmarks" className="group block h-1/2">
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-full min-h-[160px] p-7 rounded-[32px] bg-card/45 border border-border/70 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md hover:border-secondary/40 hover:shadow-secondary/5 transition-all duration-300"
        >
          {/* Decorative Background Blob */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-secondary/5 blur-2xl group-hover:bg-secondary/10 transition-colors duration-500" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
              <Bookmark className="text-secondary w-6 h-6" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 flex items-center text-secondary gap-1 text-[10px] font-black uppercase tracking-wider">
              <span>View Saved</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <motion.p 
              key={bookmarkCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter"
            >
              {bookmarkCount}
            </motion.p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-foreground/50 text-[10px] font-black uppercase tracking-[0.2em]">Saved for Later</p>
              <span className="text-[10px] text-foreground/40 font-medium">
                {bookmarkCount === 0 ? 'Empty' : `${bookmarkCount} formula${bookmarkCount > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Formulas Explored Card */}
      <Link href="/recent" className="group block h-1/2">
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-full min-h-[160px] p-7 rounded-[32px] bg-card/45 border border-border/70 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md hover:border-accent/40 hover:shadow-accent/5 transition-all duration-300"
        >
          {/* Decorative Background Blob */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-colors duration-500" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
              <History className="text-accent w-6 h-6" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 flex items-center text-accent gap-1 text-[10px] font-black uppercase tracking-wider">
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <motion.p 
              key={exploredCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter"
            >
              {exploredCount}
            </motion.p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-foreground/50 text-[10px] font-black uppercase tracking-[0.2em]">Formulas Explored</p>
              <span className="text-[10px] text-foreground/40 font-medium">
                {exploredCount === 0 ? 'None yet' : `${exploredCount} recently`}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
