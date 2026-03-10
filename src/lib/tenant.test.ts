import { describe, it, expect } from 'vitest';
import { getTenant } from '@/lib/tenant';

describe('getTenant', () => {
    it('should resolve subdomains on the platform domain', () => {
        const tenant = getTenant('hotel1.hotelify.com');
        expect(tenant).toEqual({ subdomain: 'hotel1', type: 'subdomain' });
    });

    it('should resolve subdomains on localhost', () => {
        const tenant = getTenant('marriott.localhost:3000');
        expect(tenant).toEqual({ subdomain: 'marriott', type: 'subdomain' });
    });

    it('should resolve custom domains', () => {
        const tenant = getTenant('grandroyal.com');
        expect(tenant).toEqual({ domain: 'grandroyal.com', type: 'custom' });
    });

    it('should return null for the main platform domain', () => {
        const tenant = getTenant('hotelify.com');
        expect(tenant).toBeNull();
    });

    it('should return null for empty host', () => {
        const tenant = getTenant(null);
        expect(tenant).toBeNull();
    });
});
