"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/(dashboard)/app-sidebar"
import { TenantProvider } from "@/components/providers/TenantProvider"
import { DashboardGuard } from "@/app/(dashboard)/dashboard-guard"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TenantProvider>
            <DashboardGuard>
                <SidebarProvider>
                    <AppSidebar />
                    <main className="w-full relative overflow-hidden bg-[#0a0a0c]">
                        {/* Visual "brightening" elements - Premium Dark Mode */}
                        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse duration-[5000ms]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[7000ms]" />

                        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 glass-premium sticky top-0 z-10">
                            <SidebarTrigger className="-ml-1 text-white/70 hover:text-white transition-colors" />
                        </header>
                        <div className="p-4 lg:p-8 relative z-0">
                            {children}
                        </div>
                    </main>
                </SidebarProvider>
            </DashboardGuard>
        </TenantProvider>
    )
}
