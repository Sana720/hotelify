"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Hotel,
    Plus,
    Minus,
    Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        roomCount: 20,
        floors: 3,
        propertyType: "Boutique",
        hotelName: "",
    });
    const [isLaunching, setIsLaunching] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nextStep = () => {
        if (step === 1 && !config.hotelName) {
            setError("Please provide a hotel name.");
            return;
        }
        setError(null);
        setStep((s) => Math.min(s + 1, 3));
    };
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleLaunch = async () => {
        setIsLaunching(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user found.");

            // 1. Submit/Update Lead for SuperAdmin Approval
            const { error: leadError } = await supabase
                .from('leads')
                .upsert({
                    email: user.email!,
                    hotel_name: config.hotelName,
                    property_type: config.propertyType,
                    room_count: config.roomCount,
                    status: 'Pending',
                    notes: `Self-onboarding request: ${config.floors} floors, ${config.roomCount} rooms.`
                }, { onConflict: 'email' });

            if (leadError) {
                console.error("Supabase Error Full Details:", JSON.parse(JSON.stringify(leadError, Object.getOwnPropertyNames(leadError))));
                const detailedError = `Error [${leadError.code}]: ${leadError.message}. ${leadError.hint || ''}. Details: ${leadError.details || 'None'}`;
                throw new Error(detailedError);
            }

            setIsSubmitted(true);
            setIsLaunching(false);
        } catch (err: any) {
            console.error("Setup Error Log:", err);
            setError(err.message || "An unknown submission error occurred. Please check your SQL migrations.");
            setIsLaunching(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="glass-premium p-12 rounded-[3.5rem] border border-white/5 shadow-2xl text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <Check className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter text-white">Application Received</h2>
                        <p className="text-zinc-400 font-medium max-w-sm mx-auto">
                            Thank you for choosing Hotelify. Your property request for <strong className="text-white italic">"{config.hotelName}"</strong> has been sent to our Super Admin for verification.
                        </p>
                        <div className="pt-4 flex flex-col items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/10 text-emerald-400 font-black tracking-[0.2em] text-[10px] px-6 py-2 rounded-full">
                                STATUS: UNDER VERIFICATION
                            </Badge>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2">Expected activation: 12-24 Hours</p>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5">
                        <Button 
                            variant="ghost" 
                            className="text-zinc-500 font-black uppercase tracking-widest text-xs hover:text-white"
                            onClick={() => window.location.href = '/'}
                        >
                            Return to Website
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header & Progress */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">Setup Hotel</h1>
                        <p className="text-zinc-300 font-medium">Step {step} of 3: {step === 1 ? "Basics" : step === 2 ? "Configuration" : "Confirmation"}</p>
                    </div>
                    <Badge variant="outline" className="h-8 border-blue-500/20 text-blue-400 font-black tracking-widest px-4">
                        ELITE
                    </Badge>
                </div>
                <Progress value={(step / 3) * 100} className="h-1.5 bg-white/5" />
            </div>

            <div className="glass-premium p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Hotel Name</Label>
                                    <Input 
                                        placeholder="e.g. Grand Royal" 
                                        className="h-14 bg-white/5 border-white/5 rounded-2xl"
                                        value={config.hotelName}
                                        onChange={(e) => setConfig({ ...config, hotelName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Property Type</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {["Boutique", "Hotel Chain", "Apart-hotel", "Resort"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setConfig({ ...config, propertyType: type })}
                                            className={`p-4 rounded-2xl border transition-all text-left group ${config.propertyType === type ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`text-sm font-bold ${config.propertyType === type ? 'text-white' : 'text-zinc-300 group-hover:text-white transition-colors'}`}>{type}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 rounded-2xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                                </Alert>
                            )}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Floors</Label>
                                    <p className="text-sm text-zinc-300 italic opacity-80">How many floors does your property have?</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl">
                                    <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setConfig({ ...config, floors: Math.max(1, config.floors - 1) })}><Minus /></Button>
                                    <span className="text-xl font-black w-8 text-center">{config.floors}</span>
                                    <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setConfig({ ...config, floors: config.floors + 1 })}><Plus /></Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Rooms</Label>
                                    <p className="text-sm text-zinc-300 italic opacity-80">Approximate count to initialize inventory.</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl">
                                    <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setConfig({ ...config, roomCount: Math.max(1, config.roomCount - 5) })}><Minus /></Button>
                                    <span className="text-xl font-black w-12 text-center">{config.roomCount}</span>
                                    <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setConfig({ ...config, roomCount: config.roomCount + 5 })}><Plus /></Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-8"
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <Check className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight text-white">Application Ready</h3>
                                <p className="text-zinc-500 font-medium">Your configuration for <span className="text-white italic">"{config.hotelName}"</span> is complete. Once you submit, our Super Admin will verify and activate your dashboard.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 flex items-center gap-4 pt-8 border-t border-white/5">
                    {step > 1 && (
                        <Button
                            variant="ghost"
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
                            onClick={prevStep}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <Button
                        className={`h-14 flex-grow rounded-2xl transition-all font-black uppercase tracking-widest text-xs ${step === 3 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white text-black hover:bg-zinc-200'}`}
                        onClick={step === 3 ? handleLaunch : nextStep}
                        disabled={isLaunching}
                    >
                        {isLaunching ? "Submitting..." : step === 3 ? "Submit for Verification" : "Continue"}
                        {!isLaunching && step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>

            <p className="text-center text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                System status: <span className="text-blue-500/60">Ready for verification sync...</span>
            </p>
        </div>
    );
}
