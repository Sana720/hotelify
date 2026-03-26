"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CreditCard, Activity, ArrowUpRight, Loader2 } from "lucide-react"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalHotels: 0,
        platformRevenue: "₹0",
        activeUsers: 0,
        systemLoad: "Normal",
        mix: { Enterprise: 0, Professional: 0, Essential: 0 }
    });
    const [recentHotels, setRecentHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlatformData() {
            setLoading(true);

            // 1. Fetch Total Hotels
            const { count: hotelCount } = await supabase
                .from('organizations')
                .select('*', { count: 'exact', head: true });

            // 2. Fetch Recent Registrations with Plan Details
            const { data: hotels } = await supabase
                .from('organizations')
                .select('*, subscription_plans(name)')
                .order('created_at', { ascending: false })
                .limit(3);

            // 3. Fetch Staff Count
            const { count: staffCount } = await supabase
                .from('staff')
                .select('*', { count: 'exact', head: true });

            // 4. Fetch Real Revenue
            const { data: billingData } = await supabase
                .from('platform_billing')
                .select('amount')
                .eq('status', 'paid');
            
            const totalRevenue = billingData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

            // 5. Fetch Subscription Mix
            const { data: allHotels } = await supabase
                .from('organizations')
                .select('subscription_plans(name)');
            
            const mix = {
                Enterprise: 0,
                Professional: 0,
                Essential: 0
            };

            allHotels?.forEach(h => {
                const name = (h.subscription_plans as any)?.name;
                if (name === 'Enterprise') mix.Enterprise++;
                else if (name === 'Professional') mix.Professional++;
                else if (name === 'Essential') mix.Essential++;
            });

            const totalOrgs = allHotels?.length || 1;

            setStats({
                totalHotels: hotelCount || 0,
                platformRevenue: `₹${(totalRevenue / 100000).toFixed(1)}L`,
                activeUsers: staffCount || 0,
                systemLoad: "Optimal",
                mix: mix
            });

            setRecentHotels(hotels?.map(h => ({
                name: h.name,
                domain: h.subdomain + ".hotelify.app",
                tier: (h.subscription_plans as any)?.name || 'Trial',
                status: h.subscription_status === 'active' ? 'Active' : 'Trial'
            })) || []);

            setLoading(false);
        }

        fetchPlatformData();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Synchronizing Infrastructure...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Platform Overview</h1>
                <p className="text-zinc-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Global Infrastructure Status</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <PlatformStatCard
                    title="Total Hotels"
                    value={stats.totalHotels.toString()}
                    description="+12 this month"
                    icon={<Building2 className="w-4 h-4 text-blue-400" />}
                />
                <PlatformStatCard
                    title="Platform Revenue"
                    value={stats.platformRevenue}
                    description="+8.4% growth"
                    icon={<CreditCard className="w-4 h-4 text-emerald-400" />}
                />
                <PlatformStatCard
                    title="Active Staff"
                    value={stats.activeUsers.toLocaleString()}
                    description="Across all properties"
                    icon={<Users className="w-4 h-4 text-purple-400" />}
                />
                <PlatformStatCard
                    title="System Load"
                    value={stats.systemLoad}
                    description="Optimal performance"
                    icon={<Activity className="w-4 h-4 text-amber-400" />}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2 glass-premium border-white/5 bg-white/[0.02]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">New Registrations</CardTitle>
                        <button className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                            View All <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentHotels.map((hotel) => (
                                <div key={hotel.domain} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{hotel.name}</div>
                                            <div className="text-xs text-zinc-400 font-medium">{hotel.domain}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black uppercase tracking-widest text-white">{hotel.tier}</div>
                                        <div className={`text-[10px] font-bold ${hotel.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>{hotel.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-premium border-white/5 bg-white/[0.02]">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Subscription Mix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-4">
                            <SubscriptionMetric label="Enterprise" percentage={Math.round(((stats?.mix?.Enterprise || 0) / (stats.totalHotels || 1)) * 100)} color="bg-blue-500" />
                            <SubscriptionMetric label="Professional" percentage={Math.round(((stats?.mix?.Professional || 0) / (stats.totalHotels || 1)) * 100)} color="bg-purple-500" />
                            <SubscriptionMetric label="Essential" percentage={Math.round(((stats?.mix?.Essential || 0) / (stats.totalHotels || 1)) * 100)} color="bg-zinc-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function PlatformStatCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
    return (
        <Card className="glass-premium border-white/5 bg-white/[0.02] hover:border-blue-500/20 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-blue-500/20 transition-colors">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tighter text-white">{value}</div>
                <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{description}</p>
            </CardContent>
        </Card>
    )
}

function SubscriptionMetric({ label, percentage, color }: { label: string, percentage: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400 uppercase tracking-widest">{label}</span>
                <span className="text-white">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
