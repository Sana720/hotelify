"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Hammer, CheckCircle2, Moon, WashingMachine, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

interface Room {
    id: string;
    room_number: string;
    type: string;
    status: string;
    base_price: number;
}

const statusConfig = {
    available: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" />, label: "Available" },
    occupied: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Moon className="w-3 h-3" />, label: "Occupied" },
    dirty: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Sparkles className="w-3 h-3" />, label: "Needs Cleaning" },
    cleaning: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: <WashingMachine className="w-3 h-3 text-purple-400 animate-pulse" />, label: "Cleaning" },
    maintenance: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <Hammer className="w-3 h-3" />, label: "Maintenance" },
};

export function RoomGrid() {
    const { tenant, isLoading: tenantLoading } = useTenant();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenant) return;

        async function fetchRooms() {
            setLoading(true);
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('org_id', tenant?.id)
                .order('room_number', { ascending: true });

            if (data) setRooms(data);
            setLoading(false);
        }

        fetchRooms();
    }, [tenant]);

    if (tenantLoading || loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground uppercase tracking-[0.2em] text-xs font-black">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Synchronizing Inventory...
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 glass-premium rounded-[3rem] border border-white/5 text-muted-foreground">
                <p className="font-bold">No rooms found in your property.</p>
                <Button variant="outline" className="glass h-11 px-8 rounded-2xl">Initialize Room Inventory</Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
                <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Card className="glass group hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden border border-white/5 rounded-[2.5rem]">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-3xl font-black tracking-tight text-white">Room {room.room_number}</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{room.type}</p>
                                </div>
                                <Badge variant="outline" className={`gap-1 px-3 py-1 rounded-full font-bold text-[10px] ${statusConfig[room.status as keyof typeof statusConfig]?.color || ""}`}>
                                    {statusConfig[room.status as keyof typeof statusConfig]?.icon}
                                    {statusConfig[room.status as keyof typeof statusConfig]?.label || room.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-6">
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-lg font-black text-white/90">₹{room.base_price}<span className="text-xs text-muted-foreground font-medium">/night</span></span>
                                <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
