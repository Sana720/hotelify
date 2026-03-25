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

const manageHotel = [
    { title: "Settings", url: "/dashboard/settings", icon: Circle },
    { title: "Billing & Invoices", url: "/dashboard/billing", icon: CreditCard },
    { title: "Room Type", url: "/dashboard/room-types", icon: Bed },
    { title: "Rooms", url: "/dashboard/rooms", icon: DoorOpen },
    { title: "Amenities", url: "/dashboard/amenities", icon: Sparkles },
    { title: "Housekeeping", url: "/dashboard/cleaning", icon: Sparkles },
    { title: "Guest Registry", url: "/dashboard/guests", icon: UserCheck },
    { title: "Laundry Service", url: "/dashboard/laundry", icon: WashingMachine },
]

const manageStaff = [
    { title: "Staff List", url: "/dashboard/staff", icon: Users },
    { title: "Attendance", url: "/dashboard/attendance", icon: ClipboardList },
]

const acknowledgements = [
    { title: "Booking Requests", url: "/dashboard/bookings/requests", icon: BellRing },
    { title: "Todays Booked", url: "/dashboard/bookings/today", icon: CalendarCheck },
    { title: "Todays Checkin", url: "/dashboard/bookings/checkin", icon: UserPlus },
    { title: "Pending Check-Ins", url: "/dashboard/bookings/pending", icon: Clock },
    { title: "Todays Checkout", url: "/dashboard/bookings/checkout", icon: DoorClosed },
    { title: "Delayed Checkouts", url: "/dashboard/bookings/delayed", icon: Clock },
    { title: "Upcoming Check-Ins", url: "/dashboard/bookings/upcoming-in", icon: CalendarRange },
    { title: "Upcoming Checkouts", url: "/dashboard/bookings/upcoming-out", icon: CalendarFold },
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
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Dashboard" className="h-11 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all duration-300" isActive={pathname === "/dashboard"}>
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span className="font-bold uppercase tracking-widest text-[10px]">Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Manage Hotel Dropdown */}
                            <SidebarMenuItem className="mt-4">
                                <Collapsible defaultOpen className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="h-11 hover:bg-white/5 transition-all group w-full justify-between">
                                            <div className="flex items-center gap-3">
                                                <Hotel className="w-5 h-5 group-hover:text-white transition-colors" />
                                                <span className="font-bold uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">Manage Hotel</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-all duration-300 group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l border-white/5 ml-4">
                                            {manageHotel.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <SidebarMenuSubItem key={item.title}>
                                                        <SidebarMenuSubButton asChild isActive={pathname === item.url} className="hover:bg-white/5 group">
                                                            <Link href={item.url} className="flex items-center gap-3">
                                                                <Icon className="w-2.5 h-2.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                                <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">{item.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>

                            {/* Manage Staff Dropdown */}
                            <SidebarMenuItem>
                                <Collapsible className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="h-11 hover:bg-white/5 transition-all group w-full justify-between">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 group-hover:text-white transition-colors" />
                                                <span className="font-bold uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">Manage Staff</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-all duration-300 group-data-[state=open]/collapsible:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l border-white/5 ml-4">
                                            {manageStaff.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild className="hover:bg-white/5 group">
                                                        <Link href={item.url} className="flex items-center gap-3">
                                                            <Circle className="w-2.5 h-2.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                            <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">{item.title}</span>
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

                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Acknowledgement</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {acknowledgements.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url} className="h-10 hover:bg-white/5 transition-all group">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-4 mb-8">
                    <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4 mb-2 italic">Booking</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/dashboard/bookings"} className="h-10 hover:bg-white/5 transition-all group">
                                    <Link href="/dashboard/bookings" className="flex items-center gap-3">
                                        <CalendarPlus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">Booking Overview</span>
                                    </Link>
                                </SidebarMenuButton>
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
