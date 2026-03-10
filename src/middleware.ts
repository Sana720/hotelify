import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /_vercel (Vercel internals)
         * 5. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname (e.g. hotel1.hotelify.com, customdomain.com)
    const hostname = req.headers.get('host') || '';

    // Define allowed domains (including localhost for development)
    const allowedDomains = ['hotelify.com', 'localhost:3000'];

    // Extract subdomain if it exists
    const isAllowedDomain = allowedDomains.some(domain => hostname.endsWith(domain));

    let subdomain = '';
    if (isAllowedDomain) {
        const parts = hostname.split('.');
        if (parts.length > 2 || (hostname.includes('localhost') && parts.length > 1)) {
            subdomain = parts[0];
        }
    }

    // If we have a subdomain or it's a custom domain, we need to rewrite
    // For now, let's just log and pass through as a skeleton.
    // In a real scenario, we'd rewrite to /_sites/[subdomain]/...

    return NextResponse.next();
}
