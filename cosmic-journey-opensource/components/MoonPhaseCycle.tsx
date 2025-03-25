import React, { useState, useMemo } from 'react';
import { getAllMoonPhases, MoonPhaseData } from '../utils/moonPhase';
import MoonPhase from './MoonPhase';

interface MoonPhaseCycleProps {
  size?: number;
  highlightCurrent?: boolean;
  onPhaseClick?: (phase: MoonPhaseData) => void;
  backgroundColor?: string;
  lightColor?: string;
  darkColor?: string;
}

const MoonPhaseCycle: React.FC<MoonPhaseCycleProps> = ({
  size = 500,
  highlightCurrent = true,
  onPhaseClick,
  backgroundColor = '#0b3661',
  lightColor = '#FFFDE7',
  darkColor = '#121212'
}) => {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  
  // Get all moon phases
  const moonPhases = useMemo(() => getAllMoonPhases(), []);
  
  // Get current moon phase for highlighting
  const currentPhase = useMemo(() => {
    const today = new Date();
    const currentData = moonPhases.find(
      phase => phase.phase === moonPhases[0].phase
    );
    return moonPhases.findIndex(phase => phase.phase === currentData?.phase);
  }, [moonPhases]);
  
  // Calculate positions for each phase
  const phasePositions = useMemo(() => {
    const positions = [];
    const totalPhases = moonPhases.length;
    const radius = size / 2 - 60; // Leave room for labels
    
    for (let i = 0; i < totalPhases; i++) {
      // Calculate angle (starting from top and going clockwise)
      const angle = (i * 2 * Math.PI / totalPhases) - Math.PI / 2;
      
      positions.push({
        x: Math.cos(angle) * radius + size / 2,
        y: Math.sin(angle) * radius + size / 2,
        angle: angle
      });
    }
    
    return positions;
  }, [moonPhases.length, size]);
  
  return (
    <div 
      className="moon-phase-cycle relative"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: backgroundColor,
        borderRadius: '50%',
        position: 'relative',
        margin: '0 auto'
      }}
    >
      {/* Center orbital path */}
      <div 
        className="orbital-path absolute"
        style={{
          width: size - 120,
          height: size - 120,
          top: 60,
          left: 60,
          borderRadius: '50%',
          border: '2px dashed rgba(255, 255, 255, 0.2)'
        }}
      />
      
      {/* Direction arrow */}
      <svg 
        width={size} 
        height={size} 
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3.5, 0 7" 
              fill="rgba(255, 255, 255, 0.5)"
            />
          </marker>
        </defs>
        <path
          d={`M ${size/2 + (size-120)/4} ${size/2} A ${(size-120)/4} ${(size-120)/4} 0 1 1 ${size/2} ${size/2 + (size-120)/4}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
          strokeDasharray="5,5"
          markerEnd="url(#arrowhead)"
        />
      </svg>
      
      {/* Earth in center */}
      <div
        className="earth absolute"
        style={{
          width: 60,
          height: 60,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #1E88E5 0%, #0D47A1 100%)',
          boxShadow: '0 0 20px rgba(29, 109, 232, 0.6)'
        }}
      >
        <div 
          className="earth-cloud absolute inset-0"
          style={{
            borderRadius: '50%',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' width=\'100\' height=\'100\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'10\' fill=\'rgba(255, 255, 255, 0.3)\'/%3E%3Ccircle cx=\'70\' cy=\'40\' r=\'15\' fill=\'rgba(255, 255, 255, 0.3)\'/%3E%3Ccircle cx=\'45\' cy=\'70\' r=\'12\' fill=\'rgba(255, 255, 255, 0.3)\'/%3E%3C/svg%3E") center/cover no-repeat',
            opacity: 0.8
          }}
        />
      </div>
      
      {/* Moon phases around the cycle */}
      {moonPhases.map((phase, index) => (
        <div key={index}>
          {/* Moon visualization */}
          <div
            className={`moon-phase absolute cursor-pointer transition-transform duration-300 ${
              (highlightCurrent && index === currentPhase) ? 'ring-2 ring-yellow-300' : ''
            } ${
              hoveredPhase === index ? 'scale-110' : 'scale-100'
            }`}
            style={{
              width: 50,
              height: 50,
              top: phasePositions[index].y - 25,
              left: phasePositions[index].x - 25,
              borderRadius: '50%'
            }}
            onClick={() => onPhaseClick && onPhaseClick(phase)}
            onMouseEnter={() => setHoveredPhase(index)}
            onMouseLeave={() => setHoveredPhase(null)}
          >
            <MoonPhase 
              size={50}
              phase={phase.phase}
              illumination={phase.illumination}
              showLabel={false}
              lightColor={lightColor}
              darkColor={darkColor}
            />
          </div>
          
          {/* Phase label */}
          <div
            className="phase-label absolute text-white text-center"
            style={{
              width: 120,
              top: phasePositions[index].y + (Math.sin(phasePositions[index].angle) > 0 ? 30 : -50),
              left: phasePositions[index].x - 60,
              transform: Math.sin(phasePositions[index].angle) > 0.5 || Math.sin(phasePositions[index].angle) < -0.5 
                ? 'none' 
                : (Math.cos(phasePositions[index].angle) > 0 ? 'translateX(80px)' : 'translateX(-80px)')
            }}
          >
            <div className={`text-sm font-medium ${hoveredPhase === index ? 'text-yellow-300' : ''}`}>
              {phase.emoji} {phase.phase}
            </div>
            <div className="text-xs text-gray-300">
              {phase.illumination.toFixed(0)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoonPhaseCycle; 