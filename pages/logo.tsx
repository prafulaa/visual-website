import React, { useState } from 'react';
import RetroEarthLogo from '../components/RetroEarthLogo';

const LogoShowcase: React.FC = () => {
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [pixelationEnabled, setPixelationEnabled] = useState(true);
  const [size, setSize] = useState(120);

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-space-navy flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-heading text-white mb-8">Retro Earth Logo Options</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
        {/* 2D Logo */}
        <div className="flex flex-col items-center p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-space-blue/30">
          <h2 className="text-xl text-white mb-6">2D SVG Version</h2>
          <div className="bg-space-black/50 p-8 rounded-full mb-6 flex items-center justify-center">
            <RetroEarthLogo 
              type="2d" 
              size={size} 
              animated={animationEnabled} 
              pixelated={pixelationEnabled} 
            />
          </div>
          <p className="text-white/70 text-sm text-center mb-4">
            SVG-based logo with retro styling. Best for headers, favicons, and general UI elements.
          </p>
        </div>
        
        {/* 3D Logo */}
        <div className="flex flex-col items-center p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-space-blue/30">
          <h2 className="text-xl text-white mb-6">3D Version</h2>
          <div className="bg-space-black/50 p-8 rounded-full mb-6 flex items-center justify-center h-[240px]">
            <RetroEarthLogo 
              type="3d" 
              size={size} 
            />
          </div>
          <p className="text-white/70 text-sm text-center mb-4">
            Three.js powered 3D version. Great for featured sections and interactive elements.
          </p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-12 p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-space-blue/30 w-full max-w-2xl">
        <h3 className="text-lg text-white mb-4">Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-3 text-white mb-4">
              <input 
                type="checkbox" 
                checked={animationEnabled} 
                onChange={(e) => setAnimationEnabled(e.target.checked)}
                className="form-checkbox h-5 w-5 text-space-blue rounded"
              />
              <span>Animation Effects</span>
            </label>
            
            <label className="flex items-center space-x-3 text-white">
              <input 
                type="checkbox" 
                checked={pixelationEnabled} 
                onChange={(e) => setPixelationEnabled(e.target.checked)}
                className="form-checkbox h-5 w-5 text-space-blue rounded"
              />
              <span>Pixelation (Retro Effect)</span>
            </label>
          </div>
          
          <div>
            <label className="block text-white mb-2">
              Size: {size}px
            </label>
            <input 
              type="range" 
              min="40" 
              max="200" 
              value={size} 
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-space-blue hover:text-white transition-colors">
            ← Back to main site
          </a>
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-lg">
        <h3 className="text-white text-xl mb-2">Implementation Notes</h3>
        <p className="text-white/70 text-sm">
          This retro Earth logo is designed in a pixelated, retro gaming style with bright colors
          and grid patterns reminiscent of early digital displays. It works both as a static asset 
          and with subtle animations that enhance its retro feel.
        </p>
      </div>
    </div>
  );
};

export default LogoShowcase; 