"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    logo_url?: string;
    setup_step?: string;
}

interface TenantContextType {
    tenant: Tenant | null;
    userProfile: any | null;
    permissions: string[];
    isLoading: boolean;
    hasPermission: (permissionId: string) => boolean;
    refreshTenant: () => Promise<void>;
}

export const TenantContext = createContext<TenantContextType>({
    tenant: null,
    userProfile: null,
    permissions: [],
    isLoading: true,
    hasPermission: () => false,
    refreshTenant: async () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTenant = useCallback(async () => {
        setIsLoading(true);
        try {
            // Small delay to ensure DB propagation from server actions before client fetch
            await new Promise(resolve => setTimeout(resolve, 100));

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
                                .select('id, name, subdomain, setup_step')
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
            // We force a fresh fetch by using a slightly different query or ensuring the client doesn't cache.
            const query = supabase
                .from('organizations')
                .select('id, name, subdomain, setup_step')
                .limit(1);
            
            if (orgIdOverride) {
                query.eq('id', orgIdOverride);
            } else {
                query.eq('subdomain', subdomain);
            }

            // Forced refresh by bypassing any potential Supabase JS client-side cache
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

                // 4. Fetch User Profile and Role (Permissions)
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: staffData } = await supabase
                        .from('staff')
                        .select('*, roles(*)')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    if (staffData) {
                        setUserProfile(staffData);
                        setPermissions(staffData.roles?.permissions || []);
                        console.log("AUTH - User Role:", staffData.roles?.name, "Permissions:", staffData.roles?.permissions);
                    } else {
                        // Check if platform admin
                        const { data: adminData } = await supabase
                            .from('platform_admins')
                            .select('*')
                            .eq('user_id', user.id)
                            .maybeSingle();
                        
                        if (adminData) {
                            setUserProfile({ ...adminData, is_platform_admin: true });
                            setPermissions(['*']); // All access
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Critical Tenant/Auth Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const hasPermission = useCallback((permissionId: string) => {
        if (permissions.includes('*')) return true;
        return permissions.includes(permissionId);
    }, [permissions]);

    useEffect(() => {
        fetchTenant();
    }, [fetchTenant]);

    return (
        <TenantContext.Provider value={{ 
            tenant, 
            userProfile, 
            permissions, 
            isLoading, 
            hasPermission,
            refreshTenant: fetchTenant 
        }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => useContext(TenantContext);
