"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WashingMachine, Truck, Clock, CheckCircle2, Plus, Loader2, Trash2 } from "lucide-react";
import { useTenant } from "@/components/providers/TenantProvider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { toggleLaundryCycleStatus, deleteLaundryCycle } from "@/app/(admin)/admin/hotels/actions";
import { LogCycleDialog } from "./LogCycleDialog";

export function LaundryDashboard() {
    const { tenant } = useTenant();
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!tenant) return;

        async function fetchCycles() {
            setLoading(true);
            const { data, error } = await supabase
                .from('laundry_cycles')
                .select('*, staff(full_name)')
                .eq('org_id', tenant!.id)
                .order('created_at', { ascending: false });

            if (data) setCycles(data);
            setLoading(false);
        }

        fetchCycles();
    }, [tenant, refreshKey]);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'processing' ? 'completed' : 'processing';
        const res = await toggleLaundryCycleStatus(tenant!.id, id, nextStatus);
        if (res.success) setRefreshKey(prev => prev + 1);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteLaundryCycle(tenant!.id, id);
        if (res.success) setRefreshKey(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                Synchronizing Laundry Logs...
            </div>
        );
    }

    const internalCycles = cycles.filter(c => c.type === 'internal');
    const externalCycles = cycles.filter(c => c.type === 'external');

    return (
        <Card className="glass-premium border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                    <CardTitle className="text-2xl text-gradient-premium">Laundry Management</CardTitle>
                    <p className="text-sm text-white/40 mt-1">Track internal cycles and external vendor handovers.</p>
                </div>
                <LogCycleDialog
                    onSuccess={() => setRefreshKey(prev => prev + 1)}
                    trigger={
                        <Button className="rounded-full gap-2 transition-all hover:scale-105 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            <Plus className="w-4 h-4" />
                            Log Cycle
                        </Button>
                    }
                />
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="internal" className="space-y-4">
                    <TabsList className="bg-white/5 p-1 border border-white/10 rounded-xl">
                        <TabsTrigger value="internal" className="gap-2 rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 transition-all">
                            <WashingMachine className="w-4 h-4" />
                            Internal
                        </TabsTrigger>
                        <TabsTrigger value="external" className="gap-2 rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 transition-all">
                            <Truck className="w-4 h-4" />
                            External (Vendor)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="internal" className="pt-4 space-y-4">
                        {internalCycles.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No active internal cycles</p>
                            </div>
                        ) : internalCycles.map(cycle => (
                            <LaundryItem
                                key={cycle.id}
                                id={cycle.id.substring(0, 6)}
                                staff={cycle.staff?.full_name || "System"}
                                type={cycle.items?.[0]?.type || "Mixed Load"}
                                status={cycle.status}
                                time={new Date(cycle.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                onToggle={() => handleToggleStatus(cycle.id, cycle.status)}
                                onDelete={() => handleDelete(cycle.id)}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="external" className="pt-4 space-y-4">
                        {externalCycles.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No vendor handovers logged</p>
                            </div>
                        ) : externalCycles.map(cycle => (
                            <LaundryItem
                                key={cycle.id}
                                id={cycle.id.substring(0, 6)}
                                staff={`Vendor: ${cycle.vendor_name || 'Generic'}`}
                                type={cycle.items?.[0]?.type || "Mixed Load"}
                                status={cycle.status}
                                time={new Date(cycle.created_at).toLocaleDateString()}
                                onToggle={() => handleToggleStatus(cycle.id, cycle.status)}
                                onDelete={() => handleDelete(cycle.id)}
                            />
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function LaundryItem({ id, staff, type, status, time, onToggle, onDelete }: { id: string, staff: string, type: string, status: string, time: string, onToggle: () => void, onDelete: () => void }) {
    const isCompleted = status === 'completed';
    return (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 group">
            <div className="flex items-center gap-4">
                <div
                    onClick={onToggle}
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 ${isCompleted ? 'bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-blue-500/10 animate-pulse-subtle'}`}
                >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Clock className="w-5 h-5 text-blue-400" />}
                </div>
                <div>
                    <div className="font-bold flex items-center gap-2 text-white group-hover:text-blue-300 transition-colors">
                        {type}
                        <span className="text-[9px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">#{id}</span>
                    </div>
                    <p className="text-xs text-white/40">Managed by: {staff}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className={`text-sm font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400 text-glow-emerald' : 'text-blue-400'}`}>{status}</div>
                    <p className="text-[10px] text-white/20 mt-0.5 uppercase tracking-tighter font-bold">{time}</p>
                </div>
                <Button
                    onClick={onDelete}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
