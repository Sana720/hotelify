"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Mail, Lock, ArrowRight, Server, Database, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setIsLoading(false);
            return;
        }

        // Verify if the user is actually a platform admin
        const { data: adminData, error: adminError } = await supabase
            .from('platform_admins')
            .select('id')
            .eq('user_id', data.user?.id)
            .single();

        if (adminError || !adminData) {
            await supabase.auth.signOut();
            setError("Access Restricted: Industrial Authorization Failed.");
            setIsLoading(false);
            return;
        }

        window.location.href = '/admin';
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <ShieldAlert className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Platform Control</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Infrastructure Authorization Required</p>
                    {error && (
                        <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                            {error}
                        </p>
                    )}
                </div>

                <div className="glass-premium p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group bg-black/40 backdrop-blur-3xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                                Email Address
                            </Label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-indigo-400 transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@hotelify.internal"
                                    className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all text-white placeholder:text-zinc-800 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                                Password
                            </Label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-indigo-400 transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all text-white placeholder:text-zinc-800 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-indigo-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs bg-white text-black hover:bg-zinc-200 shadow-2xl transition-all group overflow-hidden relative"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2 relative z-10 transition-transform group-hover:translate-x-1">
                                    Unlock System
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-6 text-zinc-600">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Server className="w-3 h-3" />
                        Region: US-EAST-1
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Database className="w-3 h-3" />
                        Encrypted SSL
                    </div>
                </div>
            </div>
        </div>
    );
}
