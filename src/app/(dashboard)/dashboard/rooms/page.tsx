"use client";

import { useState, useEffect, useId } from "react";
import { RoomGrid } from "@/modules/pms/RoomGrid";
import { Button } from "@/components/ui/button";
import { 
    Plus, 
    Filter, 
    Loader2, 
    Hotel as HotelIcon,
    Wifi, 
    Wind, 
    Tv, 
    Coffee, 
    ShieldCheck, 
    Mountain, 
    Waves, 
    Utensils, 
    Car, 
    Gamepad 
} from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";

export default function RoomsPage() {
    const { tenant } = useTenant();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [amenitiesList, setAmenitiesList] = useState<any[]>([]);
    const roomDialogId = useId();

    const [formData, setFormData] = useState({
        room_number: "",
        room_type_id: "",
        floor: "1",
        amenities: [] as string[]
    });

    useEffect(() => {
        async function fetchRoomTypes() {
            if (!tenant) return;
            const { data } = await supabase
                .from('room_types')
                .select('id, name, base_price')
                .eq('org_id', tenant.id);
            if (data) setRoomTypes(data);
        }
        
        async function fetchAmenities() {
            if (!tenant) return;
            const { data } = await supabase
                .from('amenities')
                .select('*')
                .eq('org_id', tenant.id);
            if (data) setAmenitiesList(data || []);
        }

        fetchRoomTypes();
        fetchAmenities();
    }, [tenant, isOpen, refreshKey]);

    const getIcon = (iconName: string) => {
        const icons: any = { Wifi, Wind, Tv, Coffee, ShieldCheck, Mountain, Waves, Utensils, Car, Gamepad };
        const Icon = icons[iconName] || Wifi;
        return <Icon className="w-3.5 h-3.5" />;
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsLoading(true);
        const selectedType = roomTypes.find(t => t.id === formData.room_type_id);

        const { error } = await supabase
            .from('rooms')
            .insert([{
                room_number: formData.room_number,
                room_type_id: formData.room_type_id,
                floor: formData.floor,
                type: selectedType?.name || "Standard",
                base_price: selectedType?.base_price || 0,
                org_id: tenant.id,
                status: 'available',
                amenities: formData.amenities
            }]);

        if (!error) {
            setIsOpen(false);
            setRefreshKey(prev => prev + 1);
            setFormData({ room_number: "", room_type_id: "", floor: "1", amenities: [] });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Room <span className="text-blue-500">Inventory</span></h1>
                    <p className="text-zinc-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Real-time logistics & asset management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass-premium border-white/5 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4" />
                        Sort & Filter
                    </Button>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild id={`${roomDialogId}-trigger`}>
                            <Button className="bg-white text-black hover:bg-zinc-200 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-white/5 transition-all">
                                <Plus className="w-4 h-4" />
                                New Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent id={`${roomDialogId}-content`} className="glass-premium border-white/10 bg-[#0a0a0c]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">Inventory <span className="text-blue-500">Expansion</span></DialogTitle>
                                <DialogDescription className="text-zinc-500 font-medium">Link a physical room to a defined room category.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddRoom} className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Room Identifier <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="e.g. 101"
                                            value={formData.room_number}
                                            onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                                            className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Floor Level <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="1"
                                            value={formData.floor}
                                            onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                            className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Room Category <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.room_type_id}
                                        onValueChange={v => setFormData({ ...formData, room_type_id: v })}
                                        required
                                    >
                                        <SelectTrigger className="h-14 bg-white/[0.03] border-white/5 rounded-xl font-bold">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-premium border-white/10">
                                            {roomTypes.map((type: any) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    <div className="flex justify-between items-center w-full gap-8">
                                                        <span className="font-bold uppercase tracking-tight italic">{type.name}</span>
                                                        <span className="text-blue-400 font-bold ml-auto text-[10px]">₹{type.base_price}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {roomTypes.length === 0 && (
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] font-bold text-zinc-500 mb-2">NO CATEGORIES DEFINED</p>
                                                    <Button variant="link" className="text-blue-400 text-xs p-0 h-auto font-black" onClick={() => window.location.href = '/dashboard/settings'}>
                                                        Setup Room Types →
                                                    </Button>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Room Amenities</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {amenitiesList.map(amenity => (
                                            <button
                                                key={amenity.id}
                                                type="button"
                                                onClick={() => {
                                                    const newAmenities = formData.amenities.includes(amenity.id)
                                                        ? formData.amenities.filter(a => a !== amenity.id)
                                                        : [...formData.amenities, amenity.id];
                                                    setFormData({ ...formData, amenities: newAmenities });
                                                }}
                                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                                                    formData.amenities.includes(amenity.id)
                                                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold'
                                                        : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.05]'
                                                }`}
                                            >
                                                {getIcon(amenity.icon)}
                                                <span className="text-[9px] uppercase tracking-widest">{amenity.name}</span>
                                            </button>
                                        ))}
                                        {amenitiesList.length === 0 && (
                                            <div className="col-span-full py-4 text-center border border-dashed border-white/5 rounded-2xl">
                                                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">No amenities available. Use 'Manage Amenities' to define some.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter className="mt-8">
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !formData.room_type_id}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy to Inventory"}
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
