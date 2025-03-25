import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture, Html } from '@react-three/drei';
import { getMoonPhase } from '../utils/moonPhase';

interface MoonInSpaceProps {
  position: [number, number, number];
  size?: number;
  rotationSpeed?: number;
  onClick?: () => void;
  parallaxIntensity?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  showMoonPhase?: boolean;
  orbitInclination?: number;
}

/**
 * MoonInSpace component
 * A realistic 3D moon that shows accurate moon phases based on current date
 */
const MoonInSpace: React.FC<MoonInSpaceProps> = ({
  position,
  size = 0.27, // Moon is about 27% the size of Earth
  rotationSpeed = 0.001,
  onClick,
  parallaxIntensity = 0.5,
  orbitRadius = 1.5,
  orbitSpeed = 0.005,
  showMoonPhase = true,
  orbitInclination = 5.14 // Moon's orbit inclination in degrees
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Store original position for parallax effect
  const originalPosition = useMemo(() => {
    return { x: position[0], y: position[1], z: position[2] };
  }, [position]);
  
  // Get current moon phase data
  const moonPhaseData = useMemo(() => {
    return getMoonPhase();
  }, []);
  
  // Load moon texture
  const moonTexture = useTexture('/images/moon/moon_texture.jpg');
  
  // Apply texture settings
  useEffect(() => {
    if (moonTexture) {
      moonTexture.wrapS = moonTexture.wrapT = THREE.RepeatWrapping;
    }
  }, [moonTexture]);
  
  // Convert degrees to radians
  const orbitInclinationRad = useMemo(() => orbitInclination * Math.PI / 180, [orbitInclination]);
  
  // Create the moon phase-specific material
  const moonPhaseMaterial = useMemo(() => {
    if (!showMoonPhase) {
      return new THREE.MeshStandardMaterial({ 
        map: moonTexture,
        roughness: 0.9,
        metalness: 0.0
      });
    }
    
    // Create a custom shader material for moon phases
    const phaseAngle = (moonPhaseData.age / 29.53) * Math.PI * 2;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: moonTexture },
        phaseAngle: { value: phaseAngle },
        illumination: { value: moonPhaseData.illumination / 100 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float phaseAngle;
        uniform float illumination;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Base texture color
          vec4 texColor = texture2D(map, vUv);
          
          // Calculate position on the moon's surface relative to center
          vec2 centered = vUv * 2.0 - 1.0;
          float dist = length(centered);
          
          // Skip pixels outside the moon's circle
          if (dist > 1.0) {
            discard;
          }
          
          // For each point on the moon's surface, calculate if it should be
          // in shadow based on phase angle and illumination percentage
          float x = centered.x;
          
          // Terminator position (the line between light and dark)
          float terminator = cos(phaseAngle);
          
          // Calculate illumination factor
          float illuminationFactor = 1.0;
          
          // Apply different phase logic based on moon phase type
          if (illumination < 0.05) {
            // New Moon
            illuminationFactor = 0.1;
          } else if (illumination > 0.95) {
            // Full Moon
            illuminationFactor = 1.0;
          } else if (phaseAngle < Math.PI) {
            // Waxing phases (New to Full)
            if (x < terminator) {
              // Dark side (closer to new moon)
              illuminationFactor = 0.1 + (x - terminator) * 0.1; // Soft terminator
            }
          } else {
            // Waning phases (Full to New)
            if (x > terminator) {
              // Dark side (closer to new moon)
              illuminationFactor = 0.1 + (terminator - x) * 0.1; // Soft terminator
            }
          }
          
          // Add subtle earthshine effect to the dark side
          if (illuminationFactor < 0.3) {
            illuminationFactor = max(illuminationFactor, 0.1 + 0.05 * (1.0 - dist));
          }
          
          // Calculate basic lighting based on surface normal
          vec3 lightDir = normalize(vec3(cos(phaseAngle), 0.0, sin(phaseAngle)));
          float diffuse = max(0.2, dot(vNormal, lightDir));
          
          // Apply illumination with shading
          gl_FragColor = vec4(
            texColor.rgb * (illuminationFactor * diffuse + 0.15),
            texColor.a
          );
        }
      `
    });
  }, [moonTexture, moonPhaseData, showMoonPhase]);
  
  // Handle orbit animation with inclination
  useFrame(({ clock }) => {
    if (!meshRef.current || !groupRef.current || !orbitRef.current) return;
    
    // Rotate the moon on its axis (tidally locked to earth)
    meshRef.current.rotation.y += rotationSpeed;
    
    // Calculate orbit position
    const time = clock.getElapsedTime();
    
    // Apply orbit inclination
    orbitRef.current.rotation.x = orbitInclinationRad;
    
    // Calculate position along orbital path
    const orbitAngle = time * orbitSpeed;
    const x = Math.cos(orbitAngle) * orbitRadius;
    const z = Math.sin(orbitAngle) * orbitRadius;
    
    // Update position within the inclined orbit plane
    groupRef.current.position.set(x, 0, z);
    
    // Always face the same side toward Earth (tidal locking)
    groupRef.current.rotation.y = -orbitAngle;
  });
  
  // Real time update of moon phase
  useEffect(() => {
    const updateTimer = setInterval(() => {
      if (showMoonPhase && moonPhaseMaterial instanceof THREE.ShaderMaterial) {
        const newPhaseData = getMoonPhase();
        const newPhaseAngle = (newPhaseData.age / 29.53) * Math.PI * 2;
        moonPhaseMaterial.uniforms.phaseAngle.value = newPhaseAngle;
        moonPhaseMaterial.uniforms.illumination.value = newPhaseData.illumination / 100;
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(updateTimer);
  }, [moonPhaseMaterial, showMoonPhase]);
  
  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Inclined orbit group */}
      <group ref={orbitRef}>
        {/* Moon position along orbit */}
        <group ref={groupRef}>
          {/* Moon sphere */}
          <mesh
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={() => {
              setShowInfo(!showInfo);
              if (onClick) onClick();
            }}
            scale={hovered ? [size * 1.1, size * 1.1, size * 1.1] : [size, size, size]}
          >
            <sphereGeometry args={[1, 64, 64]} />
            <primitive object={moonPhaseMaterial} />
          </mesh>
          
          {/* Information popup */}
          {showInfo && (
            <Html position={[0, 1.5, 0]} center style={{ width: '180px' }}>
              <div className="bg-black bg-opacity-75 backdrop-blur-sm text-white p-3 rounded-lg border border-white/10 shadow-xl">
                <h3 className="font-bold text-base">{moonPhaseData.emoji} Moon</h3>
                <p className="text-sm my-1">Phase: {moonPhaseData.phase}</p>
                <p className="text-sm my-1">{moonPhaseData.illumination.toFixed(1)}% illuminated</p>
                <p className="text-sm my-1">Age: {moonPhaseData.age.toFixed(1)} days</p>
              </div>
            </Html>
          )}
        </group>
      </group>
    </group>
  );
};

export default MoonInSpace; 