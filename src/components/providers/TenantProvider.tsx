"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
}

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
    tenant: null,
    isLoading: true,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTenant() {
            try {
                // In a real scenario, we'd get the subdomain from the current window.location
                const hostname = window.location.hostname;
                const parts = hostname.split('.');
                let subdomain = parts[0];

                // Handle localhost development
                if (hostname.includes('localhost') && parts.length === 1) {
                    // Default to a test tenant for root localhost
                    subdomain = 'grandroyal';
                }

                const { data, error } = await supabase
                    .from('organizations')
                    .select('id, name, subdomain')
                    .eq('subdomain', subdomain)
                    .single();

                if (data) {
                    setTenant(data);
                }
            } catch (err) {
                console.error("Error fetching tenant:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTenant();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => useContext(TenantContext);
