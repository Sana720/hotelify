"use client";

import { StaffList } from "@/modules/staff/StaffList";
import { AttendanceQR } from "@/modules/staff/AttendanceQR";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleManager } from "@/modules/staff/RoleManager";
import { useTenant } from "@/components/providers/TenantProvider";
import { Loader2 } from "lucide-react";

export default function StaffPage() {
    const { tenant, isLoading } = useTenant();

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-indigo-300 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin" />
                Validating Security Context...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gradient-premium">Staff Management</h1>
                <p className="text-white/50 mt-2 text-lg">Manage permissions, roles, and track attendance for {tenant?.name}.</p>
            </div>

            <Tabs defaultValue="directory" className="space-y-6 font-sans">
                <TabsList className="glass-premium border-white/10 p-1.5 rounded-xl">
                    <TabsTrigger value="directory" className="rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Staff Directory</TabsTrigger>
                    <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Attendance QR</TabsTrigger>
                    <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Roles & Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="directory" className="border-none p-0 outline-none">
                    <StaffList />
                </TabsContent>

                <TabsContent value="attendance" className="border-none p-0 outline-none">
                    <div className="py-12">
                        <AttendanceQR orgId={tenant?.id || "unknown"} />
                    </div>
                </TabsContent>

                <TabsContent value="roles" className="border-none p-0 outline-none">
                    <RoleManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
