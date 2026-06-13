'use client';

import MainLayout from '@/components/layout/MainLayout';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Edit3, 
  Sliders, 
  Activity, 
  Sparkles, 
  Info, 
  Trash2,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// DFT Types
interface DFTResult {
  freq: number;
  amp: number;
  phase: number;
}

interface Point {
  x: number;
  y: number;
}

// Preset Definitions
const PRESETS: Record<string, { name: string; generator: (count?: number) => Point[] }> = {
  heart: {
    name: 'Heart',
    generator: (count = 200) => {
      const points: Point[] = [];
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        // Classical Parametric Heart equations
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        points.push({ x, y });
      }
      return points;
    }
  },
  infinity: {
    name: 'Infinity Loop',
    generator: (count = 200) => {
      const points: Point[] = [];
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        // Lemniscate of Bernoulli
        const scale = 20 / (3 - Math.cos(2*t));
        const x = scale * Math.cos(t);
        const y = scale * Math.sin(2*t) / 2;
        points.push({ x, y });
      }
      return points;
    }
  },
  trefoil: {
    name: 'Trefoil Knot',
    generator: (count = 240) => {
      const points: Point[] = [];
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const x = Math.sin(t) + 2 * Math.sin(2 * t);
        const y = -(Math.cos(t) - 2 * Math.cos(2 * t));
        points.push({ x: x * 5, y: y * 5 });
      }
      return points;
    }
  },
  square: {
    name: 'Square Outline',
    generator: (count = 200) => {
      const points: Point[] = [];
      const side = count / 4;
      // Tracing a perfect square perimeter
      for (let i = 0; i < side; i++) points.push({ x: -10 + (20 * i) / side, y: -10 }); // Top
      for (let i = 0; i < side; i++) points.push({ x: 10, y: -10 + (20 * i) / side }); // Right
      for (let i = 0; i < side; i++) points.push({ x: 10 - (20 * i) / side, y: 10 }); // Bottom
      for (let i = 0; i < side; i++) points.push({ x: -10, y: 10 - (20 * i) / side }); // Left
      return points.map(p => ({ x: p.x * 1.5, y: p.y * 1.5 }));
    }
  },
  star: {
    name: 'Five-Point Star',
    generator: (count = 200) => {
      const points: Point[] = [];
      const outerR = 15;
      const innerR = 6;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const isOuter = Math.floor(t / (Math.PI / 5)) % 2 === 0;
        // Interpolate radius for star points
        const r = isOuter ? outerR : innerR;
        const x = r * Math.sin(t);
        const y = -r * Math.cos(t);
        points.push({ x, y });
      }
      return points;
    }
  }
};

