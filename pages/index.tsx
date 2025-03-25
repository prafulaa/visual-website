import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Dynamically import Three.js components to avoid SSR issues
const CosmicScene = dynamic(() => import('@/components/CosmicScene'), {
  ssr: false,
  loading: () => <div className="cosmic-loader" />
});

const StargazerForm = dynamic(() => import('@/components/StargazerForm'), {
  ssr: false,
});

const LiveUpdates = dynamic(() => import('@/components/LiveUpdates'), {
  ssr: false,
});

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState('earth');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const position = window.scrollY;
        setScrollPosition(position);
        
        // Determine current section based on scroll position
        if (position < 1000) {
          setCurrentSection('earth');
        } else if (position < 3000) {
          setCurrentSection('solar-system');
        } else if (position < 6000) {
          setCurrentSection('galaxy');
        } else {
          setCurrentSection('universe');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen bg-space-black overflow-hidden">
      <Head>
        <title>Cosmic Journey | Interactive Universe Explorer</title>
        <meta name="description" content="Explore the universe from Earth to the cosmos in an interactive scrolling experience" />
      </Head>

      <CosmicScene currentSection={currentSection} scrollPosition={scrollPosition} />
      
      <Navbar currentSection={currentSection} />
      
      <main className="relative z-10">
        {/* Earth Section */}
        <section id="earth" className="min-h-screen flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6">
              Begin Your <span className="text-space-blue">Cosmic</span> Journey
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Scroll to travel from Earth through the solar system, into the Milky Way 
              galaxy, and beyond to the edge of the observable universe.
            </p>
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-10"
            >
              <p className="text-white/70">Scroll to begin</p>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 mx-auto mt-2 text-white/50" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* Solar System Section */}
        <section id="solar-system" className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 text-center"
            >
              Our Solar System
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-xl text-gray-300 mb-8 text-center"
            >
              Explore the planets, moons, asteroids, and comets that orbit our sun.
            </motion.p>
            <div className="my-16">
              <StargazerForm />
            </div>
          </div>
        </section>

        {/* Galaxy Section */}
        <section id="galaxy" className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 text-center"
            >
              The Milky Way Galaxy
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-xl text-gray-300 mb-8 text-center"
            >
              Venture beyond our solar system to explore the vast spiral galaxy we call home.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="bg-space-navy/30 backdrop-blur-sm rounded-lg p-8 border border-white/10"
            >
              <h3 className="text-2xl font-heading text-white mb-4">Latest Discoveries</h3>
              <LiveUpdates />
            </motion.div>
          </div>
        </section>

        {/* Universe Section */}
        <section id="universe" className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 text-center"
            >
              The Vast Universe
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="text-xl text-gray-300 mb-8 text-center"
            >
              Journey to the edge of the observable universe and contemplate the cosmic web.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                className="bg-space-navy/30 backdrop-blur-sm rounded-lg p-6 border border-white/10"
              >
                <h3 className="text-xl font-heading text-white mb-3">The Observable Universe</h3>
                <p className="text-gray-300">
                  The observable universe is 93 billion light-years in diameter, containing 
                  approximately 2 trillion galaxies with billions of stars each.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                className="bg-space-navy/30 backdrop-blur-sm rounded-lg p-6 border border-white/10"
              >
                <h3 className="text-xl font-heading text-white mb-3">The Cosmic Web</h3>
                <p className="text-gray-300">
                  Galaxies are not randomly distributed but form a vast cosmic web, with 
                  dense clusters connected by filaments and separated by enormous voids.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 