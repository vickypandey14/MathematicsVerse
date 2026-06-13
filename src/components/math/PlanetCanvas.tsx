'use client';

import { useEffect, useRef, useState } from 'react';

interface PlanetCanvasProps {
  planetId: string;
  size?: number;
  isPlaying?: boolean;
  rotationSpeed?: number;
}

interface Point {
  x: number;
  y: number;
}

// 4-Octave pseudo-noise for organic textures
function pseudoNoise(x: number, y: number): number {
  return (
    Math.sin(x * 1.2 + Math.cos(y * 1.8)) * 0.45 +
    Math.sin(x * 3.7 - Math.sin(y * 2.9)) * 0.25 +
    Math.cos(x * 7.4 + y * 5.8) * 0.15 +
    Math.sin(x * 15.2 - y * 12.1) * 0.05
  );
}

export default function PlanetCanvas({ 
  planetId, 
  size = 280, 
  isPlaying = true,
  rotationSpeed = 1 
}: PlanetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightSource, setLightSource] = useState({ x: -0.6, y: -0.6, z: 0.8 });
  const timeRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Track mouse position to update the light source (flashlight effect)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Coordinates relative to planet center
    const mx = e.clientX - rect.left - canvas.width / 2;
    const my = e.clientY - rect.top - canvas.height / 2;
    const R = canvas.width / 2.3; // Planet radius
    
    // Normalize coordinates on sphere surface
    const x = mx / R;
    const y = my / R;
    const distSq = x * x + y * y;
    
    let z = 0.5;
    if (distSq < 1) {
      z = Math.sqrt(1 - distSq);
    }
    
    // Specular highlight following mouse
    setLightSource({ x, y, z });
  };

  // Reset light source on mouse leave
  const handleMouseLeave = () => {
    setLightSource({ x: -0.6, y: -0.6, z: 0.8 });
  };

  // Color generator for each planet based on coordinates (u, v) and time
  const getPlanetPixel = (
    u: number, 
    v: number, 
    planet: string, 
    time: number
  ): { r: number; g: number; b: number } => {
    switch (planet) {
      case 'sun': {
        const plasma = pseudoNoise(u * 14 + time * 1.5, v * 14 - time * 1.2);
        return {
          r: 255,
          g: Math.max(0, Math.min(255, 145 + plasma * 95)),
          b: Math.max(0, Math.min(255, 15 + plasma * 20))
        };
      }
      
      case 'mercury': {
        const craterNoise = pseudoNoise(u * 25, v * 25);
        const detail = pseudoNoise(u * 50, v * 50) * 0.05;
        let grey = 135 + craterNoise * 35 + detail * 255;
        
        // Add random crater marks
        if (Math.sin(u * 15.3) * Math.cos(v * 15.3) > 0.45) {
          grey -= 25; // Dark rim
        }
        if (Math.sin(u * 15.3 - 0.02) * Math.cos(v * 15.3 - 0.02) > 0.48) {
          grey += 35; // Bright center crater floor
        }
        
        return { r: grey, g: grey, b: grey };
      }
      
      case 'venus': {
        const cloudNoise = pseudoNoise(u * 8 - time * 0.2, v * 12);
        const swirls = pseudoNoise(u * 20, v * 8) * 12;
        return {
          r: 228 + cloudNoise * 20,
          g: 172 + cloudNoise * 24 + Math.sin(swirls) * 6,
          b: 92 + cloudNoise * 14
        };
      }
      
      case 'earth': {
        const landNoise = pseudoNoise(u * 14, v * 10);
        const isLand = landNoise > -0.04;
        
        let r = 15, g = 50, b = 135; // Ocean base
        
        if (isLand) {
          if (v < 0.16 || v > 0.84) {
            // Polar Ice Caps
            r = 245; g = 245; b = 250;
          } else if ((v > 0.28 && v < 0.38 && landNoise < 0.08) || (v > 0.62 && v < 0.72 && landNoise < 0.08)) {
            // Yellow Desert strips
            r = 188; g = 166; b = 106;
          } else {
            // Green continents
            r = 48; g = 122; b = 52;
          }
        } else {
          // Coastline shallow light blue highlight
          const depth = landNoise + 0.04;
          if (depth > -0.03) {
            r = 25; g = 98; b = 152;
          }
        }
        
        // Earth Dynamic Cloud Layer (rotating at a different speed)
        const cloudNoise = pseudoNoise(u * 22 + time * 0.4, v * 13);
        if (cloudNoise > 0.08) {
          const cloudIntensity = Math.min(1, (cloudNoise - 0.08) * 3);
          r = r * (1 - cloudIntensity) + 250 * cloudIntensity;
          g = g * (1 - cloudIntensity) + 250 * cloudIntensity;
          b = b * (1 - cloudIntensity) + 250 * cloudIntensity;
        }
        
        return { r, g, b };
      }
      
      case 'mars': {
        const cap = (v < 0.13 || v > 0.87);
        if (cap) {
          return { r: 242, g: 242, b: 245 }; // White poles
        }
        
        const marsNoise = pseudoNoise(u * 11, v * 9);
        const detail = pseudoNoise(u * 32, v * 32) * 12;
        
        if (marsNoise > 0.06) {
          // Dark Volcanic Basins
          return { r: 122 + detail, g: 60 + detail, b: 42 + detail };
        } else {
          // Red deserts
          return { r: 184 + detail, g: 82 + detail, b: 48 + detail };
        }
      }
      
      case 'jupiter': {
        const stripes = Math.sin(v * 16 + Math.cos(u * 5) * 0.12);
        const swirl = pseudoNoise(u * 12, v * 14) * 0.14;
        const comb = stripes + swirl;
        
        let r = 190, g = 152, b = 112; // Base beige tan
        
        if (comb > 0.35) {
          // Cream bands
          r = 228; g = 212; b = 184;
        } else if (comb < -0.3) {
          // Reddish brown bands
          r = 162; g = 102; b = 72;
        }
        
        // The Great Red Spot (V is around 0.72, U is around 0.64)
        const spotU = 0.64;
        const spotV = 0.72;
        let du = u - spotU;
        if (du > 0.5) du -= 1;
        else if (du < -0.5) du += 1;
        const dv = v - spotV;
        
        // Elliptical spot calculation
        const spotDistSq = (du * du) / 0.0036 + (dv * dv) / 0.0012;
        if (spotDistSq < 1) {
          const fade = 1 - spotDistSq;
          r = r * (1 - fade) + 168 * fade;
          g = g * (1 - fade) + 48 * fade;
          b = b * (1 - fade) + 36 * fade;
        }
        
        return { r, g, b };
      }
      
      case 'saturn': {
        const bands = Math.sin(v * 12) * 0.12 + pseudoNoise(u * 6, v * 10) * 0.04;
        return {
          r: 218 + bands * 22,
          g: 196 + bands * 18,
          b: 154 + bands * 12
        };
      }
      
      case 'uranus': {
        const detail = pseudoNoise(u * 6, v * 6) * 4;
        return {
          r: 174 + detail,
          g: 220 + detail,
          b: 224 + detail
        };
      }
      
      case 'neptune': {
        const bands = Math.sin(v * 10) * 0.15 + pseudoNoise(u * 8, v * 12) * 0.05;
        let r = 32 + bands * 12;
        let g = 66 + bands * 22;
        let b = 186 + bands * 32;
        
        // Great Dark Spot
        const spotU = 0.35;
        const spotV = 0.62;
        let du = u - spotU;
        if (du > 0.5) du -= 1;
        else if (du < -0.5) du += 1;
        const dv = v - spotV;
        
        const spotDistSq = (du * du) / 0.0028 + (dv * dv) / 0.001;
        if (spotDistSq < 1) {
          const fade = 1 - spotDistSq;
          r = r * (1 - fade) + 12 * fade;
          g = g * (1 - fade) + 32 * fade;
          b = b * (1 - fade) + 98 * fade;
        }
        
        return { r, g, b };
      }
      
      default:
        return { r: 120, g: 120, b: 120 };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = size;
    canvas.height = size;
    
    const R = size / 2.3; // Planet radius
    const cx = size / 2;
    const cy = size / 2;
    
    // Bounds check to avoid drawing full-canvas loops
    const minBoundX = Math.max(0, Math.floor(cx - R));
    const maxBoundX = Math.min(size, Math.ceil(cx + R));
    const minBoundY = Math.max(0, Math.floor(cy - R));
    const maxBoundY = Math.min(size, Math.ceil(cy + R));
    
    // Normalize light vector
    const lx = lightSource.x;
    const ly = lightSource.y;
    const lz = lightSource.z;
    const lLength = Math.sqrt(lx*lx + ly*ly + lz*lz) || 1;
    const nlx = lx / lLength;
    const nly = ly / lLength;
    const nlz = lz / lLength;
    
    const renderFrame = () => {
      // 1. Clear and Draw Background star field stars/etc (drawn by parent or CSS for perf, clear here)
      ctx.clearRect(0, 0, size, size);
      
      // 2. Draw Back half of Saturn's Rings (drawn BEFORE sphere if Saturn)
      if (planetId === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((26 * Math.PI) / 180); // Tilt rings 26 deg
        
        // Clip to upper half to draw back rings
        ctx.beginPath();
        ctx.rect(-size, -size, size * 2, size);
        ctx.clip();
        
        drawRings(ctx, R);
        ctx.restore();
      }

      // 3. Render Planet Sphere (Ray-cast pixels)
      const img = ctx.createImageData(size, size);
      const data = img.data;
      
      const isSun = planetId === 'sun';
      
      for (let y = minBoundY; y < maxBoundY; y++) {
        const dy = y - cy;
        const dySq = dy * dy;
        
        for (let x = minBoundX; x < maxBoundX; x++) {
          const dx = x - cx;
          const distSq = dx * dx + dySq;
          
          if (distSq <= R * R) {
            const dz = Math.sqrt(R * R - distSq);
            
            // Sphere surface normal vector
            const nx = dx / R;
            const ny = dy / R;
            const nz = dz / R;
            
            // Translate normals into spherical (lon/lat) coords mapped to texture (u,v)
            const lat = Math.asin(ny);
            const lon = Math.atan2(nz, nx) + timeRef.current;
            
            const u = (lon + Math.PI) / (Math.PI * 2);
            const v = (lat + Math.PI / 2) / Math.PI;
            
            // Fetch color
            const baseColor = getPlanetPixel(u, v, planetId, timeRef.current);
            
            // Compute Shading (Lambertian diffuse)
            let shading = nx * nlx + ny * nly + nz * nlz;
            
            // Ambient factor (Sun does not have shading, it shines)
            const ambient = isSun ? 1.0 : 0.08;
            shading = Math.max(ambient, shading);
            
            // Add a specular highlight (shininess) on liquid oceans or atmospheres
            let spec = 0;
            if (!isSun) {
              const specPower = planetId === 'earth' ? 24 : 12;
              const specIntensity = planetId === 'earth' ? 0.35 : 0.08;
              
              // Reflection vector R = 2*(N.L)*N - L
              const rx = 2 * shading * nx - nlx;
              const ry = 2 * shading * ny - nly;
              const rz = 2 * shading * nz - nlz;
              
              // Dot with View vector (0, 0, 1)
              const rView = Math.max(0, rz);
              spec = Math.pow(rView, specPower) * specIntensity * 255;
            }
            
            const idx = (y * size + x) * 4;
            
            // Apply color scaling
            data[idx] = Math.min(255, baseColor.r * shading + spec);
            data[idx + 1] = Math.min(255, baseColor.g * shading + spec);
            data[idx + 2] = Math.min(255, baseColor.b * shading + spec);
            data[idx + 3] = 255;
          }
        }
      }
      
      // Temporary canvas to write imageData
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(img, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }

      // 4. Draw Front half of Saturn's Rings (drawn AFTER sphere if Saturn)
      if (planetId === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((26 * Math.PI) / 180);
        
        // Clip to lower half to draw front rings (in front of planet)
        ctx.beginPath();
        ctx.rect(-size, 0, size * 2, size);
        ctx.clip();
        
        drawRings(ctx, R);
        ctx.restore();
      }

      // 5. Draw atmosphere glow layer (for Venus, Earth, Mars, Neptune)
      if (planetId !== 'sun' && planetId !== 'mercury') {
        ctx.save();
        const glowRad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.05);
        
        let glowColor = 'rgba(99, 102, 241, 0.4)'; // Light blue for Earth
        if (planetId === 'venus') glowColor = 'rgba(234, 179, 8, 0.3)';
        else if (planetId === 'mars') glowColor = 'rgba(239, 68, 68, 0.2)';
        else if (planetId === 'neptune' || planetId === 'uranus') glowColor = 'rgba(6, 182, 212, 0.35)';
        else if (planetId === 'jupiter') glowColor = 'rgba(194, 120, 3, 0.15)';
        
        glowRad.addColorStop(0, glowColor);
        glowRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowRad;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update rotation time if playing
      if (isPlaying) {
        // Base orbit increment speed
        timeRef.current += 0.0035 * rotationSpeed;
      }
      
      animationFrameId.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [planetId, size, isPlaying, rotationSpeed, lightSource]);

  // Helper to draw Saturn's rings
  const drawRings = (ctx: CanvasRenderingContext2D, R: number) => {
    // Inner/Outer ring radii in ratio to planet radius
    const innerR = R * 1.35;
    const outerR = R * 2.15;
    const isDark = document.documentElement.classList.contains('dark');
    
    // Saturn rings are composed of distinct rings (A, B, C, Cassini Division)
    // Draw concentric ring bands
    
    // Cassini division / Outer Ring A
    ctx.strokeStyle = isDark ? 'rgba(215, 185, 135, 0.65)' : 'rgba(180, 155, 110, 0.6)';
    ctx.lineWidth = R * 0.15;
    ctx.beginPath();
    ctx.ellipse(0, 0, outerR - R * 0.1, (outerR - R * 0.1) * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Middle Ring B (thickest & brightest)
    ctx.strokeStyle = isDark ? 'rgba(242, 222, 179, 0.85)' : 'rgba(212, 192, 149, 0.8)';
    ctx.lineWidth = R * 0.35;
    ctx.beginPath();
    ctx.ellipse(0, 0, innerR + R * 0.28, (innerR + R * 0.28) * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Ring C (faint, close to planet)
    ctx.strokeStyle = isDark ? 'rgba(165, 135, 95, 0.3)' : 'rgba(135, 110, 75, 0.3)';
    ctx.lineWidth = R * 0.15;
    ctx.beginPath();
    ctx.ellipse(0, 0, innerR, innerR * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Visual Telemetry Grid background */}
      <div className="absolute inset-0 bg-radial-glow opacity-50 z-0 pointer-events-none rounded-full" />
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 filter drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)] cursor-radial"
      />
    </div>
  );
}
