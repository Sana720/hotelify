import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - images (public images)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Define allowed platform domains
    const allowedDomains = ['hotelify.com', 'localhost:3000'];

    // Check if it's the platform domain or a custom domain
    const isPlatformDomain = allowedDomains.some(domain => hostname.endsWith(domain));

    let tenant = null;

    if (isPlatformDomain) {
        const parts = hostname.split('.');
        // Check for subdomain (e.g. hotel1.hotelify.com or hotel1.localhost:3000)
        if ((hostname.includes('localhost') && parts.length > 1) || (!hostname.includes('localhost') && parts.length > 2)) {
            tenant = parts[0];
        }
    } else {
        // Custom domain (e.g. grandroyal.com)
        tenant = hostname;
    }

    // If it's a tenant request, rewrite the URL
    // We'll preserve the original path but handle tenant context in the app
    if (tenant && tenant !== 'www') {
        const path = url.pathname;

        // Pass the tenant identification via a header to the app
        const response = NextResponse.next();
        response.headers.set('x-tenant', tenant);

        // Return a rewrite if we want to use a specific tenant base directory
        // return NextResponse.rewrite(new URL(`/_sites/${tenant}${path}`, req.url));

        return response;
    }

    return NextResponse.next();
}
