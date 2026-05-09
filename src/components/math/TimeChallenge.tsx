'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Zap, RefreshCcw, Check, X, Star, TrendingUp, Trophy as TrophyIcon, Plus, Minus, Hash, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { TrophyID, TROPHIES } from './TrophyRoom';
import { useSearchParams } from 'next/navigation';

type GameMode = 'multiply' | 'add' | 'subtract' | 'roman';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameMission {
  id: GameMode;
  title: string;
  icon: any;
  color: string;
  description: string;
  instructions: string;
}

const MISSIONS: GameMission[] = [
  { 
    id: 'multiply', 
    title: 'Table Master', 
    icon: Zap, 
    color: 'text-primary', 
    description: 'Master multiplication tables',
    instructions: 'Multiply the two numbers shown as quickly as you can. Focus on building mental shortcuts for larger numbers to boost your score!'
  },
  { 
    id: 'add', 
    title: 'Sum Striker', 
    icon: Plus, 
    color: 'text-green-500', 
    description: 'Fast-paced addition',
    instructions: 'Add the numbers together! Try breaking down larger numbers into smaller groups (like tens and ones) to calculate the total faster.'
  },
  { 
    id: 'subtract', 
    title: 'Minus Medic', 
    icon: Minus, 
    color: 'text-blue-500', 
    description: 'Rapid subtraction',
    instructions: 'Calculate the difference between the two numbers. Tip: Think about how much you need to add to the smaller number to reach the larger one!'
  },
  { 
    id: 'roman', 
    title: 'Roman Raider', 
    icon: Hash, 
    color: 'text-secondary', 
    description: 'Number to Roman conversion',
    instructions: 'Convert the decimal number to Roman Numerals. Remember: I=1, V=5, X=10, L=50. Subtract when a smaller symbol is before a larger one!'
  }
];

