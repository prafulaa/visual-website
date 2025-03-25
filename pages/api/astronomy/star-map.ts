import type { NextApiRequest, NextApiResponse } from 'next';
import { secureAstronomyApiRequest, validateUserInput, createResponseHash } from '../../../utils/secureApiUtils';
import NodeCache from 'node-cache';
import * as AstronomyUtils from '../../../utils/astronomy';

// Improved cache with longer TTL for better performance
// 30 minutes for most cases, but we'll extend for historical dates that won't change
const cache = new NodeCache({ 
  stdTTL: 1800,          // Standard TTL: 30 minutes 
  checkperiod: 120,      // Check for expired keys every 2 minutes
  useClones: false,      // Don't clone data for better performance
  deleteOnExpire: true   // Automatically delete expired items
});

// Types for API responses
interface StarMapResponse {
  date: string;
  formattedDate: string;
  location?: string;
  constellations: string[];
  planets: {
    name: string;
    position: string;
    magnitude?: number; // Brightness (-26 to +15, lower is brighter)
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

// Helper to determine if a date is historical (more than 1 month old)
// Historical dates can be cached longer since their astronomy data never changes
const isHistoricalDate = (date: Date): boolean => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return date < oneMonthAgo;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add CORS headers for better client performance
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported' 
    });
  }

  try {
    // Extract and validate input
    const { date, latitude, longitude, location, moonLightColor = "#FFFDE7" } = req.body;
    
    if (!date) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        message: 'Date is required' 
      });
    }

    // Sanitize inputs
    const sanitizedDate = validateUserInput(date);
    const sanitizedLocation = location ? validateUserInput(location) : undefined;
    const sanitizedMoonColor = validateUserInput(moonLightColor || "#FFFDE7");
    
    // Fix date timezone issue by using the date parts directly
    // This prevents timezone offsets from affecting the date
    const dateParts = sanitizedDate.split('-').map(part => parseInt(part, 10));
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        error: 'Invalid date format', 
        message: 'Please provide a date in YYYY-MM-DD format'
      });
    }

    const [inputYear, inputMonth, inputDay] = dateParts;
    // Create date with specific year, month (0-based), and day
    const dateObj = new Date(inputYear, inputMonth - 1, inputDay);
    
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format', 
        message: 'Please provide a valid date'
      });
    }
    
    // Validate coordinates 
    const lat = latitude ? parseFloat(latitude) : 38.75; // Default to Manassas, VA
    const lng = longitude ? parseFloat(longitude) : -77.48;
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }
    
    // Parse date for API request
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    // Create cache key based on parameters
    const cacheKey = createResponseHash({
      date: `${year}-${month}-${day}`,
      latitude: lat.toFixed(2), // Round coordinates for better cache hits
      longitude: lng.toFixed(2),
      moonLightColor: sanitizedMoonColor
    });
    
    // Check cache first
    const cachedData = cache.get<StarMapResponse>(cacheKey);
    if (cachedData) {
      // Return cached data with cache indicator
      return res.status(200)
        .setHeader('X-Cache', 'HIT')
        .setHeader('Cache-Control', 'public, max-age=3600') // Allow browser caching
        .json(cachedData);
    }
    
    // Generate astronomical data using the astronomy utilities
    
    // Use Promise.all to compute these in parallel for better performance
    const [moonPhaseData, visibleConstellations, visiblePlanetsData] = await Promise.all([
      Promise.resolve(AstronomyUtils.getMoonPhase(dateObj)),
      Promise.resolve(AstronomyUtils.getVisibleConstellations(dateObj, lat, lng)),
      Promise.resolve(AstronomyUtils.getVisiblePlanets(dateObj, lat, lng))
    ]);
    
    // Transform planet data into the expected format - done after parallel computation
    const planetPositions = visiblePlanetsData.map(planet => ({
      name: planet.name,
      position: planet.description,
      magnitude: planet.magnitude,
      isVisible: planet.isVisible
    }));
    
    // Generate moon phase SVG - pass moonLightColor if it's a custom value
    let moonPhaseSvg = AstronomyUtils.generateMoonPhaseSVG(moonPhaseData.phase);
    
    // Replace the default white color with the custom color if needed
    if (sanitizedMoonColor && sanitizedMoonColor.toLowerCase() !== "#ffffff") {
      moonPhaseSvg = moonPhaseSvg.replace(/fill="white"/g, `fill="${sanitizedMoonColor}"`);
    }
    
    // Generate star map SVG
    const starMapSvg = AstronomyUtils.generateStarMapSVG(visibleConstellations, dateObj, lat, lng);
    
    // Format date for display
    const formattedDate = formatDate(dateObj);
    
    // Prepare response data
    const responseData: StarMapResponse = {
      date: `${year}-${month}-${day}`,
      formattedDate,
      location: sanitizedLocation,
      moonPhase: {
        name: moonPhaseData.name,
        illumination: moonPhaseData.illumination,
        emoji: moonPhaseData.emoji,
        svgPath: moonPhaseSvg
      },
      constellations: visibleConstellations,
      planets: planetPositions,
      starMapSvg: starMapSvg
    };
    
    // Determine cache TTL based on date
    // Historical dates can be cached much longer (1 week)
    const cacheTTL = isHistoricalDate(dateObj) ? 604800 : 1800; // 1 week or 30 minutes
    
    // Store in cache with appropriate TTL
    cache.set(cacheKey, responseData, cacheTTL);
    
    // Set appropriate browser cache headers
    const browserCacheMaxAge = isHistoricalDate(dateObj) ? 86400 : 3600; // 24 hours or 1 hour
    
    // Return the data with cache control headers
    return res.status(200)
      .setHeader('X-Cache', 'MISS')
      .setHeader('Cache-Control', `public, max-age=${browserCacheMaxAge}`)
      .json(responseData);
    
  } catch (error) {
    console.error('Star map API error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Provide generic error to client
    return res.status(500).json({ 
      error: 'Failed to generate star map',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
}

// Format date for display (e.g. "January 1st, 2023")
function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Add ordinal suffix to day
  const lastDigit = day % 10;
  const lastTwoDigits = day % 100;
  let suffix = 'th';
  
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = 'st';
    else if (lastDigit === 2) suffix = 'nd';
    else if (lastDigit === 3) suffix = 'rd';
  }
  
  return `${months[month]} ${day}${suffix}, ${year}`;
} 