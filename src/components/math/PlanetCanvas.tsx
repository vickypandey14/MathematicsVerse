'use client';

import { useEffect, useRef, useState } from 'react';

interface PlanetCanvasProps {
  planetId: string;
  size?: number;
  isPlaying?: boolean;
  rotationSpeed?: number;
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

// Height map generator for rocky planets (for bump mapping)
function getPlanetHeight(u: number, v: number, planetId: string): number {
  if (planetId === 'mercury') {
    const craterNoise = pseudoNoise(u * 22, v * 22);
    const detail = pseudoNoise(u * 45, v * 45) * 0.05;
    let h = craterNoise + detail;
    
    // Impact crater bowls
    const bowl = Math.sin(u * 15.3) * Math.cos(v * 15.3);
    if (bowl > 0.45) {
      h -= 0.16; // crater dip
    }
    return h;
  }
  
  if (planetId === 'mars') {
    const marsNoise = pseudoNoise(u * 11, v * 9);
    const detail = pseudoNoise(u * 32, v * 32) * 0.08;
    return marsNoise + detail;
  }
  
  if (planetId === 'earth') {
    const landNoise = pseudoNoise(u * 14, v * 10);
    const isLand = landNoise > -0.04;
    if (isLand) {
      const mountains = pseudoNoise(u * 38, v * 38) * 0.12;
      return landNoise + mountains;
    }
    return 0; // Oceans are smooth
  }
  
  return 0;
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

  // Color generator for each planet based on coordinates (u, v) and time
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
        const craterNoise = pseudoNoise(u * 22, v * 22);
        const detail = pseudoNoise(u * 45, v * 45) * 0.08;
        let grey = 130 + craterNoise * 35 + detail * 255;
        
        // Impact ray ejecta systems
        const rayNoise = Math.sin(u * 42) * Math.cos(v * 42);
        if (rayNoise > 0.74) {
          grey += 25; // Bright ray marks
        }
        
        if (Math.sin(u * 15.3) * Math.cos(v * 15.3) > 0.45) {
          grey -= 25; // Dark rim
        }
        
        return { r: grey, g: grey, b: grey };
      }
      
      case 'venus': {
        // Runaway sulfur cloud layers
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
        
        let r = 12, g = 45, b = 130; // Deep Ocean
        
        if (isLand) {
          if (v < 0.16 || v > 0.84) {
            // Polar Ice Caps
            r = 245; g = 245; b = 250;
          } else if ((v > 0.28 && v < 0.38 && landNoise < 0.08) || (v > 0.62 && v < 0.72 && landNoise < 0.08)) {
            // Desert sands
            r = 188; g = 168; b = 112;
          } else {
            // Foliage & vegetation
            r = 45; g = 118; b = 48;
          }
        } else {
          // Coastline shallow shelves
          const depth = landNoise + 0.04;
          if (depth > -0.03) {
            r = 20; g = 90; b = 148;
          }
        }
        
        // Cloud shadow on Earth (offsets texture lookup relative to light vector)
        let cloudShadow = 1.0;
        const shadowU = u - nlx * 0.015;
        const shadowV = v - nly * 0.01;
        const shadowCloudNoise = pseudoNoise(shadowU * 22 + time * 0.4, shadowV * 13);
        if (shadowCloudNoise > 0.08) {
          const shadowIntensity = Math.min(0.35, (shadowCloudNoise - 0.08) * 2.5);
          cloudShadow = 1.0 - shadowIntensity;
        }
        
        // Apply shadow to surface
        r *= cloudShadow;
        g *= cloudShadow;
        b *= cloudShadow;
        
        // Earth Atmosphere Clouds (rendered on top of surface)
        const cloudNoise = pseudoNoise(u * 22 + time * 0.4, v * 13);
        if (cloudNoise > 0.08) {
          const cloudIntensity = Math.min(0.9, (cloudNoise - 0.08) * 3);
          r = r * (1 - cloudIntensity) + 250 * cloudIntensity;
          g = g * (1 - cloudIntensity) + 250 * cloudIntensity;
          b = b * (1 - cloudIntensity) + 250 * cloudIntensity;
        }
        
        return { r, g, b };
      }
      
      case 'mars': {
        const cap = (v < 0.13 || v > 0.87);
        if (cap) {
          return { r: 245, g: 245, b: 248 }; // White polar cap
        }
        
        const marsNoise = pseudoNoise(u * 11, v * 9);
        const detail = pseudoNoise(u * 32, v * 32) * 12;
        const storm = pseudoNoise(u * 8 - time * 0.05, v * 8) * 8; // Dusty atmosphere swirls
        
        if (marsNoise > 0.06) {
          // Dark volcanic basins (Syrtis Major)
          return { r: 108 + detail + storm, g: 60 + detail, b: 48 + detail };
        } else {
          // Iron oxide desert dunes
          return { r: 190 + detail + storm, g: 90 + detail, b: 55 + detail };
        }
      }
      
