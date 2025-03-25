import React, { useRef, useEffect, useState, useMemo, createContext, useContext, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useTexture, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ReactNode } from 'react';

// Create a global store for textures to avoid reloading
const textureCache = new Map<string, THREE.Texture>();

interface CosmicSceneProps {
  currentSection: string;
  scrollPosition: number;
  children?: ReactNode;
}

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

// Create a context for mouse movement
interface MouseContextType {
  mousePosition: { x: number; y: number };
}

const MouseContext = createContext<MouseContextType>({
  mousePosition: { x: 0, y: 0 }
});

// Provider component to track mouse movement with throttling
const MouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  
  // Throttle mouse movement to optimize performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Cancel any pending animation frame
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Schedule update at next animation frame
    rafId.current = requestAnimationFrame(() => {
      // Convert screen coordinates to normalized coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      
      setMousePosition({ x, y });
    });
  }, []);
  
  useEffect(() => {
    // Add event listener with passive flag for better touch performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Clean up any pending animation frame
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleMouseMove]);
  
  return (
    <MouseContext.Provider value={{ mousePosition }}>
      {children}
    </MouseContext.Provider>
  );
};

// Hook to use mouse movement
const useMouseMovement = () => {
  return useContext(MouseContext);
};

// Function to calculate position with parallax effect - pure function
const applyParallax = (
  basePosition: [number, number, number], 
  mousePosition: { x: number; y: number },
  intensity: number = 1
): [number, number, number] => {
  return [
    basePosition[0] + mousePosition.x * intensity,
    basePosition[1] + mousePosition.y * intensity,
    basePosition[2]
  ];
};

