import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MoonPhase from '../components/MoonPhase';
import { getMoonPhase, getMoonPhaseByDay } from '../utils/moonPhase';

// For demo purposes - simulated constellation data
const CONSTELLATIONS = [
  { id: 'ursa-major', name: 'Ursa Major', visible: true },
  { id: 'ursa-minor', name: 'Ursa Minor', visible: true },
  { id: 'orion', name: 'Orion', visible: true },
  { id: 'cassiopeia', name: 'Cassiopeia', visible: true },
  { id: 'draco', name: 'Draco', visible: true },
  { id: 'crux', name: 'Crux', visible: true },
];

const NightSkyPage: React.FC = () => {
  // State for the date and location
  const [date, setDate] = useState<string>('2023-05-15');
  const [location, setLocation] = useState<string>('Kathmandu, Nepal');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [lightColor, setLightColor] = useState<string>('#FFFDE7');
  
  // Convert the selected date to a Date object
  const selectedDate = useMemo(() => {
    return new Date(date);
  }, [date]);
  
  // Calculate days from current date to get the moon phase
  const daysFromNow = useMemo(() => {
    const today = new Date();
    const diffTime = selectedDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }, [selectedDate]);
  
  // Get the moon phase for the selected date
  const moonPhaseData = useMemo(() => {
    if (daysFromNow === 0) {
      return getMoonPhase();
    }
    return getMoonPhaseByDay(daysFromNow);
  }, [daysFromNow]);
  
  // Format date for display
  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  }, [selectedDate]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearch(false);
  };
  
  // Handle light color change
  const handleLightColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLightColor(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-[#0B1026] text-white">
      <Head>
        <title>Your Night Sky | Cosmic Journey</title>
        <meta name="description" content="Visualize the night sky for any location and date" />
      </Head>
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-blue-300 hover:text-blue-100 transition-colors">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </span>
          </Link>
          
          <h1 className="text-2xl font-bold">Your Night Sky</h1>
          
          <button 
            onClick={() => setShowSearch(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            New Search
          </button>
        </div>
        
        {showSearch ? (
          <div className="bg-[#121A35] rounded-lg p-6 mb-8 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Search Night Sky</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0B1026] border border-gray-700 rounded-md px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full bg-[#0B1026] border border-gray-700 rounded-md px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="moonColor" className="block text-sm font-medium mb-1">Moon Light Color</label>
                  <input
                    type="color"
                    id="moonColor"
                    value={lightColor}
                    onChange={handleLightColorChange}
                    className="w-24 h-8 cursor-pointer rounded"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Show Night Sky
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="bg-[#121A35] rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 text-indigo-300">
                <div className="flex items-center mb-4 sm:mb-0">
                  <span className="font-medium mr-2">Date:</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Location:</span>
                  <span>{location}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Moon Phase Card */}
                <div className="bg-[#13203F] rounded-lg p-6 flex flex-col items-center">
                  <h2 className="text-lg font-semibold mb-4">Moon Phase</h2>
                  
                  <div className="mb-4">
                    <MoonPhase
                      size={150}
                      phase={moonPhaseData.phase}
                      illumination={moonPhaseData.illumination}
                      showLabel={false}
                      lightColor={lightColor}
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{moonPhaseData.phase}</h3>
                  <p className="text-indigo-300 text-center">{moonPhaseData.illumination.toFixed(0)}% illuminated</p>
                </div>
                
                {/* Star Map Card */}
                <div className="bg-[#13203F] rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Star Map</h2>
                  
                  <div className="aspect-square relative bg-black rounded-lg overflow-hidden">
                    {/* Star field background */}
                    <div 
                      className="absolute inset-0" 
                      style={{
                        backgroundImage: `radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px)`,
                        backgroundSize: '50px 50px',
                        backgroundPosition: '0 0, 25px 25px'
                      }}
                    />
                    
                    {/* Constellations (simplified demo) */}
                    <svg 
                      width="100%" 
                      height="100%" 
                      viewBox="0 0 400 400" 
                      className="absolute inset-0"
                    >
                      {/* Ursa Major */}
                      <g>
                        <text x="165" y="40" fill="white" fontSize="12">Ursa Major</text>
                        <circle cx="150" cy="50" r="3" fill="white" />
                        <circle cx="170" cy="65" r="3" fill="white" />
                        <circle cx="190" cy="55" r="3" fill="white" />
                        <circle cx="210" cy="70" r="3" fill="white" />
                        <line x1="150" y1="50" x2="170" y2="65" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="170" y1="65" x2="190" y2="55" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="190" y1="55" x2="210" y2="70" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                      </g>
                      
                      {/* Orion */}
                      <g>
                        <text x="330" y="70" fill="white" fontSize="12">Orion</text>
                        <circle cx="320" cy="80" r="3" fill="white" />
                        <circle cx="350" cy="100" r="3" fill="white" />
                        <circle cx="370" cy="120" r="3" fill="white" />
                        <line x1="320" y1="80" x2="350" y2="100" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="350" y1="100" x2="370" y2="120" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                      </g>
                      
                      {/* Cassiopeia */}
                      <g>
                        <text x="120" y="135" fill="white" fontSize="12">Cassiopeia</text>
                        <circle cx="100" cy="150" r="3" fill="white" />
                        <circle cx="120" cy="160" r="3" fill="white" />
                        <circle cx="140" cy="150" r="3" fill="white" />
                        <circle cx="160" cy="165" r="3" fill="white" />
                        <line x1="100" y1="150" x2="120" y2="160" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="120" y1="160" x2="140" y2="150" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="140" y1="150" x2="160" y2="165" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                      </g>
                      
                      {/* Draco */}
                      <g>
                        <text x="80" y="185" fill="white" fontSize="12">Draco</text>
                        <circle cx="70" cy="200" r="3" fill="white" />
                        <circle cx="90" cy="220" r="3" fill="white" />
                        <circle cx="110" cy="210" r="3" fill="white" />
                        <line x1="70" y1="200" x2="90" y2="220" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="90" y1="220" x2="110" y2="210" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                      </g>
                      
                      {/* Crux */}
                      <g>
                        <text x="300" y="350" fill="white" fontSize="12">Crux</text>
                        <circle cx="290" cy="320" r="3" fill="white" />
                        <circle cx="310" cy="340" r="3" fill="white" />
                        <circle cx="330" cy="320" r="3" fill="white" />
                        <line x1="290" y1="320" x2="310" y2="340" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                        <line x1="310" y1="340" x2="330" y2="320" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visible Constellations */}
            <div className="bg-[#121A35] rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Visible Constellations</h2>
              
              <div className="flex flex-wrap gap-3">
                {CONSTELLATIONS.filter(c => c.visible).map(constellation => (
                  <div 
                    key={constellation.id} 
                    className="bg-[#13203F] hover:bg-blue-900 transition-colors rounded-full px-5 py-2 flex items-center text-sm"
                  >
                    <span>{constellation.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NightSkyPage; 