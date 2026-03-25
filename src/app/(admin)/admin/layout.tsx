"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/app/(admin)/admin-sidebar"
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        return <div className="min-h-screen bg-[#0a0a0c]">{children}</div>;
    }

    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="w-full relative overflow-hidden bg-[#0a0a0c]">
                {/* Visual "brightening" elements - Premium Admin Mode */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 glass-premium sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1 text-white/70 hover:text-white transition-colors" />
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                        Platform Control Center <span className="text-blue-500/50 mx-2">•</span> <span className="text-blue-400">v2.0.1</span>
                    </div>
                </header>
                <div className="p-4 lg:p-8 relative z-0">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