// Planet texture loader with caching
const useCachedTexture = (texturePath: string) => {
  return useMemo(() => {
    // Check cache first
    if (textureCache.has(texturePath)) {
      return textureCache.get(texturePath);
    }
    
    // Create new texture loader
    const loader = new THREE.TextureLoader();
    
    // Load texture and cache it
    const texture = loader.load(texturePath, (loadedTexture) => {
      textureCache.set(texturePath, loadedTexture);
    });
    
    return texture;
  }, [texturePath]);
};

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
  const texturePath = useMemo(() => `/textures/${texture}`, [texture]);
  const [showInfo, setShowInfo] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { mousePosition } = useMouseMovement();
  const rafId = useRef<number | null>(null);
  
  // Create Vector2 for normalScale - memoized
  const normalScale = useMemo(() => new THREE.Vector2(0.5, 0.5), []);
  
  // Original position for reference - memoized
  const originalPosition = useMemo(() => 
    new THREE.Vector3(position[0], position[1], position[2]),
  [position]);
  
  // Use cached texture
  const bodyTexture = useCachedTexture(texturePath);
  
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
  
  // Apply mouse parallax effect - only recalculate when necessary
  const adjustedPosition = useMemo(() => 
    applyParallax(position, mousePosition, parallaxIntensity),
  [position, mousePosition, parallaxIntensity]);
  
  // Optimized frame update with time-based animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Get delta time for consistent animation speeds
    const elapsedTime = clock.getElapsedTime();
    
    // Rotation with consistent speed regardless of framerate
    meshRef.current.rotation.y += rotationSpeed;
    
    // Subtle pulsation for atmosphere with performance optimization
    if (atmosphereRef.current && hasAtmosphere) {
      const pulseFactor = 1 + Math.sin(elapsedTime * 0.2) * 0.02;
      atmosphereRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    // Only schedule GSAP animations if parallax should be applied and group exists
    if (groupRef.current && parallaxIntensity > 0) {
      // Calculate parallax offset (more distant objects move less)
      const distance = Math.abs(originalPosition.z);
      const parallaxFactor = 0.1 / (distance * 0.1 + 1);
      
      // Cancel any pending animation frame
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      
      // Schedule GSAP update at next animation frame for smoother performance
      rafId.current = requestAnimationFrame(() => {
        gsap.to(groupRef.current!.position, {
          x: originalPosition.x + mousePosition.x * parallaxFactor * 10,
          y: originalPosition.y + mousePosition.y * parallaxFactor * 8,
          duration: 1,
          ease: "power2.out"
        });
      });
    }
  });

  // Handle hover effects
  useEffect(() => {
    if (!meshRef.current) return;
    
    if (hovered) {
      gsap.to(meshRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
    } else {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
    }
  }, [hovered]);

  // Clean up any GSAP animations when component unmounts
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleBodyClick = useCallback(() => {
    setShowInfo(!showInfo);
    if (onClick) onClick();
  }, [showInfo, onClick]);

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
        onClick={handleBodyClick}
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

// Earth component - memoized
const Earth: React.FC = React.memo(() => {
  return (
    <CelestialBody 
      name="Earth" 
      position={[0, 0, 0]} 
      texture="earth.jpg" 
      size={1}
      fact="Our home planet is the only place we know of so far that's inhabited by living things. It's also the only planet in our solar system with liquid water on the surface."
    />
  );
});

// Sun component - optimized with memoization
const Sun: React.FC = React.memo(() => {
  const { mousePosition } = useMouseMovement();
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const rafId = useRef<number | null>(null);
  
  // Memoize the base position
  const basePosition = useMemo<[number, number, number]>(() => [0, 0, -20], []);
  
  // Sun animation effect with time-based updates
  useFrame(({ clock }) => {
    if (!glowRef.current || !groupRef.current) return;
    
    // Get elapsed time for animation
    const elapsedTime = clock.getElapsedTime();
    
    // Pulsating glow effect with time-based animation
    const pulseFactor = 1 + Math.sin(elapsedTime * 0.5) * 0.05;
    glowRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    
    // Optimize GSAP animations by using requestAnimationFrame
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Schedule GSAP update at next animation frame
    rafId.current = requestAnimationFrame(() => {
      gsap.to(groupRef.current!.position, {
        x: mousePosition.x * 2,
        y: mousePosition.y * 2,
        duration: 2,
        ease: "power2.out"
      });
    });
  });

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Pre-compute materials
  const innerGlowMaterial = useMemo(() => (
    <meshBasicMaterial 
      color="#FFFF80" 
      transparent={true} 
      opacity={0.6} 
      side={THREE.BackSide}
    />
  ), []);

  const outerGlowMaterial = useMemo(() => (
    <meshBasicMaterial 
      color="#FFF8E0" 
      transparent={true} 
      opacity={0.3} 
      side={THREE.BackSide}
    />
  ), []);

  return (
    <group ref={groupRef}>
      {/* Sun core */}
      <CelestialBody 
        name="Sun" 
        position={basePosition} 
        texture="sun.jpg" 
        size={5}
        rotationSpeed={0.001}
        fact="The Sun is a yellow dwarf star at the center of our solar system. It contains 99.8% of the solar system's mass and has been burning for about 4.6 billion years."
      />
      
      {/* Main sun glow effect */}
      <mesh position={basePosition} ref={glowRef}>
        <sphereGeometry args={[5.5, 32, 32]} />
        {innerGlowMaterial}
      </mesh>
      
      {/* Outer glow */}
      <mesh position={basePosition}>
        <sphereGeometry args={[6.5, 32, 32]} />
        {outerGlowMaterial}
      </mesh>
      
      {/* Intense central light */}
      <pointLight position={basePosition} intensity={3} color="#FFFFFF" distance={100} />
    </group>
  );
});

// SolarSystem component - memoized with optimized planet data
const SolarSystem: React.FC = React.memo(() => {
  // Memoize planet data to prevent recreation
  const planets = useMemo(() => [
    { name: "Mercury", position: [4, 0, -15], size: 0.4, texture: "mercury.jpg", rotationSpeed: 0.004, fact: "Mercury is the smallest planet in our solar system and the closest to the Sun." },
    { name: "Venus", position: [-5, 1, -12], size: 0.9, texture: "venus.jpg", rotationSpeed: 0.002, fact: "Venus has a thick atmosphere that traps heat, making it the hottest planet in our solar system." },
    { name: "Mars", position: [7, -1, -10], size: 0.5, texture: "mars.jpg", rotationSpeed: 0.003, fact: "Mars is known as the Red Planet due to iron oxide (rust) on its surface. It has the largest volcano in the solar system." },
    { name: "Jupiter", position: [-9, 2, -25], size: 2.5, texture: "jupiter.jpg", rotationSpeed: 0.007, fact: "Jupiter is the largest planet in our solar system and has more than 75 moons." },
    { name: "Saturn", position: [12, -1, -30], size: 2.2, texture: "saturn.jpg", rotationSpeed: 0.006, fact: "Saturn is known for its prominent ring system, made mostly of ice particles with some rocky debris." }
  ], []);

  return (
    <group>
      <Sun />
      {planets.map((planet, index) => (
        <CelestialBody 
          key={planet.name}
          name={planet.name} 
          position={planet.position as [number, number, number]} 
          texture={planet.texture} 
          size={planet.size}
          rotationSpeed={planet.rotationSpeed}
          fact={planet.fact}
        />
      ))}
    </group>
  );
});

// Galaxy component - optimized with instanced geometry and memoization
const Galaxy: React.FC = React.memo(() => {
  const { mousePosition } = useMouseMovement();
  const galaxyRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Apply subtle rotation based on mouse movement - optimization with debouncing
  useEffect(() => {
    if (!galaxyRef.current) return;
    
    let rafId: number;
    
    const updateRotation = () => {
      if (!galaxyRef.current) return;
      
      // Smooth transitions for rotation
      const targetX = mousePosition.y * 0.1;
      const targetY = mousePosition.x * 0.1;
      
      const currentX = galaxyRef.current.rotation.x;
      const currentY = galaxyRef.current.rotation.y;
      
      galaxyRef.current.rotation.x += (targetX - currentX) * 0.1;
      galaxyRef.current.rotation.y += (targetY - currentY) * 0.1;
      
      // Only continue animation if there's significant movement
      if (Math.abs(targetX - currentX) > 0.0001 || Math.abs(targetY - currentY) > 0.0001) {
        rafId = requestAnimationFrame(updateRotation);
      }
    };
    
    rafId = requestAnimationFrame(updateRotation);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [mousePosition]);
  
  // Create galaxy particles - memoize this computation
  const particlesGeometry = useMemo(() => {
    // Create buffers for better performance
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Generate spiral galaxy pattern
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 30;
      const spinAngle = radius * 0.3;
      const branchAngle = (i % 3) * Math.PI * 2 / 3;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.5;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      // Color based on distance from center
      const distanceFromCenter = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );
      
      if (distanceFromCenter < 8) {
        // Blue-white for center
        colors[i3] = 0.7 + Math.random() * 0.3;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 1.0;
      } else if (distanceFromCenter < 15) {
        // Yellow-white for midrange
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 0.7 + Math.random() * 0.3;
      } else {
        // Reddish for outer regions
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i3 + 2] = 0.3 + Math.random() * 0.2;
      }
      
      // Random sizes for stars
      sizes[i] = Math.random() * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  // Cache the star texture
  const starTexture = useCachedTexture('/images/star.png');
  
  // Pre-compute material
  const particleMaterial = useMemo(() => (
    <pointsMaterial
      size={0.15}
      sizeAttenuation={true}
      transparent={true}
      alphaMap={starTexture}
      vertexColors={true}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  ), [starTexture]);
  
  return (
    <group ref={galaxyRef} position={[0, 0, -50]}>
      <points ref={particlesRef} geometry={particlesGeometry}>
        {particleMaterial}
      </points>
    </group>
  );
});

// Universe component - memoized with optimized star field
const Universe: React.FC = React.memo(() => {
  const { mousePosition } = useMouseMovement();
  const universeRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  
  // Create far background stars - memoized heavy computation
  const backgroundStarsGeometry = useMemo(() => {
    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Distribute stars in a sphere
      const radius = 100 + Math.random() * 900; // Far away
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Random star colors (mostly white with some variance)
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        // White-ish stars
        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.8 + Math.random() * 0.2;
      } else if (colorChoice < 0.8) {
        // Blue-ish stars
        colors[i3] = 0.6 + Math.random() * 0.2;
        colors[i3 + 1] = 0.6 + Math.random() * 0.2;
        colors[i3 + 2] = 1.0;
      } else if (colorChoice < 0.9) {
        // Yellow-ish stars
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 0.6 + Math.random() * 0.2;
      } else {
        // Red-ish stars
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i3 + 2] = 0.3 + Math.random() * 0.2;
      }
      
      // Randomize star sizes
      sizes[i] = Math.random() * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  // Cache the star texture
  const starTexture = useCachedTexture('/images/star.png');
  
  // Apply subtle movement based on mouse position - optimized with debouncing
  useEffect(() => {
    if (!starsRef.current) return;
    
    let rafId: number;
    
    const updateRotation = () => {
      if (!starsRef.current) return;
      
      // Smooth transitions
      const targetX = mousePosition.y * 0.05;
      const targetY = mousePosition.x * 0.05;
      
      const currentX = starsRef.current.rotation.x;
      const currentY = starsRef.current.rotation.y;
      
      starsRef.current.rotation.x += (targetX - currentX) * 0.05;
      starsRef.current.rotation.y += (targetY - currentY) * 0.05;
      
      // Only continue animation if there's significant movement
      if (Math.abs(targetX - currentX) > 0.0001 || Math.abs(targetY - currentY) > 0.0001) {
        rafId = requestAnimationFrame(updateRotation);
      }
    };
    
    rafId = requestAnimationFrame(updateRotation);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [mousePosition]);
  
  // Pre-compute material
  const starsMaterial = useMemo(() => (
    <pointsMaterial
      size={0.5}
      sizeAttenuation={true}
      transparent={true}
      alphaMap={starTexture}
      vertexColors={true}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  ), [starTexture]);
  
  // Pre-compute distant galaxy materials
  const galaxyMaterials = useMemo(() => [
    <meshBasicMaterial key="galaxy1" color="#ff3366" transparent opacity={0.3} />,
    <meshBasicMaterial key="galaxy2" color="#33ccff" transparent opacity={0.3} />,
    <meshBasicMaterial key="galaxy3" color="#ffcc00" transparent opacity={0.2} />,
    <meshBasicMaterial key="cosmic-web" color="#ffffff" transparent opacity={0.05} />
  ], []);
  
  return (
    <group ref={universeRef}>
      <points ref={starsRef} geometry={backgroundStarsGeometry}>
        {starsMaterial}
      </points>
      
      {/* Distant galaxies - instanced for better performance */}
      <mesh position={[50, 20, -200]}>
        <sphereGeometry args={[15, 32, 32]} />
        {galaxyMaterials[0]}
      </mesh>
      
      <mesh position={[-80, -30, -250]}>
        <sphereGeometry args={[20, 32, 32]} />
        {galaxyMaterials[1]}
      </mesh>
      
      <mesh position={[0, 50, -300]}>
        <sphereGeometry args={[25, 32, 32]} />
        {galaxyMaterials[2]}
      </mesh>
      
      {/* Cosmic web structure */}
      <mesh position={[0, 0, -400]}>
        <boxGeometry args={[500, 500, 1]} />
        {galaxyMaterials[3]}
      </mesh>
    </group>
  );
});

// Camera controller with optimized transitions
const CameraController = React.memo(({ currentSection, scrollPosition }: { currentSection: string; scrollPosition: number }) => {
  const { camera } = useThree();
  const prevSectionRef = useRef<string>(currentSection);
  
  // Memoize target positions to avoid recreating arrays
  const targetPositions = useMemo(() => ({
    'earth': { position: [3, 2, 5], lookAt: [0, 0, 0] },
    'solar-system': { position: [0, 5, 10], lookAt: [0, 0, -15] },
    'galaxy': { position: [0, 10, 50], lookAt: [0, 0, -50] },
    'universe': { position: [0, 0, 100], lookAt: [0, 0, -200] },
    'interactive': { position: [0, 0, 20], lookAt: [0, 0, -30] }, // Added for interactive demo
    'default': { position: [3, 2, 5], lookAt: [0, 0, 0] }
  }), []);
  
  // Only animate camera when section changes
  useEffect(() => {
    if (prevSectionRef.current === currentSection) return;
    
    const target = targetPositions[currentSection] || targetPositions.default;
    
    // Use GSAP for smooth camera transitions
    gsap.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(target.lookAt[0], target.lookAt[1], target.lookAt[2]);
      }
    });
    
    prevSectionRef.current = currentSection;
  }, [camera, currentSection, targetPositions]);

  // Fine-tune camera based on scroll position with performance optimization
  useFrame(() => {
    // Apply subtle movement based on scroll position - cheaper than re-renders
    camera.position.y += Math.sin(scrollPosition * 0.001) * 0.01;
    camera.position.x += Math.cos(scrollPosition * 0.001) * 0.01;
  });

  return null;
});

