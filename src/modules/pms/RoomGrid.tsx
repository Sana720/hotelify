"use client";

import { useEffect, useState, useId } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { 
    Hammer, 
    CheckCircle2, 
    Moon, 
    Loader2, 
    ChevronRight, 
    Info, 
    History as HistoryIcon,
    Layers,
    IndianRupee,
    ArrowRight,
    Wifi, 
    Wind, 
    Tv, 
    Coffee, 
    ShieldCheck, 
    Mountain, 
    Waves, 
    Utensils, 
    Car,
    Gamepad,
    Sparkles, 
    Dumbbell, 
    Pizza, 
    Wine, 
    Flower2, 
    WashingMachine, 
    Shirt, 
    Refrigerator, 
    Bell, 
    Microwave, 
    Bath, 
    ShowerHead, 
    Baby, 
    Accessibility, 
    CigaretteOff, 
    PawPrint, 
    Lock, 
    Key, 
    Bike, 
    Bus, 
    Plane, 
    Monitor, 
    Music, 
    Thermometer, 
    Fan, 
    Laptop, 
    Briefcase, 
    Trees,
    Hotel as HotelIcon,
    Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getHousekeepingHistory, updateRoomStatus, logHousekeepingAction } from "@/app/(admin)/admin/hotels/actions";
import { NewBookingDialog } from "./NewBookingDialog";
import { toast } from "sonner";
import { GuestFolio } from "./GuestFolio";
import { AnimatePresence } from "framer-motion";

import { motion } from "framer-motion";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

