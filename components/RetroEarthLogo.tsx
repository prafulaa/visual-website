import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface RetroEarthLogoProps {
  type?: '2d' | '3d';
  size?: number;
  className?: string;
  pixelated?: boolean;
  animated?: boolean;
  interactive?: boolean;
}

// SVG version of the retro Earth logo
const RetroEarthLogoSVG: React.FC<{ 
  size?: number; 
  className?: string; 
  pixelated?: boolean; 
  animated?: boolean;
  interactive?: boolean;
}> = React.memo(({ 
  size = 80, 
  className = '',
  pixelated = true,
  animated = true,
  interactive = true
}) => {
  // Define the retro color palette - memoized to prevent recreation
  const colors = useMemo(() => ({
    background: '#121440',
    land: '#1aaa55',
    landHighlight: '#2dfc8a',
    landShadow: '#106e38',
    ocean: '#0051cd',
    oceanHighlight: '#3386ff',
    oceanShadow: '#00348a',
    clouds: '#ffffff',
    grid: '#4646ff',
    outline: '#ffffff'
  }), []);
  
  // Define animation class if animated
  const animationClass = useMemo(() => 
    animated ? 'animate-pulse-slow hover:animate-spin-slow' : '',
  [animated]);
  
  // Add pixelated effect if desired
  const pixelFilter = useMemo(() => 
    pixelated ? 'image-rendering: pixelated; filter: contrast(1.1);' : '',
  [pixelated]);
  
  // State for mouse position
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Throttle mouse movement to reduce updates (every 16ms ≈ 60fps)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!logoRef.current) return;
    
    // Get logo container bounds
    const rect = logoRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the logo (-1 to 1)
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    requestAnimationFrame(() => {
      setMousePosition({ x, y });
    });
  }, []);
  
  // Track mouse position for interactive effects
  useEffect(() => {
    if (!interactive) return;
    
    // Listen for mouse movement when hovering over the logo
    const logoElement = logoRef.current;
    if (logoElement) {
      logoElement.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    return () => {
      if (logoElement) {
        logoElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [interactive, handleMouseMove]);
  
  // Calculate movement offsets for interactive elements - memoized
  const { gridOffset, continentOffset, highlightOffset } = useMemo(() => {
    if (!interactive) {
      return {
        gridOffset: { x: 0, y: 0 },
        continentOffset: { x: 0, y: 0 },
        highlightOffset: { x: 0, y: 0 }
      };
    }
    
    return {
      gridOffset: {
        x: mousePosition.x * 5,
        y: mousePosition.y * 5
      },
      continentOffset: {
        x: mousePosition.x * -3,
        y: mousePosition.y * -3
      },
      highlightOffset: {
        x: mousePosition.x * 8,
        y: mousePosition.y * 8
      }
    };
  }, [interactive, mousePosition.x, mousePosition.y]);
  
  // Pre-generate scanlines for better performance
  const scanlines = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => (
      <line 
        key={`scanline-${i}`} 
        x1="30" 
        y1={40 + i * 6} 
        x2="170" 
        y2={40 + i * 6} 
        stroke={colors.outline} 
        strokeWidth="1" 
      />
    )),
  [colors.outline]);
  
  return (
    <div 
      ref={logoRef}
      className={`relative inline-block ${className} ${interactive ? '' : animationClass}`} 
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ [pixelFilter]: '' }}
      >
        {/* Background Space/Grid */}
        <circle cx="100" cy="100" r="95" fill={colors.background} />
        
        {/* Grid Lines (retro arcade style) - moves with mouse */}
        <g style={{ transform: interactive ? `translate(${gridOffset.x}px, ${gridOffset.y}px)` : 'none' }}>
          <path d="M20,100 L180,100" stroke={colors.grid} strokeWidth="2" strokeOpacity="0.3" />
          <path d="M100,20 L100,180" stroke={colors.grid} strokeWidth="2" strokeOpacity="0.3" />
          <circle cx="100" cy="100" r="60" stroke={colors.grid} strokeWidth="2" strokeOpacity="0.3" fill="none" />
          <circle cx="100" cy="100" r="80" stroke={colors.grid} strokeWidth="2" strokeOpacity="0.3" fill="none" />
        </g>
        
        {/* Earth Base (Ocean) */}
        <circle cx="100" cy="100" r="70" fill={colors.ocean} />
        
        {/* Retro Earth Continents - move slightly opposite to mouse */}
        <g style={{ transform: interactive ? `translate(${continentOffset.x}px, ${continentOffset.y}px)` : 'none' }}>
          {/* North America */}
          <path d="M40,70 L70,60 L80,70 L90,60 L100,65 L105,80 L95,95 L80,100 L60,90 L45,80 Z" fill={colors.land} />
          
          {/* South America */}
          <path d="M80,100 L90,110 L85,125 L75,135 L65,130 L60,110 L70,105 Z" fill={colors.land} />
          
          {/* Africa & Europe */}
          <path d="M95,65 L115,60 L130,70 L140,90 L135,110 L120,125 L110,120 L100,110 L95,90 Z" fill={colors.land} />
          
          {/* Asia */}
          <path d="M130,65 L150,55 L165,65 L160,85 L155,100 L135,110 L130,100 L135,80 Z" fill={colors.land} />
          
          {/* Australia */}
          <path d="M150,120 L165,115 L170,130 L160,140 L145,130 Z" fill={colors.land} />
        </g>
        
        {/* Retro Grid Overlay (scanlines effect) */}
        <g opacity="0.1">
          {scanlines}
        </g>
        
        {/* Highlights & Shadows - move more with mouse */}
        <circle 
          cx={80 + (interactive ? highlightOffset.x : 0)} 
          cy={80 + (interactive ? highlightOffset.y : 0)} 
          r="55" 
          fill="url(#retro-earth-highlight)" 
          fillOpacity="0.2" 
        />
        
        {/* Pixel Reflection (for extra retro look) - move with mouse */}
        <rect 
          x={85 + (interactive ? highlightOffset.x * 0.7 : 0)} 
          y={65 + (interactive ? highlightOffset.y * 0.7 : 0)} 
          width="6" 
          height="6" 
          fill="white" 
          fillOpacity="0.7" 
        />
        <rect 
          x={92 + (interactive ? highlightOffset.x * 0.9 : 0)} 
          y={73 + (interactive ? highlightOffset.y * 0.9 : 0)} 
          width="4" 
          height="4" 
          fill="white" 
          fillOpacity="0.5" 
        />
        
        {/* Outer Glow Effect */}
        <circle 
          cx="100" 
          cy="100" 
          r="80" 
          stroke={colors.outline} 
          strokeWidth="2" 
          strokeOpacity="0.5"
          fill="none" 
        />
        
        {/* Outer Space Ring (cosmic aura) */}
        <circle 
          cx="100" 
          cy="100" 
          r="90" 
          stroke="url(#retro-space-gradient)" 
          strokeWidth="4" 
          fill="none" 
        />
        
        {/* Defining radial gradients for highlights */}
        <defs>
          <radialGradient 
            id="retro-earth-highlight" 
            cx="0.3" 
            cy="0.3" 
            r="0.8" 
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient 
            id="retro-space-gradient" 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="100%"
          >
            <stop offset="0%" stopColor="#7b61ff" />
            <stop offset="50%" stopColor="#ff61e0" />
            <stop offset="100%" stopColor="#61a8ff" />
          </linearGradient>
        </defs>
        
        {/* Website Title Text (optional) */}
        <text 
          x="100" 
          y="190" 
          fontSize="16" 
          fontFamily="'Press Start 2P', monospace" 
          textAnchor="middle" 
          fill="white"
        >
          COSMIC JOURNEY
        </text>
      </svg>
    </div>
  );
});

