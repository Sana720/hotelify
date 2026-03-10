"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Play } from "lucide-react";

export function CleaningDashboard() {
    return (
        <Card className="glass-premium border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl text-gradient-premium">Housekeeping Tracker</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Real-time status of room cleaning and inspection cycles.</p>
                </div>
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                    <div className="flex -space-x-2 overflow-hidden px-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-indigo-500/20 border border-indigo-400/50" />
                        ))}
                    </div>
                    <span className="text-sm font-medium text-white/90">3 Active</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <CleaningTask
                    room="103"
                    type="Suite"
                    plan="Full Deep Clean"
                    status="In Progress"
                    time="Started 5m ago"
                />
                <CleaningTask
                    room="104"
                    type="Deluxe King"
                    plan="Quick Refresh"
                    status="Queue"
                />
                <CleaningTask
                    room="202"
                    type="Standard Queen"
                    plan="Check-out Clean"
                    status="Dirty"
                    wasCheckout
                />
            </CardContent>
        </Card>
    );
}

function CleaningTask({ room, type, plan, status, time, wasCheckout }: { room: string, type: string, plan: string, status: string, time?: string, wasCheckout?: boolean }) {
    const isCleaning = status === 'In Progress';
    const isQueue = status === 'Queue';

    return (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 hover:scale-[1.01] group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${isCleaning ? 'bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : (isQueue ? 'bg-amber-500/10' : 'bg-red-500/10')}`}>
                    {isCleaning ? <Play className="w-5 h-5 text-purple-400 fill-purple-400 animate-pulse" /> : <Clock className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />}
                </div>
                <div>
                    <div className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                        Room {room}
                        {wasCheckout && <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30">Check-out</Badge>}
                    </div>
                    <p className="text-sm text-white/50">{type} <span className="text-white/20 mx-1">•</span> {plan}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className={`text-sm font-semibold tracking-wide ${isCleaning ? 'text-purple-400 text-glow' : 'text-white/40'}`}>{status}</div>
                    {time && <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{time}</p>}
                </div>
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-indigo-500/20 hover:text-indigo-400 transition-all duration-300 border border-transparent hover:border-indigo-500/30 group-hover:scale-110">
                    <CheckCircle2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
