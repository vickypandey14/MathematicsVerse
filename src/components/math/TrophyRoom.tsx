'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Shield, Crown, Lock, CheckCircle2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrophyID = 'first_win' | 'streak_10' | 'streak_20' | 'score_500' | 'score_1000' | 'accuracy_100' | 'speed_demon' | 'century_club';

export interface TrophyData {
  id: TrophyID;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: any;
  requirement: string;
}

export const TROPHIES: TrophyData[] = [
  {
    id: 'first_win',
    title: 'First Blood',
    description: 'Completed your first speed challenge.',
    tier: 'bronze',
    icon: Zap,
    requirement: 'Finish 1 Game'
  },
  {
    id: 'streak_10',
    title: 'Streak Master',
    description: 'Maintained focus for 10 correct answers.',
    tier: 'silver',
    icon: Star,
    requirement: '10x Streak'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Your fingers are moving faster than sound!',
    tier: 'silver',
    icon: Zap,
    requirement: '20+ Ans/Min'
  },
  {
    id: 'score_500',
    title: 'Math Titan',
    description: 'Achieved a legendary score in one session.',
    tier: 'gold',
    icon: Trophy,
    requirement: '500+ Points'
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'You have answered over 100 questions correctly!',
    tier: 'gold',
    icon: Shield,
    requirement: '100 Total Correct'
  },
  {
    id: 'streak_20',
    title: 'The Specialist',
    description: 'Unstoppable focus! You are in the zone.',
    tier: 'diamond',
    icon: Target,
    requirement: '20x Streak'
  },
  {
    id: 'accuracy_100',
    title: 'The Architect',
    description: 'Calculated everything with perfect precision.',
    tier: 'diamond',
    icon: Crown,
    requirement: '100% Accuracy'
  },
  {
    id: 'score_1000',
    title: 'Math Professor',
    description: 'You have mastered the art of numbers.',
    tier: 'diamond',
    icon: Trophy,
    requirement: '1000+ Points'
  }
];

interface TrophyCardProps {
  trophy: TrophyData;
  isUnlocked: boolean;
}

function TrophyCard({ trophy, isUnlocked }: TrophyCardProps) {
  const tierColors = {
    bronze: 'from-orange-700/80 via-orange-500/50 to-orange-900/80 border-orange-500/30 text-orange-200',
    silver: 'from-slate-400/80 via-slate-200/50 to-slate-600/80 border-slate-300/30 text-slate-100',
    gold: 'from-amber-600/80 via-amber-200/50 to-amber-800/80 border-amber-400/30 text-amber-100',
    diamond: 'from-cyan-500/80 via-white/50 to-blue-600/80 border-cyan-300/30 text-cyan-50'
  };

  const glowColors = {
    bronze: 'group-hover:shadow-[0_0_30px_rgba(194,65,12,0.3)]',
    silver: 'group-hover:shadow-[0_0_30px_rgba(148,163,184,0.3)]',
    gold: 'group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]',
    diamond: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={cn(
        "relative group p-6 rounded-[32px] border bg-slate-900/40 backdrop-blur-xl transition-all duration-500 overflow-hidden",
        isUnlocked ? "opacity-100" : "opacity-40 grayscale",
        glowColors[trophy.tier]
      )}
    >
      {/* Background Refraction Effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
        tierColors[trophy.tier]
      )} />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Trophy Icon Container */}
        <div className="relative">
           <div className={cn(
             "w-20 h-20 rounded-2xl flex items-center justify-center border-2 rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl",
             "bg-gradient-to-tr",
             tierColors[trophy.tier]
           )}>
              <trophy.icon className="w-10 h-10 drop-shadow-lg" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
           </div>
           
           {!isUnlocked && (
             <div className="absolute -top-2 -right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                <Lock className="w-4 h-4 text-slate-500" />
             </div>
           )}
           {isUnlocked && (
             <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border border-white/20 shadow-lg"
             >
                <CheckCircle2 className="w-4 h-4 text-white" />
             </motion.div>
           )}
        </div>

        <div className="space-y-1">
          <h4 className={cn("text-lg font-heading font-black tracking-tight", isUnlocked ? "text-white" : "text-slate-500")}>
            {trophy.title}
          </h4>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            {trophy.tier} Achievement
          </p>
        </div>

        <p className="text-slate-400 text-xs font-medium leading-relaxed">
          {isUnlocked ? trophy.description : `Requirement: ${trophy.requirement}`}
        </p>

        {isUnlocked && (
          <div className={cn(
            "pt-4 w-full flex justify-center border-t border-white/5",
            tierColors[trophy.tier].split(' ')[0] // use the first color for the label
          )}>
             <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">
                Earned
             </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TrophyRoom({ unlockedIds = [] }: { unlockedIds?: TrophyID[] }) {
  return (
    <div className="space-y-8 h-full overflow-y-auto pr-4 scrollbar-hide pb-12">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Hall of Fame</h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Your Military & Scholarly Achievements</p>
         </div>
         <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-black text-white">{unlockedIds.length}/{TROPHIES.length}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TROPHIES.map((trophy) => (
          <TrophyCard 
            key={trophy.id} 
            trophy={trophy} 
            isUnlocked={unlockedIds.includes(trophy.id)} 
          />
        ))}
      </div>
    </div>
  );
}
