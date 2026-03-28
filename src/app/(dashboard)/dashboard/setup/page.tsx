'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/components/providers/TenantProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, BedDouble, Plus, CheckCircle2, ChevronRight, Building2, ShieldCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyIdentityForm } from '@/app/(dashboard)/dashboard/settings/property-identity-form';
import { PolicySettingsForm } from '@/app/(dashboard)/dashboard/settings/policy-settings-form';
import { RoomTypeManager } from '@/app/(dashboard)/dashboard/settings/infrastructure/room-type-manager';
import { RoomManager } from '@/app/(dashboard)/dashboard/rooms/room-manager';
import { useRouter } from 'next/navigation';
import { updateSetupProgress } from './actions';

const STEPS = [
    { id: 'pending_settings', title: 'Property Identity', icon: Building2, next: 'pending_room_types' as const },
    { id: 'pending_room_types', title: 'Room Categories', icon: Hotel, next: 'pending_rooms' as const },
    { id: 'pending_rooms', title: 'Room Inventory', icon: BedDouble, next: 'completed' as const }
];

export default function SetupWizardPage() {
    const { tenant, isLoading: isTenantLoading, refreshTenant } = useTenant();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (isTransitioning) return;
        
        if (!isTenantLoading && tenant) {
            if (tenant.setup_step === 'completed') {
                router.push('/dashboard');
                return;
            }

            const stepIndex = STEPS.findIndex(s => s.id === tenant.setup_step);
            if (stepIndex !== -1 && stepIndex !== currentStep) {
                setCurrentStep(stepIndex);
            }
        }
    }, [tenant, isTenantLoading, router, isTransitioning, currentStep]);

    if (isTenantLoading || !tenant) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    const handleNext = async () => {
        if (!tenant) return;
        
        setIsUpdating(true);
        setIsTransitioning(true);
        
        try {
            const nextStepId = STEPS[currentStep].next;
            const result = await updateSetupProgress(tenant.id, nextStepId);
            
            if (result.success) {
                // Force a refresh of the tenant data so that DashboardGuard and this page see the update
                await refreshTenant();

                if (nextStepId === 'completed') {
                    router.push('/dashboard');
                } else {
                    setCurrentStep(prev => prev + 1);
                }
            } else {
                console.error("Setup progress update failed:", result.error);
                alert("Failed to synchronize progress. Please check your connection.");
            }
        } catch (err) {
            console.error("Error advancing setup wizard:", err);
        } finally {
            setIsUpdating(false);
            // Safety buffer to ensure the background task re-sync doesn't override manual navigation
            setTimeout(() => setIsTransitioning(false), 1500);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* --- Progress Header --- */}
            <div className="text-center space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tight text-white uppercase italic"
                >
                    Hotel Genesis <span className="text-blue-500">Wizard</span>
                </motion.h1>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Initialize your operational core infrastructure</p>
                
                <div className="flex items-center justify-center gap-4 mt-10">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${idx <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${idx === currentStep ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110' : idx < currentStep ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5'}`}>
                                    {idx < currentStep ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <step.icon className={`w-6 h-6 ${idx === currentStep ? 'text-white' : 'text-zinc-500'}`} />}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{step.title}</div>
                            </div>
                            {idx < 2 && <div className={`w-20 h-[2px] mb-8 mx-2 transition-all duration-1000 ${idx < currentStep ? 'bg-emerald-500/50' : 'bg-white/5'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Step Content --- */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {currentStep === 0 && (
                        <div className="space-y-10">
                            <Card className="glass-premium border-white/10 p-4 lg:p-10 rounded-[2.5rem] bg-white/[0.01]">
                                <CardHeader className="px-0 pt-0 pb-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <Building2 className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Step 1: Property Identity</CardTitle>
                                            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] mt-1">Configure your business details and legal billing info</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <PropertyIdentityForm onSuccess={() => {}} />
                                <div className="mt-10 pt-10 border-t border-white/5">
                                    <PolicySettingsForm />
                                </div>
                            </Card>
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleNext} 
                                    disabled={isUpdating}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs group shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                                >
                                    {isUpdating ? "Synchronizing..." : "Step 2: Room Categories"}
                                    {!isUpdating && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-10">
                            <Card className="glass-premium border-white/10 p-4 lg:p-10 rounded-[2.5rem] bg-white/[0.01]">
                                <CardHeader className="px-0 pt-0 pb-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <Hotel className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Step 2: Room Types</CardTitle>
                                            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] mt-1">Define your inventory master categories (Deluxe, Suite, Standard)</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <RoomTypeManager />
                            </Card>
                            <div className="flex justify-between">
                                <Button onClick={() => setCurrentStep(0)} variant="ghost" className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Back to Step 1</Button>
                                <Button 
                                    onClick={handleNext} 
                                    disabled={isUpdating}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs group shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                                >
                                    {isUpdating ? "Synchronizing..." : "Step 3: Asset Inventory"}
                                    {!isUpdating && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-10">
                            <Card className="glass-premium border-white/10 p-4 lg:p-10 rounded-[2.5rem] bg-white/[0.01]">
                                <CardHeader className="px-0 pt-0 pb-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <BedDouble className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-white uppercase tracking-tight italic">Step 3: Room Inventory</CardTitle>
                                            <CardDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] mt-1">Add individual room numbers to your categories</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <RoomManager />
                            </Card>
                            <div className="flex justify-between">
                                <Button onClick={() => setCurrentStep(1)} variant="ghost" className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Back to Step 2</Button>
                                <Button 
                                    onClick={handleNext} 
                                    disabled={isUpdating}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs group shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                >
                                    {isUpdating ? "Finalizing..." : "Finish & Launch Panel"}
                                    {!isUpdating && <ShieldCheck className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
