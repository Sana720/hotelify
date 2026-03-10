"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, MapPin, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion } from "framer-motion";

const logs = [
    {
        id: "LOG-1",
        staff: "Elena Gilbert",
        role: "Housekeeping",
        status: "present",
        clockIn: "2026-03-04T08:00:00Z",
        clockOut: "2026-03-04T16:00:00Z",
        location: "Main Property",
    },
    {
        id: "LOG-2",
        staff: "Stefan Salvatore",
        role: "Receptionist",
        status: "present",
        clockIn: "2026-03-04T09:00:00Z",
        clockOut: null,
        location: "Main Property",
    },
    {
        id: "LOG-3",
        staff: "Damon Salvatore",
        role: "Manager",
        status: "late",
        clockIn: "2026-03-04T09:45:00Z",
        clockOut: null,
        location: "Main Property",
    },
];

const statusConfig = {
    present: { color: "text-emerald-400 bg-emerald-500/10", label: "Present" },
    absent: { color: "text-red-400 bg-red-500/10", label: "Absent" },
    late: { color: "text-amber-400 bg-amber-500/10", label: "Late" },
};

export function AttendanceHistory() {
    return (
        <Card className="glass overflow-hidden">
            <CardHeader>
                <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead className="w-[250px]">Staff Member</TableHead>
                            <TableHead>Clock In</TableHead>
                            <TableHead>Clock Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Location</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log, index) => (
                            <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-white/5 hover:bg-white/[0.02] transition-colors group"
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                            {log.staff.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm">{log.staff}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">{log.role}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-emerald-400/80">
                                        <ArrowDownLeft className="w-3 h-3" />
                                        {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {log.clockOut ? (
                                        <div className="flex items-center gap-2 text-blue-400/80">
                                            <ArrowUpRight className="w-3 h-3" />
                                            {new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-muted-foreground animate-pulse">
                                            Still Clocked In
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`text-[10px] border-none ${statusConfig[log.status as keyof typeof statusConfig].color}`}>
                                        {statusConfig[log.status as keyof typeof statusConfig].label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground">
                                    <div className="flex items-center justify-end gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {log.location}
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
