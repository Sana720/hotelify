import {
    Hotel,
    LayoutDashboard,
    Calendar,
    Users,
    WashingMachine,
    Sparkles,
    Settings,
    CreditCard,
    History
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import Link from "next/link"

const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Bookings", url: "/dashboard/bookings", icon: Calendar },
    { title: "Room Status", url: "/dashboard/rooms", icon: Hotel },
    { title: "Staff", url: "/dashboard/staff", icon: Users },
    { title: "Laundry", url: "/dashboard/laundry", icon: WashingMachine },
    { title: "Housekeeping", url: "/dashboard/cleaning", icon: Sparkles },
    { title: "Attendance", url: "/dashboard/attendance", icon: History },
]

const settings = [
    { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
    return (
        <Sidebar className="glass-premium border-r border-white/5">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-2 px-2">
                    <Hotel className="w-7 h-7 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                    <span className="text-2xl font-bold text-gradient-premium">Hotelify</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Operations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all duration-300 group">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 group-hover:scale-110 group-hover:text-primary transition-transform duration-300" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settings.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all duration-300 group">
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 group-hover:scale-110 group-hover:text-primary transition-transform duration-300" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
