"use client";

import { useState, useEffect } from "react";
import { BookingList } from "@/modules/pms/BookingList";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Loader2, Calendar as CalendarIcon, User, Mail, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

export default function BookingsPage() {
    const { tenant } = useTenant();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const [formData, setFormData] = useState({
        guest_name: "",
        guest_email: "",
        room_id: "",
        check_in: new Date().toISOString().split('T')[0],
        check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        total_price: "299"
    });

    useEffect(() => {
        if (tenant && isOpen) {
            fetchRooms();
        }
    }, [tenant, isOpen]);

    async function fetchRooms() {
        const { data } = await supabase
            .from('rooms')
            .select('id, room_number, type, base_price')
            .eq('org_id', tenant?.id)
            .eq('status', 'available');
        if (data) setRooms(data);
    }

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsLoading(true);
        const { error } = await supabase
            .from('bookings')
            .insert([{
                ...formData,
                org_id: tenant.id,
                total_price: parseFloat(formData.total_price),
                status: 'confirmed'
            }]);

        if (!error) {
            // Also update room status to occupied
            await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('id', formData.room_id);

            setIsOpen(false);
            setRefreshKey(prev => prev + 1);
            setFormData({
                guest_name: "",
                guest_email: "",
                room_id: "",
                check_in: new Date().toISOString().split('T')[0],
                check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                total_price: "299"
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white uppercase">Reservations</h1>
                    <p className="text-zinc-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Managing the guest journey from arrival to departure.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass-premium border-white/5 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4" />
                        Intelligence Filter
                    </Button>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 transition-all">
                                <Plus className="w-4 h-4" />
                                New Reservation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-premium border-white/10 bg-[#0a0a0c]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-8 max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <CalendarIcon className="w-6 h-6 text-indigo-400" />
                                    Book Guest Stay
                                </DialogTitle>
                                <DialogDescription className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Secure a premium guest experience.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateBooking} className="space-y-8 mt-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Guest Name</Label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <Input
                                                placeholder="Alex J. Rivera"
                                                value={formData.guest_name}
                                                onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                                                className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold transition-all focus:ring-indigo-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Contact Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="guest@example.com"
                                                value={formData.guest_email}
                                                onChange={e => setFormData({ ...formData, guest_email: e.target.value })}
                                                className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold transition-all focus:ring-indigo-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Select Available Room</Label>
                                    <Select
                                        value={formData.room_id}
                                        onValueChange={(val: string) => {
                                            const room = rooms.find(r => r.id === val);
                                            setFormData({ ...formData, room_id: val, total_price: room?.base_price.toString() || "299" });
                                        }}
                                    >
                                        <SelectTrigger className="h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold px-6">
                                            <SelectValue placeholder="Identify room for placement..." />
                                        </SelectTrigger>
                                        <SelectContent className="glass-premium border-white/10 bg-[#0a0a0c] text-white rounded-2xl">
                                            {rooms.map(room => (
                                                <SelectItem key={room.id} value={room.id} className="hover:bg-white/5 rounded-xl font-bold">
                                                    Room {room.room_number} — {room.type} (₹{room.base_price}/nt)
                                                </SelectItem>
                                            ))}
                                            {rooms.length === 0 && <div className="p-4 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No Rooms Available</div>}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Check In</Label>
                                        <Input
                                            type="date"
                                            value={formData.check_in}
                                            onChange={e => setFormData({ ...formData, check_in: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Check Out</Label>
                                        <Input
                                            type="date"
                                            value={formData.check_out}
                                            onChange={e => setFormData({ ...formData, check_out: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="mt-8">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-white/5 group"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <span className="flex items-center gap-3">
                                                Confirm Reservation & Sync CRM
                                                <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                        placeholder="Search by identity, suite, or digital signature..."
                        className="pl-14 h-14 glass-premium border-white/5 rounded-2xl focus:ring-indigo-500/20 font-bold bg-white/[0.02]"
                    />
                </div>
            </div>

            <BookingList key={refreshKey} />
        </div>
    );
}
