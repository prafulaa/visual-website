import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import StarViz from './StarViz';

interface StarMapResponse {
  date: string;
  formattedDate: string;
  location?: string;
  constellations: string[];
  planets: {
    name: string;
    position: string;
    magnitude?: number;
    isVisible: boolean;
  }[];
  moonPhase: {
    name: string;
    illumination: number;
    emoji: string;
    svgPath?: string;
  };
  starMapSvg?: string;
}

interface PlanetData {
  name: string;
  position: string;
  magnitude?: number;
  isVisible: boolean;
}

// Cache for known locations to avoid recalculating coordinates
const knownLocations: Record<string, {latitude: number; longitude: number}> = {
  'new york': { latitude: 40.7128, longitude: -74.0060 },
  'london': { latitude: 51.5074, longitude: -0.1278 },
  'tokyo': { latitude: 35.6762, longitude: 139.6503 },
  'sydney': { latitude: -33.8688, longitude: 151.2093 },
  'paris': { latitude: 48.8566, longitude: 2.3522 },
  'chitwan': { latitude: 27.5291, longitude: 84.3542 },
  'nepal': { latitude: 28.3949, longitude: 84.1240 },
};

const StargazerForm: React.FC = () => {
  const [birthday, setBirthday] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [moonLightColor, setMoonLightColor] = useState<string>("#FFFDE7");
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [starMapData, setStarMapData] = useState<StarMapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const colorChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Parse coordinates from location - memoized to prevent unnecessary recalculation
  const getCoordinates = useCallback(async (locationString: string): Promise<{latitude: number; longitude: number}> => {
    // Check for direct coordinate input
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = locationString.match(coordRegex);
    
    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[3])
      };
    }
    
    // Check if location matches any known city
    const normalizedLocation = locationString.toLowerCase().trim();
    for (const [key, coords] of Object.entries(knownLocations)) {
      if (normalizedLocation.includes(key)) {
        return coords;
      }
    }
    
    // Default coordinates if location not found (use center of US as fallback)
    return { latitude: 39.8283, longitude: -98.5795 };
  }, []);

  // Effect to scroll results into view when displayed
  useEffect(() => {
    if (hasSubmitted && resultRef.current) {
      resultRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }, [hasSubmitted]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthday || !location) {
      setError('Please enter both birthday and location');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get coordinates from location
      const coords = await getCoordinates(location);
      setCoordinates(coords);
      
      // Ensure the date is preserved as-is without timezone conversion
      // The date format from the input field is already YYYY-MM-DD
      
      // Call the star map API with the date and coordinates
      const response = await fetch('/api/astronomy/star-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: birthday, // This is already in YYYY-MM-DD format from the input
          latitude: coords.latitude,
          longitude: coords.longitude,
          location: location,
          moonLightColor: moonLightColor
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data: StarMapResponse = await response.json();
      
      // Add a small delay before showing results to ensure smooth transition
      setTimeout(() => {
        setStarMapData(data);
        setHasSubmitted(true);
        setLoading(false);
      }, 100);
      
    } catch (err) {
      console.error('Error fetching star map:', err);
      setError('Failed to generate star map. Please try again.');
      setLoading(false);
    }
  }, [birthday, location, moonLightColor, getCoordinates]);

  const resetForm = useCallback(() => {
    // Create smooth transition when resetting
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Slight delay to allow for smooth transition
    setTimeout(() => {
      setHasSubmitted(false);
      setStarMapData(null);
      setBirthday('');
      setLocation('');
      setCoordinates(null);
      setError(null);
      setMoonLightColor("#FFFDE7"); // Reset to default color
    }, 300);
  }, []);

  // Debounced moon color updates to prevent too many API calls
  const handleMoonColorChange = useCallback((color: string) => {
    setMoonLightColor(color);
    
    // If we've already submitted, debounce the API call
    if (hasSubmitted && starMapData && coordinates) {
      // Clear existing timeout
      if (colorChangeTimeout.current) {
        clearTimeout(colorChangeTimeout.current);
      }
      
      // Set new timeout for 300ms debounce
      colorChangeTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/astronomy/star-map', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: birthday,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              location: location,
              moonLightColor: color
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          
          const data: StarMapResponse = await response.json();
          setStarMapData(data);
        } catch (err) {
          console.error('Error updating moon color:', err);
          // Don't show error to user for color changes
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  }, [hasSubmitted, starMapData, coordinates, birthday, location]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (colorChangeTimeout.current) {
        clearTimeout(colorChangeTimeout.current);
      }
    };
  }, []);

  // Memoize planet rendering to reduce re-renders when only the moon color changes
  const planetsList = useMemo(() => {
    if (!starMapData) return null;
    
    const visiblePlanets = starMapData.planets.filter(p => p.isVisible);
    
    if (visiblePlanets.length === 0) {
      return <li className="text-gray-400">No planets are visible at this time</li>;
    }
    
    return visiblePlanets.map((planet: PlanetData, index: number) => (
      <li key={index} className="flex items-start">
        <div 
          className={`w-3 h-3 rounded-full mt-1.5 mr-3 flex-shrink-0 ${
            planet.name === 'Venus' ? 'bg-yellow-300' :
            planet.name === 'Mars' ? 'bg-red-500' :
            planet.name === 'Jupiter' ? 'bg-orange-300' :
            planet.name === 'Saturn' ? 'bg-yellow-600' :
            planet.name === 'Mercury' ? 'bg-gray-400' :
            'bg-blue-400'
          }`}
        ></div>
        <div>
          <div className="flex items-center">
            <span className="text-white font-medium">{planet.name}</span>
            {planet.magnitude !== undefined && (
              <span className="text-gray-400 text-xs ml-2">
                (Magnitude: {planet.magnitude.toFixed(1)})
              </span>
            )}
          </div>
          <span className="text-gray-300 text-sm">{planet.position}</span>
        </div>
      </li>
    ));
  }, [starMapData]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!hasSubmitted ? (
          <motion.div
            key="form"
            ref={formRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.25, 0.1, 0.25, 1] 
            }}
          >
            <h3 className="text-2xl font-heading text-white text-center mb-6">
              Your Personal Star Map
            </h3>
            <p className="text-gray-300 text-center mb-8">
              Enter your birthday and location to see the night sky exactly as it appeared when you were born.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Birthday
                </label>
                <input
                  type="date"
                  id="birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-2 bg-space-navy/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-space-blue"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New York, USA"
                  className="w-full px-4 py-2 bg-space-navy/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-space-blue"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter a city name or coordinates (latitude,longitude)
                </p>
              </div>
              
              <div>
                <label htmlFor="moonColor" className="block text-sm font-medium text-gray-300 mb-1">
                  Moon Light Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="moonColor"
                    value={moonLightColor}
                    onChange={(e) => setMoonLightColor(e.target.value)}
                    className="h-8 w-16 rounded mr-3 cursor-pointer bg-transparent"
                  />
                  <span className="text-sm text-gray-400">Customize the moon's light color</span>
                </div>
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button
                type="submit"
                className="w-full mt-6 px-6 py-3 bg-space-blue text-white font-medium rounded-lg transition-all hover:bg-opacity-90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Star Map...
                  </span>
                ) : (
                  'Show My Star Map'
                )}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.1, 0.25, 1],
              staggerChildren: 0.1 
            }}
            className="bg-space-navy/30 backdrop-blur-sm rounded-lg p-6 border border-white/10 relative"
          >
            <div className="flex justify-between items-start mb-4">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-heading text-white"
              >
                Your Night Sky
              </motion.h3>
              <motion.button
                onClick={resetForm}
                className="text-sm text-gray-400 hover:text-white"
                whileHover={{ scale: 1.05 }}
              >
                New Search
              </motion.button>
            </div>
            
            {/* Loading indicator for color changes */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded-lg"
                >
                  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* StarViz Component with moon color customization */}
            {starMapData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <StarViz
                  starMapSvg={starMapData.starMapSvg}
                  moonPhase={starMapData.moonPhase}
                  date={starMapData.formattedDate}
                  constellations={starMapData.constellations}
                  location={starMapData.location}
                  moonLightColor={moonLightColor}
                  onMoonColorChange={handleMoonColorChange}
                />
              </motion.div>
            )}
            
            {/* Planet Information */}
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-lg font-heading text-white mb-2">Visible Planets</h4>
              <div className="bg-space-navy/50 rounded-lg p-4">
                <ul className="space-y-3">
                  {planetsList}
                </ul>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-6 pt-6 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {coordinates && (
                <p className="text-sm text-gray-400 mb-2">
                  <span className="font-medium">Coordinates used:</span> {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
                </p>
              )}
              <p className="text-sm text-gray-400">
                This visualization shows the night sky as it would have appeared on your birthdate from your location. 
                For the most accurate results, please provide specific coordinates if known.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(StargazerForm); 