import { NextResponse } from 'next/server';

export function proxy(request) {
  const url = new URL(request.url);
  
  // 1. Get org from query param
  let org = url.searchParams.get('org');
  
  // 2. Get org from cookie if not in query param
  if (!org) {
    org = request.cookies.get('active_org')?.value;
  }
  
  // 3. Fallback to default
  if (org !== 'officemate' && org !== 'tracthai') {
    org = 'officemate';
  }
  
  // 4. Set the header for server components/API routes to read
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-active-org', org);
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // 5. If the current cookie value is different from the resolved org, synchronize it
  const currentCookie = request.cookies.get('active_org')?.value;
  if (currentCookie !== org) {
    response.cookies.set('active_org', org, {
      path: '/',
      httpOnly: false, // Allow client-side JS to read
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - tenant logos and images (org/...)
     */
    '/((?!_next/static|_next/image|favicon.ico|org/|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
