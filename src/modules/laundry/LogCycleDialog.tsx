"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLaundryCycle } from "@/app/(admin)/admin/hotels/actions";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { Loader2, WashingMachine, Truck, ShieldCheck } from "lucide-react";

export function LogCycleDialog({ trigger, onSuccess }: { trigger: React.ReactNode, onSuccess: () => void }) {
    const { tenant } = useTenant();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        type: "internal",
        staff_id: "",
        vendor_name: "",
        items: [{ type: "Linens", quantity: 1 }],
        status: "processing"
    });

    useEffect(() => {
        if (open && tenant) {
            fetchStaff();
        }
    }, [open, tenant]);

    async function fetchStaff() {
        const { data } = await supabase.from('staff').select('id, full_name').eq('org_id', tenant!.id).eq('is_active', true);
        if (data) setStaff(data);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setLoading(true);
        const res = await createLaundryCycle(tenant.id, formData);
        setLoading(false);

        if (res.success) {
            setOpen(false);
            onSuccess();
        } else {
            alert("Error: " + res.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="glass-premium border-white/10 sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem]">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
                        <WashingMachine className="w-8 h-8 text-blue-500" />
                        Log <span className="text-blue-500">Laundry</span> Cycle
                    </DialogTitle>
                    <p className="text-sm text-white/40 font-medium">Capture operational data for inventory reconciliation.</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Cycle Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v, vendor_name: v === 'internal' ? '' : prev.vendor_name }))}
                            >
                                <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-blue-500/20 transition-all font-bold">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent className="glass-premium border-white/10">
                                    <SelectItem value="internal">Internal (In-house)</SelectItem>
                                    <SelectItem value="external">External (Vendor)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Initial Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                            >
                                <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-blue-500/20 transition-all font-bold">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="glass-premium border-white/10">
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="pending">Pending Pick-up</SelectItem>
                                    <SelectItem value="completed">Already Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.type === 'internal' ? (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Handled By</Label>
                            <Select 
                                value={formData.staff_id} 
                                onValueChange={(v) => setFormData(prev => ({ ...prev, staff_id: v }))}
                            >
                                <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-blue-500/20 transition-all font-bold">
                                    <SelectValue placeholder="Select Staff Member" />
                                </SelectTrigger>
                                <SelectContent className="glass-premium border-white/10">
                                    {staff.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Vendor Name</Label>
                            <div className="relative group">
                                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                                <Input 
                                    placeholder="e.g. CityClean Solutions" 
                                    className="h-12 pl-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-blue-500/20 transition-all font-bold"
                                    value={formData.vendor_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Item Description</Label>
                        <Input 
                            placeholder="e.g. Deluxe Suite Linens x 5" 
                            className="h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-blue-500/20 transition-all font-bold"
                            value={formData.items?.[0]?.type || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, items: [{ type: e.target.value, quantity: 1 }] }))}
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-xl shadow-blue-900/40 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Commit Cycle Record
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
