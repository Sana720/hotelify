"use client";

import { useState } from "react";
import { RoomGrid } from "@/modules/pms/RoomGrid";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

export default function RoomsPage() {
    const { tenant } = useTenant();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [formData, setFormData] = useState({
        room_number: "",
        type: "Deluxe King",
        base_price: "299",
        floor: "1"
    });

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsLoading(true);
        const { error } = await supabase
            .from('rooms')
            .insert([{
                ...formData,
                org_id: tenant.id,
                base_price: parseFloat(formData.base_price),
                status: 'available'
            }]);

        if (!error) {
            setIsOpen(false);
            setRefreshKey(prev => prev + 1);
            setFormData({ room_number: "", type: "Deluxe King", base_price: "299", floor: "1" });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Room Inventory</h1>
                    <p className="text-zinc-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Live status of all property assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass-premium border-white/5 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4" />
                        Sort & Filter
                    </Button>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-zinc-200 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-white/5 transition-all">
                                <Plus className="w-4 h-4" />
                                Add Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-premium border-white/10 bg-[#0a0a0c]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight">Expand Inventory</DialogTitle>
                                <DialogDescription className="text-zinc-500 font-medium">Add a new room to your property management system.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddRoom} className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Room Number</Label>
                                        <Input
                                            placeholder="101"
                                            value={formData.room_number}
                                            onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                                            className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Floor</Label>
                                        <Input
                                            placeholder="1"
                                            value={formData.floor}
                                            onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                            className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Room Type</Label>
                                    <Input
                                        placeholder="Deluxe King"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Base Price (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="299"
                                        value={formData.base_price}
                                        onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                        required
                                    />
                                </div>
                                <DialogFooter className="mt-8">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Inventory Entry"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <RoomGrid key={refreshKey} />
        </div>
    );
}