export default function FourierCanvasPage() {
  const [mode, setMode] = useState<'draw' | 'simulate'>('draw');
  const [points, setPoints] = useState<Point[]>([]);
  const [dftCoefs, setDftCoefs] = useState<DFTResult[]>([]);
  const [harmonics, setHarmonics] = useState<number>(30);
  const [speed, setSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Toggles
  const [showCircles, setShowCircles] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTracedPath, setShowTracedPath] = useState<boolean>(true);
  const [showTarget, setShowTarget] = useState<boolean>(true);
  
  // Info guides
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<boolean>(false);
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const tracedPathRef = useRef<Point[]>([]);

  // Calculate Discrete Fourier Transform (DFT)
  const computeDFT = (inputPoints: Point[]): DFTResult[] => {
    const N = inputPoints.length;
    if (N === 0) return [];
    
    const results: DFTResult[] = [];
    
    // Compute coefficients for k frequencies
    for (let k = 0; k < N; k++) {
      let re = 0;
      let im = 0;
      
      for (let n = 0; n < N; n++) {
        const phi = (Math.PI * 2 * k * n) / N;
        re += inputPoints[n].x * Math.cos(phi) + inputPoints[n].y * Math.sin(phi);
        im += -inputPoints[n].x * Math.sin(phi) + inputPoints[n].y * Math.cos(phi);
      }
      
      re = re / N;
      im = im / N;
      
      const freq = k;
      const amp = Math.sqrt(re * re + im * im);
      const phase = Math.atan2(im, re);
      
      results.push({ freq, amp, phase });
    }
    
    // Sort coefficients by amplitude to render larger circles at the base
    return results.sort((a, b) => b.amp - a.amp);
  };

  // Downsample drawing path for smoother circles rendering
  const downsamplePath = (rawPoints: Point[], targetCount = 200): Point[] => {
    if (rawPoints.length <= targetCount) return rawPoints;
    const step = rawPoints.length / targetCount;
    const result: Point[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.min(Math.floor(i * step), rawPoints.length - 1);
      result.push(rawPoints[idx]);
    }
    return result;
  };

  // Scale and center points to fit the canvas box
  const centerAndScalePath = (pathPoints: Point[], w: number, h: number): Point[] => {
    if (pathPoints.length === 0) return [];
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    pathPoints.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    
    const pathW = maxX - minX;
    const pathH = maxY - minY;
    const cx = minX + pathW / 2;
    const cy = minY + pathH / 2;
    
    const size = Math.min(w, h);
    const scale = (size * 0.6) / (Math.max(pathW, pathH) || 1);
    
    return pathPoints.map(p => ({
      x: (p.x - cx) * scale,
      y: (p.y - cy) * scale
    }));
  };

  // Initialize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(parent.clientHeight, 450);
      drawStatic();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup
    
    return () => window.removeEventListener('resize', handleResize);
  }, [mode, points]);

  // Load a preset shape
  const loadPreset = (presetKey: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const raw = PRESETS[presetKey].generator();
    const scaled = centerAndScalePath(raw, canvas.width, canvas.height);
    
    setPoints(scaled);
    tracedPathRef.current = [];
    timeRef.current = 0;
    
    const coefs = computeDFT(scaled);
    setDftCoefs(coefs);
    setHarmonics(Math.min(coefs.length, Math.max(30, Math.floor(coefs.length / 3))));
    setMode('simulate');
    setIsPlaying(true);
  };

  // Start drawing with mouse/touch
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    drawingRef.current = true;
    tracedPathRef.current = [];
    
    const coords = getEventCoords(e);
    if (coords) {
      setPoints([coords]);
    }
  };

  // Dragging mouse/touch to record points
  const handleDragDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw' || !drawingRef.current) return;
    e.preventDefault();
    
    const coords = getEventCoords(e);
    if (coords) {
      // Avoid recording duplicate adjacent points
      setPoints(prev => {
        if (prev.length === 0) return [coords];
        const last = prev[prev.length - 1];
        const distSq = Math.pow(coords.x - last.x, 2) + Math.pow(coords.y - last.y, 2);
        if (distSq > 16) { // Minimum drag distance of 4px
          return [...prev, coords];
        }
        return prev;
      });
    }
  };

  // Finished drawing, compute DFT
  const handleEndDraw = () => {
    if (mode !== 'draw' || !drawingRef.current) return;
    drawingRef.current = false;
    
    if (points.length < 5) {
      setPoints([]);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Downsample and center the drawing points
    const sampled = downsamplePath(points, 200);
    const centered = centerAndScalePath(sampled, canvas.width, canvas.height);
    
    setPoints(centered);
    tracedPathRef.current = [];
    timeRef.current = 0;
    
    const coefs = computeDFT(centered);
    setDftCoefs(coefs);
    setHarmonics(Math.min(coefs.length, 30));
    setMode('simulate');
    setIsPlaying(true);
  };

  const getEventCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Shift coords relative to canvas center
    return {
      x: clientX - rect.left - canvas.width / 2,
      y: clientY - rect.top - canvas.height / 2
    };
  };

  // Draw static state (when in draw mode or empty)
  const drawStatic = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    
    if (points.length > 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.beginPath();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(99,102,241,0.5)';
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  // Render Grid background
  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.035)';
    // In dark mode we want a slightly lighter grid line
    const isDark = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(15, 23, 42, 0.035)';
    ctx.lineWidth = 1;
    
    const size = 30;
    for (let x = 0; x < w; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Centered axes
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  };

  // Simulation Animation Loop
  useEffect(() => {
    if (mode !== 'simulate' || dftCoefs.length === 0) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvas.width, canvas.height);
      
      const isDark = document.documentElement.classList.contains('dark');

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // 1. Draw target shape sketch in background
      if (showTarget && points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]); // Reset
      }

      // 2. Compute epicycles vector chain
      let x = 0;
      let y = 0;
      
      const limitedHarmonics = Math.min(harmonics, dftCoefs.length);
      const pointsToDraw: Point[] = [];

      for (let i = 0; i < limitedHarmonics; i++) {
        const coef = dftCoefs[i];
        const prevX = x;
        const prevY = y;
        
        // Sum term: A * cos(2pi*f*t + phase) + i * A * sin(2pi*f*t + phase)
        const val = 2 * Math.PI * coef.freq * timeRef.current + coef.phase;
        x += coef.amp * Math.cos(val);
        y += coef.amp * Math.sin(val);
        
        pointsToDraw.push({ x: prevX, y: prevY });

        // Draw spinning circles
        if (showCircles) {
          ctx.beginPath();
          ctx.strokeStyle = isDark 
            ? `rgba(99, 102, 241, ${Math.max(0.02, 0.15 - i * 0.005)})` 
            : `rgba(99, 102, 241, ${Math.max(0.015, 0.12 - i * 0.004)})`;
          ctx.lineWidth = 1;
          ctx.arc(prevX, prevY, coef.amp, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw vector lines (rotating arms)
        if (showVectors) {
          ctx.beginPath();
          ctx.strokeStyle = i === 0 
            ? 'rgba(217, 70, 239, 0.65)' // Pink for base carrier vector
            : 'rgba(6, 182, 212, 0.5)';   // Cyan for details
          ctx.lineWidth = i === 0 ? 2 : 1;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
          
          // Draw small tip dot
          ctx.beginPath();
          ctx.fillStyle = i === 0 ? '#d946ef' : '#06b6d4';
          ctx.arc(x, y, i === 0 ? 3 : 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Record drawing trace (tip of the final vector)
      if (isPlaying) {
        tracedPathRef.current.push({ x, y });
        // Prevent buffer bloat
        if (tracedPathRef.current.length > points.length * 2) {
          tracedPathRef.current.shift();
        }
      }

      // 3. Draw traced output path
      if (showTracedPath && tracedPathRef.current.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(99,102,241,0.4)';
        ctx.moveTo(tracedPathRef.current[0].x, tracedPathRef.current[0].y);
        for (let i = 1; i < tracedPathRef.current.length; i++) {
          ctx.lineTo(tracedPathRef.current[i].x, tracedPathRef.current[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      }

      // Draw active tip indicator
      ctx.beginPath();
      ctx.fillStyle = '#6366f1';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#6366f1';
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      ctx.restore();

      // 4. Update Time
      if (isPlaying) {
        // Increment time based on path length and speed
        const dt = (1 / points.length) * speed;
        timeRef.current = (timeRef.current + dt) % 1;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(render);
    } else {
      render(); // Single render when paused
    }

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [mode, dftCoefs, harmonics, speed, isPlaying, showCircles, showVectors, showTracedPath, showTarget]);

  // Keep drawing in draw mode
  useEffect(() => {
    if (mode === 'draw') {
      drawStatic();
    }
  }, [points, mode]);

  const clearCanvas = () => {
    setPoints([]);
    setDftCoefs([]);
    tracedPathRef.current = [];
    timeRef.current = 0;
    setMode('draw');
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  };

  const accuracyPercent = dftCoefs.length > 0 
    ? Math.round((Math.min(harmonics, dftCoefs.length) / dftCoefs.length) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Wave Epicycles</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase leading-none">
              Fourier Canvas
            </h1>
            <p className="text-foreground/60 font-medium text-base">
              Draw custom shapes and watch spinning complex orbits reconstruct your design using waves.
            </p>
          </div>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center space-x-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border text-[10px] font-black uppercase tracking-wider rounded-xl transition-all w-fit"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>How it Works</span>
          </button>
        </div>

        {/* Explain Card */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-[28px] bg-card border border-border/80 shadow-xl space-y-4"
            >
              <h3 className="text-base font-heading font-black text-foreground uppercase flex items-center gap-2">
                <Sparkles className="text-secondary w-5 h-5" />
                The Magic of Fourier Series
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                French mathematician Joseph Fourier discovered that any periodic path can be broken down into a sum of rotating vectors (circles spinning at constant speeds).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
                <div className="space-y-1.5 p-4 rounded-2xl bg-foreground/[0.02] border border-border/60">
                  <span className="font-bold text-primary">1. Capture Coordinate Loop</span>
                  <p className="text-foreground/60 leading-relaxed">Your drawing is recorded as a continuous loop of coordinate pairs moving through 2D space.</p>
                </div>
                <div className="space-y-1.5 p-4 rounded-2xl bg-foreground/[0.02] border border-border/60">
                  <span className="font-bold text-secondary">2. Solve the Frequencies</span>
                  <p className="text-foreground/60 leading-relaxed">The Discrete Fourier Transform computes the exact size, speed, and starting rotation angle for every circle.</p>
                </div>
                <div className="space-y-1.5 p-4 rounded-2xl bg-foreground/[0.02] border border-border/60">
                  <span className="font-bold text-accent">3. Spin the Orbits</span>
                  <p className="text-foreground/60 leading-relaxed">Connecting these circles head-to-tail and spinning them recreates your original drawing perfectly!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Canvas Box */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="rounded-[40px] bg-card/40 border border-border/70 shadow-xl relative overflow-hidden backdrop-blur-md flex-grow">
              
              {/* Canvas element */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDragDraw}
                onMouseUp={handleEndDraw}
                onMouseLeave={handleEndDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleDragDraw}
                onTouchEnd={handleEndDraw}
                className={cn(
                  "w-full block bg-transparent relative z-10 select-none touch-none",
                  mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'
                )}
                style={{ height: '520px' }}
              />

              {/* Draw Overlay Prompt */}
              {points.length === 0 && mode === 'draw' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 px-6 text-center select-none">
                  <Edit3 className="w-16 h-16 text-primary/30 mb-4 animate-bounce" />
                  <p className="text-xl font-heading font-black text-foreground/70 tracking-tight uppercase">Draw here!</p>
                  <p className="text-foreground/40 text-xs mt-1 max-w-sm">Click and drag your mouse or finger to sketch a continuous outline loop inside the canvas grid.</p>
                </div>
              )}

              {/* Drawing Indicators */}
              {mode === 'draw' && points.length > 0 && (
                <div className="absolute bottom-6 left-6 z-20 px-4 py-2 rounded-xl bg-foreground/5 border border-border text-[9px] font-black uppercase tracking-wider text-foreground/50">
                  Recording: {points.length} coordinates
                </div>
              )}
            </div>

            {/* Simulation controls strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-card/40 border border-border/70 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {mode === 'simulate' ? (
                  <>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={cn(
                        "w-12 h-12 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md",
                        isPlaying 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                          : "bg-green-500/10 border-green-500/20 text-green-500"
                      )}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        timeRef.current = 0;
                        tracedPathRef.current = [];
                        if (!isPlaying) drawStatic();
                      }}
                      className="w-12 h-12 rounded-xl bg-foreground/5 border border-border text-foreground/60 hover:text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <Edit3 className="w-4 h-4 text-primary" />
                    <span>Freehand Draw Mode Active</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {mode === 'simulate' && (
                  <button
                    onClick={() => {
                      setMode('draw');
                      setIsPlaying(false);
                      tracedPathRef.current = [];
                    }}
                    className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Redraw Shape</span>
                  </button>
                )}
                <button
                  onClick={clearCanvas}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Math Config Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Presets Library */}
            <div className="p-6 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
                <Sparkles className="text-secondary w-4 h-4" />
                Select a Preset Pattern
              </h3>
              
              <div className="flex flex-col gap-2">
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className="w-full px-4 py-3 text-left rounded-xl bg-foreground/[0.03] border border-border/50 hover:bg-foreground/[0.06] hover:border-primary/30 text-foreground font-bold text-xs transition-all flex items-center justify-between group"
                  >
                    <span>{p.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Simulate &rarr;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control Params */}
            <div className="p-6 rounded-[32px] bg-card/45 border border-border/70 shadow-xl backdrop-blur-md space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/50 flex items-center gap-2">
                <Sliders className="text-primary w-4 h-4" />
                Simulation Parameters
              </h3>

              {/* Harmonics Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground/70 uppercase tracking-wide">Number of Epicycles</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 font-black text-primary">
                    {Math.min(harmonics, dftCoefs.length || harmonics)} Circles
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={dftCoefs.length > 0 ? dftCoefs.length : 100}
                  value={harmonics}
                  onChange={(e) => setHarmonics(parseInt(e.target.value))}
                  disabled={dftCoefs.length === 0}
                  className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
                <p className="text-[10px] text-foreground/40 leading-normal">
                  Higher numbers add finer detail circles to capture sharp corners and minor variations.
                </p>
              </div>

              {/* Speed Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground/70 uppercase tracking-wide">Orbit Speed</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 font-black text-secondary">
                    {speed}x speed
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              {/* Display Toggles */}
              <div className="space-y-4 pt-2 border-t border-border/60">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Visual Layers</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group select-none">
                    <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">Show Orbit Rings</span>
                    <input
                      type="checkbox"
                      checked={showCircles}
                      onChange={(e) => setShowCircles(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group select-none">
                    <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">Show Vector Arms</span>
                    <input
                      type="checkbox"
                      checked={showVectors}
                      onChange={(e) => setShowVectors(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group select-none">
                    <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">Show Reconstructed Path</span>
                    <input
                      type="checkbox"
                      checked={showTracedPath}
                      onChange={(e) => setShowTracedPath(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group select-none">
                    <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">Show Target Sketch</span>
                    <input
                      type="checkbox"
                      checked={showTarget}
                      onChange={(e) => setShowTarget(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            {mode === 'simulate' && (
              <div className="p-6 rounded-[32px] bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent border border-primary/20 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/60 flex items-center gap-2">
                  <TrendingUp className="text-primary w-4 h-4" />
                  DFT Analysis Report
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 p-3.5 rounded-xl bg-card border border-border/40">
                    <span className="text-foreground/40 text-[9px] uppercase font-black tracking-wider">Total Terms</span>
                    <p className="font-heading font-black text-foreground text-lg">{dftCoefs.length}</p>
                  </div>
                  <div className="space-y-1 p-3.5 rounded-xl bg-card border border-border/40">
                    <span className="text-foreground/40 text-[9px] uppercase font-black tracking-wider">Harmonic Fit</span>
                    <p className="font-heading font-black text-primary text-lg">{accuracyPercent}%</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-[10px] text-foreground/50 leading-relaxed p-3 rounded-xl bg-foreground/[0.02] border border-border/40">
                  <Award className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>The DFT algorithm successfully solved {dftCoefs.length} sinusoids. Using {Math.min(harmonics, dftCoefs.length)} epicycles provides {accuracyPercent}% detail fidelity.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
