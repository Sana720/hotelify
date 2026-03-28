"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Building2, Globe, Eye, EyeOff, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { registerUserAndLead } from "./actions";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formDataArr = new FormData(e.target as HTMLFormElement);
        const email = formDataArr.get('email') as string;
        const phone = formDataArr.get('phone') as string;
        const password = formDataArr.get('password') as string;
        const hotelName = formDataArr.get('hotel-name') as string;

        const result = await registerUserAndLead({
            email,
            phone,
            password,
            hotelName
        });

        if (!result.success) {
            setError(result.error || "Registration failed. Please try again.");
            setIsLoading(false);
            return;
        }

        // Auto sign in for testing
        await supabase.auth.signInWithPassword({ email, password });

        window.location.href = '/onboarding';
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-white">Scale Your Property</h1>
                <p className="text-zinc-400 font-medium text-lg">Join the elite hoteliers using Hotelify 2.0</p>
                {error && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                        {error}
                    </p>
                )}
            </div>

            <div className="glass-premium p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="hotel-name" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Hotel Name
                        </Label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <Input
                                id="hotel-name"
                                name="hotel-name"
                                placeholder="Grand Plaza Elite"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-700 font-medium"
                                required
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Work Email
                        </Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="manager@hotel.com"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-700 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Contact Number
                        </Label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-700 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Secure Password
                        </Label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-12 pr-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-700 font-medium"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-blue-400 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all group"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Start Free Trial
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>

            <div className="text-center">
                <p className="text-zinc-400 text-sm font-medium">
                    Already operational?{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