      case 'jupiter': {
        const bandNoise = pseudoNoise(u * 6, v * 20) * 0.3;
        const fineNoise = pseudoNoise(u * 25, v * 40) * 0.08;
        const yCoord = v + bandNoise + fineNoise;
        
        // Multi-layered band structure
        const bandValue = Math.sin(yCoord * 22 + Math.cos(u * 4) * 0.15);
        
        let r = 210, g = 180, b = 150;
        
        if (v < 0.18 || v > 0.82) {
          // Polar regions (slate grey)
          const pFade = v < 0.18 ? (0.18 - v) / 0.18 : (v - 0.82) / 0.18;
          r = 125 - pFade * 20;
          g = 130 - pFade * 15;
          b = 140 - pFade * 5;
        } else {
          if (bandValue > 0.3) {
            // White Zone (ammonia clouds)
            r = 238; g = 228; b = 214;
          } else if (bandValue > -0.1) {
            // Light Orange Zone
            r = 212; g = 172; b = 132;
          } else if (bandValue > -0.6) {
            // Reddish Brown Belt (ammonium hydrosulfide)
            r = 168; g = 112; b = 82;
          } else {
            // Dark Brown/Red Belt
            r = 135; g = 78; b = 52;
          }
        }
        
        // Great Red Spot (V is around 0.68, U is around 0.64)
        const spotU = 0.64;
        const spotV = 0.68;
        let du = u - spotU;
        if (du > 0.5) du -= 1;
        else if (du < -0.5) du += 1;
        const dv = v - spotV;
        
        // Elliptical spot calculation
        const spotDistSq = (du * du) / 0.0028 + (dv * dv) / 0.0009;
        if (spotDistSq < 1) {
          const fade = 1 - spotDistSq;
          // Red spot color blends in
          r = r * (1 - fade) + 185 * fade;
          g = g * (1 - fade) + 65 * fade;
          b = b * (1 - fade) + 50 * fade;
          
          // Swirl details inside the spot
          const spotSwirl = pseudoNoise(du * 40, dv * 60);
          r += spotSwirl * 15;
          g += spotSwirl * 10;
        }
        
        return { r, g, b };
      }
      
