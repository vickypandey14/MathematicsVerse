'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Zap, RefreshCcw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TimeChallenge() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({ a: 0, b: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('math-verse-high-score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateQuestion = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * 10) + 2;
    setQuestion({ a, b, answer: a * b });
    setUserAnswer('');
    setFeedback(null);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
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
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('math-verse-high-score', score.toString());
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, highScore]);

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(userAnswer);
    if (val === question.answer) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      setTimeout(generateQuestion, 200);
    } else {
      setFeedback('wrong');
      setUserAnswer('');
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center relative py-8">
      <AnimatePresence mode="wait">
        {gameState === 'idle' ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
               <Zap className="w-12 h-12 text-primary fill-current" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-heading font-black text-white uppercase tracking-tight">Speed Challenge</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">Answer as many multiplication questions as you can in 30 seconds!</p>
            </div>
            <button 
              onClick={startGame}
              className="px-12 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Start Mission
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
            className="w-full max-w-sm space-y-12"
          >
            {/* HUD */}
            <div className="flex justify-between items-center">
               <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                  <Timer className={cn("w-5 h-5", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-primary")} />
                  <span className={cn("text-2xl font-heading font-black", timeLeft < 10 ? "text-red-500" : "text-white")}>
                    {timeLeft}s
                  </span>
               </div>
               <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <span className="text-2xl font-heading font-black text-white">{score}</span>
               </div>
            </div>

            {/* Question */}
            <div className="text-center space-y-8">
               <div className="text-7xl font-heading font-black text-white tracking-tighter flex items-center justify-center space-x-6">
                  <span>{question.a}</span>
                  <span className="text-primary text-4xl">×</span>
                  <span>{question.b}</span>
               </div>

               <form onSubmit={checkAnswer} className="relative">
                  <input 
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className={cn(
                      "w-full bg-black/40 border-4 rounded-[32px] py-8 text-center text-5xl font-heading font-black text-white focus:outline-none transition-all",
                      feedback === 'correct' ? "border-green-500" : 
                      feedback === 'wrong' ? "border-red-500 animate-shake" : "border-white/5 focus:border-primary"
                    )}
                    placeholder="?"
                  />
                  <AnimatePresence>
                    {feedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2"
                      >
                         {feedback === 'correct' ? (
                           <div className="flex items-center space-x-2 text-green-500 font-black uppercase text-[10px] tracking-widest">
                              <Check className="w-4 h-4" />
                              <span>Correct!</span>
                           </div>
                         ) : (
                           <div className="flex items-center space-x-2 text-red-500 font-black uppercase text-[10px] tracking-widest">
                              <X className="w-4 h-4" />
                              <span>Try Again!</span>
                           </div>
                         )}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </form>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-secondary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
               <Trophy className="w-12 h-12 text-secondary fill-current" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-heading font-black text-white uppercase tracking-tight">Mission Over!</h3>
              <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">You scored</p>
              <div className="text-8xl font-heading font-black text-secondary tracking-tighter">{score}</div>
            </div>
            
            {score === highScore && score > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary font-black uppercase text-xs tracking-widest"
              >
                New High Score! 🎊
              </motion.div>
            )}

            <div className="flex flex-col space-y-4">
              <button 
                onClick={startGame}
                className="px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Try Again
              </button>
              <button 
                onClick={() => setGameState('idle')}
                className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Back to Start
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
