'use client';

import { useEffect, useRef, useState } from 'react';

interface PlanetCanvasProps {
  planetId: string;
  size?: number;
  isPlaying?: boolean;
  rotationSpeed?: number;
}

const texWidth = 512;
const texHeight = 256;

// 4-Octave pseudo-noise for organic textures
function pseudoNoise(x: number, y: number): number {
  return (
    Math.sin(x * 1.2 + Math.cos(y * 1.8)) * 0.45 +
    Math.sin(x * 3.7 - Math.sin(y * 2.9)) * 0.25 +
    Math.cos(x * 7.4 + y * 5.8) * 0.15 +
    Math.sin(x * 15.2 - y * 12.1) * 0.05
  );
}

// Deterministic 2D -> 1D hash returning [0, 1]
function hash21(p1: number, p2: number): number {
  const val = Math.sin(p1 * 12.9898 + p2 * 78.233) * 43758.5453123;
  return val - Math.floor(val);
}

// Crater profile function of x = dist / radius
function getCraterInfluence(dist: number, radius: number): { height: number; colorVal: number } {
  const x = dist / radius;
  if (x > 1.25) return { height: 0, colorVal: 0 };
  
  if (x < 0.9) {
    const t = x / 0.9;
    const h = -0.45 * (1 - t * t) + 0.15 * Math.pow(t, 4);
    const c = -35 * (1 - t * t) + 25 * Math.pow(t, 4);
    return { height: h, colorVal: c };
  } else {
    const t = (1.25 - x) / 0.35;
    const h = 0.15 * t * t;
    const c = 35 * t * t;
    return { height: h, colorVal: c };
  }
}

