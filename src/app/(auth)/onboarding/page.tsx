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

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        roomCount: 20,
        floors: 3,
        propertyType: "Boutique",
    });

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <div className="space-y-12">
            {/* Header & Progress */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">Setup Hotel</h1>
                        <p className="text-zinc-500 font-medium">Step {step} of 3: {step === 1 ? "Basics" : step === 2 ? "Configuration" : "Confirmation"}</p>
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
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Property Type</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Boutique", "Hotel Chain", "Apart-hotel", "Resort"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setConfig({ ...config, propertyType: type })}
                                            className={`p-6 rounded-2xl border transition-all text-left group ${config.propertyType === type ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`text-sm font-bold ${config.propertyType === type ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{type}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Floors</Label>
                                    <p className="text-sm text-zinc-400 italic">How many floors does your property have?</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl">
                                    <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setConfig({ ...config, floors: Math.max(1, config.floors - 1) })}><Minus /></Button>
                                    <span className="text-xl font-black w-8 text-center">{config.floors}</span>
                                    <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setConfig({ ...config, floors: config.floors + 1 })}><Plus /></Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Rooms</Label>
                                    <p className="text-sm text-zinc-400 italic">Approximate count to initialize inventory.</p>
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
                                <h3 className="text-2xl font-black tracking-tight text-white">Optimization Ready</h3>
                                <p className="text-zinc-500 font-medium">We've tailored the dashboard for a {config.propertyType} with {config.roomCount} rooms across {config.floors} floors.</p>
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
                        onClick={step === 3 ? () => window.location.href = '/dashboard' : nextStep}
                    >
                        {step === 3 ? "Launch Dashboard" : "Continue"}
                        {step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>

            <p className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                Configuration status: <span className="text-blue-500/60">Optimizing Performance Engine...</span>
            </p>
        </div>
    );
}
