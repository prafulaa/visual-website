import { useEffect, useState, useMemo } from 'react';
import { getMoonPhase, getMoonPhaseByDay, getAllMoonPhases, MoonPhaseData } from '../utils/moonPhase';

interface MoonPhaseProps {
  size?: number;
  displayMode?: 'current' | 'specific' | 'all';
  displayType?: 'current' | 'specific' | 'all'; // Backward compatibility
  dayOfCycle?: number;
  interactive?: boolean;
  showLabel?: boolean;
  showDetails?: boolean;
  className?: string;
  phase?: string;
  illumination?: number;
  lightColor?: string;
  darkColor?: string;
}

/**
 * Moon Phase Component
 * Displays a moon in various phases either as current, specific day, or all phases
 */
export const MoonPhase: React.FC<MoonPhaseProps> = ({
  size = 150,
  displayMode,
  displayType = 'current',
  dayOfCycle = 0,
  interactive = false,
  showLabel = true,
  showDetails = false,
  className = '',
  phase,
  illumination,
  lightColor = '#FFFDE7',
  darkColor = '#121212',
}) => {
  // For backward compatibility
  const displayModeToUse = displayMode || displayType;
  
  const [moonData, setMoonData] = useState<MoonPhaseData | null>(null);
  const [allPhases, setAllPhases] = useState<MoonPhaseData[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [day, setDay] = useState<number>(dayOfCycle);

  useEffect(() => {
    // If phase and illumination are directly provided, use them
    if (phase && illumination !== undefined) {
      const emoji = getEmojiForPhase(phase);
      setMoonData({
        phase,
        illumination,
        emoji,
        age: dayOfCycle,
      });
      return;
    }
    
    if (displayModeToUse === 'current') {
      setMoonData(getMoonPhase());
    } else if (displayModeToUse === 'specific') {
      setMoonData(getMoonPhaseByDay(dayOfCycle));
    }

    if (displayModeToUse === 'all' || interactive) {
      setAllPhases(getAllMoonPhases());
    }
  }, [displayModeToUse, dayOfCycle, phase, illumination]);

  // Helper to get emoji based on phase name
  const getEmojiForPhase = (phaseName: string): string => {
    const phaseIndex = [
      'New Moon',
      'Waxing Crescent',
      'First Quarter',
      'Waxing Gibbous',
      'Full Moon',
      'Waning Gibbous',
      'Last Quarter',
      'Waning Crescent'
    ].indexOf(phaseName);
    
    return ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][phaseIndex >= 0 ? phaseIndex : 0];
  };

  // Update when day changes for interactive mode
  useEffect(() => {
    if (interactive) {
      setMoonData(getMoonPhaseByDay(day));
    }
  }, [day, interactive]);

  // Get CSS for a specific moon phase
  const getMoonPhaseCss = (phaseData: MoonPhaseData, moonSize: number) => {
    const { phase, illumination } = phaseData;
    
    // Each phase has a specific way it should be rendered
    switch (phase) {
      case 'New Moon':
        // Completely dark
        return {
          boxShadow: 'inset 0 0 0 0 ' + lightColor,
          backgroundColor: darkColor
        };
        
      case 'Full Moon':
        // Completely lit
        return {
          boxShadow: 'inset 0 0 0 0 ' + darkColor,
          backgroundColor: lightColor
        };
        
      case 'First Quarter':
        // Right half lit
        return {
          boxShadow: `inset ${-moonSize/2}px 0 0 0 ${lightColor}`,
          backgroundColor: darkColor
        };
        
      case 'Last Quarter':
        // Left half lit
        return {
          boxShadow: `inset ${moonSize/2}px 0 0 0 ${lightColor}`,
          backgroundColor: darkColor
        };
        
      case 'Waxing Crescent': {
        // Right side partially lit - amount based on illumination
        const shadowSize = Math.round(moonSize * (1 - illumination/100) / 2);
        return {
          boxShadow: `inset ${-shadowSize}px 0 0 0 ${lightColor}`,
          backgroundColor: darkColor
        };
      }
        
      case 'Waxing Gibbous': {
        // Left side partially dark - amount based on illumination
        const shadowSize = Math.round(moonSize * (illumination/100 - 0.5) / 2);
        return {
          boxShadow: `inset ${shadowSize}px 0 0 0 ${darkColor}`,
          backgroundColor: lightColor
        };
      }
        
      case 'Waning Gibbous': {
        // Right side partially dark - amount based on illumination
        const shadowSize = Math.round(moonSize * (illumination/100 - 0.5) / 2);
        return {
          boxShadow: `inset ${-shadowSize}px 0 0 0 ${darkColor}`,
          backgroundColor: lightColor
        };
      }
        
      case 'Waning Crescent': {
        // Left side partially lit - amount based on illumination
        const shadowSize = Math.round(moonSize * (1 - illumination/100) / 2);
        return {
          boxShadow: `inset ${shadowSize}px 0 0 0 ${lightColor}`,
          backgroundColor: darkColor
        };
      }
        
      default:
        // Fallback - show full moon
        return {
          boxShadow: 'inset 0 0 0 0 ' + darkColor,
          backgroundColor: lightColor
        };
    }
  };

  // Calculate the styling for current moon
  const moonStyle = useMemo(() => {
    if (!moonData) return {};
    return getMoonPhaseCss(moonData, size);
  }, [moonData, size, lightColor, darkColor]);

  // Handle interactive mode controls
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = parseFloat(e.target.value);
    setDay(newDay);
  };

  const handlePhaseSelect = (index: number) => {
    if (allPhases && allPhases[index]) {
      setSelectedPhase(index);
      setDay(allPhases[index].age);
      setMoonData(allPhases[index]);
    }
  };

  if (!moonData && displayModeToUse !== 'all') {
    return <div>Loading moon data...</div>;
  }

  return (
    <div className={`moon-phase-component ${className}`}>
      {displayModeToUse === 'all' ? (
        <div className="moon-phases-grid grid grid-cols-4 gap-4">
          {allPhases.map((phase, index) => (
            <div 
              key={index} 
              className="moon-phase-item flex flex-col items-center cursor-pointer"
              onClick={() => interactive && handlePhaseSelect(index)}
            >
              <div 
                className="moon rounded-full border border-gray-600 overflow-hidden shadow-lg transform hover:scale-105 transition-transform"
                style={{
                  width: size / 2,
                  height: size / 2,
                  ...getMoonPhaseCss(phase, size / 2)
                }}
              />
              {showLabel && (
                <div className="text-center mt-2">
                  <div className="text-sm font-medium">{phase.phase}</div>
                  {showDetails && (
                    <div className="text-xs opacity-75">
                      {phase.illumination.toFixed(0)}% illuminated
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="single-moon-display flex flex-col items-center">
          <div 
            className="moon rounded-full border border-gray-600 overflow-hidden shadow-lg transform hover:scale-105 transition-transform"
            style={{
              width: size,
              height: size,
              ...moonStyle
            }}
          />
          
          {showLabel && moonData && (
            <div className="text-center mt-4">
              <div className="text-lg font-medium">{moonData.phase} {moonData.emoji}</div>
              {showDetails && (
                <div className="mt-2 text-sm opacity-75">
                  <div>{moonData.illumination.toFixed(1)}% illuminated</div>
                  <div>Age: {moonData.age.toFixed(1)} days</div>
                </div>
              )}
            </div>
          )}
          
          {interactive && (
            <div className="controls mt-6 w-full max-w-md">
              <label className="block text-sm font-medium mb-2">
                Moon Age: {day.toFixed(1)} days
              </label>
              <input
                type="range"
                min="0"
                max="29.5"
                step="0.1"
                value={day}
                onChange={handleDayChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="moon-phase-buttons flex flex-wrap gap-2 mt-4">
                {allPhases.map((phase, index) => (
                  <button
                    key={index}
                    onClick={() => handlePhaseSelect(index)}
                    className={`px-3 py-1 text-xs rounded ${selectedPhase === index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {phase.emoji} {phase.phase}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoonPhase; 