// Update Stars component to respond to mouse movement - memoized
const ResponsiveStars: React.FC = React.memo(() => {
  const starsRef = useRef<THREE.Group>(null);
  const { mousePosition } = useMouseMovement();
  const rafId = useRef<number | null>(null);
  
  // Optimized frame updates with debouncing
  useFrame(() => {
    if (!starsRef.current) return;
    
    // Cancel any pending animation frame
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Schedule update at next animation frame
    rafId.current = requestAnimationFrame(() => {
      // Stars move slightly opposite to mouse direction for parallax effect
      gsap.to(starsRef.current!.rotation, {
        x: -mousePosition.y * 0.05,
        y: -mousePosition.x * 0.05,
        duration: 2,
        ease: "power1.out"
      });
    });
  });
  
  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);
  
  // Optimize Stars component with memoized props
  const starsProps = useMemo(() => ({
    radius: 100, 
    depth: 50, 
    count: 5000, 
    factor: 4, 
    saturation: 0.5, 
    fade: true, 
    speed: 0.3
  }), []);
  
  return (
    <group ref={starsRef}>
      <Stars {...starsProps} />
    </group>
  );
});

// Main CosmicScene component - memoized
const CosmicScene: React.FC<CosmicSceneProps> = React.memo(({ currentSection, scrollPosition, children }) => {
  // Memoize canvas settings for performance
  const canvasSettings = useMemo(() => ({
    camera: { position: [3, 2, 5], fov: 60 },
    dpr: [1, 2], // For better performance on high-DPI screens
    gl: { 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false, // Disable stencil buffer if not needed
      depth: true, // Keep depth buffer for 3D
    },
    performance: { min: 0.5 }, // Allows quality reduction under heavy load
    // Optimize render by checking if canvas is visible
    frameloop: 'demand' as 'always' | 'demand' | 'never'
  }), []);
  
  // Component rendering based on current section for better performance
  const sectionComponent = useMemo(() => {
    switch(currentSection) {
      case 'earth': return <Earth />;
      case 'solar-system': return <SolarSystem />;
      case 'galaxy': return <Galaxy />;
      case 'universe': return <Universe />;
      default: return null;
    }
  }, [currentSection]);
  
  // Determine if Sun lighting should be included
  const needsSunLight = useMemo(() => 
    currentSection === 'solar-system',
  [currentSection]);
  
  return (
    <MouseProvider>
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={canvasSettings.camera}
          dpr={canvasSettings.dpr}
          gl={canvasSettings.gl}
          performance={canvasSettings.performance}
          frameloop={canvasSettings.frameloop}
        >
          {/* Responsive stars that move with mouse */}
          <ResponsiveStars />
          
          {/* Add a soft ambient light to the entire scene */}
          <ambientLight intensity={0.2} color="#FFFFFF" />
          
          {/* Sun specific lighting for solar system scene */}
          {needsSunLight && (
            <pointLight position={[0, 0, -20]} intensity={2.5} color="#FFF8E0" distance={100} />
          )}
          
          {/* Dynamic sections */}
          {sectionComponent}
          
          {/* Camera Controls */}
          <CameraController currentSection={currentSection} scrollPosition={scrollPosition} />
          
          {/* Pass through any children */}
          {children}
        </Canvas>
      </div>
    </MouseProvider>
  );
});

// Add display names for React DevTools
CelestialBody.displayName = 'CelestialBody';
Earth.displayName = 'Earth';
Sun.displayName = 'Sun';
SolarSystem.displayName = 'SolarSystem';
Galaxy.displayName = 'Galaxy';
Universe.displayName = 'Universe';
CameraController.displayName = 'CameraController';
ResponsiveStars.displayName = 'ResponsiveStars';
CosmicScene.displayName = 'CosmicScene';

export default CosmicScene; 