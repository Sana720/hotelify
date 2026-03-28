import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next (Next.js internal files)
         * - images, assets, favicon.ico (public files)
         */
        '/((?!api|_next|images|assets|favicon.ico).*)',
    ],
};

export default async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';
    const isRootAdmin = url.pathname.startsWith('/admin');
    const isDashboard = url.pathname.startsWith('/dashboard');

    // 1. Protect Admin Routes
    if (isRootAdmin && url.pathname !== '/admin/login') {
        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        // Optional: Check for platform_admin role in platform_admins table
        // For performance, we usually trust the session here and do deep checks in the page/layout
    }

    // 2. Protect Dashboard Routes
    if (isDashboard) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // 3. Tenant Logic (Dynamic for any deployment)
    const allowedDomains = [
        'hotelify.com', 
        'localhost:3000', 
        'hotelify-fawn.vercel.app'
    ];
    
    // Also include the current site URL from env if it exists
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
        try {
            const siteHostname = new URL(siteUrl).hostname;
            if (!allowedDomains.includes(siteHostname)) {
                allowedDomains.push(siteHostname);
            }
        } catch (e) {}
    }

    const isPlatformDomain = allowedDomains.some(domain => hostname.endsWith(domain));
    let tenant = null;

    if (isPlatformDomain) {
        const parts = hostname.split('.');
        if ((hostname.includes('localhost') && parts.length > 1) || (!hostname.includes('localhost') && parts.length > 2)) {
            tenant = parts[0];
        }
    } else {
        tenant = hostname;
    }

    if (tenant && tenant !== 'www' && !isRootAdmin) {
        res.headers.set('x-tenant', tenant);
        return res;
    }

    return res;
}
