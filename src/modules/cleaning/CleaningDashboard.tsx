"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Play, Loader2, User } from "lucide-react";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { updateRoomStatus, logHousekeepingAction, getHousekeepingHistory } from "@/app/(admin)/admin/hotels/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { History, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export function CleaningDashboard() {
    const { tenant } = useTenant();
    const [rooms, setRooms] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [roomLogs, setRoomLogs] = useState<any[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        if (!tenant) return;

        async function fetchData() {
            setLoading(true);
            const [roomsRes, staffRes] = await Promise.all([
                supabase.from('rooms').select('*').eq('org_id', tenant!.id).in('status', ['dirty', 'cleaning']).order('room_number'),
                supabase.from('staff').select('id, full_name').eq('org_id', tenant!.id).eq('is_active', true)
            ]);

            if (roomsRes.data) setRooms(roomsRes.data);
            if (staffRes.data) setStaff(staffRes.data);
            setLoading(false);
        }

        fetchData();
    }, [tenant, refreshKey]);

    const handleMarkClean = async (roomId: string, currentStatus: string, assignedStaffId: string | null) => {
        if (!tenant) return;
        const res = await updateRoomStatus(tenant.id, roomId, 'available', null); // Clear assignment on clean
        if (res.success) {
            await logHousekeepingAction(tenant.id, {
                room_id: roomId,
                staff_id: assignedStaffId,
                old_status: currentStatus,
                new_status: 'available',
                action_type: 'completion'
            });
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleToggleCleaning = async (roomId: string, currentStatus: string, assignedStaffId: string | null) => {
        if (!tenant) return;
        const nextStatus = currentStatus === 'dirty' ? 'cleaning' : 'dirty';
        const res = await updateRoomStatus(tenant.id, roomId, nextStatus);
        if (res.success) {
            await logHousekeepingAction(tenant.id, {
                room_id: roomId,
                staff_id: assignedStaffId,
                old_status: currentStatus,
                new_status: nextStatus,
                action_type: 'status_change'
            });
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleAssignStaff = async (roomId: string, staffId: string, currentStatus: string) => {
        if (!tenant) return;
        const res = await updateRoomStatus(tenant.id, roomId, currentStatus, staffId);
        if (res.success) {
            await logHousekeepingAction(tenant.id, {
                room_id: roomId,
                staff_id: staffId,
                old_status: currentStatus,
                new_status: currentStatus,
                action_type: 'assignment'
            });
            setRefreshKey(prev => prev + 1);
        }
    };

    const viewHistory = async (roomId: string) => {
        if (!tenant) return;
        setSelectedRoomId(roomId);
        setIsHistoryOpen(true);
        const res = await getHousekeepingHistory(tenant.id, roomId);
        if (res.success) {
            setRoomLogs(res.logs || []);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                Synchronizing Housekeeping Data...
            </div>
        );
    }

    return (
        <Card className="glass-premium border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl text-gradient-premium">Housekeeping Tracker</CardTitle>
                    <p className="text-sm text-white/40 mt-1">Real-time status of room cleaning and inspection cycles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewHistory('')}
                        className="h-9 px-4 rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] gap-2"
                    >
                        <History className="w-4 h-4" />
                        Full History
                    </Button>
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5 h-9">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{rooms.length} Active Tasks</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {rooms.length === 0 ? (
                    <div className="p-16 text-center text-white/20 font-bold uppercase tracking-widest text-[10px] italic">
                        All rooms are clean and available.
                    </div>
                ) : (
                    rooms.map(room => (
                        <CleaningTask
                            key={room.id}
                            room={room}
                            staffMembers={staff}
                            onToggle={() => handleToggleCleaning(room.id, room.status, room.assigned_staff_id)}
                            onComplete={() => handleMarkClean(room.id, room.status, room.assigned_staff_id)}
                            onAssign={(staffId) => handleAssignStaff(room.id, staffId, room.status)}
                            onViewHistory={() => viewHistory(room.id)}
                        />
                    ))
                )}
            </CardContent>

            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetContent className="glass-premium border-white/10 bg-[#0a0a0c]/90 backdrop-blur-3xl text-white w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
                    <SheetHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <SheetTitle className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                            <History className="w-6 h-6 text-indigo-400" />
                            Housekeeping Logs
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase font-black tracking-widest text-white/30">
                            Audit trail of cleaning and maintenance cycles
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar font-sans">
                        {roomLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20 uppercase font-black tracking-widest text-xs italic">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                Analyzing logs...
                            </div>
                        ) : (
                            roomLogs.map((log) => (
                                <div key={log.id} className="relative pl-8 border-l border-white/5 pb-6 last:pb-0">
                                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                            {format(new Date(log.created_at), "HH:mm • MMM dd")}
                                        </div>
                                        <Badge className={`text-[8px] uppercase tracking-tighter ${
                                            log.action_type === 'completion' ? 'bg-emerald-500/10 text-emerald-400' :
                                            log.action_type === 'assignment' ? 'bg-blue-500/10 text-blue-400' :
                                            'bg-purple-500/10 text-purple-400'
                                        }`}>
                                            {log.action_type}
                                        </Badge>
                                    </div>
                                    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Room {log.room?.room_number}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[9px] border-white/10 text-white/60 uppercase">{log.old_status || 'init'}</Badge>
                                                <ArrowRight className="w-3 h-3 text-white/20" />
                                                <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-300 uppercase">{log.new_status}</Badge>
                                            </div>
                                        </div>
                                        {log.staff?.full_name && (
                                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                                <User className="w-3 h-3 text-white/20" />
                                                <span className="text-[10px] font-bold text-white/70">{log.staff.full_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </Card>
    );
}

function CleaningTask({ 
    room, 
    staffMembers, 
    onToggle, 
    onComplete,
    onAssign,
    onViewHistory
}: { 
    room: any, 
    staffMembers: any[], 
    onToggle: () => void, 
    onComplete: () => void,
    onAssign: (staffId: string) => void,
    onViewHistory: () => void
}) {
    const isCleaning = room.status === 'cleaning';

    return (
        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="flex items-center gap-6">
                <div 
                    onClick={onToggle}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isCleaning ? 'bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-red-500/10'}`}
                >
                    {isCleaning ? <Play className="w-5 h-5 text-purple-400 fill-purple-400 animate-pulse" /> : <Clock className="w-5 h-5 text-red-400" />}
                </div>
                <div>
                    <div className="font-bold text-xl text-white group-hover:text-indigo-300 transition-colors flex items-center gap-3">
                        Room {room.room_number}
                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-white/10 text-white/40">{room.type}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                        <Select 
                            value={room.assigned_staff_id || ""} 
                            onValueChange={onAssign}
                        >
                            <SelectTrigger className="h-8 bg-white/5 border-white/5 rounded-full px-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all w-[160px]">
                                <User className="w-3 h-3 mr-2" />
                                <SelectValue placeholder="Assign Staff" />
                            </SelectTrigger>
                            <SelectContent className="glass-premium border-white/10">
                                {staffMembers.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="text-[10px] font-bold uppercase tracking-widest">{s.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewHistory}
                            className="h-8 w-8 rounded-full p-0 text-white/20 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <History className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${isCleaning ? 'text-purple-400 text-glow' : 'text-red-400'}`}>
                        {room.status === 'dirty' ? 'Pending' : 'In Progress'}
                    </div>
                    <p className="text-[9px] text-white/20 uppercase tracking-tighter mt-1 font-bold italic">
                        {room.assigned_staff_id ? 'Cleaning Assigned' : 'Awaiting Staff'}
                    </p>
                </div>
                <Button 
                    onClick={onComplete} 
                    variant="ghost" 
                    className="h-12 w-12 rounded-full p-0 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all duration-300"
                >
                    <CheckCircle2 className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
