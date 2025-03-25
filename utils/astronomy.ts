/**
 * Advanced Astronomy Utilities
 * 
 * This file contains utilities for calculating celestial positions,
 * moon phases, and generating visualizations for astronomical data.
 */

// Types
export interface CelestialCoordinates {
  azimuth: number;  // Horizontal angle (degrees) - 0 is North, 90 is East, etc.
  altitude: number; // Angle above horizon (degrees) - 90 is zenith, -90 is nadir
  ra?: number;      // Right Ascension (hours) - celestial longitude
  dec?: number;     // Declination (degrees) - celestial latitude
  distance?: number; // Distance in astronomical units
}

export interface CelestialObject {
  name: string;
  coordinates: CelestialCoordinates;
  magnitude?: number; // Brightness (lower = brighter)
  angularSize?: number; // Angular size in arc minutes
  phase?: number; // Moon/planet phase (0-1)
  isVisible: boolean;
  riseTime?: Date;
  setTime?: Date;
  transitTime?: Date; // Time of highest altitude
  description: string;
}

export interface StarData {
  name: string;
  ra: number; // Right Ascension in hours
  dec: number; // Declination in degrees
  magnitude: number;
  spectralType?: string;
  bvColor?: number; // B-V color index
}

export interface ConstellationData {
  name: string;
  abbr: string;
  stars: string[];
  lines: [string, string][]; // Pairs of star names forming the stick figure
  season: 'winter' | 'spring' | 'summer' | 'fall';
  hemisphere: 'north' | 'south' | 'both';
  rightAscension: number; // Center RA in hours
  declination: number; // Center declination in degrees
  description: string;
}

export interface MoonPhaseData {
  name: string;
  phase: number; // 0-1 where 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter
  illumination: number; // 0-1
  emoji: string;
}

export interface PlanetData {
  name: string;
  description: string;
  magnitude: number; // Brightness (lower is brighter)
  isVisible: boolean;
}

/**
 * Calculate Julian Day from date
 * @param date JavaScript Date object
 * @returns Julian Day number
 */
export function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Julian date calculation (Astronomical Algorithms by Jean Meeus)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4);
  jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Add time of day
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  
  jd += (hours - 12) / 24 + minutes / 1440 + seconds / 86400;
  
  return jd;
}

/**
 * Calculate Local Sidereal Time
 * @param date Date object
 * @param longitude Observer's longitude in degrees
 * @returns Local sidereal time in degrees
 */
export function getLocalSiderealTime(date: Date, longitude: number): number {
  const jd = getJulianDay(date);
  const t = (jd - 2451545.0) / 36525; // Julian centuries since 2000.0
  
  // Greenwich sidereal time
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
            0.000387933 * t * t - t * t * t / 38710000;
  
  // Normalize to 0-360
  gst = ((gst % 360) + 360) % 360;
  
  // Local sidereal time
  let lst = gst + longitude;
  lst = ((lst % 360) + 360) % 360;
  
  return lst;
}

/**
 * Calculate the moon phase for a given date
 * @param date JavaScript Date object
 * @returns Moon phase data
 */
export function getMoonPhase(date: Date): MoonPhaseData {
  const jd = getJulianDay(date);
  
  // Calculate moon age in days based on the mean synodic month
  const lunarCycle = 29.53059; // Mean synodic month in days
  const newMoonRef = 2451550.1; // A known new moon (Jan 6, 2000)
  const daysFromNewMoon = (jd - newMoonRef) % lunarCycle;
  const phase = daysFromNewMoon / lunarCycle; // Normalized 0-1
  
  // Calculate illumination (simplified sine approximation)
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * phase));
  
  // Determine phase name and emoji
  let name, emoji;
  
  if (phase < 0.025 || phase >= 0.975) {
    name = "New Moon";
    emoji = "🌑";
  } else if (phase < 0.225) {
    name = "Waxing Crescent";
    emoji = "🌒";
  } else if (phase < 0.275) {
    name = "First Quarter";
    emoji = "🌓";
  } else if (phase < 0.475) {
    name = "Waxing Gibbous";
    emoji = "🌔";
  } else if (phase < 0.525) {
    name = "Full Moon";
    emoji = "🌕";
  } else if (phase < 0.725) {
    name = "Waning Gibbous";
    emoji = "🌖";
  } else if (phase < 0.775) {
    name = "Last Quarter";
    emoji = "🌗";
  } else {
    name = "Waning Crescent";
    emoji = "🌘";
  }
  
  return {
    name,
    phase,
    illumination,
    emoji
  };
}