interface Room {
    id: string;
    room_number: string;
    type: string;
    status: string;
    base_price: number;
    floor?: string;
    amenities?: string[];
}
const commonAmenities = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-3 h-3" /> },
    { id: 'ac', label: 'AC', icon: <Wind className="w-3 h-3" /> },
    { id: 'tv', label: 'Smart TV', icon: <Tv className="w-3 h-3" /> },
    { id: 'minibar', label: 'Mini Bar', icon: <Coffee className="w-3 h-3" /> },
    { id: 'safe', label: 'Safe', icon: <ShieldCheck className="w-3 h-3" /> },
    { id: 'view', label: 'City View', icon: <Mountain className="w-3 h-3" /> }
];

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
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [roomLogs, setRoomLogs] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<{ id: string, name: string } | null>(null);
    const [amenitiesList, setAmenitiesList] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const roomDetailsId = useId();

    useEffect(() => {
        if (tenantLoading) return;
        
        if (!tenant) {
            setLoading(false);
            return;
        }

        async function fetchRooms() {
            setLoading(true);
            const { data, error } = await supabase
                .from('rooms')
                .select('*, room_types(base_price, name, amenities)')
                .eq('org_id', tenant?.id)
                .order('room_number', { ascending: true });

            if (data) {
                // Map the data to use the live price from the room type if available
                const mappedRooms = data.map((room: any) => ({
                    ...room,
                    base_price: room.room_types?.base_price ?? room.base_price
                }));
                setRooms(mappedRooms);
            }
            setLoading(false);
        }

        async function fetchAmenities() {
            if (!tenant) return;
            const { data } = await supabase
                .from('amenities')
                .select('*')
                .eq('org_id', tenant.id);
            
            // Show only organization-specific custom amenities as per multi-tenant logic
            setAmenitiesList(data || []);
        }

        fetchRooms();
        fetchAmenities();
    }, [tenant, tenantLoading]);

    const getIcon = (iconName: string) => {
        const icons: any = { 
            Wifi, Wind, Tv, Coffee, ShieldCheck, Mountain, Waves, Utensils, Car, Gamepad,
            Sparkles, Dumbbell, Pizza, Wine, Flower2, WashingMachine, Shirt, Refrigerator,
            Bell, Microwave, Bath, ShowerHead, Baby, Accessibility, CigaretteOff, PawPrint,
            Lock, Key, Bike, Bus, Plane, Monitor, Music, Thermometer, Fan, Laptop, Briefcase, Trees
        };
        const Icon = icons[iconName] || HotelIcon;
        return <Icon className="w-3.5 h-3.5" />;
    };
    useEffect(() => {
        if (!tenant || !selectedRoom) return;
        
        async function fetchLogs() {
            setLogsLoading(true);
            const res = await getHousekeepingHistory(tenant!.id, selectedRoom!.id);
            if (res.success) {
                setRoomLogs(res.logs || []);
            }
            
            // If occupied, fetch active booking for folio
            if (selectedRoom?.status === 'occupied') {
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('*, rooms (room_number), folios (status)')
                    .eq('room_id', selectedRoom.id)
                    .neq('status', 'checked_out')
                    .neq('status', 'cancelled')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                
                if (booking) {
                    // We don't set it immediately, just make it available for the folio button
                    (selectedRoom as any).activeBooking = booking;
                }
            }
            setLogsLoading(false);
        }
        
        fetchLogs();
    }, [tenant, selectedRoom]);

    const handleRequestCleaning = async () => {
        if (!tenant || !selectedRoom) return;
        
        setLogsLoading(true);
        const res = await updateRoomStatus(tenant.id, selectedRoom.id, 'dirty');
        if (res.success) {
            await logHousekeepingAction(tenant.id, {
                room_id: selectedRoom.id,
                old_status: selectedRoom.status,
                new_status: 'dirty',
                action_type: 'cleaning_request'
            });
            toast.success(`Cleaning requested for Room ${selectedRoom.room_number}.`);
            
            // Refresh local state
            setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status: 'dirty' } : r));
            setSelectedRoom(prev => prev ? { ...prev, status: 'dirty' } : null);
            
            // Re-fetch logs
            const logRes = await getHousekeepingHistory(tenant.id, selectedRoom.id);
            if (logRes.success) setRoomLogs(logRes.logs || []);
        }
        setLogsLoading(false);
    };

    const handleCheckOut = async () => {
        if (!tenant || !selectedRoom || !(selectedRoom as any).activeBooking) return;
        
        const booking = (selectedRoom as any).activeBooking;
        const isFolioOpen = booking.folios && booking.folios.length > 0 && booking.folios[0].status !== 'closed';
        const due = (booking.total_price || 0) - (booking.advance_amount || 0);

        if (isFolioOpen || due > 0) {
            toast.error("Unsettled Folio: Please clear the outstanding balance and close the statement before checkout.");
            setSelectedBooking({ id: booking.id, name: booking.guest_name });
            return;
        }

        setLogsLoading(true);
        const { error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'checked_out' })
            .eq('id', booking.id);

        if (!bookingError) {
            await updateRoomStatus(tenant.id, selectedRoom.id, 'dirty');
            await logHousekeepingAction(tenant.id, {
                room_id: selectedRoom.id,
                old_status: selectedRoom.status,
                new_status: 'dirty',
                action_type: 'cleaning_request'
            });
            toast.success(`Guest checked-out. Room ${selectedRoom.room_number} is now dirty.`);
            
            // Refresh state
            setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status: 'dirty' } : r));
            setSelectedRoom(null);
        } else {
            toast.error("Process failed.");
        }
        setLogsLoading(false);
    };

    const handleCompleteMaintenance = async () => {
        if (!tenant || !selectedRoom) return;
        setLogsLoading(true);

        const { error } = await supabase
            .from('rooms')
            .update({ status: 'available' })
            .eq('id', selectedRoom.id);

        if (!error) {
            await supabase.from('room_logs').insert([{
                room_id: selectedRoom.id,
                org_id: tenant.id,
                old_status: 'maintenance',
                new_status: 'available',
                action_type: 'maintenance_completion'
            }]);
            
            setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status: 'available' } : r));
            setSelectedRoom(prev => prev ? { ...prev, status: 'available' } : null);
            toast.success("Maintenance completed.");
        }
        setLogsLoading(false);
    };

    const handleDeleteRoom = async () => {
        if (!tenant || !selectedRoom) return;
        
        const confirmed = window.confirm(`DANGER: Are you sure you want to permanently delete Room ${selectedRoom.room_number}? This action cannot be undone.`);
        if (!confirmed) return;

        setLogsLoading(true);
        try {
            const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', selectedRoom.id)
                .eq('org_id', tenant.id);

            if (error) throw error;

            toast.success(`Asset Deleted: Room ${selectedRoom.room_number} removed from inventory.`);
            setRooms(prev => prev.filter(r => r.id !== selectedRoom.id));
            setSelectedRoom(null);
        } catch (err: any) {
            toast.error(`Deletion failed: ${err.message}`);
        } finally {
            setLogsLoading(false);
        }
    };

    if (tenantLoading || loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground uppercase tracking-[0.2em] text-xs font-black">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Synchronizing Inventory...
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 glass-premium rounded-[3rem] border border-white/5 text-muted-foreground p-8 text-center">
                <p className="font-bold">Operational Context Unavailable.</p>
                <p className="text-xs max-w-sm">Please ensure you are accessing the dashboard through your property's unique subdomain or a direct impersonation link.</p>
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
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map((room, index) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card 
                            onClick={() => setSelectedRoom(room)}
                            className="glass-premium bg-white/[0.02] hover:bg-white/[0.04] group hover:border-blue-500/40 transition-all duration-500 cursor-pointer overflow-hidden border border-white/10 rounded-[2.5rem] relative"
                        >
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                            
                            <CardHeader className="p-7 pb-2 relative">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-3xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">Room {room.room_number}</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{room.type}</p>
                                    </div>
                                    <Badge variant="outline" className={`gap-1.5 px-3.5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm ${statusConfig[room.status as keyof typeof statusConfig]?.color || ""}`}>
                                        {statusConfig[room.status as keyof typeof statusConfig]?.icon}
                                        {statusConfig[room.status as keyof typeof statusConfig]?.label || room.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-7 pt-4 relative">
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Base Tariff</span>
                                        <span className="text-xl font-black text-white/90">₹{room.base_price}<span className="text-xs text-zinc-500 font-bold"> Tariff/night</span></span>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-10 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl bg-white/[0.03] border border-white/5 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all gap-2"
                                    >
                                        Details
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
                <DialogContent id={`${roomDetailsId}-content`} className="glass-premium border-white/20 bg-[#0a0a0c]/98 backdrop-blur-3xl text-white rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden w-[95vw] max-w-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                    {selectedRoom && (
                        <div className="flex flex-col">
                            {/* Header Section */}
                            <div className="p-8 pb-6 bg-gradient-to-br from-blue-600/10 to-transparent border-b border-white/5">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <DialogTitle className="text-4xl font-black tracking-tighter uppercase italic">Room <span className="text-blue-500">{selectedRoom.room_number}</span></DialogTitle>
                                        <DialogDescription className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Asset Profile & Operational Status</DialogDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={`gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${statusConfig[selectedRoom.status as keyof typeof statusConfig]?.color || ""}`}>
                                            {statusConfig[selectedRoom.status as keyof typeof statusConfig]?.icon}
                                            {statusConfig[selectedRoom.status as keyof typeof statusConfig]?.label || selectedRoom.status}
                                        </Badge>
                                        <Button 
                                            onClick={handleDeleteRoom}
                                            disabled={logsLoading || selectedRoom.status === 'occupied'}
                                            variant="ghost" 
                                            size="icon"
                                            className="h-10 w-10 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-500/20"
                                            title="Delete Asset"
                                        >
                                            {logsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                    <div className="glass-premium bg-white/[0.02] border-white/5 p-4 rounded-xl md:rounded-2xl">
                                        <div className="flex items-center gap-2 mb-1 text-zinc-500">
                                            <Layers className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Category</span>
                                        </div>
                                        <p className="font-black uppercase tracking-tight text-sm text-blue-400">{selectedRoom.type}</p>
                                    </div>
                                    <div className="glass-premium bg-white/[0.02] border-white/5 p-4 rounded-xl md:rounded-2xl">
                                        <div className="flex items-center gap-2 mb-1 text-zinc-500">
                                            <Info className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Floor Level</span>
                                        </div>
                                        <p className="font-black uppercase tracking-tight text-sm">{selectedRoom.floor || "1"}</p>
                                    </div>
                                    <div className="glass-premium bg-white/[0.02] border-white/5 p-4 rounded-xl md:rounded-2xl">
                                        <div className="flex items-center gap-2 mb-1 text-zinc-500">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Daily Tariff</span>
                                        </div>
                                        <p className="font-black uppercase tracking-tight text-sm">₹{selectedRoom.base_price}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Body Section */}
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <HistoryIcon className="w-4 h-4 text-blue-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Operational Timeline</h3>
                                    </div>
                                    <div className="space-y-2 max-h-[135px] overflow-y-auto pr-2 custom-scrollbar">
                                        {logsLoading ? (
                                            <div className="flex items-center justify-center p-8 text-zinc-600 uppercase font-black tracking-widest text-[9px] gap-2">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Decrypting Timeline...
                                            </div>
                                        ) : roomLogs.length === 0 ? (
                                            <div className="p-8 text-center text-zinc-700 font-bold uppercase tracking-widest text-[9px] italic border border-dashed border-white/5 rounded-2xl">
                                                No operational history recorded.
                                            </div>
                                        ) : (
                                            roomLogs.map((log, i) => (
                                                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group/log my-1">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-white/80 group-hover/log:text-blue-400 transition-colors">
                                                                {log.action_type === 'completion' ? 'Room Cleaned' : 
                                                                 log.action_type === 'assignment' ? 'Staff Assigned' : 
                                                                 `Status: ${log.old_status || 'init'} → ${log.new_status}`}
                                                            </span>
                                                        </div>
                                                        {log.staff?.full_name && (
                                                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                                                                By {log.staff.full_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase italic">
                                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Asset Amenities</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {amenitiesList.map(amenity => {
                                            // Check against the room category's amenities instead of individual room
                                            const isActive = (selectedRoom as any).room_types?.amenities?.includes(amenity.id);
                                            return (
                                                <div
                                                    key={amenity.id}
                                                    className={`flex items-center gap-2 p-3 md:p-3.5 rounded-xl md:rounded-2xl border transition-all ${
                                                        isActive
                                                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold'
                                                            : 'bg-white/[0.02] border-white/5 text-zinc-600/50 opacity-50 grayscale'
                                                    }`}
                                                >
                                                    {getIcon(amenity.icon)}
                                                    <span className="text-[9px] uppercase tracking-widest leading-none">{amenity.name}</span>
                                                </div>
                                            );
                                        })}
                                        {amenitiesList.length === 0 && (
                                            <div className="col-span-full py-6 text-center border border-dashed border-white/5 rounded-2xl">
                                                <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">No custom amenities defined.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <NewBookingDialog 
                                        defaultRoomId={selectedRoom.id}
                                        onSuccess={() => {
                                            toast.success("Reservation confirmed.");
                                            setSelectedRoom(null);
                                            window.location.reload(); 
                                        }}
                                        trigger={
                                            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20">
                                                Check In Guest
                                            </Button>
                                        }
                                    />
                                    {selectedRoom.status === 'occupied' && (selectedRoom as any).activeBooking && (
                                        <div className="flex w-full gap-3">
                                            <Button 
                                                onClick={() => setSelectedBooking({ 
                                                    id: (selectedRoom as any).activeBooking.id, 
                                                    name: (selectedRoom as any).activeBooking.guest_name 
                                                })}
                                                className="flex-1 h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-white/10"
                                            >
                                                Guest Bill
                                            </Button>
                                            <Button 
                                                onClick={handleCheckOut}
                                                disabled={logsLoading}
                                                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20"
                                            >
                                                {logsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Out"}
                                            </Button>
                                        </div>
                                    )}
                                    {selectedRoom.status === 'maintenance' ? (
                                        <Button 
                                            onClick={handleCompleteMaintenance}
                                            disabled={logsLoading}
                                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                                        >
                                            {logsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Maintenance"}
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={handleRequestCleaning}
                                            disabled={logsLoading || selectedRoom.status === 'dirty' || selectedRoom.status === 'cleaning'}
                                            variant="outline" 
                                            className="w-full h-14 glass-premium border-white/5 text-zinc-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                        >
                                            {logsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Cleaning"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {selectedBooking && (
                    <GuestFolio
                        bookingId={selectedBooking.id}
                        guestName={selectedBooking.name}
                        onClose={() => {
                            setSelectedBooking(null);
                            // No need for a full reload here, but let's re-fetch the room state if needed.
                            // For simplicity and since we don't have a specific room re-fetcher, let's reload.
                            window.location.reload();
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