      case 'saturn': {
        const bandNoise = pseudoNoise(u * 5, v * 15) * 0.15;
        const bandValue = Math.sin((v + bandNoise) * 18);
        
        let r = 224, g = 200, b = 158; // Golden butterscotch base
        
        if (v < 0.16) {
          // North Polar Hexagon Region (greenish-blue/grey)
          const pFade = (0.16 - v) / 0.16;
          r = r * (1 - pFade) + 115 * pFade;
          g = g * (1 - pFade) + 130 * pFade;
          b = b * (1 - pFade) + 120 * pFade;
        } else if (v > 0.84) {
          // South Pole (cool grey)
          const pFade = (v - 0.84) / 0.16;
          r = r * (1 - pFade) + 140 * pFade;
          g = g * (1 - pFade) + 135 * pFade;
          b = b * (1 - pFade) + 130 * pFade;
        } else {
          if (bandValue > 0.4) {
            // Light golden zone
            r = 238; g = 216; b = 178;
          } else if (bandValue < -0.3) {
            // Darker tan belt
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
        
        // Bright white methane cloud bands (Cirrus clouds)
        const cloud = pseudoNoise(u * 16 - time * 0.1, v * 14);
        if (cloud > 0.14) {
          const intensity = Math.min(0.65, (cloud - 0.14) * 4);
          r = r * (1 - intensity) + 220 * intensity;
          g = g * (1 - intensity) + 240 * intensity;
          b = b * (1 - intensity) + 255 * intensity;
        }
        
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
    
    // Scale Saturn down so its rings fit perfectly within the size bounds
    const R = planetId === 'saturn' ? size / 4.5 : size / 2.4;
    const cx = size / 2;
    const cy = size / 2;
    
    // Bounding box of sphere
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
      ctx.clearRect(0, 0, size, size);
      
      // 1. Draw Back half of Saturn's Rings
      if (planetId === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((26 * Math.PI) / 180); // Tilt rings 26 deg
        
        // Clip to upper half to draw back rings (behind the sphere)
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
            
            // Sphere surface normal vector (perfect sphere)
            let nx = dx / R;
            let ny = dy / R;
            let nz = dz / R;
            
            // Translate normals into spherical (lon/lat) coords mapped to texture (u,v)
            const lat = Math.asin(ny);
            const lon = Math.atan2(nz, nx) + timeRef.current;
            
            const u = (lon + Math.PI) / (Math.PI * 2);
            const v = (lat + Math.PI / 2) / Math.PI;
            
            // Procedural Bump Mapping for rocky planets
            const hasBump = planetId === 'mercury' || planetId === 'mars' || planetId === 'earth';
            if (hasBump) {
              const eps = 0.005;
              const h = getPlanetHeight(u, v, planetId);
              const hu = getPlanetHeight(u + eps, v, planetId);
              const hv = getPlanetHeight(u, v + eps, planetId);
              
              // Slopes along horizontal and vertical texture planes
              const dh_du = (hu - h) / eps;
              const dh_dv = (hv - h) / eps;
              
              const bumpStrength = planetId === 'earth' ? 0.07 : 0.14;
              
              // Perturb the normals
              nx = nx - dh_du * bumpStrength;
              ny = ny - dh_dv * bumpStrength;
              
              // Normalize perturbed normal
              const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
              nx /= len;
              ny /= len;
              nz /= len;
            }
            
            // Fetch color (passing nlx/nly for earth cloud shadows)
            const baseColor = getPlanetPixel(u, v, planetId, timeRef.current, nlx, nly);
            
            // Compute Shading (Lambertian diffuse)
            let shading = nx * nlx + ny * nly + nz * nlz;
            
            // Ambient factor (Sun does not have shading, it shines)
            const ambient = isSun ? 1.0 : 0.08;
            shading = Math.max(ambient, shading);
            
            // Add a specular highlight (shininess) on liquid oceans or atmospheres
            let spec = 0;
            if (!isSun) {
              const specPower = planetId === 'earth' ? 24 : 10;
              const specIntensity = planetId === 'earth' ? 0.38 : 0.06;
              
              // Reflection vector R = 2*(N.L)*N - L
              const rx = 2 * shading * nx - nlx;
              const ry = 2 * shading * ny - nly;
              const rz = 2 * shading * nz - nlz;
              
              // Dot with View vector (0, 0, 1)
              const rView = Math.max(0, rz);
              spec = Math.pow(rView, specPower) * specIntensity * 255;
            }
            
            // Atmospheric Limb Darkening (making the edges look realistically volumetric)
            let limbDarkening = 1.0;
            if (isSun) {
              limbDarkening = 0.35 + 0.65 * Math.pow(nz, 0.85); // Blazing solar disk
            } else if (planetId === 'jupiter' || planetId === 'saturn') {
              limbDarkening = 0.55 + 0.45 * Math.pow(nz, 0.45); // Thick atmospheres
            } else if (planetId === 'venus') {
              limbDarkening = 0.48 + 0.52 * Math.pow(nz, 0.55);
            } else if (planetId === 'neptune' || planetId === 'uranus') {
              limbDarkening = 0.4 + 0.6 * Math.pow(nz, 0.65);
            } else {
              limbDarkening = 0.82 + 0.18 * nz; // Rocky planets
            }
            
            // Internal Limb Glow (atmospheric scattering color blend right at the edge)
            let glowR = 0, glowG = 0, glowB = 0, glowIntensity = 0;
            if (!isSun && planetId !== 'mercury') {
              const edge = Math.pow(1 - nz, 4.2);
              if (planetId === 'earth') {
                glowR = 140; glowG = 180; glowB = 255;
                glowIntensity = edge * 0.75;
              } else if (planetId === 'venus') {
                glowR = 245; glowG = 210; glowB = 150;
                glowIntensity = edge * 0.6;
              } else if (planetId === 'mars') {
                glowR = 240; glowG = 115; glowB = 95;
                glowIntensity = edge * 0.38;
              } else if (planetId === 'jupiter') {
                glowR = 230; glowG = 180; glowB = 140;
                glowIntensity = edge * 0.32;
              } else if (planetId === 'saturn') {
                glowR = 242; glowG = 220; glowB = 180;
                glowIntensity = edge * 0.35;
              } else if (planetId === 'neptune' || planetId === 'uranus') {
                glowR = 100; glowG = 225; glowB = 255;
                glowIntensity = edge * 0.75;
              }
            }
            
            const idx = (y * size + x) * 4;
            
            // Apply Base Color scaling with shading and specular
            let pixelR = baseColor.r * shading + spec;
            let pixelG = baseColor.g * shading + spec;
            let pixelB = baseColor.b * shading + spec;
            
            // Apply volumetric limb darkening
            pixelR *= limbDarkening;
            pixelG *= limbDarkening;
            pixelB *= limbDarkening;
            
            // Blend light-direction-dependent atmospheric limb glow
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
      
      // Temporary canvas to write imageData efficiently
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(img, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
      
      // 3. Draw Front half of Saturn's Rings (drawn AFTER sphere to layer correctly)
      if (planetId === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((26 * Math.PI) / 180);
        
        // Clip to lower half to draw front rings (in front of planet)
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
        
        let glowColor = 'rgba(99, 102, 241, 0.38)'; // Light blue for Earth
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

      // Update rotation time if playing
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

  // Helper to draw Saturn's rings
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
    
    // Draw rings (concentric bands)
    
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

    // Apply planet shadow onto the rings
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