/**
 * Get visible constellations based on date and location
 * @param date JavaScript Date object
 * @param latitude Observer's latitude
 * @param longitude Observer's longitude
 * @returns Array of visible constellation names
 */
export function getVisibleConstellations(date: Date, latitude: number, longitude: number): string[] {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  
  // LST will determine which constellations are visible
  const lst = getLocalSiderealTime(date, longitude);
  
  // Determine season (adjust for southern hemisphere if needed)
  let season: 'winter' | 'spring' | 'summer' | 'fall';
  const isNorthernHemisphere = latitude >= 0;
  
  // Determine astronomical season
  if (isNorthernHemisphere) {
    if ((month === 11 && day >= 21) || month < 2 || (month === 2 && day < 20)) {
      season = 'winter';
    } else if ((month === 2 && day >= 20) || month < 5 || (month === 5 && day < 21)) {
      season = 'spring';
    } else if ((month === 5 && day >= 21) || month < 8 || (month === 8 && day < 23)) {
      season = 'summer';
    } else {
      season = 'fall';
    }
  } else {
    // Reverse seasons for southern hemisphere
    if ((month === 11 && day >= 21) || month < 2 || (month === 2 && day < 20)) {
      season = 'summer';
    } else if ((month === 2 && day >= 20) || month < 5 || (month === 5 && day < 21)) {
      season = 'fall';
    } else if ((month === 5 && day >= 21) || month < 8 || (month === 8 && day < 23)) {
      season = 'winter';
    } else {
      season = 'spring';
    }
  }
  
  // Define constellation visibility by season with RA (Right Ascension) ranges
  // Constellations are generally visible when their RA is near the LST
  // These are simplified approximations
  const constellationsBySeason: {[key: string]: {name: string, ra: number}[]} = {
    winter: [
      {name: 'Orion', ra: 5.5},
      {name: 'Canis Major', ra: 7},
      {name: 'Canis Minor', ra: 8},
      {name: 'Gemini', ra: 7},
      {name: 'Taurus', ra: 4.5},
      {name: 'Auriga', ra: 6},
      {name: 'Perseus', ra: 3},
      {name: 'Eridanus', ra: 3.5},
      {name: 'Lepus', ra: 6},
    ],
    spring: [
      {name: 'Leo', ra: 11},
      {name: 'Virgo', ra: 13},
      {name: 'Ursa Major', ra: 11},
      {name: 'Bootes', ra: 15},
      {name: 'Corona Borealis', ra: 16},
      {name: 'Canes Venatici', ra: 13},
      {name: 'Coma Berenices', ra: 13},
      {name: 'Hydra', ra: 12},
    ],
    summer: [
      {name: 'Cygnus', ra: 20.5},
      {name: 'Lyra', ra: 19},
      {name: 'Aquila', ra: 20},
      {name: 'Hercules', ra: 17},
      {name: 'Scorpius', ra: 17},
      {name: 'Sagittarius', ra: 19},
      {name: 'Ophiuchus', ra: 17.5},
      {name: 'Libra', ra: 15.5},
    ],
    fall: [
      {name: 'Pegasus', ra: 22},
      {name: 'Andromeda', ra: 1},
      {name: 'Pisces', ra: 1},
      {name: 'Aquarius', ra: 23},
      {name: 'Capricornus', ra: 21},
      {name: 'Cetus', ra: 2},
      {name: 'Phoenix', ra: 1},
      {name: 'Grus', ra: 22.5},
    ]
  };
  
  // Circumpolar constellations (always visible in respective hemispheres)
  const circumNorth = ['Ursa Minor', 'Cassiopeia', 'Cepheus', 'Draco', 'Camelopardalis'];
  const circumSouth = ['Crux', 'Centaurus', 'Carina', 'Octans', 'Tucana'];
  
  // Convert LST from degrees to hours
  const lstHours = lst / 15;
  
  // Filter which constellations are actually visible at the current LST (±6 hours)
  const visibleSeasonalRaw = constellationsBySeason[season].filter(c => {
    // Handle RA wrapping around 0/24 hours
    let hourDiff = Math.abs(c.ra - lstHours);
    if (hourDiff > 12) hourDiff = 24 - hourDiff;
    return hourDiff < 6; // Visible if within 6 hours of LST
  });
  
  // Take the first 3-5 seasonal constellations
  const visibleSeasonal = visibleSeasonalRaw
    .sort((a, b) => {
      // Sort by closest to LST
      let diffA = Math.abs(a.ra - lstHours);
      if (diffA > 12) diffA = 24 - diffA;
      
      let diffB = Math.abs(b.ra - lstHours);
      if (diffB > 12) diffB = 24 - diffB;
      
      return diffA - diffB;
    })
    .slice(0, 5)
    .map(c => c.name);
  
  // Add 1-2 circumpolar constellations
  const circumpolar = isNorthernHemisphere ? circumNorth : circumSouth;
  // Select circumpolar constellations based on date to ensure variety
  const dateNum = date.getDate() + (date.getMonth() * 100) + (date.getFullYear() * 10000);
  const circ1Index = dateNum % circumpolar.length;
  const circ2Index = (dateNum + 2) % circumpolar.length;
  
  const selectedCircumpolar = [circumpolar[circ1Index]];
  // Add second circumpolar if we need more constellations
  if (visibleSeasonal.length < 4) {
    selectedCircumpolar.push(circumpolar[circ2Index]);
  }
  
  // Combine results
  let result = [...visibleSeasonal, ...selectedCircumpolar];
  
  // If we didn't get enough constellations (rare case), add some common ones
  if (result.length < 4) {
    const common = ['Orion', 'Ursa Major', 'Cassiopeia', 'Crux', 'Scorpius'];
    for (const constellation of common) {
      if (!result.includes(constellation)) {
        result.push(constellation);
        if (result.length >= 5) break;
      }
    }
  }
  
  // Limit to at most 5 constellations
  return result.slice(0, 5);
}

