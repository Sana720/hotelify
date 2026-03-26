"use client";

import { useState, useEffect, useId } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Loader2, 
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
    Trees
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";
import { toast } from "sonner";

const ICON_OPTIONS = [
    { name: 'Wifi', icon: <Wifi className="w-4 h-4" /> },
    { name: 'Wind', icon: <Wind className="w-4 h-4" /> },
    { name: 'Tv', icon: <Tv className="w-4 h-4" /> },
    { name: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
    { name: 'ShieldCheck', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'Mountain', icon: <Mountain className="w-4 h-4" /> },
    { name: 'Waves', icon: <Waves className="w-4 h-4" /> },
    { name: 'Utensils', icon: <Utensils className="w-4 h-4" /> },
    { name: 'Car', icon: <Car className="w-4 h-4" /> },
    { name: 'Gamepad', icon: <Gamepad className="w-4 h-4" /> },
    { name: 'Dumbbell', icon: <Dumbbell className="w-4 h-4" /> },
    { name: 'Pizza', icon: <Pizza className="w-4 h-4" /> },
    { name: 'Wine', icon: <Wine className="w-4 h-4" /> },
    { name: 'Flower2', icon: <Flower2 className="w-4 h-4" /> },
    { name: 'WashingMachine', icon: <WashingMachine className="w-4 h-4" /> },
    { name: 'Shirt', icon: <Shirt className="w-4 h-4" /> },
    { name: 'Refrigerator', icon: <Refrigerator className="w-4 h-4" /> },
    { name: 'Bell', icon: <Bell className="w-4 h-4" /> },
    { name: 'Microwave', icon: <Microwave className="w-4 h-4" /> },
    { name: 'Bath', icon: <Bath className="w-4 h-4" /> },
    { name: 'ShowerHead', icon: <ShowerHead className="w-4 h-4" /> },
    { name: 'Baby', icon: <Baby className="w-4 h-4" /> },
    { name: 'Accessibility', icon: <Accessibility className="w-4 h-4" /> },
    { name: 'CigaretteOff', icon: <CigaretteOff className="w-4 h-4" /> },
    { name: 'PawPrint', icon: <PawPrint className="w-4 h-4" /> },
    { name: 'Lock', icon: <Lock className="w-4 h-4" /> },
    { name: 'Key', icon: <Key className="w-4 h-4" /> },
    { name: 'Bike', icon: <Bike className="w-4 h-4" /> },
    { name: 'Bus', icon: <Bus className="w-4 h-4" /> },
    { name: 'Plane', icon: <Plane className="w-4 h-4" /> },
    { name: 'Monitor', icon: <Monitor className="w-4 h-4" /> },
    { name: 'Music', icon: <Music className="w-4 h-4" /> },
    { name: 'Thermometer', icon: <Thermometer className="w-4 h-4" /> },
    { name: 'Fan', icon: <Fan className="w-4 h-4" /> },
    { name: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
    { name: 'Briefcase', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Trees', icon: <Trees className="w-4 h-4" /> }
];

export function AmenityManager({ onSuccess }: { onSuccess?: () => void }) {
    const { tenant } = useTenant();
    const [amenities, setAmenities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: "", icon: "Wifi" });
    const managerId = useId();

    useEffect(() => {
        if (!tenant) return;
        fetchAmenities();
    }, [tenant]);

    async function fetchAmenities() {
        const { data, error } = await supabase
            .from('amenities')
            .select('*')
            .eq('org_id', tenant!.id)
            .order('name');
        
        if (data) setAmenities(data);
        setLoading(false);
    }

    const handleAdd = async () => {
        if (!formData.name) return;
        setIsAdding(true);
        const { error } = await supabase
            .from('amenities')
            .insert([{
                org_id: tenant!.id,
                name: formData.name,
                icon: formData.icon
            }]);

        if (!error) {
            toast.success("Amenity added.");
            setFormData({ name: "", icon: "Wifi" });
            fetchAmenities();
            if (onSuccess) onSuccess();
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('amenities')
            .delete()
            .eq('id', id);

        if (!error) {
            toast.success("Amenity removed.");
            fetchAmenities();
            if (onSuccess) onSuccess();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild id={`${managerId}-trigger`}>
                <Button variant="outline" className="glass-premium border-white/5 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]">
                    <Plus className="w-4 h-4" />
                    Manage Amenities
                </Button>
            </DialogTrigger>
            <DialogContent id={`${managerId}-content`} className="glass-premium border-white/10 bg-[#0a0a0c]/98 backdrop-blur-3xl text-white rounded-[2.5rem] p-8 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Amenity <span className="text-blue-500">Inventory</span></DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Add Form */}
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Amenity Name</Label>
                            <Input 
                                placeholder="e.g. Infinity Pool"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Symbol</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {ICON_OPTIONS.map(opt => (
                                    <button
                                        key={opt.name}
                                        onClick={() => setFormData({ ...formData, icon: opt.name })}
                                        className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                                            formData.icon === opt.name 
                                                ? 'bg-blue-600 border-blue-500 text-white' 
                                                : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        {opt.icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button 
                            onClick={handleAdd}
                            disabled={isAdding || !formData.name}
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registry Entry"}
                        </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : amenities.length === 0 ? (
                            <p className="text-center text-zinc-600 font-bold uppercase tracking-widest text-[9px] py-8">No Custom Amenities Defined</p>
                        ) : (
                            amenities.map(amenity => (
                                <div key={amenity.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            {ICON_OPTIONS.find(o => o.name === amenity.icon)?.icon || <Wifi className="w-4 h-4" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tight text-white/80">{amenity.name}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDelete(amenity.id)}
                                        className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
