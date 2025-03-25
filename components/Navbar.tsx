import React from 'react';
import { motion } from 'framer-motion';
import RetroEarthLogo from './RetroEarthLogo';

interface NavbarProps {
  currentSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentSection }) => {
  const sections = [
    { id: 'earth', label: 'Earth' },
    { id: 'solar-system', label: 'Solar System' },
    { id: 'galaxy', label: 'Galaxy' },
    { id: 'universe', label: 'Universe' },
  ];

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
      className="fixed top-0 left-0 right-0 z-50 p-4 bg-space-black/30 backdrop-blur-md"
    >
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavClick('earth')}
        >
          <RetroEarthLogo size={40} animated={true} />
          
          <span className="text-2xl font-heading font-bold text-white">
            <span className="text-space-blue">C</span>osmic <span className="text-space-blue">J</span>ourney
          </span>
        </motion.div>
        
        <div className="hidden md:flex space-x-8">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`relative text-sm uppercase tracking-wider ${
                currentSection === section.id ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {section.label}
              {currentSection === section.id && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-space-blue"
                />
              )}
            </motion.button>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden text-white"
          aria-label="Menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar; 