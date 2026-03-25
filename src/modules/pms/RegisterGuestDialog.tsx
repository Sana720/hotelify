"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Phone, Mail, CreditCard, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useTenant } from "@/components/providers/TenantProvider";
import { registerGuest } from "@/app/(admin)/admin/hotels/actions";
import { toast } from "sonner";

interface RegisterGuestDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: (guest: any) => void;
}

export function RegisterGuestDialog({ trigger, onSuccess }: RegisterGuestDialogProps) {
    const { tenant } = useTenant();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [guestType, setGuestType] = useState<'individual' | 'corporate'>('individual');
    
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        aadhaar_number: "",
        company_name: "",
        company_gst: "",
        company_address: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsLoading(true);
        try {
            const res = await registerGuest(tenant.id, {
                ...formData,
                guest_type: guestType
            });

            if (res.success) {
                toast.success(`Guest registered successfully!`);
                setOpen(false);
                onSuccess?.(res.guest);
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    aadhaar_number: "",
                    company_name: "",
                    company_gst: "",
                    company_address: ""
                });
            } else {
                toast.error(res.error || "Failed to register guest");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Register New Guest</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-[700px] border-white/10 bg-[#070708] text-white p-0 overflow-hidden font-sans shadow-[0_0_100px_rgba(0,0,0,1)]">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                    <User className="w-5 h-5 text-indigo-400" />
                                </div>
                                <DialogTitle className="text-2xl font-black text-white italic tracking-tighter">
                                    Intelligence Core: Guest Discovery
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                                Profiling new arrival for automated recognition and loyalty tracking
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={guestType} onValueChange={(val: any) => setGuestType(val)} className="mt-8">
                            <TabsList className="bg-[#0a0a0c] border border-white/5 p-1.5 h-16 rounded-2xl w-full max-w-[450px] shadow-2xl">
                                <TabsTrigger 
                                    value="individual" 
                                    className="rounded-xl font-black uppercase tracking-widest text-[10px] text-zinc-500 data-[state=active]:!bg-white/[0.05] data-[state=active]:!text-blue-400 data-[state=active]:!border-blue-500/50 data-[state=active]:!shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300 flex-1 h-full gap-2 border border-transparent"
                                >
                                    <User className="w-5 h-5" />
                                    Individual
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="corporate" 
                                    className="rounded-xl font-black uppercase tracking-widest text-[10px] text-zinc-500 data-[state=active]:!bg-white/[0.05] data-[state=active]:!text-blue-400 data-[state=active]:!border-blue-500/50 data-[state=active]:!shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300 flex-1 h-full gap-2 border border-transparent"
                                >
                                    <Building2 className="w-5 h-5" />
                                    Corporate
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* --- Base Intelligence: Common Fields --- */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400">01. Primary Identification</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Contact Name <span className="text-red-500">*</span></Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            required
                                            placeholder="Full legal name..."
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Universal Phone <span className="text-red-500">*</span></Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                        <Input
                                            required
                                            placeholder="+91 00000 00000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Secure Email (Optional)</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="discovery@intelligence.net"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Conditional Logic: Corporate Intelligence --- */}
                        {guestType === 'corporate' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">02. Corporate Nexus</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Company Entity <span className="text-red-500">*</span></Label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                            <Input
                                                required
                                                placeholder="Legal Company Name..."
                                                value={formData.company_name}
                                                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                                className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">TAX/GST Identification <span className="text-red-500">*</span></Label>
                                        <div className="relative group">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                            <Input
                                                required
                                                placeholder="GSTIN Number..."
                                                value={formData.company_gst}
                                                onChange={e => setFormData({ ...formData, company_gst: e.target.value })}
                                                className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Registered Address <span className="text-red-500">*</span></Label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                            <textarea
                                                required
                                                placeholder="Complete billing address for GST compliance..."
                                                value={formData.company_address}
                                                onChange={e => setFormData({ ...formData, company_address: e.target.value })}
                                                className="w-full min-h-[100px] pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500 outline-none placeholder:text-zinc-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">02. Individual Dossier</span>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Aadhaar/National ID (Optional)</Label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:!text-blue-400 transition-colors" />
                                        <Input
                                            placeholder="XXXX XXXX XXXX"
                                            value={formData.aadhaar_number}
                                            onChange={e => setFormData({ ...formData, aadhaar_number: e.target.value })}
                                            className="pl-12 h-11 bg-white/[0.03] border-white/10 rounded-xl font-bold text-sm transition-all focus-visible:!ring-2 focus-visible:!ring-blue-500/20 focus-visible:!border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setOpen(false)}
                            className="rounded-xl font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white"
                        >
                            Abort
                        </Button>
                        <Button 
                            disabled={isLoading}
                            className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] h-11 gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Synchronize Profile
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
