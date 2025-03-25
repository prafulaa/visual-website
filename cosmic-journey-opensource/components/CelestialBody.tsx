import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

interface CelestialBodyProps {
  name: string;
  position: [number, number, number];
  texture: string;
  size?: number;
  onClick?: () => void;
  rotationSpeed?: number;
  fact?: string;
  parallaxIntensity?: number;
}

const CelestialBody: React.FC<CelestialBodyProps> = React.memo(({ 
  name, 
  position, 
  texture, 
  size = 1, 
  onClick,
  rotationSpeed = 0.005,
  fact,
  parallaxIntensity = 0
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texturePath = useMemo(() => `/images/${texture}`, [texture]);
  const [showInfo, setShowInfo] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Create Vector2 for normalScale - memoized
  const normalScale = useMemo(() => new THREE.Vector2(0.5, 0.5), []);
  
  // Original position for reference - memoized
  const originalPosition = useMemo(() => 
    new THREE.Vector3(position[0], position[1], position[2]),
  [position]);
  
  // Load texture
  const bodyTexture = useTexture(texturePath);
  
  // Determine if this planet should have an atmosphere - memoized
  const hasAtmosphere = useMemo(() => 
    ['Earth', 'Venus', 'Saturn', 'Jupiter', 'Uranus', 'Neptune'].includes(name),
  [name]);
  
  // Set atmosphere color based on planet - memoized
  const atmosphereColor = useMemo(() => {
    switch(name) {
      case 'Earth': return '#5f98ff';
      case 'Venus': return '#ffcc80';
      case 'Jupiter': return '#fff6e0';
      case 'Saturn': return '#ffe0a0';
      case 'Uranus': return '#a0ffff';
      case 'Neptune': return '#5080ff';
      default: return '#ffffff';
    }
  }, [name]);
  
  // Handle orbit/rotation animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Get elapsed time for animation
    const elapsedTime = clock.getElapsedTime();
    
    // Rotation with consistent speed
    meshRef.current.rotation.y += rotationSpeed;
    
    // Subtle pulsation for atmosphere
    if (atmosphereRef.current && hasAtmosphere) {
      const pulseFactor = 1 + Math.sin(elapsedTime * 0.2) * 0.02;
      atmosphereRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
  });

  // Handle hover effects
  useEffect(() => {
    if (!meshRef.current) return;
    
    if (hovered) {
      meshRef.current.scale.set(1.1, 1.1, 1.1);
    } else {
      meshRef.current.scale.set(1, 1, 1);
    }
  }, [hovered]);

  // Pre-compute materials
  const planetMaterial = useMemo(() => (
    <meshStandardMaterial 
      map={bodyTexture} 
      metalness={0.1}
      roughness={0.8}
      envMapIntensity={0.2}
      normalScale={normalScale}
    />
  ), [bodyTexture, normalScale]);

  const atmosphereMaterial = useMemo(() => (
    <meshBasicMaterial 
      color={atmosphereColor}
      transparent={true}
      opacity={0.15}
      side={THREE.BackSide}
    />
  ), [atmosphereColor]);

  // Special material for Saturn's rings
  const ringsMaterial = useMemo(() => (
    <meshStandardMaterial 
      color="#ffe0c0"
      transparent={true}
      opacity={0.8}
      side={THREE.DoubleSide}
      roughness={1}
      metalness={0.1}
    />
  ), []);

  return (
    <group ref={groupRef} position={position}>
      {/* Planet Mesh */}
      <mesh 
        ref={meshRef} 
        onClick={() => {
          setShowInfo(!showInfo);
          if (onClick) onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        {planetMaterial}
      </mesh>
      
      {/* Atmosphere effect for some planets */}
      {hasAtmosphere && (
        <mesh ref={atmosphereRef} scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[size, 32, 32]} />
          {atmosphereMaterial}
        </mesh>
      )}
      
      {/* Saturn's rings */}
      {name === 'Saturn' && (
        <mesh rotation={[Math.PI/6, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2, 64]} />
          {ringsMaterial}
        </mesh>
      )}
      
      {/* Information popup - only rendered when visible */}
      {showInfo && (
        <Html position={[0, size + 0.5, 0]} center distanceFactor={10}>
          <div className="bg-space-navy/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-white border border-white/10 max-w-[200px]">
            <h3 className="text-lg font-bold mb-1">{name}</h3>
            {fact && <p className="text-sm">{fact}</p>}
          </div>
        </Html>
      )}
    </group>
  );
});

CelestialBody.displayName = 'CelestialBody';

export default CelestialBody; 