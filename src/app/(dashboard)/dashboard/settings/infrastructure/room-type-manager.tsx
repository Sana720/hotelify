"use client";

import React, { useState, useEffect } from "react";
import { Plus, Hotel, Bed, Trash2, Edit3, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";
import { createRoomType, deleteRoomType, updateRoomType } from "@/app/(admin)/admin/hotels/actions";

export function RoomTypeManager() {
    const { tenant } = useTenant();
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [amenities, setAmenities] = useState<any[]>([]);
    const [bedTypes, setBedTypes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        base_occupancy: 2,
        max_occupancy: 2,
        base_price: "",
        amenities: [] as string[],
        bed_configuration: [] as any[]
    });

    async function fetchData() {
        if (!tenant) return;
        setIsLoading(true);

        const [rtRes, amRes, btRes] = await Promise.all([
            supabase.from('room_types').select('*').eq('org_id', tenant.id),
            supabase.from('amenities_master').select('*'),
            supabase.from('bed_types').select('*')
        ]);

        if (rtRes.data) setRoomTypes(rtRes.data);
        if (amRes.data) setAmenities(amRes.data);
        if (btRes.data) setBedTypes(btRes.data);

        setIsLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [tenant]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                base_price: parseFloat(formData.base_price)
            };

            const result = editingId 
                ? await updateRoomType(tenant.id, editingId, payload)
                : await createRoomType(tenant.id, payload);

            if (!result.success) {
                throw new Error(result.error);
            }

            setIsModalOpen(false);
            setEditingId(null);
            fetchData();
            resetForm();
        } catch (error: any) {
            console.error("Operation Failed:", error);
            alert("Action failed: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            base_occupancy: 2,
            max_occupancy: 2,
            base_price: "",
            amenities: [],
            bed_configuration: []
        });
        setEditingId(null);
    };

    const openEditModal = (rt: any) => {
        setEditingId(rt.id);
        setFormData({
            name: rt.name,
            description: rt.description || "",
            base_occupancy: rt.base_occupancy,
            max_occupancy: rt.max_occupancy,
            base_price: rt.base_price.toString(),
            amenities: rt.amenities || [],
            bed_configuration: rt.bed_configuration || []
        });
        setIsModalOpen(true);
    };

    const toggleAmenity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter(a => a !== id)
                : [...prev.amenities, id]
        }));
    };
    
    const handleDelete = async (id: string) => {
        if (!tenant || !confirm("Are you sure you want to delete this room category?")) return;
        
        try {
            const result = await deleteRoomType(tenant.id, id);
            if (!result.success) throw new Error(result.error);
            fetchData();
        } catch (error: any) {
            console.error("Delete failed:", error);
            alert("Delete failed: " + error.message);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Infrastructure / Room Types</h3>
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-blue-600/20">
                            <Plus className="w-4 h-4" />
                            Create Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-premium border-white/10 bg-[#0a0a0c]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                                {editingId ? "Refine" : "Define"} Room <span className="text-blue-500">Class</span>
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 font-medium tracking-tight">Set expectations for guest accommodation and pricing.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSave} className="space-y-8 mt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category Name</Label>
                                    <Input
                                        placeholder="Executive King Suite"
                                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                        value={formData.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Base Price (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="5999"
                                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                        value={formData.base_price}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, base_price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Brief Description</Label>
                                <Textarea
                                    placeholder="Sophisticated living spaces with city views..."
                                    className="bg-white/[0.03] border-white/5 rounded-xl font-medium min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Base Occupancy</Label>
                                    <Input
                                        type="number"
                                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                        value={formData.base_occupancy}
                                        onChange={e => setFormData({ ...formData, base_occupancy: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Max Occupancy</Label>
                                    <Input
                                        type="number"
                                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl font-bold"
                                        value={formData.max_occupancy}
                                        onChange={e => setFormData({ ...formData, max_occupancy: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Room Amenities</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {amenities.map(am => (
                                        <div
                                            key={am.id}
                                            onClick={() => toggleAmenity(am.id)}
                                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${formData.amenities.includes(am.id)
                                                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                                                : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="p-1.5 rounded-lg bg-zinc-900/50">
                                                <Hotel className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider truncate">{am.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="mt-8">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(37,99,235,0.2)]"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : (editingId ? "Update Category" : "Deploy Category")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roomTypes.map(rt => (
                    <Card key={rt.id} className="glass-premium bg-white/[0.02] border-white/10 group hover:border-blue-500/40 transition-all duration-500 overflow-hidden relative rounded-[2rem]">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h4 className="font-black text-2xl text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight italic leading-tight">{rt.name}</h4>
                                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Bed className="w-3.5 h-3.5 text-blue-500/50" /> {rt.base_occupancy} - {rt.max_occupancy} Guests
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white leading-none tracking-tighter">₹{rt.base_price}</p>
                                    <p className="text-[8px] text-blue-500 font-bold uppercase tracking-widest mt-1">Per Night</p>
                                </div>
                            </div>
                            
                            <p className="text-xs text-zinc-400 line-clamp-2 mb-8 font-medium leading-relaxed italic">
                                "{rt.description || "Sophisticated architectural logic and premium aesthetics defined for this room class."}"
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {rt.amenities?.slice(0, 3).map((amId: string) => {
                                    const am = amenities.find(a => a.id === amId);
                                    return am ? (
                                        <div key={am.id} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[8px] font-black uppercase text-zinc-500 tracking-widest group-hover:border-blue-500/20 group-hover:bg-blue-500/[0.02] transition-colors">
                                            {am.name}
                                        </div>
                                    ) : null;
                                })}
                                {rt.amenities?.length > 3 && (
                                    <div className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-[8px] font-black uppercase text-blue-400 tracking-widest">
                                        +{rt.amenities.length - 3} More
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 h-10 bg-white/[0.02] hover:bg-blue-600 hover:text-white border border-white/5 hover:border-blue-500 rounded-xl transition-all gap-2 text-[9px] font-black uppercase tracking-widest"
                                    onClick={() => openEditModal(rt)}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Configure
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-10 h-10 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all"
                                    onClick={() => handleDelete(rt.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {roomTypes.length === 0 && (
                    <div className="col-span-full py-24 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-zinc-600 bg-white/[0.01]">
                        <div className="p-6 rounded-full bg-blue-500/5 mb-6">
                            <Hotel className="w-12 h-12 opacity-20 text-blue-500" />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-400">Inventory Logic Empty</p>
                        <p className="text-[10px] font-medium mt-2 text-zinc-600">Start by defining your first room category definition.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
