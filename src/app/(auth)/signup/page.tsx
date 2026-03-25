"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Building2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const hotelName = formData.get('hotel-name') as string;
        const subdomain = formData.get('subdomain') as string;

        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: hotelName, // Use hotel name as full name for now or add a name field
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setIsLoading(false);
            return;
        }

        // Ideally, we'd create the organization here too, but for now we'll redirect to a success state
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
                        <Label htmlFor="subdomain" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Preferred Subdomain
                        </Label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <Input
                                id="subdomain"
                                name="subdomain"
                                placeholder="grandplaza"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-700 font-medium"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                                .hotelify.com
                            </div>
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
                        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Secure Password
                        </Label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-700 font-medium"
                                required
                            />
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
