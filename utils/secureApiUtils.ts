/**
 * Secure API Utilities
 * These functions handle secure communication with external APIs
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import crypto from 'crypto';

// Timeout for API requests (10 seconds)
const API_TIMEOUT = 10000;

// Astronomy API base URL
const ASTRONOMY_API_BASE_URL = 'https://api.astronomyapi.com/api/v2';

// NASA API base URL
const NASA_API_BASE_URL = 'https://api.nasa.gov';

/**
 * Create secure headers for Astronomy API requests
 */
export function getAstronomyApiHeaders(): Record<string, string> {
  const apiId = process.env.ASTRONOMY_API_ID;
  const apiSecret = process.env.ASTRONOMY_API_SECRET;
  
  if (!apiId || !apiSecret) {
    throw new Error('Astronomy API credentials not configured');
  }
  
  // Create basic auth token from API credentials
  const authToken = Buffer.from(`${apiId}:${apiSecret}`).toString('base64');
  
  return {
    'Authorization': `Basic ${authToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create secure headers for NASA API requests
 */
export function getNasaApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Make a secure request to the Astronomy API
 */
export async function secureAstronomyApiRequest<T>(
  endpoint: string, 
  params: Record<string, any> = {},
  method: 'GET' | 'POST' = 'GET'
): Promise<T> {
  try {
    // Create request configuration
    const config: AxiosRequestConfig = {
      method,
      url: `${ASTRONOMY_API_BASE_URL}${endpoint}`,
      headers: getAstronomyApiHeaders(),
      timeout: API_TIMEOUT,
    };
    
    // Add parameters based on request method
    if (method === 'GET') {
      config.params = params;
    } else {
      config.data = params;
    }
    
    // Make the request
    const response: AxiosResponse<T> = await axios(config);
    
    // Return data from response
    return response.data;
  } catch (error) {
    // Handle and log errors securely
    console.error('Astronomy API error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Re-throw with sanitized error message (don't expose implementation details)
    throw new Error('Failed to fetch astronomical data. Please try again later.');
  }
}

/**
 * Make a secure request to the NASA API
 */
export async function secureNasaApiRequest<T>(
  endpoint: string, 
  params: Record<string, any> = {}
): Promise<T> {
  try {
    // Add API key to parameters
    const apiKey = process.env.NASA_API_KEY;
    
    if (!apiKey) {
      throw new Error('NASA API key not configured');
    }
    
    const secureParams = {
      ...params,
      api_key: apiKey,
    };
    
    // Make the request
    const response: AxiosResponse<T> = await axios({
      method: 'GET',
      url: `${NASA_API_BASE_URL}${endpoint}`,
      params: secureParams,
      headers: getNasaApiHeaders(),
      timeout: API_TIMEOUT,
    });
    
    // Return data from response
    return response.data;
  } catch (error) {
    // Handle and log errors securely
    console.error('NASA API error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Re-throw with sanitized error message
    throw new Error('Failed to fetch NASA data. Please try again later.');
  }
}

/**
 * Validate user input for security
 */
export function validateUserInput(input: string): string {
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>\\\/\"\']/g, '');
  
  // Limit length
  return sanitized.substring(0, 100);
}

/**
 * Create a secure hash for caching API responses
 */
export function createResponseHash(params: Record<string, any>): string {
  // Create a stable JSON string (sorted keys)
  const stableString = JSON.stringify(params, Object.keys(params).sort());
  
  // Create SHA-256 hash
  return crypto
    .createHash('sha256')
    .update(stableString)
    .digest('hex');
} 