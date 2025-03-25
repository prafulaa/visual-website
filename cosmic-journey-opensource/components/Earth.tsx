import React from 'react';
import CelestialBody from './CelestialBody';
import MoonInSpace from './MoonInSpace';

// Earth component - memoized
const Earth: React.FC = React.memo(() => {
  return (
    <>
      <CelestialBody 
        name="Earth" 
        position={[0, 0, 0]} 
        texture="earth.jpg" 
        size={1}
        fact="Our home planet is the only place we know of so far that's inhabited by living things. It's also the only planet in our solar system with liquid water on the surface."
      />
      
      {/* Add the Moon with accurate moon phases */}
      <MoonInSpace
        position={[0, 0, 0]}
        size={0.27}
        orbitRadius={2.5}
        orbitSpeed={0.005}
        showMoonPhase={true}
        onClick={() => console.log('Moon clicked')}
      />
    </>
  );
});

Earth.displayName = 'Earth';

export default Earth; 