'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MathRenderer from '@/components/math/MathRenderer';
import { 
  Waves, Play, Pause, Activity, Volume2, 
  Mic, MicOff, Info, Sparkles, RefreshCw, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaveConfig {
  enabled: boolean;
  frequency: number;
  amplitude: number;
  phase: number; // in degrees, converted to radians for drawing/playing
  color: string;
  glow: string;
  label: string;
}

const PRESET_SIREN = 'sine';
const PRESET_SQUARE = 'square';
const PRESET_SAWTOOTH = 'sawtooth';
const PRESET_TRIANGLE = 'triangle';
const PRESET_CHORD = 'chord';

export default function WaveExplorer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showIndividual, setShowIndividual] = useState(true);
  const [activeTab, setActiveTab] = useState<'visuals' | 'theory'>('visuals');
  const [showGuide, setShowGuide] = useState(false);
  
  // Wave state
  const [waves, setWaves] = useState<WaveConfig[]>([
    {
      enabled: true,
      frequency: 220,
      amplitude: 0.8,
      phase: 0,
      color: '#d946ef', // Fuchsia
      glow: 'rgba(217, 70, 239, 0.4)',
      label: 'Wave 1 (Fundamental)',
    },
    {
      enabled: false,
      frequency: 440,
      amplitude: 0.4,
      phase: 0,
      color: '#06b6d4', // Cyan
      glow: 'rgba(6, 182, 212, 0.4)',
      label: 'Wave 2 (2nd Harmonic)',
    },
    {
      enabled: false,
      frequency: 660,
      amplitude: 0.2,
      phase: 0,
      color: '#f59e0b', // Amber
      glow: 'rgba(245, 158, 11, 0.4)',
      label: 'Wave 3 (3rd Harmonic)',
    },
  ]);

  // Audio nodes and context references
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ [key: number]: OscillatorNode }>({});
  const gainsRef = useRef<{ [key: number]: GainNode }>({});
  const masterGainRef = useRef<GainNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Canvas references
  const timeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const freqCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize AudioContext lazily on user interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      analyser.connect(ctx.destination);
    }

    if (!masterGainRef.current) {
      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(analyserRef.current);
      masterGainRef.current = masterGain;
    }
  };

  const startAudio = () => {
    initAudio();
    const ctx = audioContextRef.current!;
    
    if (isMicEnabled) {
      stopMic();
    }

    // Clear old oscillators if they exist
    stopAudioNodes();

    waves.forEach((wave, idx) => {
      if (wave.enabled) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = wave.frequency;

        const gain = ctx.createGain();
        // Scale down to prevent clipping when summing waves
        gain.gain.value = wave.amplitude * 0.3;

        osc.connect(gain);
        gain.connect(masterGainRef.current!);
        osc.start();

        oscillatorsRef.current[idx] = osc;
        gainsRef.current[idx] = gain;
      }
    });

    setIsPlaying(true);
  };

  const stopAudioNodes = () => {
    Object.keys(oscillatorsRef.current).forEach((key) => {
      const idx = Number(key);
      try {
        oscillatorsRef.current[idx].stop();
      } catch (e) {}
      oscillatorsRef.current[idx].disconnect();
      delete oscillatorsRef.current[idx];
    });

    Object.keys(gainsRef.current).forEach((key) => {
      const idx = Number(key);
      gainsRef.current[idx].disconnect();
      delete gainsRef.current[idx];
    });
  };

  const stopAudio = () => {
    stopAudioNodes();
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const toggleMic = async () => {
    if (isMicEnabled) {
      stopMic();
      return;
    }

    if (isPlaying) {
      stopAudio();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      initAudio();
      const ctx = audioContextRef.current!;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserRef.current!);
      micSourceRef.current = source;

      setIsMicEnabled(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to analyze live audio.');
    }
  };

  const stopMic = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    setIsMicEnabled(false);
  };

  // Keep volume gain slider updated
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioContextRef.current!.currentTime, 0.05);
    }
  }, [volume]);

  // Handle wave adjustments on the fly
  const handleWaveChange = (idx: number, field: keyof WaveConfig, value: any) => {
    const updated = [...waves];
    updated[idx] = { ...updated[idx], [field]: value } as WaveConfig;
    setWaves(updated);

    // Update active synthesizer nodes
    if (isPlaying && audioContextRef.current) {
      const ctx = audioContextRef.current;
      
      if (field === 'frequency') {
        const osc = oscillatorsRef.current[idx];
        if (osc) {
          osc.frequency.setTargetAtTime(value, ctx.currentTime, 0.05);
        }
      }
      
      if (field === 'amplitude') {
        const gain = gainsRef.current[idx];
        if (gain) {
          gain.gain.setTargetAtTime(value * 0.3, ctx.currentTime, 0.05);
        }
      }

      if (field === 'enabled') {
        const isEnabled = value as boolean;
        if (isEnabled) {
          // Dynamically start a new oscillator for this wave
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = updated[idx].frequency;

          const gain = ctx.createGain();
          gain.gain.value = updated[idx].amplitude * 0.3;

          osc.connect(gain);
          gain.connect(masterGainRef.current!);
          osc.start();

          oscillatorsRef.current[idx] = osc;
          gainsRef.current[idx] = gain;
        } else {
          // Stop and remove current oscillator
          const osc = oscillatorsRef.current[idx];
          if (osc) {
            try { osc.stop(); } catch (e) {}
            osc.disconnect();
            delete oscillatorsRef.current[idx];
          }
          const gain = gainsRef.current[idx];
          if (gain) {
            gain.disconnect();
            delete gainsRef.current[idx];
          }
        }
      }
    }
  };

  // Set standard mathematical presets
  const applyPreset = (type: string) => {
    let presetWaves: WaveConfig[] = [];
    const baseFreq = 220; // A3 pitch, very clean fundamental frequency

    if (type === PRESET_SIREN) {
      presetWaves = [
        { ...waves[0], enabled: true, frequency: baseFreq, amplitude: 0.8, phase: 0 },
        { ...waves[1], enabled: false, frequency: baseFreq * 2, amplitude: 0.4, phase: 0 },
        { ...waves[2], enabled: false, frequency: baseFreq * 3, amplitude: 0.2, phase: 0 },
      ];
    } else if (type === PRESET_SQUARE) {
      presetWaves = [
        { ...waves[0], enabled: true, frequency: baseFreq, amplitude: 0.8, phase: 0 },
        { ...waves[1], enabled: true, frequency: baseFreq * 3, amplitude: 0.8 / 3, phase: 0 },
        { ...waves[2], enabled: true, frequency: baseFreq * 5, amplitude: 0.8 / 5, phase: 0 },
      ];
    } else if (type === PRESET_TRIANGLE) {
      presetWaves = [
        { ...waves[0], enabled: true, frequency: baseFreq, amplitude: 0.8, phase: 0 },
        { ...waves[1], enabled: true, frequency: baseFreq * 3, amplitude: 0.8 / 9, phase: 180 }, // phase shift to alternate signs
        { ...waves[2], enabled: true, frequency: baseFreq * 5, amplitude: 0.8 / 25, phase: 0 },
      ];
    } else if (type === PRESET_SAWTOOTH) {
      presetWaves = [
        { ...waves[0], enabled: true, frequency: baseFreq, amplitude: 0.8, phase: 0 },
        { ...waves[1], enabled: true, frequency: baseFreq * 2, amplitude: 0.8 / 2, phase: 0 },
        { ...waves[2], enabled: true, frequency: baseFreq * 3, amplitude: 0.8 / 3, phase: 0 },
      ];
    } else if (type === PRESET_CHORD) {
      // Major Triad Chord: C4 (261.63Hz), E4 (329.63Hz), G4 (392.00Hz)
      presetWaves = [
        { ...waves[0], enabled: true, frequency: 261.6, amplitude: 0.5, phase: 0, label: 'Root (C4)' },
        { ...waves[1], enabled: true, frequency: 329.6, amplitude: 0.5, phase: 0, label: 'Major 3rd (E4)' },
        { ...waves[2], enabled: true, frequency: 392.0, amplitude: 0.5, phase: 0, label: 'Perfect 5th (G4)' },
      ];
    }

    setWaves(presetWaves);

    // If currently playing, recreate the oscillators instantly
    if (isPlaying) {
      stopAudioNodes();
      const ctx = audioContextRef.current!;
      presetWaves.forEach((wave, idx) => {
        if (wave.enabled) {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = wave.frequency;

          const gain = ctx.createGain();
          gain.gain.value = wave.amplitude * 0.3;

          osc.connect(gain);
          gain.connect(masterGainRef.current!);
          osc.start();

          oscillatorsRef.current[idx] = osc;
          gainsRef.current[idx] = gain;
        }
      });
    }
  };

  // Canvas drawing loop
  useEffect(() => {
    let lastTime = performance.now();

    const draw = (now: number) => {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Increment wave display scrolling offset
      scrollOffsetRef.current += 4 * deltaTime; // Speed of movement

      // 1. Draw Time Domain (Oscilloscope) Canvas
      const timeCanvas = timeCanvasRef.current;
      if (timeCanvas) {
        const ctx = timeCanvas.getContext('2d');
        if (ctx) {
          const w = timeCanvas.clientWidth;
          const h = timeCanvas.clientHeight;
          
          // Fit canvas resolution for high-DPI displays
          const dpr = window.devicePixelRatio || 1;
          if (timeCanvas.width !== w * dpr || timeCanvas.height !== h * dpr) {
            timeCanvas.width = w * dpr;
            timeCanvas.height = h * dpr;
            ctx.scale(dpr, dpr);
          }

          // Clear & Draw grid lines
          ctx.fillStyle = '#0b0f19'; // Deep slate navy
          ctx.fillRect(0, 0, w, h);

          // Grid coordinates
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          const gridRows = 8;
          const gridCols = 10;
          for (let i = 1; i < gridRows; i++) {
            const yPos = (h / gridRows) * i;
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(w, yPos);
            ctx.stroke();
          }
          for (let i = 1; i < gridCols; i++) {
            const xPos = (w / gridCols) * i;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, h);
            ctx.stroke();
          }

          // Equilibrium line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();

          // Time domain plot logic
          if (isMicEnabled && analyserRef.current) {
            // Real Microphone Waveform
            const analyser = analyserRef.current;
            const bufferLength = analyser.fftSize;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            ctx.lineWidth = 3;
            ctx.strokeStyle = '#22d3ee'; // Neon Cyan
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
            ctx.beginPath();

            const sliceWidth = w / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0; // Normalized 0.0 - 2.0
              const y = (v * h) / 2;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }

              x += sliceWidth;
            }
            ctx.lineTo(w, h / 2);
            ctx.stroke();
            ctx.shadowBlur = 0; // reset glow
          } else {
            // Synthetic Waveforms Superposition Plot
            const points: number[] = new Array(w).fill(0);
            
            // Draw individual waves if requested
            waves.forEach((wave, idx) => {
              if (wave.enabled && showIndividual) {
                ctx.beginPath();
                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]); // Dotted line for individual harmonics

                for (let x = 0; x < w; x++) {
                  // Scale width to fit 10ms window
                  const t = 0.01 * (x / w); 
                  const radPhase = (wave.phase * Math.PI) / 180;
                  const val = wave.amplitude * Math.sin(2 * Math.PI * wave.frequency * t + radPhase - scrollOffsetRef.current);
                  
                  const y = h / 2 - val * (h / 3);
                  if (x === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);

                  // Sum up the amplitude values for combined plot
                  points[x] += val;
                }
                ctx.stroke();
              } else if (wave.enabled && !showIndividual) {
                // If individual lines are hidden, we still calculate the combined values
                for (let x = 0; x < w; x++) {
                  const t = 0.01 * (x / w); 
                  const radPhase = (wave.phase * Math.PI) / 180;
                  const val = wave.amplitude * Math.sin(2 * Math.PI * wave.frequency * t + radPhase - scrollOffsetRef.current);
                  points[x] += val;
                }
              }
            });

            // Draw Combined Superposition Wave
            ctx.setLineDash([]); // Reset line pattern
            ctx.lineWidth = 4;
            
            // Create a gorgeous gradient for the master wave
            const grad = ctx.createLinearGradient(0, 0, w, 0);
            grad.addColorStop(0, '#6366f1'); // Indigo
            grad.addColorStop(0.5, '#a855f7'); // Purple
            grad.addColorStop(1, '#ec4899'); // Pink
            ctx.strokeStyle = grad;
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(129, 140, 248, 0.4)';
            
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
              // Clamp values to fit on canvas height nicely
              const clampedVal = Math.max(-1.5, Math.min(1.5, points[x]));
              const y = h / 2 - clampedVal * (h / 3);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
          }

          // Timestamp overlay (10ms window)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = '9px monospace';
          ctx.fillText('0 ms', 5, h - 5);
          ctx.fillText('5 ms', w / 2 - 12, h - 5);
          ctx.fillText('10 ms', w - 35, h - 5);
          ctx.fillText('TIME DOMAIN (OSCILLOSCOPE)', 5, 15);
        }
      }

      // 2. Draw Frequency Domain (FFT Analyzer) Canvas
      const freqCanvas = freqCanvasRef.current;
      if (freqCanvas) {
        const ctx = freqCanvas.getContext('2d');
        if (ctx) {
          const w = freqCanvas.clientWidth;
          const h = freqCanvas.clientHeight;
          
          const dpr = window.devicePixelRatio || 1;
          if (freqCanvas.width !== w * dpr || freqCanvas.height !== h * dpr) {
            freqCanvas.width = w * dpr;
            freqCanvas.height = h * dpr;
            ctx.scale(dpr, dpr);
          }

          ctx.fillStyle = '#0b0f19';
          ctx.fillRect(0, 0, w, h);

          // Grid lines every 200 Hz up to 1500 Hz
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          
          const maxFreqDisplay = 1500; // Hz
          const labelStep = 200; // Hz
          for (let f = labelStep; f < maxFreqDisplay; f += labelStep) {
            const xPos = (f / maxFreqDisplay) * w;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, h);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = '8px monospace';
            ctx.fillText(`${f}Hz`, xPos - 12, h - 5);
          }

          // Frequency domain plot logic
          if ((isPlaying || isMicEnabled) && analyserRef.current) {
            // Real FFT analysis peaks
            const analyser = analyserRef.current;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            // Calculate bins mapping to maxFreqDisplay (1500Hz)
            const sampleRate = audioContextRef.current?.sampleRate || 44100;
            const binSize = sampleRate / analyser.fftSize; // Hz per bin
            const maxBinIdx = Math.min(bufferLength, Math.ceil(maxFreqDisplay / binSize));

            // Create linear gradient for fill
            const grad = ctx.createLinearGradient(0, h, 0, 0);
            grad.addColorStop(0, 'rgba(99, 102, 241, 0.05)'); // Translucent Indigo
            grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)'); // Translucent Cyan
            grad.addColorStop(1, 'rgba(217, 70, 239, 0.4)'); // Translucent Fuchsia

            ctx.fillStyle = grad;
            ctx.strokeStyle = '#d946ef'; // Fuchsia line
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(217, 70, 239, 0.3)';

            ctx.beginPath();
            ctx.moveTo(0, h);

            for (let i = 0; i <= maxBinIdx; i++) {
              const f = i * binSize;
              const x = (f / maxFreqDisplay) * w;
              const normalizedVal = dataArray[i] / 255;
              const y = h - normalizedVal * (h * 0.8) - 1; // leave padding at top
              
              ctx.lineTo(x, y);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
          } else {
            // Silent Mode: Draw Theoretical Frequency Deltas (Gaussian-smoothed peaks)
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, h);

            // We generate the theoretical FFT line shape mathematically
            const points: number[] = new Array(Math.ceil(w)).fill(0);
            
            waves.forEach((wave) => {
              if (wave.enabled) {
                const centerIdx = (wave.frequency / maxFreqDisplay) * w;
                const peakHeight = wave.amplitude * (h * 0.7);
                const widthFactor = 12; // width of peak bell

                for (let x = 0; x < w; x++) {
                  // Gaussian function: e^(-(x-mu)^2 / (2*sigma^2))
                  const diff = x - centerIdx;
                  const val = peakHeight * Math.exp(-(diff * diff) / (2 * widthFactor * widthFactor));
                  points[x] = Math.max(points[x], val);
                }
              }
            });

            // Draw line connecting the theoretical peaks
            ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)'; // faint indigo
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let x = 0; x < w; x++) {
              ctx.lineTo(x, h - points[x] - 1);
            }
            ctx.lineTo(w, h);
            ctx.stroke();
            
            // Draw a subtle note
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.font = '8px sans-serif';
            ctx.fillText('(Theoretical Spectrum shown while silent)', w / 2 - 90, 30);
          }

          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = '9px monospace';
          ctx.fillText('FREQUENCY DOMAIN (FFT SPECTRUM)', 5, 15);
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [waves, isPlaying, isMicEnabled, showIndividual]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      stopAudioNodes();
      stopMic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Waves className="w-3.5 h-3.5" />
              <span>Interactive Physics Simulator</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-foreground tracking-tighter">
              Harmonic Wave <span className="gradient-text">Explorer</span>
            </h1>
            <p className="text-foreground/50 font-medium text-lg max-w-3xl">
              Create your own sounds by mixing different wave speeds and volume, and see the science of sound waves in action.
            </p>
          </div>
        </header>

        {/* Tab switch */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('visuals')}
            className={cn(
              'px-6 py-3 border-b-2 font-black uppercase tracking-wider text-[11px] transition-colors',
              activeTab === 'visuals'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/40 hover:text-foreground'
            )}
          >
            Visualizer Sandbox
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={cn(
              'px-6 py-3 border-b-2 font-black uppercase tracking-wider text-[11px] transition-colors',
              activeTab === 'theory'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/40 hover:text-foreground'
            )}
          >
            Fourier Mathematics
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'visuals' ? (
            <motion.div
              key="visuals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Interactive Quick-Guide Card */}
              <div className="p-6 md:p-8 rounded-[36px] bg-card/60 border border-border shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-heading font-black text-foreground uppercase tracking-tight">
                        What is this app & How to use it?
                      </h2>
                      <p className="text-xs text-foreground/50 font-medium">Read this quick 1-minute guide to see why wave math is so fascinating!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-foreground/5 hover:bg-foreground/10 border border-border/60 transition-colors"
                  >
                    {showGuide ? 'Hide Guide' : 'Show Guide'}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {showGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-6 pt-4 border-t border-border/40"
                    >
                      <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                        Did you know that <strong>every sound you hear</strong> (such as your voice, a piano note, or waves in the ocean) is actually built from simple, mathematical repeating waves? 
                        This explorer lets you play with these waves, listen to them, and watch them combine in real time!
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-foreground/60">
                        <div className="space-y-2 p-4 rounded-2xl bg-foreground/[0.02] border border-border/40">
                          <h4 className="font-black text-foreground uppercase tracking-wider text-[10px] flex items-center text-primary">
                            <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center mr-2 font-bold font-mono">1</span>
                            Hear the Wave Math
                          </h4>
                          <p className="leading-relaxed font-medium">
                            Click the blue <strong>Play Button</strong>. You will hear a pure tone. Slide the **Volume Slider** next to it to adjust the sound.
                          </p>
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-foreground/[0.02] border border-border/40">
                          <h4 className="font-black text-foreground uppercase tracking-wider text-[10px] flex items-center text-secondary">
                            <span className="w-5 h-5 rounded-lg bg-secondary/10 flex items-center justify-center mr-2 font-bold font-mono">2</span>
                            Combine Multiple Waves
                          </h4>
                          <p className="leading-relaxed font-medium">
                            Enable <strong>Wave 2</strong> or <strong>Wave 3</strong> using their switches. Move their sliders to change their speed (**Frequency**), volume (**Amplitude**), or shift them horizontally (**Phase**).
                          </p>
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-foreground/[0.02] border border-border/40">
                          <h4 className="font-black text-foreground uppercase tracking-wider text-[10px] flex items-center text-accent">
                            <span className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center mr-2 font-bold font-mono">3</span>
                            Watch the Superposition
                          </h4>
                          <p className="leading-relaxed font-medium">
                            The dotted lines on the top graph show the individual waves. The <strong>thick glowing purple line</strong> shows the combined sound. Watch how shifting the waves can reinforce or cancel them out!
                          </p>
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-foreground/[0.02] border border-border/40">
                          <h4 className="font-black text-foreground uppercase tracking-wider text-[10px] flex items-center text-yellow-500">
                            <span className="w-5 h-5 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-2 font-bold font-mono">4</span>
                            Try Preset Combinations
                          </h4>
                          <p className="leading-relaxed font-medium">
                            Click <strong>Square Wave</strong>, <strong>Sawtooth</strong>, or <strong>Triangle</strong> to automatically combine frequencies to build geometric wave shapes, or play a <strong>C-E-G Chord</strong>!
                          </p>
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-foreground/[0.02] border border-border/40">
                          <h4 className="font-black text-foreground uppercase tracking-wider text-[10px] flex items-center text-cyan-500">
                            <span className="w-5 h-5 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-2 font-bold font-mono">5</span>
                            Analyze Your Voice
                          </h4>
                          <p className="leading-relaxed font-medium">
                            Click the <strong>Microphone</strong> icon and sing or whistle. The bottom graph (FFT) will mathematically break down your voice and highlight your pitch peaks!
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid for Sandbox */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Controls (5 Cols) */}
              <div className="lg:col-span-5">
                
                {/* Unified Sound Mixer Console Card */}
                <div className="p-6 md:p-8 rounded-[36px] bg-card/45 border border-border shadow-xl backdrop-blur-md relative overflow-hidden space-y-8">
                  
                  {/* Master Section */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground/50 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-primary fill-current" />
                      Master Sound Controls
                    </h3>

                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={togglePlayback}
                          className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all transform active:scale-95 shadow-lg',
                            isPlaying 
                              ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' 
                              : 'bg-primary shadow-primary/20 hover:bg-primary/95'
                          )}
                          title={isPlaying ? 'Pause Synthesis' : 'Start Synthesis'}
                        >
                          {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                        </button>

                        <button
                          onClick={toggleMic}
                          className={cn(
                            'w-16 h-16 rounded-2xl border flex items-center justify-center transition-all transform active:scale-95 shadow-md',
                            isMicEnabled
                              ? 'bg-cyan-500 border-cyan-500/20 text-white shadow-cyan-500/20'
                              : 'bg-foreground/5 border-border text-foreground hover:bg-foreground/10'
                          )}
                          title={isMicEnabled ? 'Turn Off Microphone' : 'Enable Microphone Analysis'}
                        >
                          {isMicEnabled ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                      </div>

                      {/* Volume Slider */}
                      <div className="flex items-center space-x-3 bg-foreground/5 p-3 rounded-2xl border border-border/50 flex-grow max-w-[200px]">
                        <Volume2 className="w-5 h-5 text-foreground/45" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-black font-mono text-foreground/70 w-10 text-right">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="pt-4 border-t border-border/40">
                      <span className="text-xs font-black uppercase tracking-widest text-foreground/50 block mb-3">Sound Presets</span>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          { id: PRESET_SIREN, label: 'Pure Sine' },
                          { id: PRESET_SQUARE, label: 'Square Wave' },
                          { id: PRESET_SAWTOOTH, label: 'Sawtooth' },
                          { id: PRESET_TRIANGLE, label: 'Triangle' },
                          { id: PRESET_CHORD, label: 'C-E-G Chord' },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyPreset(preset.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-foreground/5 hover:bg-foreground/10 border border-border/60 transition-colors cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mixer Channels Section */}
                  <div className="pt-6 border-t border-border/40 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-foreground/50">Wave Channels (Mixer)</h3>
                      <button
                        onClick={() => setShowIndividual(!showIndividual)}
                        className={cn(
                          'text-xs font-black uppercase tracking-wider transition-colors cursor-pointer',
                          showIndividual ? 'text-primary' : 'text-foreground/45'
                        )}
                      >
                        {showIndividual ? 'Hide Harmonics' : 'Show Harmonics'}
                      </button>
                    </div>

                    <div className="space-y-8">
                      {waves.map((wave, idx) => {
                        const freqPct = ((wave.frequency - 100) / (1200 - 100)) * 100;
                        const ampPct = wave.amplitude * 100;
                        const phasePct = (wave.phase / 360) * 100;

                        return (
                          <div
                            key={idx}
                            className={cn(
                              "space-y-4 pt-6 border-t border-border/40 first:border-t-0 first:pt-0 transition-opacity duration-300 relative",
                              wave.enabled ? 'opacity-100' : 'opacity-50'
                            )}
                          >
                            {/* Wave Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-foreground/5 border border-border/50">
                                  <Waves className="w-4.5 h-4.5" style={{ color: wave.color }} />
                                </div>
                                <div>
                                  <span className="font-heading font-black text-sm uppercase text-foreground tracking-tight block">
                                    {wave.label}
                                  </span>
                                  <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest block mt-0.5">
                                    {wave.enabled ? 'Active' : 'Muted'}
                                  </span>
                                </div>
                              </div>

                              {/* Toggle Switch */}
                              <div className="relative inline-flex items-center">
                                <input
                                  type="checkbox"
                                  checked={wave.enabled}
                                  onChange={(e) => handleWaveChange(idx, 'enabled', e.target.checked)}
                                  className="sr-only"
                                  id={`wave-toggle-${idx}`}
                                />
                                <label
                                  htmlFor={`wave-toggle-${idx}`}
                                  className={cn(
                                    "w-10 h-5.5 rounded-full cursor-pointer transition-all duration-300 relative border flex items-center p-0.5",
                                    wave.enabled 
                                      ? "border-transparent" 
                                      : "bg-foreground/5 border-border/60"
                                  )}
                                  style={wave.enabled ? { backgroundColor: wave.color, boxShadow: `0 0 10px ${wave.color}40` } : {}}
                                >
                                  <motion.div
                                    layout
                                    className="w-4 h-4 rounded-full bg-white shadow-md"
                                    animate={{ x: wave.enabled ? 16 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Sliders Area */}
                            <div className={cn('space-y-4 transition-opacity duration-300', wave.enabled ? 'opacity-100' : 'opacity-20 pointer-events-none')}>
                              
                              {/* Frequency slider */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground/60">Pitch / Speed (Frequency)</span>
                                  <div className="px-2.5 py-1 rounded-md bg-foreground/[0.04] border border-border/60 text-xs font-mono text-foreground font-bold">
                                    {Math.round(wave.frequency)} Hz
                                  </div>
                                </div>
                                <div className="relative flex items-center">
                                  <input
                                    type="range"
                                    min="100"
                                    max="1200"
                                    step="10"
                                    value={wave.frequency}
                                    onChange={(e) => handleWaveChange(idx, 'frequency', parseInt(e.target.value))}
                                    className="w-full h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-200 hover:bg-foreground/10"
                                    style={{
                                      background: `linear-gradient(to right, ${wave.color} 0%, ${wave.color} ${freqPct}%, rgba(120,120,120,0.15) ${freqPct}%, rgba(120,120,120,0.15) 100%)`
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Amplitude slider */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground/60">Volume / Height (Amplitude)</span>
                                  <div className="px-2.5 py-1 rounded-md bg-foreground/[0.04] border border-border/60 text-xs font-mono text-foreground font-bold">
                                    {Math.round(wave.amplitude * 100)}%
                                  </div>
                                </div>
                                <div className="relative flex items-center">
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={wave.amplitude}
                                    onChange={(e) => handleWaveChange(idx, 'amplitude', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-200 hover:bg-foreground/10"
                                    style={{
                                      background: `linear-gradient(to right, ${wave.color} 0%, ${wave.color} ${ampPct}%, rgba(120,120,120,0.15) ${ampPct}%, rgba(120,120,120,0.15) 100%)`
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Phase slider */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground/60">Horizontal Shift (Phase)</span>
                                  <div className="px-2.5 py-1 rounded-md bg-foreground/[0.04] border border-border/60 text-xs font-mono text-foreground font-bold">
                                    {Math.round(wave.phase)}°
                                  </div>
                                </div>
                                <div className="relative flex items-center">
                                  <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    step="15"
                                    value={wave.phase}
                                    onChange={(e) => handleWaveChange(idx, 'phase', parseInt(e.target.value))}
                                    className="w-full h-2 bg-foreground/5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-200 hover:bg-foreground/10"
                                    style={{
                                      background: `linear-gradient(to right, ${wave.color} 0%, ${wave.color} ${phasePct}%, rgba(120,120,120,0.15) ${phasePct}%, rgba(120,120,120,0.15) 100%)`
                                    }}
                                  />
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column - Visualizers Stack (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Time Domain (Oscilloscope) Card */}
                <div className="p-6 rounded-[40px] bg-card/40 border border-border shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-foreground/40">
                      <Activity className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Time-Domain Oscilloscope</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-foreground/5 border border-border text-[9px] font-black font-mono text-foreground/60 uppercase">
                      {isMicEnabled ? 'Live Mic Input' : 'Superposition Equation View'}
                    </div>
                  </div>

                  {/* Canvas Container */}
                  <div className="aspect-[16/9] rounded-[24px] overflow-hidden border border-border bg-[#0b0f19] shadow-inner relative">
                    <canvas 
                      ref={timeCanvasRef} 
                      className="w-full h-full block cursor-crosshair" 
                    />
                  </div>
                </div>

                {/* Frequency Domain (FFT Analyzer) Card */}
                <div className="p-6 rounded-[40px] bg-card/40 border border-border shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-foreground/40">
                      <Waves className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Frequency-Domain Spectrum (FFT)</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-foreground/5 border border-border text-[9px] font-black font-mono text-foreground/60 uppercase">
                      0Hz - 1500Hz Range
                    </div>
                  </div>

                  {/* Canvas Container */}
                  <div className="aspect-[21/9] md:aspect-[16/6] rounded-[24px] overflow-hidden border border-border bg-[#0b0f19] shadow-inner relative">
                    <canvas 
                      ref={freqCanvasRef} 
                      className="w-full h-full block" 
                    />
                  </div>
                </div>

                {/* Interactive Legend Badge info */}
                <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-border flex items-start space-x-4">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-foreground/60 font-medium">
                    <p className="font-bold text-foreground mb-1 uppercase tracking-wider text-[10px]">What are you seeing?</p>
                    {isMicEnabled ? (
                      <span>The microphone analysis uses a mathematical mechanism called a <strong>Fast Fourier Transform (FFT)</strong>. It breaks down the sound in your room into a graph showing the exact pitch peaks. Sing or whistle a single tone to see a clean peak!</span>
                    ) : (
                      <span>The thin colored dotted lines represent the individual sine waves. The thick glowing purple line represents the <strong>Superposition Wave</strong>, created by summing their coordinates: <MathRenderer latex="y(t) = y_1(t) + y_2(t) + y_3(t)" />. Changing the phase shifts the waves relative to each other, creating constructive or destructive interference.</span>
                    )}
                  </div>
                </div>

              </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-10 py-4"
            >
              
              {/* Card 1: Wave Equation */}
              <div className="p-8 rounded-[40px] bg-card/40 border border-border shadow-xl backdrop-blur-md space-y-4">
                <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">The Anatomy of a Sine Wave</h3>
                <p className="text-foreground/70 leading-relaxed text-sm font-medium">
                  A pure mathematical sound is represented as a trigonometric sine wave. Sound waves are simple variations in pressure over time, governed by the following formula:
                </p>
                
                <div className="py-4 flex justify-center bg-foreground/[0.02] border border-border rounded-2xl">
                  <MathRenderer latex="y(t) = A \cdot \sin(2\pi f \cdot t + \phi)" block />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs font-medium">
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Amplitude ($A$)</h4>
                    <p className="text-foreground/50 leading-relaxed">The height of the wave. Dynamically dictates volume. Higher amplitudes push more air molecules, yielding louder volumes.</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Frequency ($f$)</h4>
                    <p className="text-foreground/50 leading-relaxed">The speed of oscillation, measured in Hertz (cycles per second). Dictates the musical pitch (e.g. 440Hz is standard middle A note).</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Phase Offset (φ)</h4>
                    <p className="text-foreground/50 leading-relaxed">The horizontal offset of the wave in radians or degrees. Dictates where in the cycle the wave begins at time t = 0.</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Superposition & Interference */}
              <div className="p-8 rounded-[40px] bg-card/40 border border-border shadow-xl backdrop-blur-md space-y-4">
                <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">Superposition & Interference</h3>
                <p className="text-foreground/70 leading-relaxed text-sm font-medium">
                  When multiple sound waves travel through the same medium simultaneously, they pass through each other without modification. The resulting displacement of any particle is the algebraic sum of the displacements of the individual waves.
                </p>
                <div className="py-4 flex justify-center bg-foreground/[0.02] border border-border rounded-2xl">
                  <MathRenderer latex="y_{\text{composite}}(t) = \sum_{i=1}^{N} A_i \sin(2\pi f_i t + \phi_i)" block />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-green-500 uppercase tracking-wider text-[10px]">Constructive Interference</h4>
                    <p className="text-foreground/50 leading-relaxed font-medium">
                      When the peaks of two waves line up (in-phase, φ₁ ≈ φ₂), they reinforce each other, resulting in a wave with a larger amplitude (A_sum = A₁ + A₂). This makes the sound louder.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-red-500 uppercase tracking-wider text-[10px]">Destructive Interference</h4>
                    <p className="text-foreground/50 leading-relaxed font-medium">
                      When the peaks of one wave align with the troughs of another (out-of-phase, e.g. φ₂ = φ₁ + 180°), they cancel each other out (A_sum = |A₁ - A₂|). If they have equal amplitudes, the sound vanishes into total silence. This is the underlying math of active noise-canceling headphones!
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Fourier Decomposition */}
              <div className="p-8 rounded-[40px] bg-card/40 border border-border shadow-xl backdrop-blur-md space-y-4">
                <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">Fourier Series: Building Complex Geometries</h3>
                <p className="text-foreground/70 leading-relaxed text-sm font-medium">
                  In 1822, French mathematician Joseph Fourier proved that any periodic wave, no matter how complex or jagged (like a square, sawtooth, or triangle wave), can be decomposed into an infinite sum of simple sine waves.
                </p>

                <div className="space-y-6 pt-4">
                  <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">1. Square Wave Fourier Series</span>
                      <span className="text-[9px] font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase font-bold">Only Odd Harmonics</span>
                    </div>
                    <MathRenderer latex="y_{\text{square}}(t) = \frac{4}{\pi} \left[ \sin(\omega t) + \frac{1}{3}\sin(3\omega t) + \frac{1}{5}\sin(5\omega t) + \dots \right]" block />
                    <p className="text-[11px] text-foreground/50 font-medium">
                      Constructed by adding only odd harmonics ($f, 3f, 5f$) with amplitudes diminishing by $1/n$. Clicking the "Square Wave" preset sets Wave 1, 2, and 3 to these ratios to demonstrate the squaring effect!
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500">2. Sawtooth Wave Fourier Series</span>
                      <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-500 px-2.5 py-1 rounded-full uppercase font-bold">All Harmonics</span>
                    </div>
                    <MathRenderer latex="y_{\text{sawtooth}}(t) = \frac{2}{\pi} \left[ \sin(\omega t) - \frac{1}{2}\sin(2\omega t) + \frac{1}{3}\sin(3\omega t) - \dots \right]" block />
                    <p className="text-[11px] text-foreground/50 font-medium">
                      Constructed using all integer harmonics ($f, 2f, 3f, 4f$) with amplitudes diminishing by $1/n$ and alternating signs. This wave is famous in electronic synthesis for its sharp, brassy buzz.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">3. Triangle Wave Fourier Series</span>
                      <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full uppercase font-bold">Rapid Decay ($1/n^2$)</span>
                    </div>
                    <MathRenderer latex="y_{\text{triangle}}(t) = \frac{8}{\pi^2} \left[ \sin(\omega t) - \frac{1}{9}\sin(3\omega t) + \frac{1}{25}\sin(5\omega t) - \dots \right]" block />
                    <p className="text-[11px] text-foreground/50 font-medium">
                      Constructed using odd harmonics whose amplitudes decay extremely rapidly ($1/n^2$). Because the higher frequencies vanish so fast, the sound is very mellow, close to a flute.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
