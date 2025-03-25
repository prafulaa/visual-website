import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MoonPhase from '../components/MoonPhase';
import { getMoonPhase, getMoonPhaseByDay, getAllMoonPhases, MoonPhaseData } from '../utils/moonPhase';

// Dynamically import MoonPhaseCycle with SSR disabled to avoid window reference issues
const MoonPhaseCycle = dynamic(() => import('../components/MoonPhaseCycle'), {
  ssr: false,
});

// Memoized component for moon phase info cards
const MoonPhaseInfoCard = React.memo(({ info }: { info: any }) => (
  <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
    <h4 className="text-lg font-medium mb-2">{info.name}</h4>
    <p className="text-sm mb-2">{info.description}</p>
    <p className="text-sm mb-1"><span className="font-medium">Illumination:</span> {info.illumination}</p>
    <p className="text-sm"><span className="font-medium">Cultural Significance:</span> {info.effect}</p>
  </div>
));

// Memoized calendar day component
const CalendarDay = React.memo(({ day }: { day: any }) => {
  if (!day) return <div className="aspect-square p-1"></div>;
  
  return (
    <div className={`aspect-square p-1 text-center ${
      day.isToday 
        ? 'bg-blue-700 bg-opacity-50 rounded' 
        : 'hover:bg-gray-800 rounded'
    }`}>
      <div className="text-sm mb-1">{day.day}</div>
      {day.moonPhase && (
        <div className="mx-auto w-6 h-6">
          <MoonPhase
            size={24}
            phase={day.moonPhase.phase}
            illumination={day.moonPhase.illumination}
            showLabel={false}
          />
        </div>
      )}
    </div>
  );
});