export default function TimeChallenge() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'config' | 'playing' | 'finished'>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameTime, setGameTime] = useState<number>(30);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [unlockedTrophies, setUnlockedTrophies] = useState<TrophyID[]>([]);
  const [lastUnlocked, setLastUnlocked] = useState<TrophyID | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({ a: 0, b: 0, operator: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // Auto-select mode from URL if present
  useEffect(() => {
    const modeParam = searchParams.get('mode') as GameMode;
    if (modeParam && MISSIONS.some(m => m.id === modeParam)) {
      setGameMode(modeParam);
      setGameState('config');
    }
  }, [searchParams]);

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
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b'] });
      return next;
    });
  }, []);

  const updateLifetimeStats = useCallback((correctCount: number, mode: GameMode) => {
    // Global stats
    const savedGlobal = localStorage.getItem('math-verse-lifetime-correct');
    const globalTotal = (savedGlobal ? parseInt(savedGlobal) : 0) + correctCount;
    localStorage.setItem('math-verse-lifetime-correct', globalTotal.toString());
    if (globalTotal >= 100) unlockTrophy('century_club');

    // Mode-specific stats
    const modeKey = `math-verse-lifetime-${mode}`;
    const savedMode = localStorage.getItem(modeKey);
    const modeTotal = (savedMode ? parseInt(savedMode) : 0) + correctCount;
    localStorage.setItem(modeKey, modeTotal.toString());

    // Check specialist trophies
    if (mode === 'add' && modeTotal >= 100) unlockTrophy('specialist_add');
    if (mode === 'subtract' && modeTotal >= 100) unlockTrophy('specialist_sub');
    if (mode === 'multiply' && modeTotal >= 100) unlockTrophy('specialist_multiply');
    if (mode === 'roman' && modeTotal >= 50) unlockTrophy('specialist_roman');
  }, [unlockTrophy]);

  const toRoman = (num: number) => {
    const lookup: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (let i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };

  const generateQuestion = useCallback((modeOverride?: GameMode) => {
    let a, b, answer, operator;
    
    // Difficulty Scaling
    let maxNum = 10;
    if (difficulty === 'medium') maxNum = 20;
    if (difficulty === 'hard') maxNum = 50;
    
    // Dynamic difficulty within game
    const currentMax = maxNum + Math.floor(score / 100) * 5;

    const currentMode = modeOverride || gameMode;

    switch(currentMode) {
      case 'add':
        a = Math.floor(Math.random() * currentMax) + 2;
        b = Math.floor(Math.random() * currentMax) + 2;
        operator = '+';
        answer = (a + b).toString();
        break;
      case 'subtract':
        a = Math.floor(Math.random() * currentMax) + 10;
        b = Math.floor(Math.random() * a) + 1;
        operator = '-';
        answer = (a - b).toString();
        break;
      case 'roman':
        const romanMax = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;
        a = Math.floor(Math.random() * romanMax) + 1;
        operator = '→';
        b = 0; 
        answer = toRoman(a).toLowerCase();
        break;
      default: // multiply
        const multMax = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15;
        a = Math.floor(Math.random() * (multMax - 2 + 1)) + 2;
        b = Math.floor(Math.random() * 10) + 2;
        operator = '×';
        answer = (a * b).toString();
    }
    
    setQuestion({ a, b, operator, answer });
    setUserAnswer('');
    setFeedback(null);
  }, [gameMode, score, difficulty]);

  const selectMission = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('config');
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(gameTime);
    setStats({ correct: 0, total: 0, bestStreak: 0 });
    setGameState('playing');
    setTimeout(() => {
        generateQuestion(); 
        inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) : 0;
      const efficiency = (stats.correct / 0.5);
      if (accuracy === 1 && stats.total >= 15) unlockTrophy('accuracy_100');
      if (score >= 500) unlockTrophy('score_500');
      if (score >= 1000) unlockTrophy('score_1000');
      if (efficiency >= 20) unlockTrophy('speed_demon');
      unlockTrophy('first_win');
      if (gameMode) updateLifetimeStats(stats.correct, gameMode);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('math-verse-high-score', score.toString());
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#ec4899'] });
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, highScore, stats, unlockTrophy, updateLifetimeStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setUserAnswer(val);

    if (val === question.answer) {
      const newStreak = streak + 1;
      const newMultiplier = 1 + Math.floor(newStreak / 5);
      if (newStreak >= 10) unlockTrophy('streak_10');
      if (newStreak >= 20) unlockTrophy('streak_20');
      setScore(prev => prev + (10 * newMultiplier));
      setStreak(newStreak);
      setMultiplier(newMultiplier);
      setStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1, bestStreak: Math.max(prev.bestStreak, newStreak) }));
      setFeedback('correct');
      if (newStreak % 5 === 0) confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#6366f1', '#ec4899'] });
      setTimeout(generateQuestion, 150);
    } else if (val.length >= question.answer.length && val !== question.answer) {
        if (!question.answer.startsWith(val)) {
            setFeedback('wrong');
            setStreak(0);
            setMultiplier(1);
            setStats(prev => ({ ...prev, total: prev.total + 1 }));
            setTimeout(() => { setUserAnswer(''); setFeedback(null); }, 400);
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
            className="w-full max-w-4xl space-y-12"
          >
            <div className="text-center space-y-4">
              <h3 className="text-5xl font-heading font-black text-white uppercase tracking-tight">Pick Your Math Game</h3>
              <p className="text-slate-500 font-medium text-lg">Which math skill do you want to practice today?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {MISSIONS.map((mission) => (
                 <button 
                   key={mission.id}
                   onClick={() => selectMission(mission.id)}
                   className="relative p-10 rounded-[48px] bg-slate-900/40 border border-white/5 hover:border-white/20 text-left group transition-all hover:-translate-y-2 overflow-hidden shadow-2xl"
                 >
                    <div className={cn(
                        "absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full bg-current",
                        mission.color
                    )} />

                    <div className="relative z-10 flex flex-col h-full">
                       <div className="flex items-center justify-between mb-8">
                          <div className={cn(
                            "w-20 h-20 rounded-[32px] flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                            "bg-white/5 border border-white/10",
                            mission.color
                          )}>
                             <mission.icon className="w-10 h-10" />
                          </div>
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                             <ArrowRight className="w-6 h-6 text-white" />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <h4 className="text-3xl font-heading font-black text-white tracking-tight group-hover:text-primary transition-colors">
                            {mission.title}
                          </h4>
                          <p className="text-slate-400 text-base font-medium leading-relaxed max-w-[280px]">
                            {mission.description}
                          </p>
                       </div>
                    </div>
                 </button>
               ))}
            </div>

            {highScore > 0 && (
               <div className="flex items-center justify-center space-x-3 text-secondary font-black text-xs uppercase tracking-[0.2em] pt-4">
                  <TrophyIcon className="w-4 h-4" />
                  <span>Arcade High Score: {highScore}</span>
               </div>
            )}
          </motion.div>
        ) : gameState === 'config' ? (
          <motion.div 
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl bg-slate-900/60 rounded-[64px] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl flex flex-col md:flex-row min-h-[600px]"
          >
             {/* Left Panel: Mission Identity */}
             <div className="md:w-5/12 bg-black/40 p-12 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
                {/* Decorative Background Scanning Line */}
                <motion.div 
                  animate={{ y: [0, 500, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-px bg-primary/20 blur-sm z-0"
                />

                <div className="relative z-10 space-y-8">
                   <button onClick={() => setGameState('idle')} className="group flex items-center space-x-3 text-slate-500 hover:text-white transition-colors">
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest">Return to Hangar</span>
                   </button>

                   <div className="space-y-4">
                      <div className={cn(
                        "w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl",
                        MISSIONS.find(m => m.id === gameMode)?.color
                      )}>
                         {(() => {
                           const Icon = MISSIONS.find(m => m.id === gameMode)?.icon;
                           return Icon ? <Icon className="w-12 h-12" /> : null;
                         })()}
                      </div>
                      <h3 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">
                        {MISSIONS.find(m => m.id === gameMode)?.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                         <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                         <span>System Online</span>
                      </div>
                   </div>
                </div>

                <div className="relative z-10 space-y-6">
                   <div className="space-y-2">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tactical Intel</p>
                      <p className="text-slate-300 text-lg font-medium leading-relaxed italic">
                        "{MISSIONS.find(m => m.id === gameMode)?.instructions}"
                      </p>
                   </div>
                   
                   <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      <div className="flex items-center space-x-2">
                         <Star className="w-3 h-3" />
                         <span>XP Multiplier Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                         <Zap className="w-3 h-3" />
                         <span>Neural Sync ready</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Panel: Configuration */}
             <div className="md:w-7/12 p-12 flex flex-col justify-between space-y-12">
                <div className="grid grid-cols-1 gap-12">
                   {/* Difficulty Select */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h5 className="text-white text-xs font-black uppercase tracking-[0.2em]">Select Difficulty Rank</h5>
                         <span className="text-primary text-[10px] font-black uppercase tracking-widest">Level 0{difficulty === 'easy' ? '1' : difficulty === 'medium' ? '2' : '3'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                         {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                           <button 
                             key={d}
                             onClick={() => setDifficulty(d)}
                             className={cn(
                               "relative group h-32 rounded-3xl border-2 transition-all overflow-hidden",
                               difficulty === d 
                                ? "bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105 z-10" 
                                : "bg-white/5 border-white/5 hover:border-white/20"
                             )}
                           >
                              <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-2">
                                 <span className={cn(
                                   "text-[10px] font-black uppercase tracking-widest",
                                   difficulty === d ? "text-slate-500" : "text-slate-600"
                                 )}>
                                   {d === 'easy' ? 'Novice' : d === 'medium' ? 'Scholar' : 'Master'}
                                 </span>
                                 <span className={cn(
                                   "text-2xl font-heading font-black",
                                   difficulty === d ? "text-black" : "text-white"
                                 )}>
                                   {d === 'easy' ? '1-10' : d === 'medium' ? '1-20' : '1-50'}
                                 </span>
                              </div>
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Time Select */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h5 className="text-white text-xs font-black uppercase tracking-[0.2em] text-right w-full">Mission Duration</h5>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-[32px] border border-white/5">
                         {[30, 60, 120].map((t) => (
                           <button 
                             key={t}
                             onClick={() => setGameTime(t)}
                             className={cn(
                               "flex-grow py-6 rounded-[28px] text-xs font-black uppercase tracking-widest transition-all",
                               gameTime === t 
                                ? "bg-primary text-white shadow-xl shadow-primary/20" 
                                : "text-slate-500 hover:text-white"
                             )}
                           >
                             {t} Seconds
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-8">
                   <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>All Systems Nominal</span>
                   </div>
                   <button 
                    onClick={startGame}
                    className="group relative w-full py-8 rounded-[32px] bg-white text-black font-black uppercase tracking-[0.5em] overflow-hidden hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                   >
                      <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative z-10 group-hover:text-white flex items-center justify-center space-x-4">
                         <span>Let's Go!</span>
                         <ArrowRight className="w-6 h-6" />
                      </span>
                   </button>
                </div>
             </div>
          </motion.div>
        ) : gameState === 'playing' ? (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full max-w-5xl flex flex-col items-center justify-between py-6 relative"
          >
            {/* Top HUD: Aligned Grid */}
            <div className="w-full grid grid-cols-3 items-start px-6">
               {/* Left: Timer */}
               <div className="p-4 rounded-[24px] bg-slate-900/60 border-l-4 border-primary backdrop-blur-2xl shadow-2xl space-y-0 w-fit">
                  <div className="flex items-center space-x-2 text-primary">
                     <Timer className={cn("w-4 h-4", timeLeft < 10 && "animate-pulse")} />
                     <span className="text-xs font-black uppercase tracking-tight opacity-60">Timer</span>
                  </div>
                  <div className={cn("text-4xl font-heading font-black tracking-tighter", timeLeft < 10 ? "text-red-500" : "text-white")}>
                     {timeLeft}<span className="text-base text-slate-600 ml-1">s</span>
                  </div>
               </div>

               {/* Center: Abort */}
               <div className="flex justify-center">
                  <button 
                    onClick={() => setGameState('idle')}
                    className="group p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all flex items-center space-x-2 backdrop-blur-xl"
                  >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-tight">Abort Mission</span>
                  </button>
               </div>

               {/* Right: Score */}
               <div className="flex justify-end">
                  <div className="p-4 rounded-[24px] bg-slate-900/60 border-r-4 border-secondary backdrop-blur-2xl shadow-2xl text-right space-y-0 w-fit">
                     <div className="flex items-center justify-end space-x-2 text-secondary">
                        <span className="text-xs font-black uppercase tracking-tight opacity-60">Power Level</span>
                        <Star className="w-4 h-4 fill-current" />
                     </div>
                     <div className="text-4xl font-heading font-black tracking-tighter text-white">
                        {score}
                     </div>
                  </div>
               </div>
            </div>

            {/* Central Math Core */}
            <div className="flex-grow flex flex-col items-center justify-center space-y-4 relative w-full">
               {/* Background Decorative Rings */}
               <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-[300px] h-[300px] border border-white/[0.02] rounded-full"
                  />
               </div>

               <div className="text-center">
                  <h2 className="text-white/40 text-xs font-black uppercase tracking-tighter">
                     {gameMode === 'multiply' && "Synthesize Product"}
                     {gameMode === 'add' && "Calculate Sum"}
                     {gameMode === 'subtract' && "Determine Difference"}
                     {gameMode === 'roman' && "Decode Numerals"}
                  </h2>
               </div>

               <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center justify-center space-x-8 md:space-x-12">
                     <motion.div 
                        key={`a-${question.a}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-8xl md:text-9xl font-heading font-black text-white tracking-tighter"
                     >
                        {question.a}
                     </motion.div>
                     
                     <div className="text-5xl md:text-6xl font-black text-primary/60">
                        {question.operator}
                     </div>

                     {question.b > 0 && (
                        <motion.div 
                           key={`b-${question.b}`}
                           initial={{ opacity: 0, scale: 0.5 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="text-8xl md:text-9xl font-heading font-black text-white tracking-tighter"
                        >
                           {question.b}
                        </motion.div>
                     )}
                  </div>

                  <div className="relative w-full max-w-[320px] group">
                     <motion.div 
                        className={cn(
                          "absolute -inset-1 rounded-[24px] blur-lg transition-all duration-500 opacity-20 group-hover:opacity-40",
                          feedback === 'correct' ? "bg-green-500" : feedback === 'wrong' ? "bg-red-500" : "bg-primary"
                        )}
                     />
                     <input 
                        ref={inputRef}
                        type="text"
                        value={userAnswer}
                        onChange={handleInputChange}
                        className={cn(
                          "relative w-full bg-black/60 border-2 rounded-[24px] py-8 text-center text-6xl font-heading font-black text-white focus:outline-none transition-all placeholder:text-white/5 uppercase backdrop-blur-3xl tracking-tighter",
                          feedback === 'correct' ? "border-green-500 text-green-500 scale-105" : 
                          feedback === 'wrong' ? "border-red-500 text-red-500 animate-shake" : "border-white/10 focus:border-primary shadow-2xl"
                        )}
                        placeholder="..."
                     />
                  </div>
               </div>
            </div>

            {/* Bottom: Combo Meter */}
            <div className="w-full max-w-xl px-6">
               <div className="flex justify-between items-end mb-1">
                  <div className="flex items-center space-x-2">
                     <TrendingUp className="w-5 h-5 text-primary" />
                     <div>
                        <p className="text-white font-black uppercase text-xs tracking-tight">{streak} COMBO</p>
                     </div>
                  </div>
                  {streak > 0 && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-primary font-heading font-black text-xl italic tracking-tighter"
                    >
                      {streak >= 15 ? "UNSTOPPABLE!!" : streak >= 10 ? "LEGENDARY!" : streak >= 5 ? "GREAT!" : "NICE!"}
                    </motion.span>
                  )}
               </div>
               <div className="h-3 w-full bg-white/5 rounded-full p-0.5 border border-white/5">
                  <motion.div 
                     className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min((streak / 20) * 100, 100)}%` }}
                  />
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
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{MISSIONS.find(m => m.id === gameMode)?.title} Operations</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-1">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Score</p>
                    <p className="text-4xl font-heading font-black text-white">{score}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center space-y-1">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Accuracy</p>
                    <p className="text-4xl font-heading font-black text-primary">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={startGame}
                className="flex-grow px-8 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
              >
                Play Again
              </button>
              <button 
                onClick={() => setGameState('idle')}
                className="px-8 py-5 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all"
              >
                New Mission
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
