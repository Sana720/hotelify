"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2, Mail, User, Globe, ShieldAlert, Loader2, Calendar, ShieldCheck } from "lucide-react";

import { provisionHotel } from "./actions";

interface AddHotelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        name?: string;
        email?: string;
    };
    leadId?: string;
}

export function AddHotelModal({ isOpen, onClose, onSuccess, initialData, leadId }: AddHotelModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingPlans, setFetchingPlans] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Dynamic subdomain generation based on initial name
    const defaultSubdomain = initialData?.name 
        ? initialData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        : "";

    useEffect(() => {
        async function fetchPlans() {
            try {
                const { data, error } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .order('price_monthly', { ascending: true });

                if (error) throw error;
                setPlans(data || []);
            } catch (err) {
                console.error("Failed to fetch plans:", err);
            } finally {
                setFetchingPlans(false);
            }
        }
        if (isOpen) fetchPlans();
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const subdomain = formData.get("subdomain") as string;
        const adminEmail = formData.get("adminEmail") as string;
        const adminName = formData.get("adminName") as string;
        const adminPassword = formData.get("adminPassword") as string;
        const planId = formData.get("tier") as string;
        const trialDays = formData.get("trialDays") as string;
        const isTrialEnabled = formData.get("isTrialEnabled") === "on";
        
        // Find the plan object to get its name for backward compatibility
        const selectedPlan = plans.find(p => p.id === planId);

        try {
            const result = await provisionHotel({
                name,
                subdomain,
                adminEmail,
                adminName,
                adminPassword,
                tier: selectedPlan?.name || "Essential",
                planId: planId,
                trialDays: isTrialEnabled ? parseInt(trialDays) : 0,
                leadId: leadId
            });

            if (!result.success) {
                throw new Error(result.error || "Failed to provision property infrastructure.");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Infrastructure Provisioning Error:", err);
            setError(err.message || "Failed to provision property infrastructure.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] glass-premium border-white/5 bg-[#0A0A0A]/90 backdrop-blur-3xl text-white rounded-[2rem] overflow-hidden p-0 max-h-[90vh] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        Provision New Property
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Initialize isolated infrastructure and admin account
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6 custom-scrollbar">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                                <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    {error}
                                </p>
                            </div>
                        )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Hotel Name</Label>
                                <div className="relative group/input">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                    <Input
                                        name="name"
                                        placeholder="Enter hotel name"
                                        defaultValue={initialData?.name}
                                        required
                                        className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Subdomain</Label>
                                <div className="relative group/input">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                    <Input 
                                        name="subdomain" 
                                        placeholder="unique-subdomain" 
                                        defaultValue={defaultSubdomain}
                                        required 
                                        className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm focus:ring-blue-500/20" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admin Full Name</Label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                <Input 
                                    name="adminName" 
                                    placeholder="Enter admin full name" 
                                    required 
                                    className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm focus:ring-blue-500/20" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admin Work Email</Label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                <Input 
                                    name="adminEmail" 
                                    type="email" 
                                    placeholder="admin@example.com" 
                                    defaultValue={initialData?.email}
                                    required 
                                    className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm focus:ring-blue-500/20" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Temporary Password</Label>
                            <div className="relative group/input">
                                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                <Input 
                                    name="adminPassword" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    defaultValue="Hotelify123!"
                                    required 
                                    className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm focus:ring-blue-500/20" 
                                />
                            </div>
                            <p className="px-1 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Sets an initial password for immediate login.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Subscription Tier</Label>
                                <Select name="tier" defaultValue={plans[0]?.id}>
                                    <SelectTrigger className="h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm focus:ring-blue-500/20">
                                        <SelectValue placeholder={fetchingPlans ? "Loading Plans..." : "Select Plan"} />
                                    </SelectTrigger>
                                    <SelectContent className="glass-premium border-white/10 bg-[#0A0A0A] text-white">
                                        {fetchingPlans ? (
                                            <div className="p-4 flex items-center justify-center">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            </div>
                                        ) : plans.length > 0 ? (
                                            plans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    {plan.name} (₹{plan.price_monthly})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-[10px] font-bold text-zinc-500 uppercase text-center">
                                                No plans found. Sync required.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Trial Period (Days)</Label>
                                <div className="relative group/input">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-emerald-400 transition-colors" />
                                    <Input 
                                        name="trialDays" 
                                        type="number" 
                                        defaultValue="14" 
                                        min="0"
                                        className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Initialize with Free Trial</div>
                                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Property will start in 'Trialing' status</div>
                                </div>
                            </div>
                            <input 
                                type="checkbox" 
                                name="isTrialEnabled" 
                                defaultChecked 
                                className="w-5 h-5 rounded border-white/10 bg-white/5 accent-emerald-500 cursor-pointer" 
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 border-t border-white/5 bg-white/[0.02] flex !justify-between gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] group"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Provisioning...</span>
                                </div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create Infrastructure
                                    <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
