import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting store (replace with Redis in production)
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>();
const API_RATE_LIMIT = 50; // 50 requests per minute
const API_RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function middleware(request: NextRequest) {
  // Only apply security middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get the client's IP address
    const ip = request.ip || 'unknown';
    
    // Check for rate limiting
    if (isRateLimited(ip)) {
      // Return 429 Too Many Requests response
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
    
    // Check for suspicious requests
    if (hasSuspiciousPayload(request)) {
      // Return 403 Forbidden for suspicious requests
      return new NextResponse(
        JSON.stringify({
          error: 'Request denied for security reasons.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Add security headers to API responses
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }
  
  // Continue with the request for non-API routes
  return NextResponse.next();
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};

/**
 * Check if the client's IP is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  
  // Get the current count and timestamp for this IP
  const currentData = ipRequestCounts.get(ip) || { count: 0, timestamp: now };
  
  // Reset count if outside rate limit window
  if (now - currentData.timestamp > API_RATE_WINDOW) {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  // Increment count for this IP
  const newCount = currentData.count + 1;
  ipRequestCounts.set(ip, { count: newCount, timestamp: currentData.timestamp });
  
  // Check if rate limit exceeded
  return newCount > API_RATE_LIMIT;
}

/**
 * Check for suspicious payloads or injection attempts
 */
function hasSuspiciousPayload(request: NextRequest): boolean {
  // This is a simplified check - in production use a more robust solution
  const url = request.nextUrl.toString();
  
  // Check URL for common injection patterns
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS
    /etc\/passwd/i, // Path traversal
    /\/\/\+/i, // Path manipulation
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
} 