/**
 * Get visible planets and their positions
 * @param date JavaScript Date object
 * @param latitude Observer's latitude
 * @param longitude Observer's longitude
 * @returns Array of planet data objects
 */
export function getVisiblePlanets(date: Date, latitude: number, longitude: number): PlanetData[] {
  // For accurate calculations, we'd need a proper astronomical library
  // This is a simplified approximation that uses the date to vary results
  
  const jd = getJulianDay(date);
  
  // Planet orbital periods in days
  const periods = {
    Mercury: 88,
    Venus: 225,
    Mars: 687,
    Jupiter: 4333,
    Saturn: 10759
  };
  
  // Simplified visibility calculation
  const result: PlanetData[] = [];
  
  // Reference epoch (J2000.0)
  const j2000 = 2451545.0;
  
  Object.entries(periods).forEach(([name, period]) => {
    // Calculate phase in orbit (0-1)
    const phase = ((jd - j2000) % period) / period;
    
    // Convert to position in sky (simplified)
    // This creates predictable but varying results based on date
    let description = '';
    let isVisible = false;
    let magnitude = 0;
    
    switch (name) {
      case 'Mercury':
        // Mercury's apparent magnitude ranges from -1.9 to +5.7
        magnitude = -1.9 + 7.6 * Math.abs(phase - 0.5) * 2;
        if (phase < 0.25 || phase > 0.75) {
          description = 'Low on eastern horizon before sunrise';
          isVisible = phase > 0.8 || phase < 0.2;
        } else {
          description = 'Low on western horizon after sunset';
          isVisible = phase > 0.3 && phase < 0.7;
        }
        break;
        
      case 'Venus':
        // Venus's apparent magnitude ranges from -4.6 to -3.0
        magnitude = -4.6 + 1.6 * Math.abs(phase - 0.5) * 2;
        if (phase < 0.25 || phase > 0.75) {
          description = 'Morning star (eastern horizon before sunrise)';
          isVisible = true;
        } else {
          description = 'Evening star (western horizon after sunset)';
          isVisible = true;
        }
        break;
        
      case 'Mars':
        // Mars's apparent magnitude ranges from -2.9 to +1.8
        magnitude = -2.9 + 4.7 * Math.abs(phase - 0.5) * 2;
        if (phase < 0.25) {
          description = 'Rising in the east';
          isVisible = true;
        } else if (phase < 0.5) {
          description = 'High in the southern sky';
          isVisible = true;
        } else if (phase < 0.75) {
          description = 'Setting in the west';
          isVisible = true;
        } else {
          description = 'Below horizon (not visible)';
          isVisible = false;
        }
        break;
        
      case 'Jupiter':
        // Jupiter's apparent magnitude ranges from -2.9 to -2.0
        magnitude = -2.9 + 0.9 * Math.abs(phase - 0.5) * 2;
        if (phase < 0.33) {
          description = 'Rising in the east';
          isVisible = true;
        } else if (phase < 0.66) {
          description = 'High in the southern sky';
          isVisible = true;
        } else {
          description = 'Setting in the west';
          isVisible = true;
        }
        break;
        
      case 'Saturn':
        // Saturn's apparent magnitude ranges from -0.2 to +1.2
        magnitude = -0.2 + 1.4 * Math.abs(phase - 0.5) * 2;
        if (phase < 0.25) {
          description = 'Rising in the east';
          isVisible = true;
        } else if (phase < 0.5) {
          description = 'High in the southern sky';
          isVisible = true;
        } else if (phase < 0.75) {
          description = 'Setting in the west';
          isVisible = true;
        } else {
          description = 'Below horizon (not visible)';
          isVisible = false;
        }
        break;
    }
    
    // Visibility also depends on time of year, add some variety
    // Make some planets not visible during certain times
    const month = date.getMonth();
    const day = date.getDate();
    const dateNum = day + month * 31;
    
    // Adjust visibility based on date
    if ((dateNum % 11) === 0 && name !== 'Jupiter') {
      isVisible = false;
      description = 'Below horizon (not visible)';
    }
    
    if (isVisible) {
      result.push({
        name,
        description,
        magnitude,
        isVisible
      });
    }
  });
  
  // Always ensure at least 2 planets are visible
  if (result.length < 2) {
    const backup = [
      {
        name: 'Venus',
        description: 'Evening star (western horizon after sunset)',
        magnitude: -4.0,
        isVisible: true
      },
      {
        name: 'Jupiter',
        description: 'High in the southern sky',
        magnitude: -2.5,
        isVisible: true
      }
    ];
    
    for (const planet of backup) {
      if (!result.some(p => p.name === planet.name)) {
        result.push(planet);
        if (result.length >= 2) break;
      }
    }
  }
  
  return result;
}

