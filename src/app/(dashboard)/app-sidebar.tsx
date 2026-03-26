"use client";

import {
    CalendarPlus,
    LogOut,
    Circle,
    CreditCard,
    DoorOpen,
    Bed,
    Sparkles,
    Settings,
    Triangle,
    BellRing,
    CalendarFold,
    Hotel,
    Users,
    ChevronDown,
    ClipboardList,
    CalendarCheck,
    CalendarRange,
    Clock,
    UserPlus,
    UserCheck,
    DoorClosed,
    LayoutDashboard,
    Shirt,
    WashingMachine
} from "lucide-react"

import { useState, useEffect } from "react"
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
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useTenant } from "@/components/providers/TenantProvider"
import { supabase } from "@/lib/supabase"

const operations = [
    { title: "Operations Overview", url: "/dashboard", icon: LayoutDashboard },
    { title: "Guest Registry", url: "/dashboard/guests", icon: UserCheck },
]

const frontDesk = [
    { title: "Today's Check-In", url: "/dashboard/bookings/checkin", icon: UserPlus },
    { title: "Today's Check-Out", url: "/dashboard/bookings/checkout", icon: DoorClosed },
    { title: "Pending Check-Ins", url: "/dashboard/bookings/pending", icon: Clock },
    { title: "Delayed Check-Outs", url: "/dashboard/bookings/delayed", icon: Clock },
]

const reservations = [
    { title: "Booking Overview", url: "/dashboard/bookings", icon: CalendarPlus },
    { title: "Booking Requests", url: "/dashboard/bookings/requests", icon: BellRing },
    { title: "Today's Booked", url: "/dashboard/bookings/today", icon: CalendarCheck },
    { title: "Upcoming Arrivals", url: "/dashboard/bookings/upcoming-in", icon: CalendarRange },
    { title: "Upcoming Departures", url: "/dashboard/bookings/upcoming-out", icon: CalendarFold },
]

const housekeepingItems = [
    { title: "Room Cleaning", url: "/dashboard/cleaning", icon: Sparkles },
    { title: "Laundry Service", url: "/dashboard/laundry", icon: WashingMachine },
]

const inventory = [
    { title: "Room Inventory", url: "/dashboard/rooms", icon: DoorOpen },
    { title: "Room Types", url: "/dashboard/room-types", icon: Bed },
    { title: "Amenities", url: "/dashboard/amenities", icon: Sparkles },
]

const adminFinance = [
    { title: "Billing & Invoices", url: "/dashboard/billing", icon: CreditCard },
    { title: "Staff Directory", url: "/dashboard/staff", icon: Users },
    { title: "Staff Attendance", url: "/dashboard/attendance", icon: ClipboardList },
    { title: "Property Settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
    const { tenant } = useTenant();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (!mounted) {
        return <Sidebar className="bg-[#0f172a] border-r border-white/5 text-slate-300" />;
    }

    return (
        <Sidebar className="bg-[#0f172a] border-r border-white/5 text-slate-300">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3 px-2">
                    {tenant?.logo_url ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white/5">
                            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Triangle className="w-6 h-6 text-white fill-current" />
                        </div>
                    )}
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic truncate">
                        {tenant?.name ? tenant.name : "Turbofy"}
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-4">
                {/* --- OPERATIONS & DASHBOARD --- */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Operations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {operations.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url} className="h-11 hover:bg-white/5 transition-all group data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-400">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-data-[active=true]:text-blue-400 transition-colors" />
                                            <span className="font-bold uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* --- FRONT DESK (High Level) --- */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Front Desk</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Collapsible defaultOpen className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="h-11 hover:bg-white/5 transition-all group w-full justify-between">
                                            <div className="flex items-center gap-3">
                                                <UserPlus className="w-5 h-5 group-hover:text-white transition-colors" />
                                                <span className="font-bold uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">Arrivals & Departures</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-all duration-300 group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l border-white/5 ml-4">
                                            {frontDesk.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={pathname === item.url} className="hover:bg-white/5 group h-9">
                                                        <Link href={item.url} className="flex items-center gap-3">
                                                            <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* --- RESERVATIONS --- */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Reservations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {reservations.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url} className="h-10 hover:bg-white/5 transition-all group data-[active=true]:text-emerald-400">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-data-[active=true]:text-emerald-400 transition-colors" />
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* --- HOUSEKEEPING & SERVICES --- */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Housekeeping & Services</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {housekeepingItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url} className="h-10 hover:bg-white/5 transition-all group">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* --- INVENTORY --- */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Inventory Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Collapsible className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="h-11 hover:bg-white/5 transition-all group w-full justify-between">
                                            <div className="flex items-center gap-3">
                                                <Hotel className="w-5 h-5 group-hover:text-white transition-colors" />
                                                <span className="font-bold uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">Assets & Rooms</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-all duration-300 group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l border-white/5 ml-4">
                                            {inventory.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={pathname === item.url} className="hover:bg-white/5 group h-9">
                                                        <Link href={item.url} className="flex items-center gap-3">
                                                            <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* --- ADMIN & FINANCE --- */}
                <SidebarGroup className="mt-4 mb-8">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Collapsible className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="h-11 hover:bg-white/5 transition-all group w-full justify-between">
                                            <div className="flex items-center gap-3">
                                                <Settings className="w-5 h-5 group-hover:text-white transition-colors" />
                                                <span className="font-bold uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">Org & Finance</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-all duration-300 group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l border-white/5 ml-4">
                                            {adminFinance.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={pathname === item.url} className="hover:bg-white/5 group h-9">
                                                        <Link href={item.url} className="flex items-center gap-3">
                                                            <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
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
