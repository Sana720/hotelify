"use client";

import {
    LayoutDashboard,
    Building2,
    Users,
    CreditCard,
    Settings,
    ShieldCheck,
    Globe,
    LogOut,
    Package
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface SidebarItem {
    title: string;
    url: string;
    icon: any;
}

const items: SidebarItem[] = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
    { title: "Leads", url: "/admin/leads", icon: Users },
    { title: "Hotels", url: "/admin/hotels", icon: Building2 },
    { title: "Packages", url: "/admin/packages", icon: Package },
]

const system: SidebarItem[] = [
    { title: "Billing Ledger", url: "/admin/billing", icon: CreditCard },
    // { title: "Domains", url: "/admin/domains", icon: Globe },
    // { title: "Settings", url: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    return (
        <Sidebar className="glass-premium border-r border-white/5">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-2 px-2">
                    <ShieldCheck className="w-7 h-7 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-white">Hotelify</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">Platform Admin</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/5 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 transition-all duration-300 group">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-400 transition-transform duration-300" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-300 font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Infrastructure</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {system.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/5 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 transition-all duration-300 group">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-400 transition-transform duration-300" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-300 font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-white/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="h-11 w-full flex items-center gap-3 px-4 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-bold uppercase tracking-widest text-[10px] transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
