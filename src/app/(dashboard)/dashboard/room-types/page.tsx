"use client";

import { RoomTypeManager } from "@/app/(dashboard)/dashboard/settings/infrastructure/room-type-manager";
import { Home, ChevronRight, Hotel } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function RoomTypesPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Room <span className="text-blue-500">Categories</span></h1>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <Home className="w-3 h-3" />
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/dashboard/rooms" className="hover:text-white transition-colors">Inventory</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-zinc-300">Room Types</span>
                </div>
            </div>

            <Card className="glass-premium border-white/10 p-10 rounded-[3rem] bg-white/[0.01]">
                <RoomTypeManager />
            </Card>
        </div>
    );
}
