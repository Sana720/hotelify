"use client";

import React, { useState, useEffect } from "react";
import { 
    Package, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    X,
    Loader2,
    ShieldCheck,
    Users,
    Building2,
    Layout,
    LayoutDashboard,
    Calendar,
    Sparkles,
    CreditCard,
    Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Plan {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    max_rooms: number;
    features: string[];
    is_active: boolean;
}

const PLATFORM_MODULES = [
    { id: 'front-desk', label: 'Front Office', icon: LayoutDashboard, desc: 'Check-in/Out & PMS Dashboard' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, desc: 'Booking Wizard & Timeline' },
    { id: 'inventory', label: 'Property Inventory', icon: Building2, desc: 'Rooms, Types & Amenities' },
    { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles, desc: 'Status Mgmt & Cleaning' },
    { id: 'guest-intelligence', label: 'Guest Intelligence', icon: Users, desc: 'Profiles & History' },
    { id: 'billing', label: 'Financials', icon: CreditCard, desc: 'Folios, Invoices & GST' },
    { id: 'reports', label: 'Analytics', icon: Activity, desc: 'Business Intelligence' }
];

export default function PackagesPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: "",
        description: "",
        price_monthly: 0,
        max_rooms: 10,
        features: [],
        is_active: true
    });

    const [currentStep, setCurrentStep] = useState(1);
    
    useEffect(() => {
        setMounted(true);
        fetchPlans();
    }, []);

    const [isSeeding, setIsSeeding] = useState(false);
    
    // Reset wizard when dialog opens/closes
    useEffect(() => {
        if (!isDialogOpen) {
            setCurrentStep(1);
        }
    }, [isDialogOpen]);

    if (!mounted) return null;

    async function fetchPlans() {
        setLoading(true);
        console.log("Fetching plans from Supabase...");
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price_monthly', { ascending: true });

        if (error) {
            console.error("Supabase Error fetching plans:", error);
            alert(`Error loading plans: ${error.message}`);
        } else {
            console.log("Successfully fetched plans:", data);
            setPlans(data || []);
        }
        setLoading(false);
    }

    async function seedDefaults() {
        setIsSeeding(true);
        const defaults = [
            {
                name: 'Starter (Essential)',
                description: 'Core PMS features for budget hotels and growing guest houses.',
                price_monthly: 2499,
                max_rooms: 15,
                features: ["front-desk", "reservations", "inventory"],
                is_active: true
            },
            {
                name: 'Professional',
                description: 'Complete operational control with housekeeping and financials.',
                price_monthly: 5999,
                max_rooms: 40,
                features: ["front-desk", "reservations", "inventory", "housekeeping", "billing"],
                is_active: true
            },
            {
                name: 'Enterprise',
                description: 'Full-scale intelligence and analytics for luxury resorts.',
                price_monthly: 12499,
                max_rooms: 999,
                features: ["front-desk", "reservations", "inventory", "housekeeping", "guest-intelligence", "billing", "reports"],
                is_active: true
            }
        ];

        const { error } = await supabase
            .from('subscription_plans')
            .insert(defaults);

        if (error) {
            alert(`Seeding failed: ${error.message}`);
        } else {
            fetchPlans();
        }
        setIsSeeding(false);
    }

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('subscription_plans')
            .upsert({
                ...formData,
                updated_at: new Date().toISOString()
            });

        if (error) {
            toast.error("Failed to save plan.");
        } else {
            toast.success("Plan architecture deployed.");
            fetchPlans();
            setIsDialogOpen(false);
            setFormData({ name: "", description: "", price_monthly: 0, max_rooms: 10, features: [], is_active: true });
        }
        setIsSaving(false);
    };

    const toggleModule = (moduleId: string) => {
        const current = formData.features || [];
        if (current.includes(moduleId)) {
            setFormData({ ...formData, features: current.filter(id => id !== moduleId) });
        } else {
            setFormData({ ...formData, features: [...current, moduleId] });
        }
    };

    const toggleStatus = async (plan: Plan) => {
        const { error } = await supabase
            .from('subscription_plans')
            .update({ is_active: !plan.is_active })
            .eq('id', plan.id);
        
        if (!error) fetchPlans();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 italic uppercase">
                        <Package className="w-8 h-8 text-blue-500" />
                        Plan <span className="text-blue-500">Marketplace</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Configure Platform Subscription Tiers</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-zinc-200 h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-white/5 transition-all active:scale-95">
                            <Plus className="w-4 h-4" />
                            Create New Tier
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0a0b] border-white/10 text-white rounded-2xl p-0 max-w-2xl overflow-hidden animate-in fade-in duration-300">
                        <DialogHeader className="p-8 border-b border-white/5">
                            <DialogTitle className="text-xl font-bold tracking-tight">Configure Subscription Plan</DialogTitle>
                            <p className="text-xs text-zinc-500 mt-1">Define package name, commercials, and active features.</p>
                        </DialogHeader>

                        <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Section 1: Identity */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block">01 Identity</Label>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] text-zinc-400">Plan Name</Label>
                                        <Input 
                                            value={formData.name || ""}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-11 bg-white/[0.02] border-white/5 rounded-xl focus:bg-white/[0.04] transition-all"
                                            placeholder="e.g. Enterprise Plus"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] text-zinc-400">Tagline</Label>
                                        <Input 
                                            value={formData.description || ""}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="h-11 bg-white/[0.02] border-white/5 rounded-xl focus:bg-white/[0.04] transition-all"
                                            placeholder="e.g. Best for large chains"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Commercials */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block">02 Commercials</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] text-zinc-400">Monthly Price (₹)</Label>
                                        <Input 
                                            type="number"
                                            value={formData.price_monthly?.toString() ?? ""}
                                            onChange={e => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                                            className="h-11 bg-white/[0.02] border-white/5 rounded-xl focus:bg-white/[0.04]"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] text-zinc-400">Room Limit</Label>
                                        <Input 
                                            type="number"
                                            value={formData.max_rooms?.toString() ?? ""}
                                            onChange={e => setFormData({ ...formData, max_rooms: parseInt(e.target.value) || 0 })}
                                            className="h-11 bg-white/[0.02] border-white/5 rounded-xl focus:bg-white/[0.04]"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Features */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block">03 Active Features</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PLATFORM_MODULES.map(module => (
                                        <div 
                                            key={module.id}
                                            onClick={() => toggleModule(module.id)}
                                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                                formData.features?.includes(module.id) 
                                                ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                                                : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.05]'
                                            }`}
                                        >
                                            <module.icon className={`w-4 h-4 ${formData.features?.includes(module.id) ? 'text-blue-400' : 'text-zinc-600'}`} />
                                            <span className="text-[11px] font-bold uppercase tracking-tight">{module.label}</span>
                                            {formData.features?.includes(module.id) && (
                                                <Check className="w-3.5 h-3.5 ml-auto text-blue-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                            <Button 
                                onClick={() => setIsDialogOpen(false)}
                                variant="ghost"
                                className="h-11 px-6 text-zinc-500 font-bold uppercase tracking-widest text-[9px] hover:text-white"
                            >
                                Discard
                            </Button>
                            <Button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-blue-500/10"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Plan"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    Calculating Tier Matrix...
                </div>
            ) : plans.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center">
                        <Package className="w-8 h-8 text-zinc-700" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-600">No Tier Architecture Found</h3>
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Seeding the database with the provided SQL is required.</p>
                    </div>
                    <Button 
                        onClick={seedDefaults}
                        disabled={isSeeding}
                        className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3 active:scale-95 transition-all"
                    >
                        {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Deploy Default Architecture
                                <Plus className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="glass-premium border border-white/5 bg-white/[0.02] rounded-[2.5rem] p-8 space-y-8 hover:border-blue-500/20 transition-all duration-500 group relative overflow-hidden flex flex-col">
                            {!plan.is_active && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 border border-red-500/50 px-4 py-1 rounded-full">Deactivated</span>
                                </div>
                            )}

                            <div className="flex justify-between items-start relative z-20">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">{plan.name}</h3>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{plan.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white italic">₹{plan.price_monthly}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">per month</div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 relative z-20 flex-grow">
                                <div className="flex items-center gap-3 text-zinc-400 group-hover:text-white transition-colors">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Up to {plan.max_rooms} Rooms</span>
                                </div>
                                
                                <div className="pt-4 space-y-3">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Active Architecture</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.features?.map(featId => {
                                            const module = PLATFORM_MODULES.find(m => m.id === featId);
                                            if (!module) return null;
                                            return (
                                                <Badge key={featId} variant="outline" className="bg-blue-500/5 border-blue-500/10 text-blue-400/80 text-[8px] px-2 py-0.5 font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <module.icon className="w-2.5 h-2.5" />
                                                    {module.label}
                                                </Badge>
                                            );
                                        })}
                                        {(!plan.features || plan.features.length === 0) && (
                                            <span className="text-[8px] font-bold text-zinc-600 uppercase italic">No modules selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-8 relative z-20">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setFormData(plan);
                                        setIsDialogOpen(true);
                                    }}
                                    className="flex-grow glass-premium border-white/5 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5"
                                >
                                    <Edit2 className="w-3 h-3" /> Re-Architect
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => toggleStatus(plan)}
                                    className={`h-10 w-10 rounded-xl ${plan.is_active ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                                >
                                    {plan.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: any }) {
    return (
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
