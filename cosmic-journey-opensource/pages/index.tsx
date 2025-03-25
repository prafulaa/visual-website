import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import MoonPhase from '../components/MoonPhase';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white">
      <Head>
        <title>Cosmic Journey - Moon Phases and Space Exploration</title>
        <meta name="description" content="Explore the cosmos and moon phases with interactive visualizations" />
      </Head>
      
      <main className="container mx-auto px-4 pt-16 pb-20">
        <h1 className="text-5xl font-bold text-center mb-10">
          Cosmic Journey
        </h1>
        
        <div className="flex flex-col md:flex-row gap-10 items-center justify-center mb-16">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">
              Explore the Moon Phases
            </h2>
            <p className="text-xl mb-6">
              Visualize the current moon phase or interact with our moon phase explorer.
              See how the moon changes throughout its lunar cycle.
            </p>
            <Link 
              href="/moon-phases" 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-medium transition-colors"
            >
              Moon Phase Explorer
            </Link>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
            <MoonPhase 
              size={180} 
              displayType="current"
              showLabel={true}
              showDetails={true}
              lightColor="#FFFDE7"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg hover:bg-opacity-70 transition-all">
            <h3 className="text-2xl font-bold mb-3">3D Cosmic Scene</h3>
            <p className="mb-4">Explore an interactive 3D visualization of Earth and its moon, complete with accurate moon phases.</p>
            <Link 
              href="/cosmic-scene" 
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Launch 3D Scene
            </Link>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg hover:bg-opacity-70 transition-all">
            <h3 className="text-2xl font-bold mb-3">Night Sky Visualization</h3>
            <p className="mb-4">View the moon phase and visible constellations for any date and location around the world.</p>
            <Link 
              href="/night-sky" 
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Your Night Sky
            </Link>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg hover:bg-opacity-70 transition-all">
            <h3 className="text-2xl font-bold mb-3">Moon Facts</h3>
            <p className="mb-4">Learn interesting facts about the moon, its relationship with Earth, and its impact on our planet.</p>
            <Link 
              href="/moon-phases" 
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Discover More
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="text-center py-8 text-gray-400 border-t border-gray-800">
        <p>Cosmic Journey © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Home; 