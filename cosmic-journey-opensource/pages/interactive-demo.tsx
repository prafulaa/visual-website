import React, { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import RetroEarthLogo from '../components/RetroEarthLogo';

const InteractiveDemo = () => {
  // State management for logo configuration
  const [logoType, setLogoType] = useState<'2d' | '3d'>('2d');
  const [logoSize, setLogoSize] = useState(120);
  const [pixelated, setPixelated] = useState(true);
  const [animated, setAnimated] = useState(true);
  const [interactive, setInteractive] = useState(true);
  
  // Memoized event handlers to prevent unnecessary re-renders
  const handleLogoTypeChange = useCallback((type: '2d' | '3d') => {
    setLogoType(type);
  }, []);
  
  const handleSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoSize(parseInt(e.target.value, 10));
  }, []);
  
  const togglePixelated = useCallback(() => {
    setPixelated(prev => !prev);
  }, []);
  
  const toggleAnimated = useCallback(() => {
    setAnimated(prev => !prev);
  }, []);
  
  const toggleInteractive = useCallback(() => {
    setInteractive(prev => !prev);
  }, []);
  
  // Memoize content sections to prevent unnecessary re-rendering
  const pageTitle = useMemo(() => (
    <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
      Interactive Demo
    </h1>
  ), []);
  
  // Memoize logo controls to avoid re-renders when unrelated state changes
  const logoControls = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Logo Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={logoType === '2d'}
                onChange={() => handleLogoTypeChange('2d')}
                className="text-cyan-500"
              />
              <span>2D Logo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={logoType === '3d'}
                onChange={() => handleLogoTypeChange('3d')}
                className="text-cyan-500"
              />
              <span>3D Logo</span>
            </label>
          </div>
          
          <div>
            <label className="block mb-1">Size: {logoSize}px</label>
            <input
              type="range"
              min="60"
              max="200"
              value={logoSize}
              onChange={handleSizeChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Effects</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pixelated}
              onChange={togglePixelated}
              className="text-cyan-500"
            />
            <span>Pixelated</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={animated}
              onChange={toggleAnimated}
              className="text-cyan-500"
            />
            <span>Animated</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={interactive}
              onChange={toggleInteractive}
              className="text-cyan-500"
            />
            <span>Interactive (Mouse Tracking)</span>
          </label>
        </div>
      </div>
    </div>
  ), [
    logoType, 
    logoSize, 
    pixelated, 
    animated, 
    interactive, 
    handleLogoTypeChange, 
    handleSizeChange, 
    togglePixelated, 
    toggleAnimated, 
    toggleInteractive
  ]);
  
  // Memoize the logo component to prevent unnecessary re-renders
  const logoComponent = useMemo(() => (
    <RetroEarthLogo 
      type={logoType} 
      size={logoSize} 
      pixelated={pixelated} 
      animated={animated}
      interactive={interactive}
    />
  ), [logoType, logoSize, pixelated, animated, interactive]);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Interactive Demo | Cosmic Journey</title>
        <meta name="description" content="Interactive demo of the RetroEarthLogo component" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {pageTitle}
          
          <div className="bg-space-navy bg-opacity-70 backdrop-blur-lg rounded-lg p-6 mb-12">
            <h2 className="text-2xl text-cyan-300 mb-4">Interactive Retro Earth Logo</h2>
            <p className="text-lg mb-6">
              Our retro-styled Earth logo responds to mouse movement.
              Try hovering over the logo below and moving your cursor to see the interactive effects.
            </p>
            
            <div className="flex flex-col items-center mb-8">
              <div className="h-40 w-40 flex items-center justify-center">
                {logoComponent}
              </div>
            </div>
            
            {logoControls}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-400">
              Cosmic Journey - Open Source Interactive Visualization
            </p>
            <p className="mt-4">
              <a 
                href="https://github.com/yourusername/cosmic-journey" 
                className="text-cosmic-blue hover:text-cosmic-purple transition-colors"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo; 