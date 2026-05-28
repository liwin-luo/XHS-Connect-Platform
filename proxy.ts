import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'chrome-extension://',
  'http://localhost:3000',
  'http://localhost:5173',
  /^https:\/\/[\w-]+\.vercel\.app$/,
];

export function proxy(request: NextRequest) {
  // Only handle API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some(pattern => {
    if (typeof pattern === 'string') return origin.startsWith(pattern);
    if (pattern instanceof RegExp) return pattern.test(origin);
    return false;
  });

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = NextResponse.next();
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
