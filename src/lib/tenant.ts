export function getTenant(host: string | null) {
    if (!host) return null;

    const allowedDomains = ['hotelify.com', 'localhost:3000'];
    const isLocal = host.includes('localhost');

    // Extract subdomain or custom domain
    const isPlatformDomain = allowedDomains.some(d => host.endsWith(d));

    if (isPlatformDomain) {
        const parts = host.split('.');
        // hotel1.hotelify.com -> hotel1
        // hotel1.localhost:3000 -> hotel1
        if ((!isLocal && parts.length > 2) || (isLocal && parts.length > 1)) {
            return { subdomain: parts[0], type: 'subdomain' };
        }
        return null; // Main platform
    }

    // Custom Domain logic
    return { domain: host, type: 'custom' };
}
