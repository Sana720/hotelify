"use client";

import React, { useState, useEffect } from "react";
import { Save, Clock, ShieldCheck, Dog, Cigarette, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/components/providers/TenantProvider";

export function PolicySettingsForm() {
    const { tenant } = useTenant();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        check_in_time: "14:00",
        check_out_time: "11:00",
        cancellation_policy: "",
        child_policy: "",
        pets_allowed: false,
        smoking_allowed: false,
        extra_bed_policy: { allowed: false, charge: 0 }
    });

    useEffect(() => {
        async function fetchPolicies() {
            if (!tenant) return;
            try {
                const { data, error } = await supabase
                    .from('operational_policies')
                    .select('*')
                    .eq('org_id', tenant.id)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching policies:", error);
                }

                if (data) {
                    setFormData({
                        ...formData,
                        ...data,
                        // Ensure extra_bed_policy has the right structure if it comes back empty or different
                        extra_bed_policy: data.extra_bed_policy || { allowed: false, charge: 0 }
                    });
                }
            } catch (err) {
                console.error("Failed to fetch policies:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPolicies();
    }, [tenant]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsSaving(true);
        setSaveStatus('idle');

        try {
            const { error } = await supabase
                .from('operational_policies')
                .upsert({
                    ...formData,
                    org_id: tenant.id,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'org_id' });

            if (error) throw error;

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error("Failed to save policies:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Retrieving Business Rules...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-12 animate-in fade-in duration-700">
            <div className="grid gap-12 md:grid-cols-2">
                {/* Check-in/out Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Guest Cycle <span className="text-blue-500">Dynamics</span></h4>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Orchestrate check-in and check-out windows</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Arrival Time</Label>
                            <Input
                                type="time"
                                value={formData.check_in_time}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, check_in_time: e.target.value })}
                                className="h-14 bg-white/[0.03] border-white/10 rounded-2xl font-black text-lg focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Departure Time</Label>
                            <Input
                                type="time"
                                value={formData.check_out_time}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, check_out_time: e.target.value })}
                                className="h-14 bg-white/[0.03] border-white/10 rounded-2xl font-black text-lg focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* House Rules Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <ShieldCheck className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Governance <span className="text-purple-500">& Protocol</span></h4>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Define property-wide usage allowances</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/5 text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                                    <Dog className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-200">Pet Accommodations</span>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Allow domestic animals</p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.pets_allowed}
                                onCheckedChange={(v: boolean) => setFormData({ ...formData, pets_allowed: v })}
                                className="data-[state=checked]:bg-purple-500"
                            />
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-500/5 text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                                    <Cigarette className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-200">Smoking Policy</span>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Allow indoor smoking</p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.smoking_allowed}
                                onCheckedChange={(v: boolean) => setFormData({ ...formData, smoking_allowed: v })}
                                className="data-[state=checked]:bg-orange-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Policies Text Blocks */}
                <div className="col-span-full grid md:grid-cols-2 gap-12 pt-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                            <Info className="w-3 h-3 text-blue-400" />
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Master Cancellation Strategy</Label>
                        </div>
                        <Textarea
                            value={formData.cancellation_policy}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                            className="bg-white/[0.02] border-white/10 rounded-[2rem] min-h-[160px] p-6 font-bold text-sm focus:ring-blue-500/10 focus:bg-white/[0.04] transition-all"
                            placeholder="State your refund and booking commitment terms..."
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                            <Info className="w-3 h-3 text-purple-400" />
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Child & Auxiliary Bed Framework</Label>
                        </div>
                        <Textarea
                            value={formData.child_policy}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, child_policy: e.target.value })}
                            className="bg-white/[0.02] border-white/10 rounded-[2rem] min-h-[160px] p-6 font-bold text-sm focus:ring-purple-500/10 focus:bg-white/[0.04] transition-all"
                            placeholder="Detail age limits and extra bed procurement logic..."
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="pt-12 border-t border-white/5 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Policies Synchronized</span>
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 animate-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Update Failed</span>
                        </div>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Encrypting Data...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Save className="w-5 h-5" />
                            <span>Commit Strategic Update</span>
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
