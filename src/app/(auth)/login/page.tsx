"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, ShieldCheck, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState<'manager' | 'staff'>('manager');
    const [error, setError] = useState<string | null>(null);

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

        // Redirect based on login type or role
        window.location.href = '/dashboard';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white">Welcome Back</h1>
                <p className="text-zinc-400 font-medium uppercase tracking-widest text-[10px]">Portal Identification Required</p>
                {error && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                        {error}
                    </p>
                )}
            </div>

            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl mb-8">
                <button
                    onClick={() => setLoginType('manager')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginType === 'manager' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                </button>
                <button
                    onClick={() => setLoginType('staff')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginType === 'staff' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <UserCircle2 className="w-4 h-4" />
                    Team Member
                </button>
            </div>

            <div className="glass-premium p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${loginType === 'staff' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Identification (Email)
                        </Label>
                        <div className="relative group/input">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                Secret Key
                            </Label>
                            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                                Reset
                            </Link>
                        </div>
                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/input:text-blue-400 transition-colors" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-white placeholder:text-zinc-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all group ${loginType === 'staff' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Access Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>

            <div className="text-center">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    New property owner?{" "}
                    <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Launch your hotel
                    </Link>
                </p>
            </div>
        </div>
    );
}
