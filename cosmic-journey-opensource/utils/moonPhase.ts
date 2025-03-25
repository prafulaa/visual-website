/**
 * Moon phase calculation utility
 * Based on astronomical algorithms for determining the moon's phase
 */

export type MoonPhaseData = {
  phase: string;        // Phase name (New, Waxing Crescent, First Quarter, etc.)
  illumination: number; // Percentage of illumination (0-100)
  emoji: string;        // Visual representation for simple displays
  age: number;          // Age in days of the current lunar cycle (0-29.53)
  date?: Date;          // Date for the moon phase (optional, for calendar views)
  nextFullMoon?: string; // Date string for the next full moon
  nextNewMoon?: string;  // Date string for the next new moon
};

// Moon phase names in order
const MOON_PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
];

// Simple emoji representation for each phase
const MOON_PHASE_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

/**
 * Calculate the current moon phase
 * @param date Optional date to calculate moon phase for (defaults to current date)
 * @returns MoonPhaseData object with phase information
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseData {
  // JD = Julian Date
  const JD = date.getTime() / 86400000 + 2440587.5;
  
  // Days since 2000 January 1 (J2000.0)
  const daysJ2000 = JD - 2451545.0;
  
  // Mean longitude of the sun
  const sunMeanLongitude = (280.46646 + daysJ2000 * 0.9856474) % 360;

  // Mean anomaly of the sun
  const sunMeanAnomaly = (357.52911 + daysJ2000 * 0.9856003) % 360;
  
  // Calculate the sun's ecliptic longitude
  const eclipticLongitude = (sunMeanLongitude + 1.915 * Math.sin(sunMeanAnomaly * Math.PI / 180) + 0.020 * Math.sin(2 * sunMeanAnomaly * Math.PI / 180)) % 360;
  
  // Mean longitude of the moon
  const moonMeanLongitude = (218.316 + 13.176396 * daysJ2000) % 360;
  
  // Mean anomaly of the moon
  const moonMeanAnomaly = (134.963 + 13.064993 * daysJ2000) % 360;
  
  // Moon's mean elongation from the sun
  const elongation = (moonMeanLongitude - eclipticLongitude + 180) % 360;
  
  // Calculate age of the moon in days (0-29.53)
  const lunarCycleDays = 29.53;
  const age = lunarCycleDays * (elongation / 360.0);
  
  // Calculate moon phase (0-7)
  const phaseIndex = Math.floor(((elongation + 22.5) % 360) / 45);
  
  // Calculate illumination percentage (0-100)
  const illumination = 50 * (1 - Math.cos(elongation * Math.PI / 180));
  
  // Calculate next full moon
  const daysToFullMoon = (4 - phaseIndex) * 3.69125; // Approximation
  let nextFullMoonDate = new Date(date);
  nextFullMoonDate.setDate(date.getDate() + (daysToFullMoon < 0 ? daysToFullMoon + 29.53 : daysToFullMoon));
  
  // Calculate next new moon
  const daysToNewMoon = (0 - phaseIndex) * 3.69125; // Approximation
  let nextNewMoonDate = new Date(date);
  nextNewMoonDate.setDate(date.getDate() + (daysToNewMoon <= 0 ? daysToNewMoon + 29.53 : daysToNewMoon));
  
  return {
    phase: MOON_PHASE_NAMES[phaseIndex],
    illumination: parseFloat(illumination.toFixed(1)),
    emoji: MOON_PHASE_EMOJIS[phaseIndex],
    age: parseFloat(age.toFixed(1)),
    date: date,
    nextFullMoon: nextFullMoonDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    nextNewMoon: nextNewMoonDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
}

/**
 * Get the moon phase for a specific day of the lunar cycle (0-29.53)
 * Useful for displaying all phases or a specific phase
 * @param dayOfCycle Day in the lunar cycle (0-29.53)
 * @returns MoonPhaseData object
 */
export function getMoonPhaseByDay(dayOfCycle: number): MoonPhaseData {
  const lunarCycleDays = 29.53;
  const normalizedDay = dayOfCycle % lunarCycleDays;
  
  // Convert to elongation angle
  const elongation = (normalizedDay / lunarCycleDays) * 360;
  
  // Calculate phase index
  const phaseIndex = Math.floor(((elongation + 22.5) % 360) / 45);
  
  // Calculate illumination percentage
  const illumination = 50 * (1 - Math.cos(elongation * Math.PI / 180));
  
  // Create a date by offsetting from current date
  const date = new Date();
  date.setDate(date.getDate() + dayOfCycle);
  
  return {
    phase: MOON_PHASE_NAMES[phaseIndex],
    illumination: parseFloat(illumination.toFixed(1)),
    emoji: MOON_PHASE_EMOJIS[phaseIndex],
    age: parseFloat(normalizedDay.toFixed(1)),
    date: date
  };
}

/**
 * Get data for all eight main moon phases or all phases for a specific month
 * 
 * @param yearOrUndefined Optional year to get moon phases for
 * @param month Optional month to get moon phases for (0-11)
 * @returns Array of MoonPhaseData objects
 */
export function getAllMoonPhases(yearOrUndefined?: number, month?: number): MoonPhaseData[] {
  // If both year and month are provided, return moon phases for that month
  if (yearOrUndefined !== undefined && month !== undefined) {
    // Create an array to hold the moon phase data for each day of the month
    const year = yearOrUndefined;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const moonPhases: MoonPhaseData[] = [];
    
    // Calculate moon phase for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const moonPhase = getMoonPhase(date);
      moonPhases.push(moonPhase);
    }
    
    return moonPhases;
  }
  
  // Otherwise, return the 8 main moon phases
  return [
    getMoonPhaseByDay(0),    // New Moon
    getMoonPhaseByDay(3.7),  // Waxing Crescent
    getMoonPhaseByDay(7.4),  // First Quarter
    getMoonPhaseByDay(11.1), // Waxing Gibbous
    getMoonPhaseByDay(14.8), // Full Moon
    getMoonPhaseByDay(18.5), // Waning Gibbous
    getMoonPhaseByDay(22.1), // Last Quarter
    getMoonPhaseByDay(25.8)  // Waning Crescent
  ];
} 