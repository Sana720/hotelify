"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WashingMachine, Truck, Clock, CheckCircle2, Plus } from "lucide-react";

export function LaundryDashboard() {
    return (
        <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                    <CardTitle>Laundry Management</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Track internal cycles and external vendor handovers.</p>
                </div>
                <Button className="rounded-full gap-2 transition-all hover:scale-105">
                    <Plus className="w-4 h-4" />
                    Log Cycle
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="internal" className="space-y-4">
                    <TabsList className="bg-white/5 p-1 border border-white/10">
                        <TabsTrigger value="internal" className="gap-2">
                            <WashingMachine className="w-4 h-4" />
                            Internal
                        </TabsTrigger>
                        <TabsTrigger value="external" className="gap-2">
                            <Truck className="w-4 h-4" />
                            External (Vendor)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="internal" className="pt-4 space-y-4">
                        <LaundryItem
                            id="L-9042"
                            staff="Elena G."
                            type="Linens (Deluxe)"
                            status="Processing"
                            time="12 mins left"
                        />
                        <LaundryItem
                            id="L-9043"
                            staff="Elena G."
                            type="Towels (Standard)"
                            status="Completed"
                            time="Just now"
                        />
                    </TabsContent>

                    <TabsContent value="external" className="pt-4 space-y-4">
                        <LaundryItem
                            id="V-102"
                            staff="Vendor: CityClean"
                            type="Duvet Covers"
                            status="Picked up"
                            time="Est. return: Tomorrow"
                        />
                        <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                            <p className="text-sm text-muted-foreground italic">No other active vendor reconciliations.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function LaundryItem({ id, staff, type, status, time }: { id: string, staff: string, type: string, status: string, time: string }) {
    const isCompleted = status === 'Completed';
    return (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Clock className="w-5 h-5 text-blue-400" />}
                </div>
                <div>
                    <div className="font-bold flex items-center gap-2">
                        {type}
                        <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded uppercase">#{id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Managed by: {staff}</p>
                </div>
            </div>
            <div className="text-right">
                <div className={`text-sm font-semibold ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>{status}</div>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tighter">{time}</p>
            </div>
        </div>
    );
}
