import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import Earth from './Earth';

interface CosmicSceneProps {
  currentSection?: string;
  scrollPosition?: number;
  children?: React.ReactNode;
}

const CosmicScene: React.FC<CosmicSceneProps> = ({ 
  currentSection = 'earth', 
  scrollPosition = 0,
  children 
}) => {
  // Component rendering based on current section
  const sectionComponent = useMemo(() => {
    switch(currentSection) {
      case 'earth':
      default:
        return <Earth />;
    }
  }, [currentSection]);
  
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [3, 2, 5], fov: 60 }}
        dpr={[1, 2]} // For better performance on high-DPI screens
        gl={{ 
          antialias: true,
          alpha: true,
        }}
      >
        {/* Background stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0.5} 
        />
        
        {/* Add a soft ambient light */}
        <ambientLight intensity={0.5} color="#FFFFFF" />
        
        {/* Main directional light */}
        <directionalLight position={[5, 3, 5]} intensity={1} />
        
        {/* Earth component */}
        {sectionComponent}
        
        {/* Camera controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
        />
        
        {/* Pass through any children */}
        {children}
      </Canvas>
    </div>
  );
};

CosmicScene.displayName = 'CosmicScene';

export default CosmicScene; 