// 3D version of the retro Earth logo
const RetroEarthLogo3D: React.FC<{ size?: number; interactive?: boolean }> = React.memo(({ 
  size = 120,
  interactive = true 
}) => {
  // State for mouse position to rotate the globe
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  
  // Throttle mouse movement to reduce updates
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    // Cancel any pending animation frame
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the container
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    // Schedule update at next animation frame
    rafId.current = requestAnimationFrame(() => {
      setRotation({ 
        x: y * 0.3, // Tilt based on vertical mouse position
        y: -x * 0.5  // Rotate based on horizontal mouse position
      });
    });
  }, []);
  
  // Track mouse position for interactive rotation
  useEffect(() => {
    if (!interactive) return;
    
    // Listen for mouse movement when hovering over the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      
      // Clean up any pending animation frame
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [interactive, handleMouseMove]);

  return (
    <div 
      ref={containerRef}
      style={{ width: size, height: size }}
      className="cursor-move"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]} // Responsive to device pixel ratio
        performance={{ min: 0.5 }} // For performance optimization
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <RetroEarthMesh userRotation={rotation} autoRotate={!interactive} />
      </Canvas>
    </div>
  );
});

// Mesh for the 3D version
const RetroEarthMesh: React.FC<{ 
  userRotation?: { x: number; y: number }; 
  autoRotate?: boolean;
}> = React.memo(({ 
  userRotation = { x: 0, y: 0 },
  autoRotate = false
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const groupRef = React.useRef<THREE.Group>(null);
  
  // Pixelated grid pattern for retro effect - heavy computation, should be memoized
  const gridTexture = React.useMemo(() => {
    // Create canvas only once
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background (deep blue)
      ctx.fillStyle = '#0051cd';
      ctx.fillRect(0, 0, 64, 64);
      
      // Land masses (green pixels)
      ctx.fillStyle = '#1aaa55';
      
      // North America
      ctx.fillRect(10, 15, 20, 10);
      
      // South America
      ctx.fillRect(20, 30, 10, 15);
      
      // Europe/Africa
      ctx.fillRect(30, 20, 15, 25);
      
      // Asia
      ctx.fillRect(45, 15, 15, 20);
      
      // Australia
      ctx.fillRect(45, 40, 10, 8);
      
      // Grid overlay
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 64; i += 8) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(64, i);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 64);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter; // For that pixelated look
    return texture;
  }, []);
  
  // Auto-rotation animation with requestAnimationFrame for better performance
  React.useEffect(() => {
    if (!groupRef.current || !autoRotate) return;
    
    let animationFrameId: number;
    let lastTime = 0;
    
    // Slow rotation animation with time-based updates for consistent speed
    const animate = (time: number) => {
      if (!groupRef.current) return;
      
      // Compute delta time for consistent rotation speed
      const deltaTime = lastTime ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;
      
      groupRef.current.rotation.y += 0.005 * deltaTime * 60; // 60 is a base framerate
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [autoRotate]);
  
  // Apply user mouse rotation - optimized to reduce unnecessary updates
  React.useEffect(() => {
    if (!groupRef.current || autoRotate) return;
    
    let animationFrameId: number;
    
    const updateRotation = () => {
      if (!groupRef.current) return;
      
      groupRef.current.rotation.x = userRotation.x;
      
      // Smooth interpolation for better feel
      const targetY = userRotation.y;
      const currentY = groupRef.current.rotation.y;
      groupRef.current.rotation.y += (targetY - currentY) * 0.1;
      
      // Only continue animation if there's significant movement
      if (Math.abs(targetY - currentY) > 0.001) {
        animationFrameId = requestAnimationFrame(updateRotation);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateRotation);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [userRotation, autoRotate]);
  
  // Pre-compute material properties
  const earthMaterial = React.useMemo(() => (
    <meshStandardMaterial 
      map={gridTexture}
      emissive="#ffffff"
      emissiveIntensity={0.1}
    />
  ), [gridTexture]);
  
  const glowMaterial = React.useMemo(() => (
    <meshBasicMaterial 
      color="#4040ff" 
      transparent={true} 
      opacity={0.1} 
      side={THREE.BackSide} 
    />
  ), []);
  
  const ringMaterial = React.useMemo(() => (
    <meshBasicMaterial 
      color="#ffffff" 
      transparent={true} 
      opacity={0.3} 
      side={THREE.DoubleSide} 
    />
  ), []);
  
  return (
    <group ref={groupRef}>
      {/* Earth Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        {earthMaterial}
      </mesh>
      
      {/* Glow Effect */}
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        {glowMaterial}
      </mesh>
      
      {/* Orbit Ring */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[2, 2.1, 64]} />
        {ringMaterial}
      </mesh>
    </group>
  );
});

// Main component that decides which version to render - memoized to prevent unnecessary re-renders
const RetroEarthLogo: React.FC<RetroEarthLogoProps> = React.memo(({ 
  type = '2d',
  size = 80,
  className = '',
  pixelated = true,
  animated = true,
  interactive = true
}) => {
  // Render 3D or 2D version based on type prop
  if (type === '3d') {
    return <RetroEarthLogo3D size={size} interactive={interactive} />;
  }
  
  return (
    <RetroEarthLogoSVG 
      size={size} 
      className={className} 
      pixelated={pixelated} 
      animated={animated}
      interactive={interactive}
    />
  );
});

RetroEarthLogo.displayName = 'RetroEarthLogo';
RetroEarthLogoSVG.displayName = 'RetroEarthLogoSVG';
RetroEarthLogo3D.displayName = 'RetroEarthLogo3D';
RetroEarthMesh.displayName = 'RetroEarthMesh';

export default RetroEarthLogo; 