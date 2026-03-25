"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Hotel, Bell, Shield, Palette, Globe, Save, Home, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { PropertyIdentityForm } from "./property-identity-form";
import { PolicySettingsForm } from "./policy-settings-form";

function SettingsContent() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "identity";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Provide a stable default during hydration
    const currentTab = mounted ? activeTab : "identity";

    return (
        <>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white">Hotel Setting</h1>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <Home className="w-3 h-3" />
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span>Hotel</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-zinc-300">Setting</span>
                </div>
            </div>

            <Tabs defaultValue="identity" value={currentTab} className="space-y-10" onValueChange={() => { }}>
                <TabsList className="bg-white/[0.02] p-1.5 border border-white/5 h-16 rounded-2xl">
                    <TabsTrigger value="identity" className="px-8 rounded-xl gap-3 data-[state=active]:bg-white data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] transition-all">
                        <Globe className="w-4 h-4" />
                        Property Identity
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="px-8 rounded-xl gap-3 data-[state=active]:bg-white data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] transition-all">
                        <Shield className="w-4 h-4" />
                        Policies
                    </TabsTrigger>
                    <TabsTrigger value="security" className="px-8 rounded-xl gap-3 data-[state=active]:bg-white data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] transition-all">
                        <Bell className="w-4 h-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <Card className="glass-premium border-white/10 p-10 rounded-[3rem] bg-white/[0.01]">
                        <PropertyIdentityForm />
                    </Card>
                </TabsContent>

                <TabsContent value="policies" className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <Card className="glass-premium border-white/10 p-10 rounded-[3rem] bg-white/[0.01]">
                        <PolicySettingsForm />
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <Card className="glass-premium border-white/10 p-10 rounded-[3rem] bg-white/[0.01]">
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-600">
                            <Shield className="w-12 h-12 mb-4 opacity-10" />
                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Access Control Active</p>
                            <p className="text-[10px] font-medium mt-1">Multi-factor authentication and IP whitelisting coming soon.</p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}

export default function SettingsPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                    <Hotel className="w-8 h-8 animate-pulse text-zinc-700" />
                </div>
            }>
                <SettingsContent />
            </Suspense>
        </div>
    );
}
