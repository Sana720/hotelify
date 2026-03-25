"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    logo_url?: string;
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
                const hostname = window.location.hostname;
                const pathname = window.location.pathname;
                const searchParams = new URLSearchParams(window.location.search);
                const impersonateId = searchParams.get('org_id');
                const parts = hostname.split('.');
                
                let subdomain = '';
                let orgIdOverride = '';

                // 1. Direct Impersonation for Platform Admins
                if (impersonateId) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data: adminData } = await supabase
                            .from('platform_admins')
                            .select('id')
                            .eq('user_id', user.id)
                            .maybeSingle();
                        
                        if (adminData) {
                            console.log("TENANT - Impersonating Org ID:", impersonateId);
                            orgIdOverride = impersonateId;
                        }
                    }
                }

                // 2. Normal Subdomain Resolution (only if no override)
                if (!orgIdOverride) {
                    if (hostname === 'localhost') {
                        // Try to resolve from authenticated user first
                        const { data: { user } } = await supabase.auth.getUser();
                        
                        if (user && pathname.startsWith('/dashboard')) {
                            const { data: staffData } = await supabase
                                .from('staff')
                                .select('org_id')
                                .eq('user_id', user.id)
                                .maybeSingle();

                            if (staffData?.org_id) {
                                const { data: orgData } = await supabase
                                    .from('organizations')
                                    .select('id, name, subdomain')
                                    .eq('id', staffData.org_id)
                                    .single();
                                
                                if (orgData) {
                                    subdomain = orgData.subdomain;
                                }
                            }
                        }

                        if (!subdomain) {
                            console.log("TENANT - Falling back to [null] tenant on localhost.");
                            setIsLoading(false);
                            return;
                        }
                    } else if (hostname.endsWith('.localhost')) {
                        subdomain = parts[0];
                    } else {
                        if (parts.length > 2) {
                            subdomain = parts[0];
                        }
                    }

                    if (!subdomain || subdomain === 'www') {
                        setIsLoading(false);
                        return;
                    }
                }

                // 3. Final Fetch
                const query = supabase.from('organizations').select('id, name, subdomain');
                if (orgIdOverride) {
                    query.eq('id', orgIdOverride);
                } else {
                    query.eq('subdomain', subdomain);
                }

                const { data: orgData, error: orgError } = await query.single();

                if (orgError) {
                    console.warn(`Tenant [${orgIdOverride || subdomain}] not found:`, orgError.message);
                    setTenant(null);
                    return;
                }

                if (orgData) {
                    const { data: identityData } = await supabase
                        .from('property_identity')
                        .select('logo_url')
                        .eq('org_id', orgData.id)
                        .maybeSingle();

                    setTenant({
                        ...orgData,
                        logo_url: identityData?.logo_url
                    });
                }
            } catch (err) {
                console.error("Critical Tenant Fetch Error:", err);
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
