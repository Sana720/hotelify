"use client";

import { AttendanceHistory } from "@/modules/staff/AttendanceHistory";
import { AttendanceQR } from "@/modules/staff/AttendanceQR";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, QrCode } from "lucide-react";

export default function AttendancePage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
                <p className="text-muted-foreground mt-1">Track staff presence and manage time-sheets.</p>
            </div>

            <Tabs defaultValue="logs" className="space-y-6">
                <TabsList className="bg-white/5 p-1 border border-white/10">
                    <TabsTrigger value="logs" className="gap-2">
                        <History className="w-4 h-4" />
                        Attendance Logs
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="gap-2">
                        <QrCode className="w-4 h-4" />
                        Check-in QR
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="logs">
                    <AttendanceHistory />
                </TabsContent>

                <TabsContent value="qr" className="flex justify-center pt-8">
                    <AttendanceQR orgId="org-123" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
