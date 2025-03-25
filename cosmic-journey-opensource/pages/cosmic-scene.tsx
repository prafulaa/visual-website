import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CosmicScene from '../components/CosmicScene';

const CosmicScenePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Cosmic Scene | Cosmic Journey</title>
        <meta name="description" content="Explore an interactive 3D visualization of Earth and the Moon with accurate moon phases" />
      </Head>
      
      <div className="fixed top-4 left-4 z-10">
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 z-10 text-center">
        <div className="inline-block bg-black bg-opacity-70 backdrop-blur-sm p-4 rounded-lg max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Earth and Moon</h1>
          <p>
            Interactive 3D visualization with accurate moon phases. Drag to rotate, scroll to zoom.
            The moon orbits Earth and shows its current phase based on real astronomical calculations.
          </p>
        </div>
      </div>
      
      {/* Full screen cosmic scene with Earth and Moon */}
      <CosmicScene />
    </div>
  );
};

export default CosmicScenePage; 