/**
 * Generate SVG representation of moon phase
 * @param phase Moon phase (0-1 where 0=new, 0.5=full)
 * @returns SVG path string
 */
export function generateMoonPhaseSVG(phase: number): string {
  // Normalize phase to 0-1
  phase = ((phase % 1) + 1) % 1;
  
  // SVG dimensions
  const width = 100;
  const height = 100;
  const cx = width / 2;
  const cy = height / 2;
  const r = 40;
  
  // Special cases: New Moon and Full Moon
  if (Math.abs(phase) < 0.01 || Math.abs(phase - 1) < 0.01) {
    // New Moon (completely dark)
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" stroke="#444" stroke-width="1" />
    </svg>`;
  }
  
  if (Math.abs(phase - 0.5) < 0.01) {
    // Full Moon (completely light)
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#444" stroke-width="1" />
    </svg>`;
  }
  
  // For crescent and gibbous phases
  let d = '';
  let illumination;
  
  // Determine if waxing (phase 0 to 0.5) or waning (phase 0.5 to 1)
  const isWaxing = phase < 0.5;
  
  // First Quarter (phase = 0.25) and Last Quarter (phase = 0.75)
  if (Math.abs(phase - 0.25) < 0.01) {
    // First Quarter (right half illuminated)
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" stroke="#444" stroke-width="1" />
      <path d="M ${cx} ${cy-r} A ${r} ${r} 0 0 1 ${cx} ${cy+r} L ${cx} ${cy-r} Z" fill="white" />
    </svg>`;
  }
  
  if (Math.abs(phase - 0.75) < 0.01) {
    // Last Quarter (left half illuminated)
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" stroke="#444" stroke-width="1" />
      <path d="M ${cx} ${cy-r} A ${r} ${r} 0 0 0 ${cx} ${cy+r} L ${cx} ${cy-r} Z" fill="white" />
    </svg>`;
  }
  
  // Calculate the terminator position (x-coordinate of the shadow line)
  // Convert phase to angle (0 to 360 degrees)
  const phaseAngle = phase * 360;
  
  // Calculate x offset based on phase (using cosine function)
  // For waxing phases (0-0.5): terminator moves right from -r to 0
  // For waning phases (0.5-1): terminator moves right from 0 to r
  const xOffset = r * Math.cos(phaseAngle * Math.PI / 180);
  
  // Calculate the curve factor for the terminator (elliptical curve)
  // The shadow edge should be an ellipse when viewed from an angle
  const curveFactor = Math.abs(Math.sin(phaseAngle * Math.PI / 180)) * r;
  
  // Draw the moon with appropriate shadow
  if (isWaxing) {
    // Waxing: 0 (new) to 0.5 (full)
    // Dark circle with light on the right side, increasing
    if (phase < 0.25) {
      // Waxing Crescent (less than half illuminated)
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" stroke="#444" stroke-width="1" />
        <path d="M ${cx} ${cy-r} 
                A ${curveFactor} ${r} 0 0 1 ${cx} ${cy+r} 
                A ${r} ${r} 0 0 0 ${cx} ${cy-r}" 
              fill="white" />
      </svg>`;
    } else {
      // Waxing Gibbous (more than half illuminated)
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#444" stroke-width="1" />
        <path d="M ${cx} ${cy-r} 
                A ${curveFactor} ${r} 0 0 0 ${cx} ${cy+r} 
                A ${r} ${r} 0 0 1 ${cx} ${cy-r}" 
              fill="black" />
      </svg>`;
    }
  } else {
    // Waning: 0.5 (full) to 1 (new)
    // Light circle with dark on the right side, increasing
    if (phase < 0.75) {
      // Waning Gibbous (more than half illuminated)
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#444" stroke-width="1" />
        <path d="M ${cx} ${cy-r} 
                A ${curveFactor} ${r} 0 0 1 ${cx} ${cy+r} 
                A ${r} ${r} 0 0 0 ${cx} ${cy-r}" 
              fill="black" />
      </svg>`;
    } else {
      // Waning Crescent (less than half illuminated)
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" stroke="#444" stroke-width="1" />
        <path d="M ${cx} ${cy-r} 
                A ${curveFactor} ${r} 0 0 0 ${cx} ${cy+r} 
                A ${r} ${r} 0 0 1 ${cx} ${cy-r}" 
              fill="white" />
      </svg>`;
    }
  }
}

