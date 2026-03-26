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
import { Building2, Mail, User, Globe, ShieldAlert, Loader2 } from "lucide-react";

import { provisionHotel } from "./actions";

interface AddHotelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddHotelModal({ isOpen, onClose, onSuccess }: AddHotelModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingPlans, setFetchingPlans] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

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
        const planId = formData.get("tier") as string;
        
        // Find the plan object to get its name for backward compatibility
        const selectedPlan = plans.find(p => p.id === planId);

        try {
            const result = await provisionHotel({
                name,
                subdomain,
                adminEmail,
                adminName,
                tier: selectedPlan?.name || "Essential",
                planId: planId
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
            <DialogContent className="sm:max-w-[500px] glass-premium border-white/5 bg-[#0A0A0A]/90 backdrop-blur-3xl text-white rounded-[2rem] overflow-hidden p-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <DialogHeader>
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
                                    <Input name="name" placeholder="Grand Royale" className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Subdomain</Label>
                                <div className="relative group/input">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                    <Input name="subdomain" placeholder="grand-royale" className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm" required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admin Full Name</Label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                <Input name="adminName" placeholder="Ahmad Sana" className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admin Work Email</Label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                                <Input name="adminEmail" type="email" placeholder="admin@hotel.com" className="pl-12 h-12 bg-white/[0.02] border-white/5 rounded-xl text-sm" required />
                            </div>
                        </div>

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
                    </div>

                    <DialogFooter className="pt-4 flex !justify-between gap-4">
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
                                <Loader2 className="w-4 h-4 animate-spin" />
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
