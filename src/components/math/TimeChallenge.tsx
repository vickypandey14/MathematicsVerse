'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Zap, RefreshCcw, Check, X, Star, TrendingUp, Trophy as TrophyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { TrophyID, TROPHIES } from './TrophyRoom';

export default function TimeChallenge() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [unlockedTrophies, setUnlockedTrophies] = useState<TrophyID[]>([]);
  const [lastUnlocked, setLastUnlocked] = useState<TrophyID | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({ a: 0, b: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stats for Mastery Report
  const [stats, setStats] = useState({ correct: 0, total: 0, bestStreak: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('math-verse-high-score');
    if (saved) setHighScore(parseInt(saved));
    
    const savedTrophies = localStorage.getItem('math-verse-trophies');
    if (savedTrophies) setUnlockedTrophies(JSON.parse(savedTrophies));
  }, []);

  const unlockTrophy = useCallback((id: TrophyID) => {
    setUnlockedTrophies(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('math-verse-trophies', JSON.stringify(next));
      setLastUnlocked(id);
      setTimeout(() => setLastUnlocked(null), 3000);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b']
      });
      
      return next;
    });
  }, []);

  const updateLifetimeStats = useCallback((correctCount: number) => {
    const saved = localStorage.getItem('math-verse-lifetime-correct');
    const current = saved ? parseInt(saved) : 0;
    const total = current + correctCount;
    localStorage.setItem('math-verse-lifetime-correct', total.toString());
    if (total >= 100) unlockTrophy('century_club');
  }, [unlockTrophy]);

  const generateQuestion = useCallback(() => {
    // Difficulty scales based on score
    let maxNum = 10;
    if (score > 100) maxNum = 15;
    if (score > 50) maxNum = 12;
    
    const a = Math.floor(Math.random() * (maxNum - 2 + 1)) + 2;
    const b = Math.floor(Math.random() * 10) + 2;
    
    setQuestion({ a, b, answer: a * b });
    setUserAnswer('');
    setFeedback(null);
  }, [score]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(30);
    setStats({ correct: 0, total: 0, bestStreak: 0 });
    setGameState('playing');
    generateQuestion();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      
      // Check for Trophies
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) : 0;
      const efficiency = (stats.correct / 0.5); // ans per minute (30s = 0.5m)
      
      if (accuracy === 1 && stats.total >= 15) unlockTrophy('accuracy_100');
      if (score >= 500) unlockTrophy('score_500');
      if (score >= 1000) unlockTrophy('score_1000');
      if (efficiency >= 20) unlockTrophy('speed_demon');
      unlockTrophy('first_win');
      updateLifetimeStats(stats.correct);

      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('math-verse-high-score', score.toString());
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, highScore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);

    // Auto-submit logic
    if (val === question.answer.toString()) {
      const newStreak = streak + 1;
      const newMultiplier = 1 + Math.floor(newStreak / 5);
      if (newStreak >= 10) unlockTrophy('streak_10');
      if (newStreak >= 20) unlockTrophy('streak_20');
      
      setScore(prev => prev + (10 * newMultiplier));
      setStreak(newStreak);
      setMultiplier(newMultiplier);
      setStats(prev => ({ 
        ...prev, 
        correct: prev.correct + 1, 
        total: prev.total + 1,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      }));
      setFeedback('correct');

      // Visual Juice
      if (newStreak % 5 === 0) {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#ec4899']
        });
      }

      setTimeout(generateQuestion, 150);
    } else if (val.length >= question.answer.toString().length && val !== question.answer.toString()) {
        // If they entered enough digits but it's wrong
        if (!question.answer.toString().startsWith(val)) {
            setFeedback('wrong');
            setStreak(0);
            setMultiplier(1);
            setStats(prev => ({ ...prev, total: prev.total + 1 }));
            setTimeout(() => {
                setUserAnswer('');
                setFeedback(null);
            }, 400);
        }
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center relative py-4 px-2">
      <AnimatePresence mode="wait">
        {gameState === 'idle' ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8"
          >
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary blur-3xl opacity-20 rounded-full"
                />
                <div className="relative w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <Zap className="w-12 h-12 text-primary fill-current" />
                </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl font-heading font-black text-white uppercase tracking-tight">Speed Challenge</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">Master your tables with multipliers and speed bonuses!</p>
            </div>
            
            <button 
              onClick={startGame}
              className="group relative px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 group-hover:text-white transition-colors">Start Mission</span>
            </button>

            {highScore > 0 && (
               <div className="flex items-center justify-center space-x-2 text-secondary font-black text-xs uppercase tracking-widest">
                  <Trophy className="w-4 h-4" />
                  <span>Personal Best: {highScore}</span>
               </div>
            )}
          </motion.div>
        ) : gameState === 'playing' ? (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm space-y-10"
          >
            {/* Top HUD */}
            <div className="flex justify-between items-center px-2">
               <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <Timer className={cn("w-5 h-5", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-primary")} />
                  <span className={cn("text-2xl font-heading font-black", timeLeft < 10 ? "text-red-500" : "text-white")}>
                    {timeLeft}s
                  </span>
               </div>
               
               <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                     <Star className="w-5 h-5 text-secondary fill-current" />
                     <span className="text-2xl font-heading font-black text-white">{score}</span>
                  </div>
                  {multiplier > 1 && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-secondary/20"
                    >
                        {multiplier}x Multiplier
                    </motion.div>
                  )}
               </div>
            </div>

            {/* Streak Counter */}
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative">
               <motion.div 
                 className="absolute inset-0 bg-primary"
                 initial={{ width: 0 }}
                 animate={{ width: `${(streak % 5) * 20}%` }}
               />
               <div className="absolute inset-0 flex justify-around items-center">
                  {[1,2,3,4].map(i => <div key={i} className="w-px h-full bg-white/10" />)}
               </div>
            </div>

            {/* Question Card */}
            <div className={cn(
                "p-12 rounded-[48px] bg-slate-900/40 border-2 transition-all duration-300 relative overflow-hidden",
                streak >= 5 ? "border-primary/40 shadow-[0_0_30px_rgba(99,102,241,0.2)]" : "border-white/5"
            )}>
               {streak >= 5 && (
                  <motion.div 
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/10"
                  />
               )}
               
               <div className="relative z-10 text-center space-y-8">
                  <div className="flex items-center justify-center space-x-6">
                     <span className="text-6xl font-heading font-black text-white">{question.a}</span>
                     <span className="text-primary text-3xl font-black">×</span>
                     <span className="text-6xl font-heading font-black text-white">{question.b}</span>
                  </div>

                  <div className="relative">
                    <input 
                        ref={inputRef}
                        type="number"
                        value={userAnswer}
                        onChange={handleInputChange}
                        className={cn(
                        "w-full bg-black/40 border-b-4 rounded-2xl py-6 text-center text-6xl font-heading font-black text-white focus:outline-none transition-all placeholder:text-white/5",
                        feedback === 'correct' ? "border-green-500 text-green-500" : 
                        feedback === 'wrong' ? "border-red-500 text-red-500 animate-shake" : "border-primary/20 focus:border-primary"
                        )}
                        placeholder="?"
                    />
                  </div>

                  {streak > 0 && (
                    <div className="flex items-center justify-center space-x-2 text-primary font-black uppercase text-[10px] tracking-widest">
                        <TrendingUp className="w-3 h-3" />
                        <span>{streak} Streak!</span>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg space-y-8"
          >
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-secondary/10 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                    <Trophy className="w-10 h-10 text-secondary fill-current" />
                </div>
                <h3 className="text-4xl font-heading font-black text-white uppercase tracking-tight">Mission Report</h3>
            </div>
            
            {/* Mastery Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Score</p>
                    <p className="text-4xl font-heading font-black text-white">{score}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Accuracy</p>
                    <p className="text-4xl font-heading font-black text-primary">
                        {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Best Streak</p>
                    <p className="text-4xl font-heading font-black text-secondary">{stats.bestStreak}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Efficiency</p>
                    <p className="text-4xl font-heading font-black text-amber-500">
                        {(stats.correct / 0.5).toFixed(1)} <span className="text-xs">ans/m</span>
                    </p>
                </div>
            </div>

            {score === highScore && score > 0 && (
              <div className="p-4 rounded-2xl bg-primary/20 border border-primary/30 text-center text-primary font-black uppercase text-[10px] tracking-[0.2em]">
                Personal Record Shattered! 🎊
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={startGame}
                className="flex-grow px-8 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
              >
                Re-Deploy
              </button>
              <button 
                onClick={() => setGameState('idle')}
                className="px-8 py-5 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all"
              >
                End Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trophy Notification */}
      <AnimatePresence>
        {lastUnlocked && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 p-6 rounded-[32px] bg-black/80 border border-amber-500/30 backdrop-blur-2xl shadow-2xl flex items-center space-x-6 min-w-[320px]"
          >
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-200 flex items-center justify-center shadow-lg rotate-3">
                <TrophyIcon className="w-8 h-8 text-amber-900" />
             </div>
             <div>
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Achievement Unlocked!</p>
                <h4 className="text-white font-heading font-black text-lg tracking-tight">
                  {TROPHIES.find(t => t.id === lastUnlocked)?.title}
                </h4>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