/**
 * Generate SVG star map visualization
 * @param constellations Array of constellation names
 * @param date Observer's date
 * @param lat Observer's latitude
 * @param lng Observer's longitude
 * @returns SVG string representation of star map
 */
export function generateStarMapSVG(
  constellations: string[],
  date: Date,
  lat: number,
  lng: number
): string {
  // SVG dimensions
  const width = 500;
  const height = 300;
  
  // Star data for constellations (simplified positions)
  const constellationData: {[key: string]: {stars: [number, number][], lines: [number, number][]}} = {
    'Orion': {
      stars: [[250, 110], [270, 100], [290, 120], [260, 150], [230, 150], [220, 120], [240, 130], [270, 70]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [6, 0], [6, 3], [1, 7]]
    },
    'Ursa Major': {
      stars: [[150, 80], [180, 70], [210, 60], [240, 50], [250, 80], [220, 100], [190, 110]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]]
    },
    'Cassiopeia': {
      stars: [[300, 50], [330, 40], [360, 50], [350, 80], [320, 70]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
    },
    'Leo': {
      stars: [[120, 150], [150, 130], [180, 120], [200, 140], [170, 160], [140, 170], [170, 190]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [4, 6]]
    },
    'Scorpius': {
      stars: [[350, 170], [360, 190], [370, 210], [380, 230], [390, 250], [410, 260], [400, 240], [420, 230], [430, 210]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8]]
    },
    // Simplified data for more constellations
    'Cygnus': {
      stars: [[230, 50], [240, 70], [250, 90], [260, 110], [270, 130], [220, 90], [280, 90]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6]]
    },
    'Lyra': {
      stars: [[310, 90], [330, 100], [320, 120], [300, 110], [290, 100]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
    },
    'Gemini': {
      stars: [[140, 130], [160, 120], [180, 110], [200, 120], [220, 130], [170, 150], [190, 160]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [4, 6]]
    },
    'Taurus': {
      stars: [[130, 170], [150, 160], [170, 150], [190, 160], [155, 175], [175, 185]],
      lines: [[0, 1], [1, 2], [2, 3], [1, 4], [2, 5]]
    },
    'Canis Major': {
      stars: [[330, 200], [340, 220], [320, 230], [310, 210], [350, 240]],
      lines: [[0, 1], [1, 4], [0, 2], [0, 3]]
    },
    'Ursa Minor': {
      stars: [[100, 50], [120, 40], [140, 30], [160, 20], [158, 40], [138, 50], [118, 60]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]]
    },
    'Crux': {
      stars: [[240, 250], [250, 230], [230, 230], [260, 270]],
      lines: [[0, 1], [2, 0], [0, 3]]
    },
    'Centaurus': {
      stars: [[280, 240], [300, 250], [320, 260], [290, 270], [270, 260], [260, 280]],
      lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5]]
    },
    // Add more as needed
  };

  // Default constellation if we don't have data
  const defaultConstellation = {
    stars: [[100, 100], [120, 80], [140, 100], [120, 120]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]]
  };
  
  // Generate SVG string
  let svgString = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="black" />`;
  
  // Function to get random star positions that appear consistent
  function getStarField(date: Date, count: number): [number, number][] {
    const stars: [number, number][] = [];
    const dateNum = date.getDate() + date.getMonth() * 31 + date.getFullYear() * 372;
    
    // Generate stars with a predictable pattern based on date
    for (let i = 0; i < count; i++) {
      const seed = (dateNum * (i + 1)) % 997; // Use prime number for better distribution
      const x = seed % width;
      const y = (seed * 13) % height;
      stars.push([x, y]);
    }
    
    return stars;
  }
  
  // Add background stars
  const bgStars = getStarField(date, 200);
  for (const [x, y] of bgStars) {
    // Vary star size slightly
    const size = 0.5 + Math.floor((x * y) % 3) * 0.5;
    svgString += `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${0.3 + (size / 2) * 0.7}" />`;
  }
  
  // Add selected constellations
  let offset = 0;
  for (const constellation of constellations) {
    // Get constellation data or use default
    const conData = constellationData[constellation] || defaultConstellation;
    
    // Adjust constellation position based on date and location
    // This creates some variety in the night sky view
    const jd = getJulianDay(date);
    const hourAngle = (jd % 1) * 360; // 0-360 based on time of day
    const latOffset = (90 - Math.abs(lat)) / 90; // 0-1 based on latitude
    
    // Calculate position offsets
    const xOffset = ((Math.sin(hourAngle * Math.PI / 180) * 50) - 25) * latOffset;
    const yOffset = ((Math.cos(hourAngle * Math.PI / 180) * 30) - 15) * latOffset;
    
    // Offset to spread constellations around the sky
    offset += 30;
    
    // Draw constellation name
    const nameX = conData.stars[0][0] + xOffset;
    const nameY = conData.stars[0][1] + yOffset - 15;
    svgString += `<text x="${nameX}" y="${nameY}" fill="white" opacity="0.7" font-size="10">${constellation}</text>`;
    
    // Draw constellation lines
    for (const [start, end] of conData.lines) {
      const [x1, y1] = conData.stars[start];
      const [x2, y2] = conData.stars[end];
      svgString += `<line 
        x1="${x1 + xOffset}" 
        y1="${y1 + yOffset}" 
        x2="${x2 + xOffset}" 
        y2="${y2 + yOffset}" 
        stroke="white" 
        opacity="0.5" 
        stroke-width="1" 
      />`;
    }
    
    // Draw constellation stars
    for (let i = 0; i < conData.stars.length; i++) {
      const [x, y] = conData.stars[i];
      const size = 2 + (i % 3);
      svgString += `<circle 
        cx="${x + xOffset}" 
        cy="${y + yOffset}" 
        r="${size}" 
        fill="white" 
      />`;
    }
  }
  
  // Close SVG string
  svgString += '</svg>';
  
  return svgString;
} 