const MoonPhasesPage: React.FC = () => {
  // State for the moon phase slider
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [showAllPhases, setShowAllPhases] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);
  const [selectedCyclePhase, setSelectedCyclePhase] = useState<string | null>(null);
  const [lightColor, setLightColor] = useState<string>('#FFFDE7');
  
  // Current real-time moon data - memoized to prevent recalculations
  const realTimeMoon = useMemo(() => getMoonPhase(), []);
  
  // Calculate the selected moon phase based on the day offset
  const selectedMoonPhase = useMemo(() => {
    if (selectedCyclePhase) {
      const allPhases = getAllMoonPhases();
      const selected = allPhases.find(phase => phase.phase === selectedCyclePhase);
      if (selected) return selected;
    }
    
    if (selectedDay === 0) {
      return realTimeMoon;
    }
    return getMoonPhaseByDay(selectedDay);
  }, [selectedDay, realTimeMoon, selectedCyclePhase]);
  
  // Handle slider change
  const handleDayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDay(parseInt(e.target.value));
    setSelectedCyclePhase(null);
  }, []);
  
  // Auto-rotate moon phases
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setSelectedDay(prev => (prev + 1) % 30);
      setSelectedCyclePhase(null);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoRotate]);
  
  // Handle phase click in the cycle
  const handlePhaseClick = useCallback((phase: MoonPhaseData) => {
    setSelectedCyclePhase(phase.phase);
    setSelectedDay(0); // Reset day slider
  }, []);
  
  // Handle light color change
  const handleLightColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLightColor(e.target.value);
  }, []);
  
  // All major moon phases with descriptions - only created once
  const moonPhaseInfo = useMemo(() => {
    return [
      {
        name: "New Moon",
        description: "The Moon is positioned between the Earth and Sun, with the side facing us receiving no direct sunlight. The Moon is nearly invisible.",
        illumination: "0%",
        effect: "Lowest tides, good for new beginnings and setting intentions."
      },
      {
        name: "Waxing Crescent",
        description: "A sliver of the Moon becomes visible as it waxes (grows) towards the First Quarter.",
        illumination: "1-49%",
        effect: "Time for growth, creation, and manifestation. Plant seeds both literally and metaphorically."
      },
      {
        name: "First Quarter",
        description: "Half of the Moon appears illuminated as viewed from Earth. This is a turning point in the lunar cycle.",
        illumination: "50%",
        effect: "Time for decision making and taking action. Overcome obstacles and push forward."
      },
      {
        name: "Waxing Gibbous",
        description: "The illuminated portion continues to grow, now covering more than half of the visible surface.",
        illumination: "51-99%",
        effect: "Time for refinement and perseverance. Continue efforts and adjust as needed."
      },
      {
        name: "Full Moon",
        description: "The entire disk of the Moon is illuminated as the Moon is positioned opposite the Sun, with Earth in between.",
        illumination: "100%",
        effect: "Peak energy and culmination. Time for celebration, completion, and illumination of truth."
      },
      {
        name: "Waning Gibbous",
        description: "The illuminated portion begins to decrease (wane) after the Full Moon phase.",
        illumination: "99-51%",
        effect: "Time for gratitude, sharing, and teaching others. Distribute the abundance."
      },
      {
        name: "Last Quarter",
        description: "Half of the Moon appears illuminated, but the opposite half from the First Quarter.",
        illumination: "50%",
        effect: "Time for reflection and release. Let go of what no longer serves you."
      },
      {
        name: "Waning Crescent",
        description: "Only a small crescent remains illuminated as the Moon approaches the New Moon phase again.",
        illumination: "49-1%",
        effect: "Time for surrender, rest, and recuperation. Prepare for the next cycle."
      },
    ];
  }, []);
  
  // Calendar view - memoized to prevent recalculation during scrolling
  const calendarView = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDay = firstDay.getDay(); // Day of week (0-6)
    
    // Get the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Get all moon phases for the month
    const monthMoonPhases = getAllMoonPhases(currentYear, currentMonth);
    
    // Generate calendar days
    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null); // Empty cells for days before month starts
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const moonPhase = monthMoonPhases.find(mp => 
        mp.date && mp.date.getDate() === day
      );
      calendarDays.push({
        day,
        moonPhase,
        isToday: day === today.getDate()
      });
    }
    
    return {
      month: today.toLocaleString('default', { month: 'long' }),
      year: currentYear,
      days: calendarDays
    };
  }, []);

  // Get the selected info for the current phase
  const selectedPhaseInfo = useMemo(() => {
    return moonPhaseInfo.find(info => info.name === selectedMoonPhase.phase);
  }, [selectedMoonPhase.phase, moonPhaseInfo]);
  
  // Get the selected info for the cycle phase
  const selectedCyclePhaseInfo = useMemo(() => {
    if (!selectedCyclePhase) return null;
    return moonPhaseInfo.find(info => info.name === selectedCyclePhase);
  }, [selectedCyclePhase, moonPhaseInfo]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 text-white">
      <Head>
        <title>Moon Phases Explorer | Cosmic Journey</title>
        <meta name="description" content="Explore the phases of the moon and learn about their significance" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center mb-8 text-blue-300 hover:text-blue-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1.0001 1.0001 0 01-1.414 0l-6-6a1.0001 1.0001 0 010-1.414l6-6a1.0001 1.0001 0 011.414 1.414L5.414 9H17a1.0001 1.0001 0 110 2H5.414l4.293 4.293a1.0001 1.0001 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">
          Moon Phases Explorer
        </h1>
        <p className="text-center text-blue-200 mb-8 max-w-3xl mx-auto">
          Discover the beauty and science behind the moon's changing appearance as it orbits Earth.
        </p>
        
        {/* Current Moon Section */}
        <section className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Today's Moon</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 relative flex-shrink-0">
              <MoonPhase
                size={180}
                phase={realTimeMoon.phase}
                illumination={realTimeMoon.illumination}
                showLabel={false}
                lightColor={lightColor}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl mb-2">{realTimeMoon.emoji} {realTimeMoon.phase}</h3>
              <p className="text-gray-300 mb-4">
                The moon is currently {realTimeMoon.illumination.toFixed(1)}% illuminated and is {' '}
                {realTimeMoon.age.toFixed(1)} days into its lunar cycle.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800 bg-opacity-50 p-3 rounded">
                  <h4 className="font-medium mb-1">Next Full Moon</h4>
                  <p>{realTimeMoon.nextFullMoon}</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 p-3 rounded">
                  <h4 className="font-medium mb-1">Next New Moon</h4>
                  <p>{realTimeMoon.nextNewMoon}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Moon Phase Cycle Visualization */}
        <section className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Moon Phase Cycle</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Customize Moon Light Color:
            </label>
            <input 
              type="color" 
              value={lightColor} 
              onChange={handleLightColorChange}
              className="h-8 w-24 cursor-pointer rounded"
            />
          </div>
          
          <div className="flex justify-center mb-6">
            {typeof window !== 'undefined' && (
              <MoonPhaseCycle 
                size={400}
                onPhaseClick={handlePhaseClick}
                lightColor={lightColor}
              />
            )}
          </div>
          
          {selectedCyclePhaseInfo && (
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg mt-4 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-2">{selectedCyclePhase}</h3>
              <p className="text-sm mb-3">
                {selectedCyclePhaseInfo.description}
              </p>
              <p className="text-sm">
                <span className="font-medium">Cultural Significance:</span>{' '}
                {selectedCyclePhaseInfo.effect}
              </p>
            </div>
          )}
        </section>
        
        {/* Interactive Moon Slider */}
        <section className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Explore Moon Phases</h2>
            <div className="space-x-4">
              <button 
                onClick={() => setShowAllPhases(!showAllPhases)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                {showAllPhases ? "Show Single Phase" : "Show All Phases"}
              </button>
              <button 
                onClick={() => setAutoRotate(!autoRotate)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
              >
                {autoRotate ? "Stop Animation" : "Animate Phases"}
              </button>
            </div>
          </div>
          
          {!showAllPhases ? (
            <>
              <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                <div className="w-48 h-48 relative flex-shrink-0">
                  <MoonPhase 
                    size={180}
                    phase={selectedMoonPhase.phase}
                    illumination={selectedMoonPhase.illumination}
                    showLabel={false}
                    lightColor={lightColor}
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl mb-2">{selectedMoonPhase.emoji} {selectedMoonPhase.phase}</h3>
                  <p className="text-gray-300 mb-4">
                    {selectedCyclePhase ? 'Selected from cycle above' : 
                      (selectedDay === 0 ? 'Current phase' : `Moon phase ${selectedDay > 0 ? selectedDay + ' days from now' : Math.abs(selectedDay) + ' days ago'}`)}
                  </p>
                  <p className="text-gray-300 mb-4">
                    Illumination: {selectedMoonPhase.illumination.toFixed(1)}%
                  </p>
                  
                  {/* Phase-specific information */}
                  {selectedPhaseInfo && (
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded text-sm">
                      <p>{selectedPhaseInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <label htmlFor="daySlider" className="block text-sm font-medium mb-2">
                  Adjust days from current date: {selectedDay}
                </label>
                <input
                  type="range"
                  id="daySlider"
                  min="-14"
                  max="14"
                  value={selectedDay}
                  onChange={handleDayChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2 weeks ago</span>
                  <span>Today</span>
                  <span>2 weeks ahead</span>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MoonPhase displayMode="all" lightColor={lightColor} />
            </div>
          )}
        </section>
        
        {/* Educational Content Toggle */}
        <section className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <button 
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className="w-full flex justify-between items-center text-left"
          >
            <h2 className="text-2xl font-semibold">Learn About Moon Phases</h2>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 transition-transform duration-300 ${showEducationalContent ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showEducationalContent && (
            <div className="mt-6 space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-medium mb-3">Why Does the Moon Have Phases?</h3>
                <p className="mb-3">
                  The Moon doesn't produce its own light but reflects sunlight. As the Moon orbits Earth, 
                  different portions of its sunlit side are visible from our perspective, creating the phases we see.
                </p>
                <p className="mb-3">
                  A complete lunar cycle takes approximately 29.5 days, during which the Moon passes through eight distinct phases.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moonPhaseInfo.map((info, index) => (
                  <MoonPhaseInfoCard key={info.name} info={info} />
                ))}
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-3">Fun Facts About the Moon</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>The Moon is moving approximately 3.8 cm away from Earth every year.</li>
                  <li>The Moon's gravity is responsible for creating ocean tides on Earth.</li>
                  <li>A person would weigh about 16.5% on the Moon compared to their weight on Earth.</li>
                  <li>The Moon has an extremely thin atmosphere called an exosphere.</li>
                  <li>The same side of the Moon always faces Earth due to tidal locking.</li>
                </ul>
              </div>
            </div>
          )}
        </section>
        
        {/* Lunar Calendar Section */}
        <section className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Lunar Calendar: {calendarView.month} {calendarView.year}</h2>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-medium text-gray-400 text-sm py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarView.days.map((day, i) => (
              <CalendarDay key={i} day={day} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MoonPhasesPage; 