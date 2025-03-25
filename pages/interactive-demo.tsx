import React, { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
// Import directly instead of using dynamic imports to avoid type issues
import CosmicScene from '../components/CosmicScene';
import RetroEarthLogo from '../components/RetroEarthLogo';

const InteractiveDemo = () => {
  // State management for logo configuration
  const [logoType, setLogoType] = useState<'2d' | '3d'>('2d');
  const [logoSize, setLogoSize] = useState(120);
  const [pixelated, setPixelated] = useState(true);
  const [animated, setAnimated] = useState(true);
  const [interactive, setInteractive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for components
  React.useEffect(() => {
    // Simulate loading time to give the browser time to render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
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
      Interactive Cosmic Experience
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
  
  // Memoize the page content to avoid re-renders when props don't change
  const pageContent = useMemo(() => (
    <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        {pageTitle}
        
        <div className="bg-black/70 backdrop-blur-lg rounded-lg p-6 mb-12">
          <h2 className="text-2xl text-cyan-300 mb-4">Mouse-Reactive Background</h2>
          <p className="text-lg mb-6">
            Move your mouse around to see how the cosmic elements in the background respond to your movements.
            The planets, stars, and galaxies all have different parallax effects based on their distance.
          </p>
          <div className="flex justify-center items-center h-40 border border-cyan-800 border-dashed rounded-lg">
            <p className="text-center text-gray-400">
              ✨ Move your mouse here to test the background parallax ✨
            </p>
          </div>
        </div>
        
        <div className="bg-black/70 backdrop-blur-lg rounded-lg p-6 mb-12">
          <h2 className="text-2xl text-cyan-300 mb-4">Interactive Retro Earth Logo</h2>
          <p className="text-lg mb-6">
            Our new retro-styled Earth logo also responds to mouse movement.
            Try hovering over the logo below and moving your cursor to see the interactive effects.
          </p>
          
          <div className="flex flex-col items-center mb-8">
            <div className="h-40 w-40 flex items-center justify-center">
              {!isLoading ? logoComponent : (
                <div className="h-40 w-40 flex items-center justify-center bg-black/30 rounded-full">
                  <div className="text-cyan-400">Loading logo...</div>
                </div>
              )}
            </div>
          </div>
          
          {logoControls}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-400">
            These interactive elements enhance the user experience by creating a dynamic,
            responsive cosmic environment that reacts to user movements.
          </p>
        </div>
      </div>
    </div>
  ), [pageTitle, logoComponent, logoControls, isLoading]);
  
  // For CosmicScene props - memoized to prevent unnecessary re-renders
  const scrollPosition = useMemo(() => 0, []);
  const currentSection = useMemo(() => 'interactive', []);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Interactive Cosmic Demo | Cosmic Journey</title>
        <meta name="description" content="Showcase of interactive cosmic visuals with mouse tracking" />
        {/* Preload critical resources */}
        <link rel="preload" href="/images/star.png" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </Head>
      
      <Navbar />
      
      {/* Background scene with mouse interactivity */}
      <div className="fixed inset-0 z-0">
        {!isLoading ? (
          <CosmicScene 
            currentSection={currentSection} 
            scrollPosition={scrollPosition} 
          />
        ) : (
          <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div className="text-cyan-400 text-xl">Loading cosmic environment...</div>
          </div>
        )}
      </div>
      
      {pageContent}
    </div>
  );
};

export default InteractiveDemo; 