// Organic scattered crater generator for Mercury using cell noise grid
function getMercuryCrater(u: number, v: number): { height: number; colorVal: number } {
  let totalH = 0;
  let totalC = 0;
  
  const Nu = 12; // divisions along longitude
  const Nv = 6;  // divisions along latitude
  
  const cu = Math.floor(u * Nu);
  const cv = Math.floor(v * Nv);
  
  for (let dj = -1; dj <= 1; dj++) {
    const clampedJ = Math.max(0, Math.min(Nv - 1, cv + dj));
    
    for (let di = -1; di <= 1; di++) {
      const wrappedCellI = (cu + di + Nu) % Nu;
      
      const seed = wrappedCellI + clampedJ * 57;
      const h1 = hash21(seed, 12.5);
      const h2 = hash21(seed, 93.1);
      const h3 = hash21(seed, 45.7);
      
      if (h1 > 0.8) continue;
      
      const cx = (wrappedCellI + 0.1 + 0.8 * h2) / Nu;
      const cy = (clampedJ + 0.1 + 0.8 * h3) / Nv;
      
      let du = u - cx;
      if (du > 0.5) du -= 1;
      else if (du < -0.5) du += 1;
      const dv = v - cy;
      
      const dist = Math.sqrt(du * du + dv * dv);
      const radius = 0.012 + 0.026 * h3;
      
      const influence = getCraterInfluence(dist, radius);
      const strength = 0.45 + 0.55 * h1;
      
      totalH += influence.height * strength;
      totalC += influence.colorVal * strength;
    }
  }
  
  return { height: totalH, colorVal: totalC };
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

  // Baked texture buffers stored in refs to avoid CPU re-evaluations
  const bakedColorRef = useRef<Uint8Array | null>(null);
  const bakedHeightRef = useRef<Float32Array | null>(null);
  const bakedPlanetIdRef = useRef<string>('');

  // Track mouse position to update the light source (flashlight effect)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const mx = e.clientX - rect.left - canvas.width / 2;
    const my = e.clientY - rect.top - canvas.height / 2;
    const R = planetId === 'saturn' ? canvas.width / 4.5 : canvas.width / 2.4;
    
    const x = mx / R;
    const y = my / R;
    const distSq = x * x + y * y;
    
    let z = 0.5;
    if (distSq < 1) {
      z = Math.sqrt(1 - distSq);
    }
    
    setLightSource({ x, y, z });
  };

  const handleMouseLeave = () => {
    setLightSource({ x: -0.6, y: -0.6, z: 0.8 });
  };

  // Color generator for each planet based on coordinates (u, v) and time (fallback/dynamic)
  const getPlanetPixel = (
    u: number, 
    v: number, 
    planet: string, 
    time: number,
    nlx: number,
    nly: number
  ): { r: number; g: number; b: number } => {
    switch (planet) {
      case 'sun': {
        const plasma = pseudoNoise(u * 14 + time * 1.5, v * 14 - time * 1.2);
        const cell = pseudoNoise(u * 35, v * 35) * 0.15;
        const temp = plasma + cell;
        return {
          r: 255,
          g: Math.max(0, Math.min(255, 150 + temp * 85)),
          b: Math.max(0, Math.min(255, 10 + temp * 25))
        };
      }
      
      case 'mercury': {
        const baseNoise = pseudoNoise(u * 8, v * 8) * 15;
        const craterData = getMercuryCrater(u, v);
        let grey = 132 + baseNoise + craterData.colorVal;
        const rayNoise = Math.sin(u * 45) * Math.cos(v * 45);
        if (rayNoise > 0.76) {
          grey += 20;
        }
        grey = Math.max(30, Math.min(240, grey));
        return { r: grey, g: grey, b: grey };
      }
      
      case 'venus': {
        const cloudNoise = pseudoNoise(u * 6 - time * 0.15, v * 10);
        const waveNoise = Math.sin(u * 18 - v * 12 + time * 0.3) * 0.1;
        const comb = cloudNoise + waveNoise;
        return {
          r: 228 + comb * 22,
          g: 184 + comb * 20,
          b: 122 + comb * 10
        };
      }
      
      case 'earth': {
        const landNoise = pseudoNoise(u * 14, v * 10);
        const isLand = landNoise > -0.04;
        let r = 12, g = 45, b = 130;
        if (isLand) {
          if (v < 0.16 || v > 0.84) {
            r = 245; g = 245; b = 250;
          } else if ((v > 0.28 && v < 0.38 && landNoise < 0.08) || (v > 0.62 && v < 0.72 && landNoise < 0.08)) {
            r = 188; g = 168; b = 112;
          } else {
            r = 45; g = 118; b = 48;
          }
        } else {
          const depth = landNoise + 0.04;
          if (depth > -0.03) {
            r = 20; g = 90; b = 148;
          }
        }
        return { r, g, b };
      }
      
      case 'mars': {
        const cap = (v < 0.13 || v > 0.87);
        if (cap) return { r: 245, g: 245, b: 248 };
        
        const marsNoise = pseudoNoise(u * 11, v * 9);
        const detail = pseudoNoise(u * 32, v * 32) * 12;
        let r = 190, g = 90, b = 55;
        
        if (marsNoise > 0.06) {
          r = 108 + detail; g = 60 + detail; b = 48 + detail;
        } else {
          r = 190 + detail; g = 90 + detail; b = 55 + detail;
        }
        return { r, g, b };
      }
      
      case 'jupiter': {
        const bandNoise = pseudoNoise(u * 6, v * 20) * 0.3;
        const fineNoise = pseudoNoise(u * 25, v * 40) * 0.08;
        const yCoord = v + bandNoise + fineNoise;
        const bandValue = Math.sin(yCoord * 22 + Math.cos(u * 4) * 0.15);
        
        let r = 210, g = 180, b = 150;
        
        if (v < 0.18 || v > 0.82) {
          const pFade = v < 0.18 ? (0.18 - v) / 0.18 : (v - 0.82) / 0.18;
          r = 125 - pFade * 20; g = 130 - pFade * 15; b = 140 - pFade * 5;
        } else {
          if (bandValue > 0.3) {
            r = 238; g = 228; b = 214;
          } else if (bandValue > -0.1) {
            r = 212; g = 172; b = 132;
          } else if (bandValue > -0.6) {
            r = 168; g = 112; b = 82;
          } else {
            r = 135; g = 78; b = 52;
          }
        }
        
        const spotU = 0.64;
        const spotV = 0.68;
        let du = u - spotU;
        if (du > 0.5) du -= 1;
        else if (du < -0.5) du += 1;
        const dv = v - spotV;
        
        const spotDistSq = (du * du) / 0.0028 + (dv * dv) / 0.0009;
        if (spotDistSq < 1) {
          const fade = 1 - spotDistSq;
          r = r * (1 - fade) + 185 * fade;
          g = g * (1 - fade) + 65 * fade;
          b = b * (1 - fade) + 50 * fade;
          
          const spotSwirl = pseudoNoise(du * 40, dv * 60);
          r += spotSwirl * 15; g += spotSwirl * 10;
        }
        return { r, g, b };
      }
      
      case 'saturn': {
        const bandNoise = pseudoNoise(u * 5, v * 15) * 0.15;
        const bandValue = Math.sin((v + bandNoise) * 18);
        
        let r = 224, g = 200, b = 158;
        
        if (v < 0.16) {
          const pFade = (0.16 - v) / 0.16;
          r = r * (1 - pFade) + 115 * pFade; g = g * (1 - pFade) + 130 * pFade; b = b * (1 - pFade) + 120 * pFade;
        } else if (v > 0.84) {
          const pFade = (v - 0.84) / 0.16;
          r = r * (1 - pFade) + 140 * pFade; g = g * (1 - pFade) + 135 * pFade; b = b * (1 - pFade) + 130 * pFade;
        } else {
          if (bandValue > 0.4) {
            r = 238; g = 216; b = 178;
          } else if (bandValue < -0.3) {
            r = 205; g = 178; b = 136;
          }
        }
        return { r, g, b };
      }
      
      case 'uranus': {
        const detail = pseudoNoise(u * 5, v * 8) * 5;
        const bands = Math.sin(v * 6) * 4;
        return {
          r: 168 + detail + bands,
          g: 216 + detail,
          b: 220 + detail - bands
        };
      }
      
      case 'neptune': {
        const bands = Math.sin(v * 8) * 0.1 + pseudoNoise(u * 6, v * 10) * 0.05;
        let r = 35 + bands * 15;
        let g = 75 + bands * 25;
        let b = 200 + bands * 40;
        
        const spotU = 0.35;
        const spotV = 0.62;
        let du = u - spotU;
        if (du > 0.5) du -= 1;
        else if (du < -0.5) du += 1;
        const dv = v - spotV;
        
        const spotDistSq = (du * du) / 0.0028 + (dv * dv) / 0.001;
        if (spotDistSq < 1) {
          const fade = 1 - spotDistSq;
          r = r * (1 - fade) + 10 * fade;
          g = g * (1 - fade) + 25 * fade;
          b = b * (1 - fade) + 110 * fade;
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
    
    const R = planetId === 'saturn' ? size / 4.5 : size / 2.4;
    const cx = size / 2;
    const cy = size / 2;
    
    const minBoundX = Math.max(0, Math.floor(cx - R));
    const maxBoundX = Math.min(size, Math.ceil(cx + R));
    const minBoundY = Math.max(0, Math.floor(cy - R));
    const maxBoundY = Math.min(size, Math.ceil(cy + R));
    
    const lx = lightSource.x;
    const ly = lightSource.y;
    const lz = lightSource.z;
    const lLength = Math.sqrt(lx*lx + ly*ly + lz*lz) || 1;
    const nlx = lx / lLength;
    const nly = ly / lLength;
    const nlz = lz / lLength;

    // --- BAKING STEP ---
    // Bake static planet texture layers into memory to guarantee smooth 60fps performance
    if (bakedPlanetIdRef.current !== planetId) {
      const colorBuf = new Uint8Array(texWidth * texHeight * 3);
      const heightBuf = new Float32Array(texWidth * texHeight);
      
      for (let ty = 0; ty < texHeight; ty++) {
        const v = ty / (texHeight - 1);
        for (let tx = 0; tx < texWidth; tx++) {
          const u = tx / (texWidth - 1);
          
          let r = 120, g = 120, b = 120, h = 0;
          
          if (planetId === 'mercury') {
            const baseNoise = pseudoNoise(u * 8, v * 8) * 15;
            const craterData = getMercuryCrater(u, v);
            let grey = 132 + baseNoise + craterData.colorVal;
            const rayNoise = Math.sin(u * 45) * Math.cos(v * 45);
            if (rayNoise > 0.76) grey += 20;
            grey = Math.max(30, Math.min(240, grey));
            r = g = b = grey;
            h = craterData.height + pseudoNoise(u * 15, v * 15) * 0.05;
          } else if (planetId === 'earth') {
            const landNoise = pseudoNoise(u * 14, v * 10);
            const isLand = landNoise > -0.04;
            if (isLand) {
              if (v < 0.16 || v > 0.84) {
                r = 245; g = 245; b = 250;
              } else if ((v > 0.28 && v < 0.38 && landNoise < 0.08) || (v > 0.62 && v < 0.72 && landNoise < 0.08)) {
                r = 188; g = 168; b = 112;
              } else {
                r = 45; g = 118; b = 48;
              }
              h = landNoise + pseudoNoise(u * 38, v * 38) * 0.12;
            } else {
              r = 12; g = 45; b = 130;
              const depth = landNoise + 0.04;
              if (depth > -0.03) r = 20; g = 90; b = 148;
              h = 0;
            }
          } else if (planetId === 'mars') {
            const marsNoise = pseudoNoise(u * 11, v * 9);
            const detail = pseudoNoise(u * 32, v * 32) * 12;
            if (marsNoise > 0.06) {
              r = 108 + detail; g = 60 + detail; b = 48 + detail;
            } else {
              r = 190 + detail; g = 90 + detail; b = 55 + detail;
            }
            h = marsNoise + pseudoNoise(u * 32, v * 32) * 0.08;
            
            const du = u - 0.4;
            const dv = v - 0.5;
            if (Math.abs(du) < 0.15 && Math.abs(dv) < 0.035) {
              const canyonDepth = (1 - Math.abs(du) / 0.15) * (1 - Math.abs(dv) / 0.035);
              h -= canyonDepth * 0.32;
              r -= canyonDepth * 45;
              g -= canyonDepth * 25;
              b -= canyonDepth * 15;
            }
          } else {
            // Static lookup base
            const c = getPlanetPixel(u, v, planetId, 0, -0.6, -0.6);
            r = c.r; g = c.g; b = c.b;
            h = 0;
          }
          
          const idx = (ty * texWidth + tx) * 3;
          colorBuf[idx] = Math.max(0, Math.min(255, r));
          colorBuf[idx + 1] = Math.max(0, Math.min(255, g));
          colorBuf[idx + 2] = Math.max(0, Math.min(255, b));
          
          heightBuf[ty * texWidth + tx] = h;
        }
      }
      
      bakedColorRef.current = colorBuf;
      bakedHeightRef.current = heightBuf;
      bakedPlanetIdRef.current = planetId;
    }

    const lookupHeight = (u: number, v: number): number => {
      if (!bakedHeightRef.current) return 0;
      const uu = ((u % 1) + 1) % 1;
      const vv = Math.max(0, Math.min(1, v));
      const tx = Math.floor(uu * (texWidth - 1));
      const ty = Math.floor(vv * (texHeight - 1));
      return bakedHeightRef.current[ty * texWidth + tx];
    };
    
    const lookupColor = (u: number, v: number): { r: number; g: number; b: number } => {
      if (!bakedColorRef.current) return { r: 120, g: 120, b: 120 };
      const uu = ((u % 1) + 1) % 1;
      const vv = Math.max(0, Math.min(1, v));
      const tx = Math.floor(uu * (texWidth - 1));
      const ty = Math.floor(vv * (texHeight - 1));
      const idx = (ty * texWidth + tx) * 3;
      return {
        r: bakedColorRef.current[idx],
        g: bakedColorRef.current[idx + 1],
        b: bakedColorRef.current[idx + 2]
      };
    };
    
    const renderFrame = () => {
      ctx.clearRect(0, 0, size, size);
      
      // 1. Draw Back half of Saturn's Rings
      if (planetId === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((26 * Math.PI) / 180);
        
        ctx.beginPath();
        ctx.rect(-size, -size, size * 2, size);
        ctx.clip();
        
        drawRings(ctx, R, true, nlx, nly);
        ctx.restore();
      }

      // 2. Render Planet Sphere (Ray-cast pixels)
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
            
            let nx = dx / R;
            let ny = dy / R;
            let nz = dz / R;
            
            const lat = Math.asin(ny);
            const lon = Math.atan2(nz, nx) + timeRef.current;
            
            const u = (lon + Math.PI) / (Math.PI * 2);
            const v = (lat + Math.PI / 2) / Math.PI;
            
            // Fast O(1) Bump Mapping
            const hasBump = planetId === 'mercury' || planetId === 'mars' || planetId === 'earth';
            if (hasBump) {
              const eps = 0.005;
              const h = lookupHeight(u, v);
              const hu = lookupHeight(u + eps, v);
              const hv = lookupHeight(u, v + eps);
              
              const dh_du = (hu - h) / eps;
              const dh_dv = (hv - h) / eps;
              
              const bumpStrength = planetId === 'earth' ? 0.07 : 0.14;
              
              nx = nx - dh_du * bumpStrength;
              ny = ny - dh_dv * bumpStrength;
              
              const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
              nx /= len;
              ny /= len;
              nz /= len;
            }
            
            // Texture lookup & Dynamic overlay layers
            let baseColor = lookupColor(u, v);
            
            if (planetId === 'earth') {
              // Dynamic Earth clouds and shadow
              let cloudShadow = 1.0;
              const shadowU = u - nlx * 0.015;
              const shadowV = v - nly * 0.01;
              const shadowCloudNoise = pseudoNoise(shadowU * 22 + timeRef.current * 0.4, shadowV * 13);
              if (shadowCloudNoise > 0.08) {
                const shadowIntensity = Math.min(0.35, (shadowCloudNoise - 0.08) * 2.5);
                cloudShadow = 1.0 - shadowIntensity;
              }
              
              let r = baseColor.r * cloudShadow;
              let g = baseColor.g * cloudShadow;
              let b = baseColor.b * cloudShadow;
              
              const cloudNoise = pseudoNoise(u * 22 + timeRef.current * 0.4, v * 13);
              if (cloudNoise > 0.08) {
                const cloudIntensity = Math.min(0.9, (cloudNoise - 0.08) * 3);
                r = r * (1 - cloudIntensity) + 250 * cloudIntensity;
                g = g * (1 - cloudIntensity) + 250 * cloudIntensity;
                b = b * (1 - cloudIntensity) + 250 * cloudIntensity;
              }
              baseColor = { r, g, b };
            } else if (planetId === 'mars') {
              // Dynamic Mars dust storm layer
              const storm = pseudoNoise(u * 8 - timeRef.current * 0.05, v * 8) * 8;
              baseColor = {
                r: Math.max(0, Math.min(255, baseColor.r + storm)),
                g: Math.max(0, Math.min(255, baseColor.g)),
                b: Math.max(0, Math.min(255, baseColor.b))
              };
            } else if (planetId === 'sun') {
              // Full dynamic convective cell plasma (Sun)
              const plasma = pseudoNoise(u * 14 + timeRef.current * 1.5, v * 14 - timeRef.current * 1.2);
              const cell = pseudoNoise(u * 35, v * 35) * 0.15;
              const temp = plasma + cell;
              baseColor = {
                r: 255,
                g: Math.max(0, Math.min(255, 150 + temp * 85)),
                b: Math.max(0, Math.min(255, 10 + temp * 25))
              };
            } else if (planetId === 'neptune') {
              // Dynamic methane cloud bands
              const cloud = pseudoNoise(u * 16 - timeRef.current * 0.1, v * 14);
              if (cloud > 0.14) {
                const intensity = Math.min(0.65, (cloud - 0.14) * 4);
                baseColor = {
                  r: baseColor.r * (1 - intensity) + 220 * intensity,
                  g: baseColor.g * (1 - intensity) + 240 * intensity,
                  b: baseColor.b * (1 - intensity) + 255 * intensity
                };
              }
            } else if (planetId === 'venus') {
              // Dynamic runaway sulfur clouds
              const cloudNoise = pseudoNoise(u * 6 - timeRef.current * 0.15, v * 10);
              const waveNoise = Math.sin(u * 18 - v * 12 + timeRef.current * 0.3) * 0.1;
              const comb = cloudNoise + waveNoise;
              baseColor = {
                r: Math.max(0, Math.min(255, 228 + comb * 22)),
                g: Math.max(0, Math.min(255, 184 + comb * 20)),
                b: Math.max(0, Math.min(255, 122 + comb * 10))
              };
            }
            
            // Compute Shading (Lambertian diffuse)
            let shading = nx * nlx + ny * nly + nz * nlz;
            const ambient = isSun ? 1.0 : 0.08;
            shading = Math.max(ambient, shading);
            
            let spec = 0;
            if (!isSun) {
              const specPower = planetId === 'earth' ? 24 : 10;
              const specIntensity = planetId === 'earth' ? 0.38 : 0.06;
              const rx = 2 * shading * nx - nlx;
              const ry = 2 * shading * ny - nly;
              const rz = 2 * shading * nz - nlz;
              const rView = Math.max(0, rz);
              spec = Math.pow(rView, specPower) * specIntensity * 255;
            }
            
            // Atmospheric Limb Darkening
            let limbDarkening = 1.0;
            if (isSun) {
              limbDarkening = 0.35 + 0.65 * Math.pow(nz, 0.85);
            } else if (planetId === 'jupiter' || planetId === 'saturn') {
              limbDarkening = 0.55 + 0.45 * Math.pow(nz, 0.45);
            } else if (planetId === 'venus') {
              limbDarkening = 0.48 + 0.52 * Math.pow(nz, 0.55);
            } else if (planetId === 'neptune' || planetId === 'uranus') {
              limbDarkening = 0.4 + 0.6 * Math.pow(nz, 0.65);
            } else {
              limbDarkening = 0.82 + 0.18 * nz;
            }
            
            // Internal Limb Glow (atmospheric scattering)
            let glowR = 0, glowG = 0, glowB = 0, glowIntensity = 0;
            if (!isSun && planetId !== 'mercury') {
              const edge = Math.pow(1 - nz, 4.2);
              if (planetId === 'earth') {
                glowR = 140; glowG = 180; glowB = 255; glowIntensity = edge * 0.75;
              } else if (planetId === 'venus') {
                glowR = 245; glowG = 210; glowB = 150; glowIntensity = edge * 0.6;
              } else if (planetId === 'mars') {
                glowR = 240; glowG = 115; glowB = 95; glowIntensity = edge * 0.38;
              } else if (planetId === 'jupiter') {
                glowR = 230; glowG = 180; glowB = 140; glowIntensity = edge * 0.32;
              } else if (planetId === 'saturn') {
                glowR = 242; glowG = 220; glowB = 180; glowIntensity = edge * 0.35;
              } else if (planetId === 'neptune' || planetId === 'uranus') {
                glowR = 100; glowG = 225; glowB = 255; glowIntensity = edge * 0.75;
              }
            }
            
            const idx = (y * size + x) * 4;
            
            let pixelR = baseColor.r * shading + spec;
            let pixelG = baseColor.g * shading + spec;
            let pixelB = baseColor.b * shading + spec;
            
            pixelR *= limbDarkening;
            pixelG *= limbDarkening;
            pixelB *= limbDarkening;
            
            if (glowIntensity > 0) {
              const finalGlow = glowIntensity * Math.max(0.18, shading);
              pixelR = pixelR * (1 - finalGlow) + glowR * finalGlow;
              pixelG = pixelG * (1 - finalGlow) + glowG * finalGlow;
              pixelB = pixelB * (1 - finalGlow) + glowB * finalGlow;
            }
            
            data[idx] = Math.min(255, pixelR);
            data[idx + 1] = Math.min(255, pixelG);
            data[idx + 2] = Math.min(255, pixelB);
            data[idx + 3] = 255;
          }
        }
      }
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(img, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
      
      // 3. Draw Front half of Saturn's Rings
      if (planetId === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((26 * Math.PI) / 180);
        
        ctx.beginPath();
        ctx.rect(-size, 0, size * 2, size);
        ctx.clip();
        
        drawRings(ctx, R, false, nlx, nly);
        ctx.restore();
      }

      // 4. Draw Outer atmosphere glow halo
      if (planetId !== 'sun' && planetId !== 'mercury') {
        ctx.save();
        const glowRad = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.08);
        
        let glowColor = 'rgba(99, 102, 241, 0.38)';
        if (planetId === 'venus') glowColor = 'rgba(234, 179, 8, 0.28)';
        else if (planetId === 'mars') glowColor = 'rgba(239, 68, 68, 0.18)';
        else if (planetId === 'neptune' || planetId === 'uranus') glowColor = 'rgba(6, 182, 212, 0.35)';
        else if (planetId === 'jupiter') glowColor = 'rgba(194, 120, 3, 0.15)';
        else if (planetId === 'saturn') glowColor = 'rgba(215, 185, 135, 0.16)';
        
        glowRad.addColorStop(0, glowColor);
        glowRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowRad;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (isPlaying) {
        timeRef.current += 0.0035 * rotationSpeed;
      }
      
      animationFrameId.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [planetId, size, isPlaying, rotationSpeed, lightSource]);

  const drawRings = (
    ctx: CanvasRenderingContext2D, 
    R: number, 
    drawShadow = false, 
    nlx = 0, 
    nly = 0
  ) => {
    const innerR = R * 1.35;
    const outerR = R * 2.15;
    const isDark = document.documentElement.classList.contains('dark');
    
    // Cassini division / Outer Ring A
    ctx.strokeStyle = isDark ? 'rgba(215, 185, 135, 0.65)' : 'rgba(180, 155, 110, 0.6)';
    ctx.lineWidth = R * 0.15;
    ctx.beginPath();
    ctx.ellipse(0, 0, outerR - R * 0.1, (outerR - R * 0.1) * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Middle Ring B
    ctx.strokeStyle = isDark ? 'rgba(242, 222, 179, 0.85)' : 'rgba(212, 192, 149, 0.8)';
    ctx.lineWidth = R * 0.35;
    ctx.beginPath();
    ctx.ellipse(0, 0, innerR + R * 0.28, (innerR + R * 0.28) * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Ring C
    ctx.strokeStyle = isDark ? 'rgba(165, 135, 95, 0.3)' : 'rgba(135, 110, 75, 0.3)';
    ctx.lineWidth = R * 0.15;
    ctx.beginPath();
    ctx.ellipse(0, 0, innerR, innerR * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (drawShadow) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      
      const angle = (26 * Math.PI) / 180;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      const sx = -nlx * R * 0.95;
      const sy = -nly * R * 0.95;
      
      const rx = sx * cosA + sy * sinA;
      const ry = -sx * sinA + sy * cosA;
      
      const shadowGrad = ctx.createRadialGradient(
        rx, ry, R * 0.4,
        rx, ry, R * 1.25
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
      shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.88)');
      shadowGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, R * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  return (
    <div className="relative flex items-center justify-center select-none">
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
