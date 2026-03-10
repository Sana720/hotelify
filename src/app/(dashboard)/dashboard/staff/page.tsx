"use client";

import { StaffList } from "@/modules/staff/StaffList";
import { AttendanceQR } from "@/modules/staff/AttendanceQR";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StaffPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gradient-premium">Staff Management</h1>
                <p className="text-white/50 mt-2 text-lg">Manage permissions, roles, and track attendance.</p>
            </div>

            <Tabs defaultValue="directory" className="space-y-6">
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
                        <AttendanceQR orgId="main-hotel" />
                    </div>
                </TabsContent>

                <TabsContent value="roles" className="border-none p-0 outline-none">
                    <div className="glass-premium border-white/10 p-12 rounded-3xl text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                        <p className="text-white/40 text-lg">Role builder coming soon to enterprise plan.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
