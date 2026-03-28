'use client';

import { useTenant } from "@/components/providers/TenantProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
    const { tenant, isLoading } = useTenant();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && tenant) {
            // Only enforce for dashboard routes, excluding the setup page itself
            const isDashboardRoute = pathname.startsWith('/dashboard');
            const isSetupPage = pathname === '/dashboard/setup';

            if (isDashboardRoute && !isSetupPage && tenant.setup_step !== 'completed') {
                console.log("GUARD - Redirecting to Setup Wizard. Current Step:", tenant.setup_step);
                router.push('/dashboard/setup');
            }
        }
    }, [tenant, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
