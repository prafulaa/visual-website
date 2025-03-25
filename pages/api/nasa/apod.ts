import type { NextApiRequest, NextApiResponse } from 'next';
import { secureNasaApiRequest, validateUserInput } from '../../../utils/secureApiUtils';
import crypto from 'crypto';

// Simple in-memory cache map for storing NASA API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 86400000; // 24 hours in milliseconds

interface APODResponse {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  copyright?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported' 
    });
  }

  try {
    // Extract and validate date query parameter
    let date = req.query.date ? validateUserInput(req.query.date as string) : '';
    
    // If no date is provided, use today's date
    if (!date) {
      const today = new Date();
      date = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }
    
    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format',
        message: 'Please provide a valid date in YYYY-MM-DD format'
      });
    }
    
    // Format the date for the API request
    const formattedDate = dateObj.toISOString().split('T')[0];
    
    // Create a cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(`apod-${formattedDate}`)
      .digest('hex');
    
    // Check the cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      // Return cached data
      return res.status(200).setHeader('X-Cache', 'HIT').json(cachedData.data);
    }
    
    // Make secure request to NASA API
    const nasaResponse = await secureNasaApiRequest<APODResponse>(
      '/planetary/apod',
      { date: formattedDate }
    );
    
    // Sanitize and validate the response
    const sanitizedResponse = sanitizeNasaResponse(nasaResponse);
    
    // Store in cache
    apiCache.set(cacheKey, {
      data: sanitizedResponse,
      timestamp: Date.now()
    });
    
    // Return the data
    return res.status(200).setHeader('X-Cache', 'MISS').json(sanitizedResponse);
    
  } catch (error) {
    console.error('NASA APOD API error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Provide a generic error to the client (don't leak internal details)
    return res.status(500).json({ 
      error: 'Failed to fetch NASA APOD data',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
}

/**
 * Sanitize and validate NASA API response
 * This helps prevent XSS and other injection attacks
 */
function sanitizeNasaResponse(response: APODResponse): APODResponse {
  // Ensure the response has all required fields
  if (!response || !response.date || !response.title || !response.url) {
    throw new Error('Invalid NASA API response');
  }
  
  // Create a sanitized copy
  const sanitized: APODResponse = {
    date: validateUserInput(response.date),
    title: validateUserInput(response.title),
    explanation: validateUserInput(response.explanation || ''),
    url: validateUserInput(response.url),
    media_type: validateUserInput(response.media_type || 'image'),
    ...(response.hdurl && { hdurl: validateUserInput(response.hdurl) }),
    ...(response.copyright && { copyright: validateUserInput(response.copyright) })
  };
  
  // Check if URLs are valid and from expected domains
  if (!isValidUrl(sanitized.url) || !isAllowedDomain(sanitized.url)) {
    throw new Error('Invalid or disallowed URL in NASA API response');
  }
  
  if (sanitized.hdurl && (!isValidUrl(sanitized.hdurl) || !isAllowedDomain(sanitized.hdurl))) {
    delete sanitized.hdurl;
  }
  
  return sanitized;
}

/**
 * Validate if string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if URL is from an allowed domain
 */
function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedDomains = [
      'apod.nasa.gov',
      'images.nasa.gov',
      'www.nasa.gov',
      'nasa.gov',
      'stsci-opo.org',
      'www.stsci-opo.org'
    ];
    
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
} 