import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import RetroEarthLogo from './RetroEarthLogo';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);
  
  return (
    <nav className="bg-black/80 backdrop-blur-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <RetroEarthLogo size={40} interactive={false} />
            <span className="font-bold text-lg">Cosmic Journey</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-cosmic-blue transition-colors">
              Home
            </Link>
            <Link href="/interactive-demo" className="text-white hover:text-cosmic-blue transition-colors">
              Demo
            </Link>
            <a 
              href="https://github.com/yourusername/cosmic-journey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-cosmic-blue transition-colors"
            >
              GitHub
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 p-4 bg-black/90 rounded-lg">
            <Link 
              href="/"
              className="block text-white hover:text-cosmic-blue transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              href="/interactive-demo"
              className="block text-white hover:text-cosmic-blue transition-colors"
              onClick={toggleMenu}
            >
              Demo
            </Link>
            <a 
              href="https://github.com/yourusername/cosmic-journey"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white hover:text-cosmic-blue transition-colors"
              onClick={toggleMenu}
            >
              GitHub
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 