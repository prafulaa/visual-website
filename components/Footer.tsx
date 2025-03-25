import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-space-black/80 backdrop-blur-md border-t border-white/10 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-heading font-bold text-white">
              <span className="text-space-blue">C</span>osmic <span className="text-space-blue">J</span>ourney
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              An interactive journey through the universe
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
            <div>
              <h4 className="text-sm font-semibold uppercase text-white tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors">
                    NASA
                  </a>
                </li>
                <li>
                  <a href="https://www.esa.int/" target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition-colors">
                    ESA
                  </a>
                </li>
                <li>
                  <a href="https://hubblesite.org/" target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition-colors">
                    Hubble
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase text-white tracking-wider mb-4">Discover</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#earth" className="text-gray-400 hover:text-white transition-colors">
                    Earth View
                  </a>
                </li>
                <li>
                  <a href="#solar-system" className="text-gray-400 hover:text-white transition-colors">
                    Solar System
                  </a>
                </li>
                <li>
                  <a href="#galaxy" className="text-gray-400 hover:text-white transition-colors">
                    Milky Way
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Cosmic Journey. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <motion.a 
              href="#" 
              className="text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </motion.a>
            <motion.a 
              href="#" 
              className="text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 