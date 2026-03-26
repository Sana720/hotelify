"use client";

import { useState, useEffect } from "react";
import { 
    Plus, 
    Trash2, 
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
    Sparkles,
    Hotel as HotelIcon,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const ICON_OPTIONS = [
    { name: 'Wifi', icon: <Wifi className="w-5 h-5" /> },
    { name: 'Wind', icon: <Wind className="w-5 h-5" /> },
    { name: 'Tv', icon: <Tv className="w-5 h-5" /> },
    { name: 'Coffee', icon: <Coffee className="w-5 h-5" /> },
    { name: 'ShieldCheck', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'Mountain', icon: <Mountain className="w-5 h-5" /> },
    { name: 'Waves', icon: <Waves className="w-5 h-5" /> },
    { name: 'Utensils', icon: <Utensils className="w-5 h-5" /> },
    { name: 'Car', icon: <Car className="w-5 h-5" /> },
    { name: 'Gamepad', icon: <Gamepad className="w-5 h-5" /> },
    { name: 'Dumbbell', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Pizza', icon: <Pizza className="w-5 h-5" /> },
    { name: 'Wine', icon: <Wine className="w-5 h-5" /> },
    { name: 'Flower2', icon: <Flower2 className="w-5 h-5" /> },
    { name: 'WashingMachine', icon: <WashingMachine className="w-5 h-5" /> },
    { name: 'Shirt', icon: <Shirt className="w-5 h-5" /> },
    { name: 'Refrigerator', icon: <Refrigerator className="w-5 h-5" /> },
    { name: 'Bell', icon: <Bell className="w-5 h-5" /> },
    { name: 'Microwave', icon: <Microwave className="w-5 h-5" /> },
    { name: 'Bath', icon: <Bath className="w-5 h-5" /> },
    { name: 'ShowerHead', icon: <ShowerHead className="w-5 h-5" /> },
    { name: 'Baby', icon: <Baby className="w-5 h-5" /> },
    { name: 'Accessibility', icon: <Accessibility className="w-5 h-5" /> },
    { name: 'CigaretteOff', icon: <CigaretteOff className="w-5 h-5" /> },
    { name: 'PawPrint', icon: <PawPrint className="w-5 h-5" /> },
    { name: 'Lock', icon: <Lock className="w-5 h-5" /> },
    { name: 'Key', icon: <Key className="w-5 h-5" /> },
    { name: 'Bike', icon: <Bike className="w-5 h-5" /> },
    { name: 'Bus', icon: <Bus className="w-5 h-5" /> },
    { name: 'Plane', icon: <Plane className="w-5 h-5" /> },
    { name: 'Monitor', icon: <Monitor className="w-5 h-5" /> },
    { name: 'Music', icon: <Music className="w-5 h-5" /> },
    { name: 'Thermometer', icon: <Thermometer className="w-5 h-5" /> },
    { name: 'Fan', icon: <Fan className="w-5 h-5" /> },
    { name: 'Laptop', icon: <Laptop className="w-5 h-5" /> },
    { name: 'Briefcase', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Trees', icon: <Trees className="w-5 h-5" /> }
];

export default function AmenitiesPage() {
    const { tenant } = useTenant();
    const [amenities, setAmenities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: "", icon: "Wifi" });

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
            toast.success("Amenity added to property registry.");
            setFormData({ name: "", icon: "Wifi" });
            fetchAmenities();
        } else {
            toast.error("Process failed. Please check connectivity.");
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('amenities')
            .delete()
            .eq('id', id);

        if (!error) {
            toast.success("Amenity removed from inventory.");
            fetchAmenities();
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4">
            {/* Header Area */}
            <div className="flex justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-600/10 rounded-xl">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Asset Management</h2>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                        Amenity <span className="text-blue-500">Inventory</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Addition Console */}
                <div className="lg:col-span-1">
                    <div className="glass-premium bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-8 sticky top-8">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase italic text-white">Registry <span className="text-blue-500">Console</span></h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Add unique features to your property's service profile.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Feature Name</Label>
                                <Input 
                                    placeholder="e.g. Roof Top Lounge"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 bg-white/[0.03] border-white/5 rounded-2xl font-bold text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-blue-500/40 transition-all border-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Visual Symbol</Label>
                                <div className="grid grid-cols-5 gap-3">
                                    {ICON_OPTIONS.map(opt => (
                                        <button
                                            key={opt.name}
                                            onClick={() => setFormData({ ...formData, icon: opt.name })}
                                            className={`h-12 rounded-xl border transition-all flex items-center justify-center ${
                                                formData.icon === opt.name 
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                                    : 'bg-white/[0.03] border-white/5 text-zinc-600 hover:bg-white/[0.05]'
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
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                            >
                                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy to Registry"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-600 uppercase tracking-[0.2em] text-[10px] font-black italic">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            Loading Registry Data...
                        </div>
                    ) : amenities.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-6 glass-premium rounded-[3rem] border border-dashed border-white/10 text-center p-12 bg-white/[0.01]">
                            <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-blue-500/20" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-black uppercase italic text-zinc-500">Registry Depleted.</p>
                                <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest max-w-xs">No custom amenities found for this property. Initialize your inventory using the console.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {amenities.map((amenity, idx) => (
                                <motion.div
                                    key={amenity.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <div className="glass-premium bg-white/[0.02] border border-white/5 hover:border-blue-500/30 p-6 rounded-[2rem] transition-all duration-500 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                                                {ICON_OPTIONS.find(o => o.name === amenity.icon)?.icon || <Wifi className="w-6 h-6" />}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">
                                                    {amenity.name}
                                                </span>
                                                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Active Amenity</p>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => handleDelete(amenity.id)}
                                            className="h-10 w-10 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
